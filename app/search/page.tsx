import type { Metadata } from "next";
import { ExamExplorer } from "@/components/ExamExplorer";
import { exams } from "@/lib/exams";
import { toSearchDoc } from "@/lib/search";

export const metadata: Metadata = {
  title: "Search government exams",
  description: "Ranked search across central, state and union-territory government recruitment cycles in India.",
  alternates: { canonical: "/search" },
  robots: { index: false, follow: true },
};

const searchDocs = exams.map(toSearchDoc);

export default function SearchPage() {
  return (
    <div className="page-shell listing-page search-page">
      <div className="page-intro">
        <div>
          <span className="eyebrow">Ranked exam search</span>
          <h1>Search the government exam index</h1>
          <p>
            Search natural phrases such as “12th pass”, “bank PO” or a state name. Results are ranked by relevance,
            then can be narrowed by location, qualification, year and current stage.
          </p>
        </div>
      </div>
      <ExamExplorer docs={searchDocs} mode="search" />
    </div>
  );
}
