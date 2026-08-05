import type { EducationLevel, Exam, ExamType, GovernmentLevel, StatusTone } from "@/lib/exam-types";
import {
  applicationCloseDate,
  invertedDateKey,
  lifecyclePhaseIndex,
  lifecyclePhases,
  lifecycleSortKey,
  todayIso,
  type LifecyclePhase,
} from "@/lib/lifecycle";

/**
 * A deliberately small per-exam record. The explorer and the search page load
 * this instead of the full dataset, so adding hundreds of exams costs the
 * browser kilobytes rather than megabytes.
 */
export type SearchDoc = {
  /** slug */ s: string;
  /** title */ t: string;
  /** short title */ st: string;
  /** organisation */ o: string;
  /** searchable haystack, already lowercased */ h: string;
  /** education levels */ e: EducationLevel[];
  /** exam types */ x: ExamType[];
  /** government level */ g: GovernmentLevel;
  /** region codes ([] = all-India) */ r: string[];
  /** state name */ sn?: string;
  /** year */ y: number;
  /** status tone */ n: StatusTone;
  /** status label */ sl: string;
  /** next action */ na: string;
  /** vacancy label */ v: string;
  /** last checked, date part only */ c: string;
  /** verified? */ vf: 0 | 1;
  /** featured? */ f: 0 | 1;
  /** lifecycle phase index: 0 ongoing, 1 upcoming, 2 past */ p: 0 | 1 | 2;
  /** within-phase sort key, deadline-first */ k: string;
  /** ISO application closing date, when one is published */ cd?: string;
};

/**
 * Whether the submission window is still open, judged against `at` rather than
 * against the build. `cd` is the published closing date, so the browser can
 * answer this itself however old the page it is reading is.
 */
export function isWindowOpen(doc: SearchDoc, at = todayIso()) {
  return doc.cd != null && doc.cd >= at;
}

/**
 * `k` was computed when the site was built. Bucket "0" means "the application
 * window is open", and that is the one bucket that goes stale dangerously: a
 * cycle whose deadline has since passed would keep sorting above every live
 * one. Recompute just that case from the published closing date and let the
 * rest of the key stand.
 */
export function sortKeyAt(doc: SearchDoc, at: string) {
  if (doc.k.startsWith("0") && doc.cd != null && doc.cd < at) return `2${invertedDateKey(doc.cd)}`;
  return doc.k;
}

/** Ongoing before upcoming before past, then the nearest deadline to act on. */
export function compareDocs(a: SearchDoc, b: SearchDoc, at = todayIso()) {
  return a.p - b.p || sortKeyAt(a, at).localeCompare(sortKeyAt(b, at)) || b.f - a.f || a.st.localeCompare(b.st);
}

/** `compareDocs` with the reference date resolved once, for sorting long lists. */
export function compareDocsAt(at: string) {
  return (a: SearchDoc, b: SearchDoc) => compareDocs(a, b, at);
}

export function phaseOfDoc(doc: SearchDoc): LifecyclePhase {
  return lifecyclePhases[doc.p] ?? "past";
}

export function toSearchDoc(item: Exam): SearchDoc {
  const haystack = [
    ...item.aliases,
    ...(item.keywords ?? []),
    item.jurisdiction,
    item.notificationNumber,
    item.sector,
    item.qualification,
    item.cycle,
  ]
    .filter(Boolean)
    .join(" · ");
  const closing = applicationCloseDate(item);

  return {
    s: item.slug,
    t: item.title,
    st: item.shortTitle,
    o: item.organisation,
    h: normalise(haystack),
    e: item.education,
    x: item.examTypes,
    g: item.governmentLevel,
    r: Array.from(new Set([...(item.regionCodes ?? []), ...(item.stateCode ? [item.stateCode] : [])])),
    ...(item.state ? { sn: item.state } : {}),
    y: item.year,
    n: item.status.tone,
    sl: item.status.label,
    na: item.status.nextAction,
    v: item.vacancyLabel,
    c: item.lastVerified.split(",")[0],
    vf: item.verification === "verified" ? 1 : 0,
    f: item.featured ? 1 : 0,
    p: lifecyclePhaseIndex(item) as 0 | 1 | 2,
    k: lifecycleSortKey(item),
    ...(closing ? { cd: closing } : {}),
  };
}

/** Lowercase, strip punctuation, fold the typographic dashes/quotes in titles. */
export function normalise(value: string) {
  return value
    .toLocaleLowerCase("en-IN")
    .replace(/\b(?:[a-z]\.){2,}[a-z]?\.?/g, (acronym) => acronym.replaceAll(".", ""))
    .replace(/[’'`]/g, "")
    .replace(/[^a-z0-9ऀ-෿]+/g, " ")
    .trim();
}

/**
 * Words candidates actually type, mapped to the vocabulary the official titles
 * use. Without this, "bank po" and "12th pass" find nothing.
 */
const SYNONYMS: Record<string, string[]> = {
  po: ["probationary officer"],
  so: ["specialist officer"],
  mt: ["management trainee"],
  si: ["sub inspector"],
  asi: ["assistant sub inspector"],
  ci: ["circle inspector"],
  gd: ["general duty", "constable"],
  je: ["junior engineer"],
  ae: ["assistant engineer"],
  ldc: ["lower division clerk"],
  udc: ["upper division clerk"],
  deo: ["data entry operator"],
  mts: ["multi tasking staff"],
  cse: ["civil services"],
  ias: ["civil services", "administrative"],
  ips: ["civil services", "police"],
  ifs: ["forest service", "foreign service"],
  pcs: ["provincial civil service", "state service"],
  psc: ["public service commission"],
  tet: ["teacher eligibility test"],
  clerk: ["clerical", "junior associate"],
  bank: ["banking"],
  banking: ["bank"],
  railway: ["railways", "rrb"],
  railways: ["railway", "rrb"],
  defence: ["armed forces", "army", "navy", "air force"],
  army: ["armed forces"],
  navy: ["armed forces"],
  teacher: ["teaching"],
  teaching: ["teacher"],
  nurse: ["nursing"],
  doctor: ["medical"],
  police: ["constable", "police capf"],
  "12th": ["class 12", "higher secondary", "intermediate"],
  "10th": ["class 10", "matriculation", "matric"],
  "12": ["12th", "class 12", "higher secondary", "intermediate"],
  "10": ["10th", "class 10", "matriculation", "matric"],
  graduate: ["bachelors degree", "graduation"],
};

/** Tokens that carry no signal on their own. */
const STOPWORDS = new Set([
  "the",
  "for",
  "and",
  "in",
  "of",
  "a",
  "an",
  "to",
  "on",
  "is",
  "all",
  "any",
  "with",
  "after",
  "class",
  "exam",
  "exams",
  "government",
  "govt",
  "job",
  "jobs",
  "latest",
  "naukri",
  "pass",
  "recruitment",
  "sarkari",
  "vacancy",
  "vacancies",
]);

function isAdjacentTransposition(a: string, b: string) {
  if (a.length !== b.length) return false;
  const mismatches: number[] = [];
  for (let index = 0; index < a.length; index++) {
    if (a[index] !== b[index]) mismatches.push(index);
    if (mismatches.length > 2) return false;
  }
  return (
    mismatches.length === 2 &&
    mismatches[1] === mismatches[0] + 1 &&
    a[mismatches[0]] === b[mismatches[1]] &&
    a[mismatches[1]] === b[mismatches[0]]
  );
}

function editDistanceWithin(a: string, b: string, max: number) {
  if (max >= 1 && isAdjacentTransposition(a, b)) return true;
  if (Math.abs(a.length - b.length) > max) return false;
  // Bounded Levenshtein: we only care whether it is within `max`.
  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    let rowBest = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      const value = Math.min(previous[j] + 1, current[j - 1] + 1, previous[j - 1] + cost);
      current.push(value);
      if (value < rowBest) rowBest = value;
    }
    if (rowBest > max) return false;
    previous = current;
  }
  return previous[b.length] <= max;
}

function fuzzyThreshold(token: string) {
  if (token.length >= 8) return 2;
  if (token.length >= 5) return 1;
  return 0;
}

export type Ranked = { doc: SearchDoc; score: number };

/** Keep one canonical result for each recruitment cycle. */
export function uniqueSearchDocs(docs: SearchDoc[]) {
  const bySlug = new Map<string, SearchDoc>();
  for (const doc of docs) {
    if (!bySlug.has(doc.s)) bySlug.set(doc.s, doc);
  }
  return Array.from(bySlug.values());
}

/**
 * Rank documents against a free-text query.
 *
 * Every meaningful token must match somewhere (AND semantics), so "ssc cgl"
 * does not return every SSC exam. Token order does not matter, exact whole-word
 * hits beat prefixes, prefixes beat substrings, and a bounded edit distance
 * catches typos like "cosntable".
 */
export function rank(docs: SearchDoc[], query: string, at = todayIso()): Ranked[] {
  const cleaned = normalise(query);
  if (!cleaned) return [];

  const rawTokens = cleaned.split(" ").filter(Boolean);
  const tokens = rawTokens.filter((token) => !STOPWORDS.has(token));
  if (!tokens.length) {
    return uniqueSearchDocs(docs)
      .sort(compareDocsAt(at))
      .map((doc) => ({ doc, score: 0 }));
  }

  const results = new Map<string, Ranked>();

  for (const doc of uniqueSearchDocs(docs)) {
    // Whole-phrase hit in the title is the strongest possible signal.
    let score = 0;
    const titleHay = normalise(`${doc.st} ${doc.t}`);
    // Display and facet fields are already present in the compact document.
    // Compose them here instead of serialising the same text into `h` again.
    const searchHay = normalise(
      `${doc.h} ${doc.o} ${doc.sn ?? ""} ${doc.e.join(" ")} ${doc.x.join(" ")} ${doc.g} ${doc.y}`,
    );
    if (titleHay.includes(cleaned)) score += 60;
    else if (searchHay.includes(cleaned)) score += 25;

    let matchedAll = true;

    for (const token of tokens) {
      const variants = [token, ...(SYNONYMS[token] ?? []).map(normalise)];
      let best = 0;

      for (const variant of variants) {
        const weight = variant === token ? 1 : 0.7;

        if (new RegExp(`(^| )${escapeRegExp(variant)}( |$)`).test(titleHay)) {
          best = Math.max(best, 30 * weight);
        } else if (new RegExp(`(^| )${escapeRegExp(variant)}`).test(titleHay)) {
          best = Math.max(best, 22 * weight);
        } else if (new RegExp(`(^| )${escapeRegExp(variant)}( |$)`).test(searchHay)) {
          best = Math.max(best, 16 * weight);
        } else if (new RegExp(`(^| )${escapeRegExp(variant)}`).test(searchHay)) {
          best = Math.max(best, 11 * weight);
        } else if (searchHay.includes(variant)) {
          best = Math.max(best, 6 * weight);
        }
      }

      // Typo tolerance, only when nothing matched cleanly.
      const allowed = fuzzyThreshold(token);
      if (!best && allowed) {
        for (const word of searchHay.split(" ")) {
          if (word.length >= 3 && editDistanceWithin(token, word, allowed)) {
            best = 5;
            break;
          }
        }
      }

      if (!best) {
        matchedAll = false;
        break;
      }
      score += best;
    }

    if (!matchedAll) continue;

    // Prefer records a candidate can act on: confirmed detail, then recency.
    score += doc.vf * 4;
    score += doc.f * 3;
    score += Math.max(0, doc.y - 2024) * 2;
    if (doc.n === "green" || doc.n === "amber") score += 3;

    const existing = results.get(doc.s);
    if (!existing || score > existing.score) results.set(doc.s, { doc, score });
  }

  // Phase leads every list on the site, so a live cycle is never buried under a
  // finished one. Relevance still decides the order inside a phase.
  return Array.from(results.values()).sort(
    (a, b) => a.doc.p - b.doc.p || b.score - a.score || compareDocs(a.doc, b.doc, at),
  );
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export type Facets = {
  education: "All" | EducationLevel;
  examType: "All" | ExamType;
  level: "All" | GovernmentLevel;
  region: "All" | string;
  year: "All" | number;
  tones: readonly StatusTone[];
  phase?: LifecyclePhase;
};

/** Apply the explorer's dropdown filters. Kept separate from ranking. */
export function applyFacets(docs: SearchDoc[], facets: Facets) {
  return uniqueSearchDocs(docs).filter((doc) => {
    if (facets.education !== "All" && !doc.e.includes(facets.education)) return false;
    if (facets.examType !== "All" && !doc.x.includes(facets.examType)) return false;
    if (facets.level !== "All" && doc.g !== facets.level) return false;
    if (facets.year !== "All" && doc.y !== facets.year) return false;
    if (facets.tones.length && !facets.tones.includes(doc.n)) return false;
    if (facets.phase && phaseOfDoc(doc) !== facets.phase) return false;
    if (facets.region !== "All") {
      // "central" is offered as its own option, so picking a state narrows to
      // that state's own recruitment rather than re-listing every all-India cycle.
      if (facets.region === "central") {
        if (doc.g !== "Central") return false;
      } else if (!doc.r.includes(facets.region)) {
        return false;
      }
    }
    return true;
  });
}

export type StatusFilter =
  | "all"
  | "ongoing"
  | "upcoming"
  | "past"
  | "open"
  | "attention"
  | "notification-soon"
  | "exam-scheduled"
  | "in-progress";

/**
 * Two ways to narrow the same list: by where the cycle sits overall (phase), or
 * by the exact stage it is at (tone). The explorer groups them separately so
 * "Ongoing" never reads like a synonym for "Applications open".
 */
export const statusFilters: readonly {
  value: StatusFilter;
  label: string;
  tones: readonly StatusTone[];
  phase?: LifecyclePhase;
  group?: "phase" | "stage";
}[] = [
  { value: "all", label: "All stages", tones: [] },
  { value: "ongoing", label: "Ongoing", tones: [], phase: "ongoing", group: "phase" },
  { value: "upcoming", label: "Upcoming", tones: [], phase: "upcoming", group: "phase" },
  { value: "past", label: "Past", tones: [], phase: "past", group: "phase" },
  { value: "open", label: "Applications open", tones: ["green"], group: "stage" },
  { value: "attention", label: "Needs attention", tones: ["red"], group: "stage" },
  { value: "notification-soon", label: "Notification soon", tones: ["amber"], group: "stage" },
  { value: "exam-scheduled", label: "Exam scheduled", tones: ["blue"], group: "stage" },
  { value: "in-progress", label: "In progress / results", tones: ["violet", "slate"], group: "stage" },
];

export type ExplorerState = {
  query: string;
  education: "All" | EducationLevel;
  examType: "All" | ExamType;
  level: "All" | GovernmentLevel;
  region: "All" | "central" | string;
  year: "All" | number;
  status: StatusFilter;
  savedOnly: boolean;
};

export type ExplorerParamOptions = {
  education: readonly EducationLevel[];
  examTypes: readonly ExamType[];
  regions: readonly string[];
  years: readonly number[];
};

export const defaultExplorerState: ExplorerState = {
  query: "",
  education: "All",
  examType: "All",
  level: "All",
  region: "All",
  year: "All",
  status: "all",
  savedOnly: false,
};

export function tonesForStatus(status: StatusFilter): readonly StatusTone[] {
  return statusFilters.find((filter) => filter.value === status)?.tones ?? [];
}

export function phaseForStatus(status: StatusFilter) {
  return statusFilters.find((filter) => filter.value === status)?.phase;
}

export function parseExplorerParams(params: URLSearchParams, options: ExplorerParamOptions): ExplorerState {
  const requestedEducation = params.get("education") as EducationLevel | null;
  const requestedType = params.get("type") as ExamType | null;
  const requestedLevel = params.get("level");
  const requestedRegion = params.get("region");
  const requestedYear = Number(params.get("year"));
  const requestedStatus = params.get("status") as StatusFilter | null;

  return {
    query: params.get("q")?.trim() ?? "",
    education: requestedEducation && options.education.includes(requestedEducation) ? requestedEducation : "All",
    examType: requestedType && options.examTypes.includes(requestedType) ? requestedType : "All",
    level: requestedLevel === "Central" || requestedLevel === "State" ? requestedLevel : "All",
    region:
      requestedRegion === "central" || (requestedRegion && options.regions.includes(requestedRegion))
        ? requestedRegion
        : "All",
    year: Number.isInteger(requestedYear) && options.years.includes(requestedYear) ? requestedYear : "All",
    status:
      requestedStatus && statusFilters.some((filter) => filter.value === requestedStatus)
        ? requestedStatus
        : "all",
    savedOnly: params.get("saved") === "1",
  };
}

export function toExplorerParams(state: ExplorerState) {
  const params = new URLSearchParams();
  if (state.query.trim()) params.set("q", state.query.trim());
  if (state.education !== "All") params.set("education", state.education);
  if (state.examType !== "All") params.set("type", state.examType);
  if (state.level !== "All") params.set("level", state.level);
  if (state.region !== "All") params.set("region", state.region);
  if (state.year !== "All") params.set("year", String(state.year));
  if (state.status !== "all") params.set("status", state.status);
  if (state.savedOnly) params.set("saved", "1");
  return params;
}
