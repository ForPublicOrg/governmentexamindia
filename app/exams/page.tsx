import type { Metadata } from "next";
import { ExamExplorer } from "@/components/ExamExplorer";

export const metadata: Metadata = {
  title: "All government exams",
  description: "Search verified central and state government exam cycles by education, stage and location.",
  alternates: { canonical: "/exams" },
};

export default function ExamsPage() {
  return (
    <div className="page-shell listing-page">
      <div className="page-intro">
        <div>
          <span className="eyebrow">Searchable exam index</span>
          <h1>Find the right government exam</h1>
          <p>
            Search by exam, post, state, recruiting body or notification number. Then filter by your education and the
            exam’s current stage.
          </p>
        </div>
      </div>
      <ExamExplorer />
    </div>
  );
}
