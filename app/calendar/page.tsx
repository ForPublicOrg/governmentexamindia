import type { Metadata } from "next";
import Link from "next/link";
import { calendarEvents } from "@/lib/exams";

export const metadata: Metadata = {
  title: "Government exam calendar",
  description: "A timeline of government exam notifications, applications, exams, objections and results.",
  alternates: { canonical: "/calendar" },
};

const monthFormatter = new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric", timeZone: "Asia/Kolkata" });
const indiaDateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "Asia/Kolkata",
});
const RECENT_HISTORY_DAYS = 90;
const MAX_RECENT_HISTORY_EVENTS = 36;

type CalendarEvent = (typeof calendarEvents)[number];

function monthKey(date: string) {
  return date.slice(0, 7);
}

function indiaDateKey(date: Date) {
  const parts = indiaDateFormatter.formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";
  return `${value("year")}-${value("month")}-${value("day")}`;
}

function shiftIsoDate(date: string, days: number) {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

function groupEvents(events: CalendarEvent[]) {
  return events.reduce<Record<string, CalendarEvent[]>>((groups, event) => {
    const key = monthKey(event.sortDate);
    groups[key] = [...(groups[key] ?? []), event];
    return groups;
  }, {});
}

function CalendarEventGroups({ events, idPrefix }: { events: CalendarEvent[]; idPrefix: string }) {
  return (
    <div className="calendar-list">
      {Object.entries(groupEvents(events)).map(([key, monthEvents]) => {
        const title = monthFormatter.format(new Date(`${key}-15T00:00:00Z`));
        return (
          <section key={key} className="calendar-month" aria-labelledby={`${idPrefix}-month-${key}`}>
            <div className="month-heading"><h2 id={`${idPrefix}-month-${key}`}>{title}</h2><span>{monthEvents.length} events</span></div>
            <div className="month-events">
              {monthEvents.map((event) => (
                <Link href={`/exams/${event.examSlug}#timeline`} prefetch={false} className={`calendar-event event-${event.state}`} key={`${event.examSlug}-${event.label}-${event.sortDate}`}>
                  <time dateTime={event.dateTime}>{event.displayDate}</time>
                  <div><span>{event.organisation}</span><h3>{event.examTitle}</h3><p>{event.label}{event.note ? ` · ${event.note}` : ""}</p></div>
                  <strong>{event.state}</strong>
                  <span aria-hidden="true">→</span>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

const today = indiaDateKey(new Date());
const recentHistoryCutoff = shiftIsoDate(today, -RECENT_HISTORY_DAYS);
const currentMonth = monthKey(today);
const recentHistoryCutoffMonth = monthKey(recentHistoryCutoff);
const currentAndUpcomingEvents = calendarEvents.filter((event) =>
  event.dateTime.length === 7 ? event.dateTime >= currentMonth : event.sortDate >= today,
);
const recentHistoryEvents = calendarEvents
  .filter((event) =>
    event.dateTime.length === 7
      ? event.dateTime < currentMonth && event.dateTime >= recentHistoryCutoffMonth
      : event.sortDate < today && event.sortDate >= recentHistoryCutoff,
  )
  .sort((a, b) => b.sortDate.localeCompare(a.sortDate))
  .slice(0, MAX_RECENT_HISTORY_EVENTS);

export default function CalendarPage() {
  return (
    <div className="page-shell calendar-page">
      <div className="page-intro calendar-intro">
        <div>
          <span className="eyebrow">One national timeline</span>
          <h1>Exam calendar</h1>
          <p>Notifications, closing dates, exams and results in one sequence. Tentative dates stay visibly tentative.</p>
        </div>
        <div className="calendar-legend" aria-label="Calendar legend">
          <span><i className="legend-current" />Current / next</span>
          <span><i className="legend-scheduled" />Scheduled</span>
          <span><i className="legend-tentative" />Tentative</span>
          <span><i className="legend-postponed" />Postponed</span>
        </div>
      </div>

      <div className="calendar-notice">
        <span aria-hidden="true">i</span>
        <p><strong>Dates are not all the same kind.</strong> Exact dates come from notices; month-only entries come from official tentative calendars. Open the exam page to see which is which.</p>
      </div>

      <section className="collection-section" aria-labelledby="current-upcoming-title">
        <div className="section-heading">
          <span className="kicker">Act next</span>
          <h2 id="current-upcoming-title">Current and upcoming</h2>
          <p>{currentAndUpcomingEvents.length} exact-date or month-window milestones from now onward, ordered soonest first.</p>
        </div>
        {currentAndUpcomingEvents.length ? (
          <CalendarEventGroups events={currentAndUpcomingEvents} idPrefix="current" />
        ) : (
          <div className="missing-data"><span aria-hidden="true">i</span><div><h3>No upcoming dated milestone</h3><p>Check individual exam pages for stages whose dates are still awaited.</p></div></div>
        )}
      </section>

      <section className="collection-section" aria-labelledby="recent-history-title">
        <div className="section-heading">
          <span className="kicker">Recent history</span>
          <h2 id="recent-history-title">Recently completed milestones</h2>
          <p>The newest {recentHistoryEvents.length} events from the past {RECENT_HISTORY_DAYS} days. Older dates remain on each exam page.</p>
        </div>
        {recentHistoryEvents.length ? (
          <CalendarEventGroups events={recentHistoryEvents} idPrefix="history" />
        ) : (
          <div className="missing-data"><span aria-hidden="true">i</span><div><h3>No recent dated milestone</h3><p>Older dates remain available on individual exam pages.</p></div></div>
        )}
      </section>
    </div>
  );
}
