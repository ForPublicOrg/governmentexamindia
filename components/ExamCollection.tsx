import Link from "next/link";
import type { Exam } from "@/lib/exams";

export function ExamCollection({ items }: { items: Exam[] }) {
  return (
    <div className="collection-grid">
      {items.map((item) => (
        <Link
          href={`/exams/${item.slug}`}
          prefetch={false}
          className="collection-card"
          aria-labelledby={`exam-${item.slug}`}
          key={item.slug}
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
      ))}
    </div>
  );
}
