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

/**
 * Only the first page is serialised into the HTML; the browser fetches the full
 * catalogue from the same cached index the home-page typeahead uses. Inlining
 * every record would grow this page with each exam added to the index.
 */
const SSR_DOCS = 12;
const searchDocs = exams.slice(0, SSR_DOCS).map(toSearchDoc);

export default function SearchPage() {
  return (
    <div className="page-shell listing-page search-page">
      <header className="search-page-heading">
        <span className="eyebrow">{exams.length} exam cycles</span>
        <h1>Find an exam</h1>
      </header>
      <ExamExplorer docs={searchDocs} mode="search" indexUrl="/search-index.json?v=2" />
    </div>
  );
}
