export type EducationLevel =
  | "10th"
  | "12th"
  | "ITI / Diploma"
  | "Graduate"
  | "Postgraduate"
  | "Professional degree";

export type GovernmentLevel = "Central" | "State";

export type ExamType =
  | "Civil Services & Administration"
  | "Banking & Finance"
  | "Armed Forces"
  | "Police & CAPF"
  | "Railways"
  | "Health & Medical"
  | "Technical & Trades"
  | "Teaching & Education"
  | "Specialist & Professional"
  | "Judiciary & Legal"
  | "Public Sector Undertakings";

export type StatusTone =
  | "green"
  | "amber"
  | "red"
  | "blue"
  | "violet"
  | "slate";

export type TimelineState =
  | "completed"
  | "current"
  | "scheduled"
  | "tentative"
  | "postponed";

/**
 * How much of a record is confirmed against a dated official document.
 *
 * - `verified`  — the cycle's dates, status and (where published) vacancies were
 *                 read off a specific official notice or calendar entry.
 * - `listed`    — the recruitment exists and the recruiting body and official
 *                 pages are confirmed, but the current cycle's dates/vacancies
 *                 are not announced. Unknown fields must say so rather than
 *                 carry an estimate.
 *
 * Nothing in this dataset may present an inferred date or vacancy count as fact.
 */
export type Verification = "verified" | "listed";

export type ExamEvent = {
  label: string;
  /**
   * Official ISO date used by the calendar. Omit it when the recruiting body
   * has announced the stage but not its date; never add a placeholder solely
   * to make an undated stage sortable.
   */
  date?: string;
  /** Official YYYY-MM month for a month-only date or wider calendar window. */
  sortMonth?: string;
  displayDate: string;
  state: TimelineState;
  note?: string;
};

export type VacancyRow = {
  label: string;
  ur?: number;
  ews?: number;
  obc?: number;
  sc?: number;
  st?: number;
  total: number;
};

export type OfficialLink = {
  label: string;
  url: string;
  type: "notice" | "apply" | "calendar" | "result" | "website";
};

export type Exam = {
  slug: string;
  title: string;
  shortTitle: string;
  aliases: string[];
  organisation: string;
  governmentLevel: GovernmentLevel;
  jurisdiction: string;
  state?: string;
  stateCode?: string;
  /**
   * Every region this recruitment actually recruits for. Central/all-India
   * exams leave this empty and are treated as available everywhere; a state
   * exam normally lists its own code, and inter-state bodies list several.
   */
  regionCodes?: string[];
  cycle: string;
  /** Primary calendar year of the cycle, used for year filtering and sorting. */
  year: number;
  notificationNumber?: string;
  sector: string;
  examTypes: ExamType[];
  education: EducationLevel[];
  verification: Verification;
  status: {
    label: string;
    tone: StatusTone;
    nextAction: string;
    detail: string;
  };
  summary: string;
  vacancies?: number;
  vacancyLabel: string;
  vacancyNote: string;
  vacancyBreakdown?: VacancyRow[];
  age: string;
  qualification: string;
  fee: string;
  pay: string;
  timeline: ExamEvent[];
  eligibility: string[];
  relaxations: string[];
  selectionStages: string[];
  syllabus: string[];
  documents: string[];
  officialLinks: OfficialLink[];
  sourceTitle: string;
  sourceUrl: string;
  sourcePublished: string;
  lastVerified: string;
  changeLog: { date: string; displayDate: string; text: string }[];
  /** Extra search terms: local-language names, post names, common misspellings. */
  keywords?: string[];
  featured?: boolean;
};

/** A recruiting body, and the hosts a record is allowed to cite for it. */
export type Authority = {
  id: string;
  name: string;
  level: GovernmentLevel;
  /** Region codes this body recruits for. Empty for all-India bodies. */
  regionCodes?: string[];
  allowedHosts: string[];
  watchUrls: string[];
};

export const commonDocuments = [
  "Recent passport-size photograph and scanned signature",
  "Government photo ID with the same name used in the application",
  "Education certificates and marksheets",
  "Category, EWS, PwBD or ex-serviceman certificate, if claimed",
  "Domicile or language proof where the notification requires it",
];

/** Wording reused by records whose current cycle has no published figure yet. */
export const NOT_ANNOUNCED = "Not announced";

export function exam(
  value: Omit<Exam, "documents" | "relaxations" | "changeLog" | "verification"> &
    Partial<Pick<Exam, "documents" | "relaxations" | "changeLog" | "verification">>,
): Exam {
  return {
    documents: commonDocuments,
    relaxations: [
      "SC/ST, OBC-NCL, PwBD and ex-servicemen relaxations follow the applicable notification.",
      "Always check the certificate format and cut-off date in the official notice.",
    ],
    changeLog: [],
    verification: "listed",
    ...value,
  };
}

type ListedDefaultField =
  | "aliases"
  | "vacancyLabel"
  | "vacancyNote"
  | "age"
  | "qualification"
  | "fee"
  | "pay"
  | "timeline"
  | "eligibility"
  | "relaxations"
  | "selectionStages"
  | "syllabus"
  | "documents"
  | "changeLog";

/**
 * Minimal, honesty-preserving input for a known recruitment series whose
 * current cycle has not published its detailed notice. Callers may replace
 * any editorial default with sourced information, but cannot attach numeric
 * vacancies or mark the record verified through this factory.
 */
export type ListedExamInput =
  Omit<Exam, ListedDefaultField | "verification" | "vacancies" | "vacancyBreakdown"> &
  Partial<Pick<Exam, ListedDefaultField>> & {
    verification?: never;
    vacancies?: never;
    vacancyBreakdown?: never;
  };

export function listedExam(value: ListedExamInput): Exam {
  return exam({
    ...value,
    aliases: value.aliases ?? [],
    verification: "listed",
    vacancyLabel: value.vacancyLabel ?? NOT_ANNOUNCED,
    vacancyNote: value.vacancyNote ?? "Vacancies will be added only after an official notice publishes them.",
    age: value.age ?? "As prescribed in the notification.",
    qualification:
      value.qualification ?? "See the official notification; no current-cycle qualification is asserted here.",
    fee: value.fee ?? "See the official notification",
    pay: value.pay ?? "See the official notification",
    timeline: value.timeline ?? [],
    eligibility: value.eligibility ?? [
      "Confirm education, age, nationality, domicile and category rules in the official current-cycle notice.",
    ],
    selectionStages: value.selectionStages ?? [
      "See the official notification; no current-cycle selection stages are asserted here.",
    ],
    syllabus: value.syllabus ?? [
      "Use only the official current-cycle syllabus when it is published.",
    ],
  });
}
