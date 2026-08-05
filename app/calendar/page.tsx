import type { Metadata } from "next";
import { CalendarBrowser } from "@/components/CalendarBrowser";
import { toCalendarFeed } from "@/lib/calendar";
import { calendarEvents } from "@/lib/exams";
import { todayIso } from "@/lib/lifecycle";

export const metadata: Metadata = {
  title: "Government exam calendar",
  description: "A timeline of government exam notifications, applications, exams, objections and results.",
  alternates: { canonical: "/calendar" },
};

const RECENT_HISTORY_DAYS = 90;
/**
 * This bounds what is *shipped*, and the page has almost no room left in its
 * 200 KB budget, so it cannot go up without making each row cheaper first.
 * Note the section still fills out over time without shipping more: milestones
 * cross into it from the upcoming list as their dates pass.
 */
const MAX_RECENT_HISTORY_EVENTS = 36;

function monthKey(date: string) {
  return date.slice(0, 7);
}

function shiftIsoDate(date: string, days: number) {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

const today = todayIso();
const recentHistoryCutoff = shiftIsoDate(today, -RECENT_HISTORY_DAYS);
const currentMonth = monthKey(today);
const recentHistoryCutoffMonth = monthKey(recentHistoryCutoff);

/*
 * This decides what the page *ships*, not what each section shows: the browser
 * re-splits the feed against the reader's own date, because milestones cross
 * from upcoming to past while the build sits there. So the two lists below only
 * have to be a superset of what either section will ever need — every future
 * milestone, plus enough history to fill the second section on day one.
 */
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

const feed = toCalendarFeed(currentAndUpcomingEvents, recentHistoryEvents);

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

      <CalendarBrowser feed={feed} buildDate={today} />
    </div>
  );
}
