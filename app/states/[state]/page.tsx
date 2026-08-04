import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExamCollection } from "@/components/ExamCollection";
import { getRegion, indiaRegions } from "@/lib/discovery";
import { exams } from "@/lib/exams";

export function generateStaticParams() {
  return indiaRegions.map((region) => ({ state: region.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ state: string }> }): Promise<Metadata> {
  const region = getRegion((await params).state);
  if (!region) return {};
  return {
    title: `Government exams in ${region.name}`,
    description: `State and central government recruitment cycles relevant to candidates in ${region.name}.`,
    alternates: { canonical: `/states/${region.slug}` },
  };
}

export default async function StatePage({ params }: { params: Promise<{ state: string }> }) {
  const region = getRegion((await params).state);
  if (!region) notFound();
  const stateExams = exams.filter((item) => item.stateCode === region.code);
  const centralExams = exams.filter((item) => item.governmentLevel === "Central");

  return (
    <div className="page-shell collection-page">
      <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/states">States</Link><span>›</span><span>{region.name}</span></nav>
      <div className="collection-hero">
        <div><span className="eyebrow">{region.kind}</span><h1>{region.name}</h1><p>State recruitment first, followed by central and all-India exams.</p></div>
        <dl><div><dt>State cycles</dt><dd>{stateExams.length}</dd></div><div><dt>Central cycles</dt><dd>{centralExams.length}</dd></div></dl>
      </div>

      <section className="collection-section" aria-labelledby="state-exams-title">
        <div className="section-heading section-heading-split"><div><span className="kicker">State recruitment</span><h2 id="state-exams-title">{region.name} exams</h2></div><Link href={`/exams?q=${encodeURIComponent(region.name)}`} className="text-link">Search this state →</Link></div>
        {stateExams.length ? <ExamCollection items={stateExams} /> : <div className="collection-empty"><h3>No state-specific cycle in the index yet</h3><p>Central and all-India recruitment cycles are listed below.</p></div>}
      </section>

      <section className="collection-section" aria-labelledby="central-exams-title">
        <div className="section-heading"><span className="kicker">Central recruitment</span><h2 id="central-exams-title">All-India exams</h2><p>Check each notification for posting, language, domicile and reservation conditions.</p></div>
        <ExamCollection items={centralExams} />
      </section>
    </div>
  );
}
