import Link from "next/link";
import type { Exam } from "@/lib/exams";

export function ExamCollection({ items }: { items: Exam[] }) {
  return (
    <div className="collection-grid">
      {items.map((item) => (
        <article className="collection-card" key={item.slug}>
          <div className="collection-card-topline">
            <span className={`status-pill status-${item.status.tone}`}><span className="status-dot" aria-hidden="true" />{item.status.label}</span>
            <span>{item.organisation}</span>
          </div>
          <h3><Link href={`/exams/${item.slug}`}>{item.title}</Link></h3>
          <p><strong>Next:</strong> {item.status.nextAction}</p>
          <dl>
            <div><dt>Vacancies</dt><dd>{item.vacancyLabel}</dd></div>
            <div><dt>Education</dt><dd>{item.education.join(" · ")}</dd></div>
          </dl>
          <footer>
            <span>Checked {item.lastVerified.split(",")[0]}</span>
            <Link href={`/exams/${item.slug}`}>View exam →</Link>
          </footer>
        </article>
      ))}
    </div>
  );
}
