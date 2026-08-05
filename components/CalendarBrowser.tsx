"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import {
  calendarFilterCount,
  calendarStageOptions,
  defaultCalendarFilter,
  examLookup,
  filterCalendar,
  splitCalendar,
  type CalendarExam,
  type CalendarFeed,
  type CalendarFilterState,
  type CalendarMilestone,
} from "@/lib/calendar";
import { examTypeOptions, indiaRegions } from "@/lib/discovery";
import type { ExamType, TimelineState } from "@/lib/exam-types";
import { useToday } from "@/lib/use-today";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** "2026-08" → "August 2026", without depending on browser locale data. */
function monthTitle(key: string) {
  const [year, month] = key.split("-");
  return `${MONTH_NAMES[Number(month) - 1]} ${year}`;
}

function groupByMonth(events: CalendarMilestone[]) {
  const months = new Map<string, CalendarMilestone[]>();
  for (const event of events) {
    const key = event.d.slice(0, 7);
    months.set(key, [...(months.get(key) ?? []), event]);
  }
  return Array.from(months.entries());
}

function CalendarEventGroups({
  events,
  exams,
  idPrefix,
}: {
  events: CalendarMilestone[];
  exams: Map<string, CalendarExam>;
  idPrefix: string;
}) {
  return (
    <div className="calendar-list">
      {groupByMonth(events).map(([key, monthEvents]) => (
        <section key={key} className="calendar-month" aria-labelledby={`${idPrefix}-month-${key}`}>
          <div className="month-heading">
            <h2 id={`${idPrefix}-month-${key}`}>{monthTitle(key)}</h2>
            <span>{monthEvents.length} events</span>
          </div>
          <div className="month-events">
            {monthEvents.map((event) => {
              const exam = exams.get(event.s);
              return (
                <Link
                  href={`/exams/${event.s}#timeline`}
                  prefetch={false}
                  className={`calendar-event event-${event.e}`}
                  key={`${event.s}-${event.l}-${event.d}`}
                >
                  <time dateTime={event.dt}>{event.dd}</time>
                  <div>
                    <span>{exam?.o}</span>
                    <h3>{exam?.t}</h3>
                    <p>{event.l}{event.nt ? ` · ${event.nt}` : ""}</p>
                  </div>
                  <strong>{event.e}</strong>
                  <span aria-hidden="true">→</span>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}

export function CalendarBrowser({ feed, buildDate }: { feed: CalendarFeed; buildDate: string }) {
  const controlId = useId();
  const [filters, setFilters] = useState<CalendarFilterState>(defaultCalendarFilter);
  const today = useToday(buildDate);

  const exams = useMemo(() => examLookup(feed), [feed]);
  const matches = useMemo(() => filterCalendar(feed, filters), [feed, filters]);
  // The build's split is only right on the day it ran, so it is made again here
  // against the reader's own date.
  const { upcoming, history } = useMemo(() => splitCalendar(matches, today), [matches, today]);
  const activeCount = calendarFilterCount(filters);

  const update = (patch: Partial<CalendarFilterState>) => setFilters((current) => ({ ...current, ...patch }));

  return (
    <>
      <div className="calendar-filter" role="search">
        <div className="calendar-filter-search">
          <span aria-hidden="true">⌕</span>
          <label htmlFor={`${controlId}-query`} className="sr-only">Filter the calendar by exam or department</label>
          <input
            id={`${controlId}-query`}
            type="search"
            value={filters.query}
            onChange={(event) => update({ query: event.target.value })}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.preventDefault();
            }}
            placeholder="Filter by exam or department"
            autoComplete="off"
          />
        </div>

        <label htmlFor={`${controlId}-type`} className="sr-only">Exam category</label>
        <select
          id={`${controlId}-type`}
          value={filters.examType}
          onChange={(event) => update({ examType: event.target.value as "All" | ExamType })}
        >
          <option value="All">All categories</option>
          {examTypeOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.value}</option>
          ))}
        </select>

        <label htmlFor={`${controlId}-region`} className="sr-only">Location</label>
        <select
          id={`${controlId}-region`}
          value={filters.region}
          onChange={(event) => update({ region: event.target.value })}
        >
          <option value="All">All India + every state</option>
          <option value="central">Central / All India only</option>
          <optgroup label="States">
            {indiaRegions.filter((region) => region.kind === "State").map((region) => (
              <option key={region.code} value={region.code}>{region.name}</option>
            ))}
          </optgroup>
          <optgroup label="Union territories">
            {indiaRegions.filter((region) => region.kind === "Union territory").map((region) => (
              <option key={region.code} value={region.code}>{region.name}</option>
            ))}
          </optgroup>
        </select>

        <label htmlFor={`${controlId}-stage`} className="sr-only">Milestone kind</label>
        <select
          id={`${controlId}-stage`}
          value={filters.stage}
          onChange={(event) => update({ stage: event.target.value as "All" | TimelineState })}
        >
          <option value="All">All milestones</option>
          {calendarStageOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>

        <p role="status" aria-live="polite" aria-atomic="true">
          <strong>{matches.length}</strong> of {feed.events.length}
        </p>
        <button
          type="button"
          className="reset-button"
          onClick={() => setFilters(defaultCalendarFilter)}
          disabled={!activeCount}
        >
          Reset
        </button>
      </div>

      <section className="collection-section" aria-labelledby="current-upcoming-title">
        <div className="section-heading">
          <span className="kicker">Act next</span>
          <h2 id="current-upcoming-title">Current and upcoming</h2>
          <p>
            {upcoming.length} exact-date or month-window {upcoming.length === 1 ? "milestone" : "milestones"} from
            now onward, ordered soonest first.
          </p>
        </div>
        {upcoming.length ? (
          <CalendarEventGroups events={upcoming} exams={exams} idPrefix="current" />
        ) : (
          <div className="missing-data">
            <span aria-hidden="true">i</span>
            <div>
              <h3>{activeCount ? "No upcoming milestone matches this filter" : "No upcoming dated milestone"}</h3>
              <p>
                {activeCount
                  ? "Widen the filter, or open an exam page to see stages whose dates are still awaited."
                  : "Check individual exam pages for stages whose dates are still awaited."}
              </p>
            </div>
          </div>
        )}
      </section>

      <section className="collection-section" aria-labelledby="recent-history-title">
        <div className="section-heading">
          <span className="kicker">Recent history</span>
          <h2 id="recent-history-title">Recently completed milestones</h2>
          <p>
            {/* No fixed window is claimed: milestones move here as their dates
                pass, so a page read weeks after it was built holds more than
                the history the build shipped. */}
            The {history.length} most recent {history.length === 1 ? "milestone" : "milestones"} already passed.
            Older dates remain on each exam page.
          </p>
        </div>
        {history.length ? (
          <CalendarEventGroups events={history} exams={exams} idPrefix="history" />
        ) : (
          <div className="missing-data">
            <span aria-hidden="true">i</span>
            <div>
              <h3>{activeCount ? "No recent milestone matches this filter" : "No recent dated milestone"}</h3>
              <p>Older dates remain available on individual exam pages.</p>
            </div>
          </div>
        )}
      </section>
    </>
  );
}
