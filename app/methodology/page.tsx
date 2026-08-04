import type { Metadata } from "next";
import { exams } from "@/lib/exams";

export const metadata: Metadata = {
  title: "Sources and coverage",
  description: "Source, date and coverage rules for Government Exam India.",
  alternates: { canonical: "/methodology" },
};

const authorities = Array.from(
  exams.reduce((map, item) => {
    const current = map.get(item.organisation) ?? { name: item.organisation, level: item.governmentLevel, cycles: 0 };
    current.cycles += 1;
    map.set(item.organisation, current);
    return map;
  }, new Map<string, { name: string; level: string; cycles: number }>()),
).map(([, value]) => value);

const sourceRules = [
  { title: "Dates", text: "Exact dates, tentative windows and awaited events are labelled separately." },
  { title: "Status", text: "A status changes when the recruiting body publishes the corresponding notice or result." },
  { title: "Corrections", text: "Revised vacancies, dates and postponements are added to the exam’s change record." },
  { title: "Eligibility", text: "Summaries help with the first check; the official notification decides eligibility." },
];

export default function MethodologyPage() {
  return (
    <>
      <div className="method-hero">
        <div className="page-shell">
          <span className="eyebrow">Sources & coverage</span>
          <h1>How exam information is updated</h1>
          <p>Each exam record links to the recruiting body’s notice, calendar, application page or result.</p>
        </div>
      </div>

      <div className="page-shell method-page">
        <section className="method-section">
          <div className="section-heading"><span className="kicker">Record rules</span><h2>What the labels mean</h2></div>
          <div className="evidence-grid source-rule-grid">
            {sourceRules.map((rule, index) => (
              <article key={rule.title}>
                <span>0{index + 1}</span>
                <h3>{rule.title}</h3>
                <p>{rule.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="method-section">
          <div className="section-heading"><span className="kicker">Updates</span><h2>From source change to site update</h2></div>
          <ol className="workflow-list compact-workflow">
            <li><span>01</span><div><h3>Watch</h3><p>A registry checks official recruiting-body pages for changes.</p></div></li>
            <li><span>02</span><div><h3>Review</h3><p>The changed fields, source date and record-level checked time are reviewed together.</p></div></li>
            <li><span>03</span><div><h3>Publish</h3><p>Data checks run before the static pages, search, calendar and update feed are rebuilt.</p></div></li>
          </ol>
        </section>

        <section className="method-section" id="coverage">
          <div className="section-heading section-heading-split">
            <div><span className="kicker">Current coverage</span><h2>Recruiting bodies in the index</h2><p>{exams.length} cycles are currently included. More authorities will be added over time.</p></div>
            <div className="coverage-total"><strong>{exams.length}</strong><span>recruitment cycles</span></div>
          </div>
          <div className="coverage-table-wrap">
            <table className="coverage-table">
              <caption>Recruiting bodies currently represented</caption>
              <thead><tr><th>Authority</th><th>Level</th><th>Cycles</th></tr></thead>
              <tbody>
                {authorities.map((authority) => (
                  <tr key={authority.name}>
                    <th scope="row">{authority.name}</th><td>{authority.level}</td><td>{authority.cycles}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="map-attribution">
            State map boundaries: DataMeet Community Maps Project, CC BY 2.5 India; geometry simplified for web display.
          </p>
        </section>
      </div>
    </>
  );
}
