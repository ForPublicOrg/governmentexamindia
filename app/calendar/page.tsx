import type { Metadata } from "next";
import Link from "next/link";
import { calendarEvents } from "@/lib/exams";

export const metadata: Metadata = {
  title: "Government exam calendar",
  description: "A timeline of government exam notifications, applications, exams, objections and results.",
  alternates: { canonical: "/calendar" },
};

const monthFormatter = new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric", timeZone: "Asia/Kolkata" });

function monthKey(date: string) {
  const value = new Date(`${date}T00:00:00+05:30`);
  return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}`;
}

const groupedEvents = calendarEvents.reduce<Record<string, typeof calendarEvents>>((groups, event) => {
  const key = monthKey(event.date);
  groups[key] = [...(groups[key] ?? []), event];
  return groups;
}, {});

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

      <div className="calendar-list">
        {Object.entries(groupedEvents).map(([key, events]) => {
          const title = monthFormatter.format(new Date(`${key}-01T00:00:00+05:30`));
          return (
            <section key={key} className="calendar-month" aria-labelledby={`month-${key}`}>
              <div className="month-heading"><h2 id={`month-${key}`}>{title}</h2><span>{events.length} events</span></div>
              <div className="month-events">
                {events.map((event) => (
                  <Link href={`/exams/${event.examSlug}#timeline`} className={`calendar-event event-${event.state}`} key={`${event.examSlug}-${event.label}-${event.date}`}>
                    <time dateTime={event.date}>{event.displayDate}</time>
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
    </div>
  );
}
