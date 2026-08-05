import type { ExamType, GovernmentLevel, TimelineState } from "@/lib/exam-types";
import { normalise } from "@/lib/search";

/**
 * The exam a milestone belongs to, stored once per exam. A cycle with five
 * dated stages would otherwise ship its title, organisation and facets five
 * times over to the browser.
 */
export type CalendarExam = {
  /** slug */ s: string;
  /** short title */ t: string;
  /** organisation */ o: string;
  /** exam types */ x: ExamType[];
  /** government level */ g: GovernmentLevel;
  /** region codes ([] = all-India) */ r: string[];
};

export type CalendarMilestone = {
  /** exam slug */ s: string;
  /** stage label */ l: string;
  /** stage note */ nt?: string;
  /** stage state */ e: TimelineState;
  /** ISO sort date, always a full date */ d: string;
  /** dateTime attribute: YYYY-MM for month-only entries */ dt: string;
  /** display date as published */ dd: string;
  /** section: 0 current and upcoming, 1 recent history */ p: 0 | 1;
};

export type CalendarFeed = { exams: CalendarExam[]; events: CalendarMilestone[] };

/** The shape `calendarEvents` produces, narrowed to what the calendar needs. */
export type CalendarEventInput = {
  label: string;
  note?: string;
  state: TimelineState;
  sortDate: string;
  dateTime: string;
  displayDate: string;
  examSlug: string;
  examTitle: string;
  organisation: string;
  examTypes: ExamType[];
  governmentLevel: GovernmentLevel;
  regionCodes: string[];
};

/** Split the two rendered sections into one exam table and one milestone list. */
export function toCalendarFeed(upcoming: CalendarEventInput[], history: CalendarEventInput[]): CalendarFeed {
  const exams = new Map<string, CalendarExam>();

  const collect = (events: CalendarEventInput[], section: 0 | 1): CalendarMilestone[] =>
    events.map((event) => {
      if (!exams.has(event.examSlug)) {
        exams.set(event.examSlug, {
          s: event.examSlug,
          t: event.examTitle,
          o: event.organisation,
          x: event.examTypes,
          g: event.governmentLevel,
          r: event.regionCodes,
        });
      }
      return {
        s: event.examSlug,
        l: event.label,
        ...(event.note ? { nt: event.note } : {}),
        e: event.state,
        d: event.sortDate,
        dt: event.dateTime,
        dd: event.displayDate,
        p: section,
      };
    });

  // `collect` fills the exam table as it goes, so the milestones must be built
  // before the table is read out.
  const events = [...collect(upcoming, 0), ...collect(history, 1)];
  return { exams: Array.from(exams.values()), events };
}

/**
 * Which section a milestone belongs in, judged against `at`. The build files
 * each milestone once, but a date does not stay in the future: read the page a
 * week later and yesterday's exam is still sitting under "Current and
 * upcoming" unless this is asked again in the browser.
 *
 * Mirrors the windowing in app/calendar/page.tsx — month-only entries are only
 * ever as precise as their month.
 */
export function calendarSection(event: CalendarMilestone, at: string): 0 | 1 {
  if (event.dt.length === 7) return event.dt >= at.slice(0, 7) ? 0 : 1;
  return event.d >= at ? 0 : 1;
}

/** Soonest first for what is still to come, newest first for what has passed. */
export function splitCalendar(events: CalendarMilestone[], at: string) {
  const upcoming: CalendarMilestone[] = [];
  const history: CalendarMilestone[] = [];
  for (const event of events) {
    (calendarSection(event, at) === 0 ? upcoming : history).push(event);
  }
  upcoming.sort((a, b) => a.d.localeCompare(b.d));
  history.sort((a, b) => b.d.localeCompare(a.d));
  return { upcoming, history };
}

export type CalendarFilterState = {
  query: string;
  examType: "All" | ExamType;
  region: "All" | "central" | string;
  stage: "All" | TimelineState;
};

export const defaultCalendarFilter: CalendarFilterState = {
  query: "",
  examType: "All",
  region: "All",
  stage: "All",
};

export const calendarStageOptions: { value: TimelineState; label: string }[] = [
  { value: "current", label: "Current / next" },
  { value: "scheduled", label: "Scheduled" },
  { value: "tentative", label: "Tentative" },
  { value: "postponed", label: "Postponed" },
  { value: "completed", label: "Completed" },
];

export function calendarFilterCount(filters: CalendarFilterState) {
  return [
    Boolean(filters.query.trim()),
    filters.examType !== "All",
    filters.region !== "All",
    filters.stage !== "All",
  ].filter(Boolean).length;
}

export function examLookup(feed: CalendarFeed) {
  return new Map(feed.exams.map((item) => [item.s, item]));
}

/**
 * Narrow the milestone list. Every query token has to match somewhere, which
 * keeps "bihar police" from returning every Bihar milestone.
 */
export function filterCalendar(feed: CalendarFeed, filters: CalendarFilterState) {
  const exams = examLookup(feed);
  const tokens = normalise(filters.query).split(" ").filter(Boolean);

  return feed.events.filter((event) => {
    const exam = exams.get(event.s);
    if (!exam) return false;
    if (filters.stage !== "All" && event.e !== filters.stage) return false;
    if (filters.examType !== "All" && !exam.x.includes(filters.examType)) return false;

    if (filters.region !== "All") {
      // "Central / All India" is its own option so picking a state shows that
      // state's own recruitment rather than every nationwide cycle as well.
      if (filters.region === "central") {
        if (exam.g !== "Central") return false;
      } else if (!exam.r.includes(filters.region)) {
        return false;
      }
    }

    if (tokens.length) {
      const haystack = normalise(`${exam.t} ${exam.o} ${event.l} ${exam.x.join(" ")}`);
      if (!tokens.every((token) => haystack.includes(token))) return false;
    }

    return true;
  });
}
