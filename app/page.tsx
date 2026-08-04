import Link from "next/link";
import { IndiaStateMap } from "@/components/IndiaStateMap";
import { examTypeOptions, indiaRegions } from "@/lib/discovery";
import { educationOptions, exams, examsForRegion } from "@/lib/exams";

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
    title: "Published timeline",
    copy: "Applications, exams, objections, results and document checks when the recruiting body announces them.",
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

const launchUpdates = exams
  .map((item) => ({
    item,
    date: item.changeLog.reduce((latest, change) => (change.date > latest ? change.date : latest), ""),
  }))
  .filter((entry) => entry.date)
  .sort((a, b) => b.date.localeCompare(a.date))
  .slice(0, 3)
  .map((entry) => entry.item);

const transparencyExam = exams.find((item) => item.slug === "ibps-po-mt-xvi-2026");
const transparencyRow = transparencyExam?.vacancyBreakdown?.[0];
const transparencyTimeline = transparencyExam?.timeline.filter((event) => event.label !== "Notification").slice(0, 4) ?? [];

function formatCount(value?: number) {
  return value == null ? "—" : value.toLocaleString("en-IN");
}

export default function Home() {
  const organisationCount = new Set(exams.map((item) => item.organisation)).size;
  const allRepresentedRegions = indiaRegions
    .map((region) => ({ ...region, count: examsForRegion(region.code).length }))
    .filter((region) => region.count > 0)
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
  const representedRegions = allRepresentedRegions.slice(0, 8);

  return (
    <>
      <section className="hero-section">
        <div className="hero-grid page-shell">
          <div className="hero-copy">
            <div className="eyebrow-row">
              <span className="eyebrow">Central + state government exams</span>
            </div>
            <h1>
              Government exams across India.
              <span> One clear next step.</span>
            </h1>
            <p className="hero-lede">
              Find reviewed central and state recruitment by education. See the published status, eligibility, dates,
              vacancies, reservation details, syllabus, fees and official links—without the clutter.
            </p>

            <form className="hero-search" action="/search" method="get" role="search">
              <label htmlFor="home-search" className="sr-only">
                Search the government exam index
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
              <Link href="/search?q=SSC" prefetch={false}>SSC</Link>
              <Link href="/search?q=Railway" prefetch={false}>Railways</Link>
              <Link href="/search?education=Graduate" prefetch={false}>Graduate exams</Link>
              <Link href="/search?level=State" prefetch={false}>State PSC</Link>
            </div>
          </div>

          <aside className="status-desk" aria-labelledby="status-desk-title">
            <div className="desk-heading">
              <div>
                <p>Latest reviewed changes</p>
                <h2 id="status-desk-title">What changed?</h2>
              </div>
              <Link href="/updates" prefetch={false}>All updates →</Link>
            </div>
            <div className="desk-updates">
              {launchUpdates.map((update) => (
                <Link href={`/exams/${update.slug}`} prefetch={false} className="desk-update" key={update.slug}>
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
          <div><strong>{allRepresentedRegions.length}/36</strong><span>states &amp; UTs represented</span></div>
        </div>
      </section>

      <section className="section page-shell" id="education">
        <div className="section-heading section-heading-split">
          <div>
            <span className="kicker">Start with what you have</span>
            <h2>Exams for your education level</h2>
            <p>Choose the highest qualification you want an exam to accept. Specific degrees are clearly called out later.</p>
          </div>
          <Link href="/search" prefetch={false} className="button button-secondary">Browse the exam index</Link>
        </div>
        <div className="education-grid">
          {educationOptions.slice(1).map((option, index) => (
            <Link
              href={`/search?education=${encodeURIComponent(option.value)}`}
              prefetch={false}
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
              <p>See recruitment explicitly tagged to a state or union territory; browse national exams separately.</p>
            </div>
            <Link href="/states" prefetch={false} className="button button-secondary">All states & UTs</Link>
          </div>

          <div className="state-browser-grid">
            <div className="map-card">
              <div className="map-card-heading"><span>State navigator</span><strong>India</strong></div>
              <IndiaStateMap />
            </div>

            <div className="state-shortcuts">
              <Link href="/search?level=Central" prefetch={false} className="central-shortcut">
                <span>Central / All India</span>
                <strong>{exams.filter((item) => item.governmentLevel === "Central").length} cycles</strong>
                <i aria-hidden="true">→</i>
              </Link>
              <div className="state-shortcut-list">
                {representedRegions.map((region) => (
                  <Link href={`/states/${region.slug}`} prefetch={false} key={region.code}>
                    <span>{region.code}</span>
                    <div><strong>{region.name}</strong><small>{region.count} {region.count === 1 ? "cycle" : "cycles"}</small></div>
                    <i aria-hidden="true">→</i>
                  </Link>
                ))}
              </div>
              <Link href="/states" prefetch={false} className="state-directory-link">Browse all 28 states and 8 union territories →</Link>
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
          <Link href="/exam-types" prefetch={false} className="button button-secondary">View all types</Link>
        </div>
        <div className="home-type-grid">
          {examTypeOptions.map((type, index) => {
            const count = exams.filter((item) => item.examTypes.includes(type.value)).length;
            return (
              <Link href={`/exam-types/${type.slug}`} prefetch={false} className={`home-type-card type-accent-${(index % 4) + 1}`} key={type.slug}>
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
            <h2>Published exam details, in the order you need them</h2>
            <p>Open one cycle to see what is confirmed, what comes next and which fields are still unannounced.</p>
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

      {transparencyExam && transparencyRow ? (
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
            <Link href={`/exams/${transparencyExam.slug}`} prefetch={false} className="button button-secondary">
              Open the full example
            </Link>
          </div>
          <div className="transparency-grid">
            <div className="vacancy-demo card-surface">
              <div className="demo-heading">
                <div>
                  <span>{transparencyExam.shortTitle}</span>
                  <h3>{transparencyExam.vacancyLabel}</h3>
                </div>
                <span className="source-badge">Notice verified</span>
              </div>
              <div className="table-wrap">
                <table>
                  <caption className="sr-only">{transparencyExam.shortTitle} category-wise vacancies</caption>
                  <thead><tr><th>UR</th><th>EWS</th><th>OBC</th><th>SC</th><th>ST</th><th>Total</th></tr></thead>
                  <tbody>
                    <tr>
                      <td>{formatCount(transparencyRow.ur)}</td>
                      <td>{formatCount(transparencyRow.ews)}</td>
                      <td>{formatCount(transparencyRow.obc)}</td>
                      <td>{formatCount(transparencyRow.sc)}</td>
                      <td>{formatCount(transparencyRow.st)}</td>
                      <td><strong>{formatCount(transparencyRow.total)}</strong></td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="table-note">{transparencyExam.vacancyNote}</p>
            </div>

            <div className="timeline-demo card-surface">
              <div className="demo-heading">
                <div>
                  <span>Published cycle milestones</span>
                  <h3>Your next action stays obvious</h3>
                </div>
              </div>
              <ol className="mini-timeline">
                {transparencyTimeline.map((event, index) => (
                  <li
                    className={event.state === "completed" ? "is-done" : event.state === "current" ? "is-current" : undefined}
                    key={`${event.label}-${event.displayDate}`}
                  >
                    <span>{event.state === "completed" ? "✓" : index + 1}</span>
                    <div>
                      <strong>{event.label}</strong>
                      <p>{event.displayDate}{event.state === "tentative" ? " · tentative" : ""}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>
      ) : null}

      <section className="section explorer-section" id="explore">
        <div className="page-shell">
          <div className="section-heading section-heading-split">
            <div>
              <span className="kicker">Search exams</span>
              <h2>Find an exam that fits</h2>
              <p>Search acronyms, posts, states, organisations and notification numbers, then refine the ranked results.</p>
            </div>
            <Link href="/search" prefetch={false} className="button button-primary">Open ranked search →</Link>
          </div>
        </div>
      </section>

      <section className="coverage-note page-shell">
        <p>
          <strong>Current index:</strong> {exams.length} recruitment cycles across {organisationCount} recruiting bodies.
          More bodies are being added.
        </p>
        <Link href="/methodology#coverage" prefetch={false}>See coverage →</Link>
      </section>
    </>
  );
}
