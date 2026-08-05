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

const indiaDateFormatter = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: "Asia/Kolkata",
});

/** The IST calendar date of an instant, as YYYY-MM-DD. */
export function indiaDateKey(at: Date) {
  // en-CA formats as ISO, and formatToParts avoids depending on that.
  const parts = indiaDateFormatter.formatToParts(at);
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";
  return `${value("year")}-${value("month")}-${value("day")}`;
}

/**
 * The date the site reasons from, in IST because every deadline here is an
 * Indian one — UTC would call it yesterday until 05:30 every morning.
 *
 * In the browser this is the reader's own clock, so anything recomputed client
 * side corrects itself across midnight and in a page served from cache. On the
 * build machine it is the build date, which SITE_REFERENCE_DATE can override to
 * pin a build or to run the site forward in time (see tools/data/time-travel.ts).
 */
export function todayIso() {
  if (typeof window === "undefined") {
    const pinned = process.env.SITE_REFERENCE_DATE;
    if (pinned) return pinned;
  }
  return indiaDateKey(new Date());
}

/** Complement of YYYYMMDD, so an ascending sort reads newest first. */
export function invertedDateKey(iso: string) {
  return String(99_999_999 - Number(iso.replaceAll("-", ""))).padStart(8, "0");
}

export function isRealIsoDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return (
    parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day
  );
}

const MONTH_NUMBER: Record<string, number> = {
  Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6,
  Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12,
};
const LAST_VERIFIED = /^(\d{1,2}) ([A-Z][a-z]{2}) (\d{4}), (\d{2}):(\d{2}) IST$/;

/** The date part of a `lastVerified` stamp ("4 Aug 2026, 19:00 IST" → "2026-08-04"). */
export function lastVerifiedIso(value: string) {
  const match = LAST_VERIFIED.exec(value);
  if (!match) return undefined;
  const [, dayText, monthText, yearText, hourText, minuteText] = match;
  const month = MONTH_NUMBER[monthText];
  if (!month || Number(hourText) > 23 || Number(minuteText) > 59) return undefined;
  const key = `${yearText}-${String(month).padStart(2, "0")}-${String(Number(dayText)).padStart(2, "0")}`;
  return isRealIsoDate(key) ? key : undefined;
}

function datedPoints(item: LifecycleInput) {
  return item.timeline
    .flatMap((event) => (event.date ? [event.date] : event.sortMonth ? [`${event.sortMonth}-01`] : []))
    .sort();
}

const compact = (iso: string) => iso.replaceAll("-", "");

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
  return last ? `2${invertedDateKey(last)}` : "3";
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
