import type { Metadata } from "next";
import Link from "next/link";
import { ExamCollection } from "@/components/ExamCollection";
import { exams } from "@/lib/exams";

export const metadata: Metadata = {
  title: "Current government exams",
  description: "Search official-source central and state government exam cycles by education, stage and location.",
  alternates: { canonical: "/exams" },
};

// `exams` is already ordered ongoing → upcoming → past, by the deadline a
// candidate still has to act on, so this only narrows and truncates.
const currentHighlights = exams.filter((item) => item.verification === "verified").slice(0, 24);

export default function ExamsPage() {
  return (
    <div className="page-shell listing-page">
      <div className="page-intro">
        <div>
          <span className="eyebrow">Current exam highlights</span>
          <h1>Government exams worth checking now</h1>
          <p>
            A concise set of verified application windows, schedule changes and upcoming examinations. The dedicated
            search page covers the full index of {exams.length} central, state and union-territory recruitment cycles.
          </p>
        </div>
        <Link href="/search" prefetch={false} className="button button-primary">
          Search the full index →
        </Link>
      </div>

      <section className="collection-section" aria-labelledby="current-exams-title">
        <div className="section-heading section-heading-split">
          <div>
            <span className="kicker">{currentHighlights.length} recent and actionable cycles</span>
            <h2 id="current-exams-title">Applications, exams and live status changes</h2>
            <p>
              This bounded catalogue favours verified open, postponed and scheduled cycles. Use ranked search for every
              official listing, qualification, state, organisation and notification number.
            </p>
          </div>
          <Link href="/search" prefetch={false} className="button button-secondary">
            Open ranked search
          </Link>
        </div>
        <ExamCollection items={currentHighlights} />
      </section>
    </div>
  );
}
