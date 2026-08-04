import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExamCollection } from "@/components/ExamCollection";
import { getRegion, indiaRegions } from "@/lib/discovery";
import { authorities, exams, examsForRegion } from "@/lib/exams";

export function generateStaticParams() {
  return indiaRegions.map((region) => ({ state: region.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ state: string }> }): Promise<Metadata> {
  const region = getRegion((await params).state);
  if (!region) return {};
  return {
    title: `Government exams in ${region.name}`,
    description: `Official-source government recruitment cycles explicitly listed for ${region.name}, with recruiting-body links and national search.`,
    alternates: { canonical: `/states/${region.slug}` },
  };
}

export default async function StatePage({ params }: { params: Promise<{ state: string }> }) {
  const region = getRegion((await params).state);
  if (!region) notFound();
  const stateExams = examsForRegion(region.code);
  const centralCount = exams.filter((item) => item.governmentLevel === "Central").length;
  const activeAuthorityNames = new Set(stateExams.map((item) => item.organisation));
  const regionAuthorities = authorities.filter(
    (authority) =>
      (authority.regionCodes?.includes(region.code) || activeAuthorityNames.has(authority.name)) &&
      authority.watchUrls.length,
  );

  return (
    <div className="page-shell collection-page">
      <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/states" prefetch={false}>States</Link><span>›</span><span>{region.name}</span></nav>
      <div className="collection-hero">
        <div><span className="eyebrow">{region.kind}</span><h1>{region.name}</h1><p>Recruitment cycles explicitly tagged for {region.name}. National exams stay in one separate all-India catalogue.</p></div>
        <dl><div><dt>State cycles</dt><dd>{stateExams.length}</dd></div><div><dt>Tracked bodies</dt><dd>{regionAuthorities.length}</dd></div></dl>
      </div>

      <section className="collection-section" aria-labelledby="state-exams-title">
        <div className="section-heading section-heading-split"><div><span className="kicker">State recruitment</span><h2 id="state-exams-title">{region.name} exams</h2></div><Link href={`/search?region=${region.code}`} prefetch={false} className="text-link">Search this state →</Link></div>
        {stateExams.length ? (
          <ExamCollection items={stateExams} />
        ) : (
          <div className="collection-empty">
            <h3>No state cycle is listed right now</h3>
            <p>Cycles appear here only when the dataset explicitly tags them for {region.name}; central exams are not counted as state coverage.</p>
            {regionAuthorities.length ? (
              <p>
                Official recruitment {regionAuthorities.length === 1 ? "body" : "bodies"}: {regionAuthorities.map((authority, index) => (
                  <span key={authority.id}>
                    {index ? " · " : ""}<a href={authority.watchUrls[0]} target="_blank" rel="noreferrer">{authority.name} ↗</a>
                  </span>
                ))}
              </p>
            ) : null}
          </div>
        )}
      </section>

      <section className="collection-section" aria-labelledby="central-exams-title">
        <div className="section-heading section-heading-split">
          <div><span className="kicker">Central recruitment</span><h2 id="central-exams-title">Looking for all-India exams?</h2><p>Browse the national catalogue once, then check each notification for posting, language, domicile and reservation conditions.</p></div>
          <Link href="/search?level=Central" prefetch={false} className="button button-secondary">Browse {centralCount} central cycles</Link>
        </div>
      </section>
    </div>
  );
}
