import type { Metadata } from "next";
import Link from "next/link";
import { indiaRegions } from "@/lib/discovery";
import { exams } from "@/lib/exams";

export const metadata: Metadata = {
  title: "Government exams by state",
  description: "Browse state government exams and all-India recruitment cycles for every Indian state and union territory.",
  alternates: { canonical: "/states" },
};

export default function StatesPage() {
  const centralCount = exams.filter((item) => item.governmentLevel === "Central").length;
  const states = indiaRegions.filter((region) => region.kind === "State");
  const territories = indiaRegions.filter((region) => region.kind === "Union territory");

  const regionCard = (region: (typeof indiaRegions)[number]) => {
    const count = exams.filter((item) => item.stateCode === region.code).length;
    return (
      <Link href={`/states/${region.slug}`} className={`region-card${count ? " has-cycles" : ""}`} key={region.code}>
        <span>{region.code}</span>
        <div><h2>{region.name}</h2><p>{count ? `${count} state ${count === 1 ? "cycle" : "cycles"}` : "Central exams available"}</p></div>
        <strong aria-hidden="true">→</strong>
      </Link>
    );
  };

  return (
    <div className="page-shell discovery-page">
      <div className="page-intro">
        <div><span className="eyebrow">28 states · 8 union territories</span><h1>Exams by state</h1><p>Open a state to see its recruitment cycles alongside central exams available across India.</p></div>
      </div>

      <Link href="/exams?level=Central" className="all-india-card">
        <div><span>Central / All India</span><h2>{centralCount} recruitment cycles</h2><p>UPSC, SSC, banking, railways and national recruitment</p></div>
        <strong aria-hidden="true">→</strong>
      </Link>

      <section className="region-group" aria-labelledby="states-title">
        <div className="section-heading"><span className="kicker">States</span><h2 id="states-title">Choose a state</h2></div>
        <div className="region-grid">{states.map(regionCard)}</div>
      </section>

      <section className="region-group" aria-labelledby="territories-title">
        <div className="section-heading"><span className="kicker">Union territories</span><h2 id="territories-title">Choose a union territory</h2></div>
        <div className="region-grid">{territories.map(regionCard)}</div>
      </section>
    </div>
  );
}
