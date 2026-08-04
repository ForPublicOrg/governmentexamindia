import type { Metadata } from "next";
import Link from "next/link";
import { exams } from "@/lib/exams";

export const metadata: Metadata = {
  title: "Recent exam updates",
  description: "Corrections, postponements, vacancy revisions and timetable changes for government exams.",
  alternates: { canonical: "/updates" },
};

const updates = exams
  .flatMap((item) => item.changeLog.map((change) => ({ ...change, item })))
  .sort((a, b) => b.date.localeCompare(a.date));

export default function UpdatesPage() {
  return (
    <div className="page-shell updates-page">
      <div className="page-intro">
        <div><span className="eyebrow">Corrections & changes</span><h1>Recent exam updates</h1><p>Postponements, corrected dates and revised vacancies across the index.</p></div>
      </div>

      <div className="updates-layout">
        <div className="updates-list">
          {updates.map((update) => (
            <article className="update-row-card" key={`${update.item.slug}-${update.date}-${update.text}`}>
              <time dateTime={update.date}>{update.displayDate}</time>
              <div>
                <span className={`status-pill status-${update.item.status.tone}`}><span className="status-dot" />{update.item.status.label}</span>
                <h2>
                  <Link
                    href={`/exams/${update.item.slug}`}
                    prefetch={false}
                    className="stretched-card-link"
                    aria-label={`Open ${update.item.shortTitle}`}
                  >
                    {update.item.shortTitle}
                  </Link>
                </h2>
                <p>{update.text}</p>
                <a className="update-source-link" href={update.item.sourceUrl} target="_blank" rel="noreferrer">Official source ↗</a>
              </div>
            </article>
          ))}
        </div>
        <Link href="/methodology" prefetch={false} className="update-method-card">
          <span>Date and status labels</span>
          <h2>Exact, tentative or awaited</h2>
          <p>Each exam page distinguishes confirmed dates from tentative windows and events that have not been announced.</p>
          <span className="card-cta">Sources & coverage →</span>
        </Link>
      </div>
    </div>
  );
}
