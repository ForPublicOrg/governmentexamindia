import type { Metadata } from "next";
import { CalendarBrowser } from "@/components/CalendarBrowser";
import { toCalendarFeed } from "@/lib/calendar";
import { calendarEvents } from "@/lib/exams";

export const metadata: Metadata = {
  title: "Government exam calendar",
  description: "A timeline of government exam notifications, applications, exams, objections and results.",
  alternates: { canonical: "/calendar" },
};

const indiaDateFormatter = new Intl.DateTimeFormat("en-IN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "Asia/Kolkata",
});
const RECENT_HISTORY_DAYS = 90;
const MAX_RECENT_HISTORY_EVENTS = 36;

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

      <CalendarBrowser feed={feed} historyDays={RECENT_HISTORY_DAYS} />
    </div>
  );
}
