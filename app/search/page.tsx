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
      <header className="search-page-heading">
        <span className="eyebrow">{exams.length} exam cycles</span>
        <h1>Find an exam</h1>
      </header>
      <ExamExplorer docs={searchDocs} mode="search" />
    </div>
  );
}
