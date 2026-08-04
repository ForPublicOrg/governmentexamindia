import type { ExamEvent, StatusTone } from "@/lib/exam-types";

/**
 * Where a recruitment cycle sits relative to a candidate's decision to apply.
 *
 * - `ongoing`  — the process is live: applications are open, a stage is under
 *                way, a result is awaited, or a published stage has already
 *                completed.
 * - `upcoming` — announced or awaited, but no official stage has happened yet.
 * - `past`     — the cycle is complete.
 *
 * Status tone stays the editorial truth about a cycle; the phase is derived
 * from it so ordering never contradicts the reviewed status.
 */
export type LifecyclePhase = "ongoing" | "upcoming" | "past";

export const lifecyclePhases: readonly LifecyclePhase[] = ["ongoing", "upcoming", "past"];

export const lifecyclePhaseMeta: Record<LifecyclePhase, { label: string; blurb: string }> = {
  ongoing: { label: "Ongoing", blurb: "Applications, exams or results in progress" },
  upcoming: { label: "Upcoming", blurb: "Announced or awaited — no stage has run yet" },
  past: { label: "Past", blurb: "Recruitment cycle complete" },
};

/** The minimum a record needs to expose for its phase and ordering. */
export type LifecycleInput = {
  status: { tone: StatusTone };
  timeline: ExamEvent[];
};

/** Tones that describe a live process regardless of what the timeline holds. */
const LIVE_TONES = new Set<StatusTone>(["green", "violet", "red"]);

export function lifecyclePhase(item: LifecycleInput): LifecyclePhase {
  if (item.status.tone === "slate") return "past";
  if (LIVE_TONES.has(item.status.tone)) return "ongoing";
  // amber and blue only mean "live" once an official stage has actually run.
  return item.timeline.some((event) => event.state === "completed") ? "ongoing" : "upcoming";
}

export function lifecyclePhaseIndex(item: LifecycleInput) {
  return lifecyclePhases.indexOf(lifecyclePhase(item));
}

/**
 * Timeline labels that mark the end of the submission window. Extensions are
 * written as later events, so the last match wins.
 */
const CLOSING_LABEL = /(?:applications?|registrations?)[^,]*?(?:close[ds]?|closing)|deadline|last date|apply by/i;

/** ISO date the application window closes, when a dated official event says so. */
export function applicationCloseDate(item: LifecycleInput) {
  let closing: string | undefined;
  for (const event of item.timeline) {
    if (event.date && CLOSING_LABEL.test(event.label)) closing = event.date;
  }
  return closing;
}

export function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function datedPoints(item: LifecycleInput) {
  return item.timeline
    .flatMap((event) => (event.date ? [event.date] : event.sortMonth ? [`${event.sortMonth}-01`] : []))
    .sort();
}

const compact = (iso: string) => iso.replaceAll("-", "");

/** Complement of YYYYMMDD, so an ascending sort reads newest first. */
const inverted = (iso: string) => String(99_999_999 - Number(compact(iso))).padStart(8, "0");

/**
 * A sortable key that puts the most actionable record first *within* a phase:
 *
 * 1. an open submission window, soonest deadline first;
 * 2. otherwise the next dated stage, soonest first;
 * 3. otherwise the most recent stage, newest first;
 * 4. otherwise no dates at all.
 */
export function lifecycleSortKey(item: LifecycleInput, referenceDate = todayIso()) {
  const closing = applicationCloseDate(item);
  if (closing && closing >= referenceDate) return `0${compact(closing)}`;

  const points = datedPoints(item);
  const next = points.find((date) => date >= referenceDate);
  if (next) return `1${compact(next)}`;

  const last = points.at(-1);
  return last ? `2${inverted(last)}` : "3";
}

/**
 * Order any list of recruitment records: ongoing, then upcoming, then past,
 * and inside each group by the closing date a candidate has to act on.
 */
export function byLifecycle<T extends LifecycleInput & { year: number; title: string }>(
  referenceDate = todayIso(),
) {
  return (a: T, b: T) => {
    const phase = lifecyclePhaseIndex(a) - lifecyclePhaseIndex(b);
    if (phase) return phase;
    const keys = lifecycleSortKey(a, referenceDate).localeCompare(lifecycleSortKey(b, referenceDate));
    if (keys) return keys;
    return b.year - a.year || a.title.localeCompare(b.title);
  };
}

/** Split an already-ordered list into its phase groups, dropping empty ones. */
export function groupByLifecycle<T extends LifecycleInput>(items: T[]) {
  return lifecyclePhases
    .map((phase) => ({ phase, ...lifecyclePhaseMeta[phase], items: items.filter((item) => lifecyclePhase(item) === phase) }))
    .filter((group) => group.items.length > 0);
}
