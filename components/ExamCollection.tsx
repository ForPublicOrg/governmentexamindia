import Link from "next/link";
import type { Exam } from "@/lib/exams";
import { groupByLifecycle } from "@/lib/lifecycle";

function ExamCard({ item }: { item: Exam }) {
  return (
    <Link
      href={`/exams/${item.slug}`}
      prefetch={false}
      className="collection-card"
      aria-labelledby={`exam-${item.slug}`}
    >
      <div className="collection-card-topline">
        <div className="exam-card-badges">
          <span className={`status-pill status-${item.status.tone}`}><span className="status-dot" aria-hidden="true" />{item.status.label}</span>
          <span className={`verification-badge verification-${item.verification}`}>
            {item.verification === "verified" ? "Notice verified" : "Official listing"}
          </span>
        </div>
        <span>{item.organisation}</span>
      </div>
      <h3 id={`exam-${item.slug}`}>{item.title}</h3>
      <p><strong>Next:</strong> {item.status.nextAction}</p>
      <dl>
        <div><dt>Vacancies</dt><dd>{item.vacancyLabel}</dd></div>
        <div><dt>Education</dt><dd>{item.education.join(" · ")}</dd></div>
      </dl>
      <footer>
        <span>Checked {item.lastVerified.split(",")[0]}</span>
        <span className="card-cta" aria-hidden="true">Open exam →</span>
      </footer>
    </Link>
  );
}

/**
 * Records arrive already ordered by `lib/exams`, so grouping only draws the
 * boundary between a live cycle, one that has not started and a finished one.
 * Pass `grouped={false}` where a list is already scoped to a single phase.
 */
export function ExamCollection({ items, grouped = true }: { items: Exam[]; grouped?: boolean }) {
  if (!grouped) {
    return (
      <div className="collection-grid">
        {items.map((item) => <ExamCard item={item} key={item.slug} />)}
      </div>
    );
  }

  return (
    <>
      {groupByLifecycle(items).map((group) => (
        <section className="phase-group" key={group.phase} aria-labelledby={`phase-${group.phase}`}>
          <div className={`phase-heading phase-${group.phase}`}>
            <h3 id={`phase-${group.phase}`}>
              <span className="phase-dot" aria-hidden="true" />
              {group.label}
              <span className="phase-count">{group.items.length}</span>
            </h3>
            <p>{group.blurb}</p>
          </div>
          <div className="collection-grid">
            {group.items.map((item) => <ExamCard item={item} key={item.slug} />)}
          </div>
        </section>
      ))}
    </>
  );
}
