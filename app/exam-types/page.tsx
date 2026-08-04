import type { Metadata } from "next";
import Link from "next/link";
import { examTypeOptions } from "@/lib/discovery";
import { exams } from "@/lib/exams";

export const metadata: Metadata = {
  title: "Government exam types",
  description: "Browse Indian government exams by civil services, banking, defence, railways, police, teaching, health and technical work.",
  alternates: { canonical: "/exam-types" },
};

export default function ExamTypesPage() {
  return (
    <div className="page-shell discovery-page">
      <div className="page-intro"><div><span className="eyebrow">Browse by work</span><h1>Exam types</h1><p>Start with the kind of service or role you want, then compare eligibility and current stage.</p></div></div>
      <div className="type-directory-grid">
        {examTypeOptions.map((type, index) => {
          const count = exams.filter((item) => item.examTypes.includes(type.value)).length;
          return (
            <Link href={`/exam-types/${type.slug}`} className={`type-directory-card type-accent-${(index % 4) + 1}`} key={type.slug}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div><h2>{type.value}</h2><p>{type.description}</p></div>
              <footer><strong>{count}</strong> {count === 1 ? "cycle" : "cycles"}<i aria-hidden="true">→</i></footer>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
