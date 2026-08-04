import Link from "next/link";
import { ExamExplorer } from "@/components/ExamExplorer";
import { IndiaStateMap } from "@/components/IndiaStateMap";
import { examTypeOptions, indiaRegions } from "@/lib/discovery";
import { educationOptions, exams } from "@/lib/exams";

const examEssentials = [
  {
    number: "01",
    title: "Current status",
    copy: "The next deadline or event, plus the date the record was last checked.",
  },
  {
    number: "02",
    title: "Vacancies & reservation",
    copy: "Post, region and category tables when they are published.",
  },
  {
    number: "03",
    title: "Eligibility",
    copy: "Education, age, domicile and certificate requirements in one place.",
  },
  {
    number: "04",
    title: "Complete timeline",
    copy: "Applications, admit cards, exams, objections, results and document checks.",
  },
  {
    number: "05",
    title: "Selection & syllabus",
    copy: "The stages, exam pattern and syllabus for the exact recruitment cycle.",
  },
  {
    number: "06",
    title: "Official links",
    copy: "Direct links to notifications, applications, admit cards and results.",
  },
];

const homeUpdateSlugs = ["bpsc-72nd-cce-2026", "tnpsc-group-ii-iia-2026", "ibps-po-mt-xvi-2026"];
const launchUpdates = homeUpdateSlugs
  .map((slug) => exams.find((item) => item.slug === slug))
  .filter((item): item is (typeof exams)[number] => Boolean(item));

export default function Home() {
  const organisationCount = new Set(exams.map((item) => item.organisation)).size;
  const representedRegions = indiaRegions
    .map((region) => ({ ...region, count: exams.filter((item) => item.stateCode === region.code).length }))
    .filter((region) => region.count > 0)
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

  return (
    <>
      <section className="hero-section">
        <div className="hero-grid page-shell">
          <div className="hero-copy">
            <div className="eyebrow-row">
              <span className="eyebrow">Central + state government exams</span>
            </div>
            <h1>
              Every government exam.
              <span> One clear next step.</span>
            </h1>
            <p className="hero-lede">
              Find central and state exams by education. See the real status, who can apply, every important date,
              vacancy and reservation details, syllabus, fees and official links—without the clutter.
            </p>

            <form className="hero-search" action="/exams" method="get" role="search">
              <label htmlFor="home-search" className="sr-only">
                Search every government exam
              </label>
              <span aria-hidden="true">⌕</span>
              <input
                id="home-search"
                name="q"
                type="search"
                placeholder="Try “12th pass”, “bank PO” or “Bihar”"
                autoComplete="off"
              />
              <button type="submit">Search exams</button>
            </form>
            <div className="search-hints" aria-label="Popular searches">
              <span>Popular:</span>
              <Link href="/exams?q=SSC">SSC</Link>
              <Link href="/exams?q=Railway">Railways</Link>
              <Link href="/exams?education=Graduate">Graduate exams</Link>
              <Link href="/exams?level=State">State PSC</Link>
            </div>
          </div>

          <aside className="status-desk" aria-labelledby="status-desk-title">
            <div className="desk-heading">
              <div>
                <p>Live exam desk</p>
                <h2 id="status-desk-title">What changed?</h2>
              </div>
              <Link href="/updates">All updates →</Link>
            </div>
            <div className="desk-updates">
              {launchUpdates.map((update) => (
                <Link href={`/exams/${update.slug}`} className="desk-update" key={update.slug}>
                  <span className={`status-pill status-${update.status.tone}`}>
                    <span className="status-dot" aria-hidden="true" />
                    {update.status.label}
                  </span>
                  <strong>{update.shortTitle}</strong>
                  <p>{update.status.nextAction}</p>
                  <span className="desk-arrow" aria-hidden="true">↗</span>
                </Link>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="snapshot-strip" aria-label="Launch coverage snapshot">
        <div className="page-shell snapshot-grid">
          <div><strong>{exams.length}</strong><span>recruitment cycles</span></div>
          <div><strong>{organisationCount}</strong><span>recruiting bodies</span></div>
          <div><strong>6</strong><span>education paths</span></div>
          <div><strong>Jun ’25+</strong><span>scope start for official events</span></div>
        </div>
      </section>

      <section className="section page-shell" id="education">
        <div className="section-heading section-heading-split">
          <div>
            <span className="kicker">Start with what you have</span>
            <h2>Exams for your education level</h2>
            <p>Choose the highest qualification you want an exam to accept. Specific degrees are clearly called out later.</p>
          </div>
          <Link href="/exams" className="button button-secondary">Browse all exams</Link>
        </div>
        <div className="education-grid">
          {educationOptions.slice(1).map((option, index) => (
            <Link
              href={`/exams?education=${encodeURIComponent(option.value)}`}
              className="education-card"
              key={option.value}
            >
              <span className="education-index">0{index + 1}</span>
              <div>
                <h3>{option.label}</h3>
                <p>{option.description}</p>
              </div>
              <span aria-hidden="true">→</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section state-browser-section" id="states">
        <div className="page-shell">
          <div className="section-heading section-heading-split">
            <div>
              <span className="kicker">Browse by location</span>
              <h2>Choose your state</h2>
              <p>See state recruitment together with central exams available across India.</p>
            </div>
            <Link href="/states" className="button button-secondary">All states & UTs</Link>
          </div>

          <div className="state-browser-grid">
            <div className="map-card">
              <div className="map-card-heading"><span>State navigator</span><strong>India</strong></div>
              <IndiaStateMap />
            </div>

            <div className="state-shortcuts">
              <Link href="/exams?level=Central" className="central-shortcut">
                <span>Central / All India</span>
                <strong>{exams.filter((item) => item.governmentLevel === "Central").length} cycles</strong>
                <i aria-hidden="true">→</i>
              </Link>
              <div className="state-shortcut-list">
                {representedRegions.map((region) => (
                  <Link href={`/states/${region.slug}`} key={region.code}>
                    <span>{region.code}</span>
                    <div><strong>{region.name}</strong><small>{region.count} {region.count === 1 ? "cycle" : "cycles"}</small></div>
                    <i aria-hidden="true">→</i>
                  </Link>
                ))}
              </div>
              <Link href="/states" className="state-directory-link">Browse all 28 states and 8 union territories →</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section page-shell" id="exam-types">
        <div className="section-heading section-heading-split">
          <div>
            <span className="kicker">Browse by work</span>
            <h2>Exam types</h2>
            <p>Start with the service or role you want.</p>
          </div>
          <Link href="/exam-types" className="button button-secondary">View all types</Link>
        </div>
        <div className="home-type-grid">
          {examTypeOptions.map((type, index) => {
            const count = exams.filter((item) => item.examTypes.includes(type.value)).length;
            return (
              <Link href={`/exam-types/${type.slug}`} className={`home-type-card type-accent-${(index % 4) + 1}`} key={type.slug}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div><h3>{type.value}</h3><p>{count} {count === 1 ? "cycle" : "cycles"}</p></div>
                <strong aria-hidden="true">→</strong>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="section section-tinted">
        <div className="page-shell">
          <div className="section-heading centered-heading">
            <span className="kicker">Everything in one place</span>
            <h2>The complete exam, in the order you need it</h2>
            <p>Open one cycle to understand what is happening now and what comes next.</p>
          </div>
          <div className="problem-grid">
            {examEssentials.map((item) => (
              <article className="problem-card" key={item.number}>
                <span>{item.number}</span>
                <h3>{item.title}</h3>
                <p className="problem-copy">{item.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section page-shell">
        <div className="section-heading section-heading-split">
          <div>
            <span className="kicker">No hidden details</span>
            <h2>See exactly where the seats go</h2>
            <p>
              Reservation is not a footnote. Tables retain the recruiting body’s categories and explain when horizontal
              reservations overlap the total.
            </p>
          </div>
          <Link href="/exams/ibps-po-mt-xvi-2026" className="button button-secondary">
            Open the full example
          </Link>
        </div>
        <div className="transparency-grid">
          <div className="vacancy-demo card-surface">
            <div className="demo-heading">
              <div>
                <span>IBPS PO XVI · revised 20 Jul</span>
                <h3>7,365 indicative vacancies</h3>
              </div>
              <span className="source-badge">Official update</span>
            </div>
            <div className="table-wrap">
              <table>
                <caption className="sr-only">IBPS PO XVI category-wise indicative vacancies</caption>
                <thead><tr><th>UR</th><th>EWS</th><th>OBC</th><th>SC</th><th>ST</th><th>Total</th></tr></thead>
                <tbody><tr><td>2,936</td><td>721</td><td>2,015</td><td>1,131</td><td>562</td><td><strong>7,365</strong></td></tr></tbody>
              </table>
            </div>
            <p className="table-note">Indicative—not a guarantee. Participating banks can revise reported vacancies.</p>
          </div>

          <div className="timeline-demo card-surface">
            <div className="demo-heading">
              <div>
                <span>One cycle · every milestone</span>
                <h3>Your next action stays obvious</h3>
              </div>
            </div>
            <ol className="mini-timeline">
              <li className="is-done"><span>✓</span><div><strong>Applications closed</strong><p>26 Jul 2026</p></div></li>
              <li className="is-current"><span>2</span><div><strong>Preliminary exam</strong><p>22–23 Aug 2026</p></div></li>
              <li><span>3</span><div><strong>Main exam</strong><p>4 Oct 2026</p></div></li>
              <li><span>4</span><div><strong>Allotment</strong><p>Jan 2027 · tentative</p></div></li>
            </ol>
          </div>
        </div>
      </section>

      <section className="section explorer-section" id="explore">
        <div className="page-shell">
          <div className="section-heading section-heading-split">
            <div>
              <span className="kicker">Search exams</span>
              <h2>Find an exam that fits</h2>
              <p>Search acronyms, posts, states, organisations and notification numbers. Save useful cycles on this device.</p>
            </div>
            <span className="privacy-note">Saved exams stay in your browser</span>
          </div>
          <ExamExplorer compact />
        </div>
      </section>

      <section className="coverage-note page-shell">
        <p>
          <strong>Current index:</strong> {exams.length} recruitment cycles across {organisationCount} recruiting bodies.
          More bodies are being added.
        </p>
        <Link href="/methodology#coverage">See coverage →</Link>
      </section>
    </>
  );
}
