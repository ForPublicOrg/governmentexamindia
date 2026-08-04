import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ShareExam } from "@/components/ShareExam";
import { exams, getExam } from "@/lib/exams";

type PageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return exams.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = getExam(slug);
  if (!item) return { title: "Exam not found" };

  return {
    title: item.shortTitle,
    description: `${item.status.label}: ${item.status.nextAction}. Eligibility, vacancies, reservation, timeline, syllabus and official sources for ${item.title}.`,
    alternates: { canonical: `/exams/${item.slug}` },
  };
}

export default async function ExamDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const item = getExam(slug);
  if (!item) notFound();

  const related = exams
    .filter(
      (candidate) =>
        candidate.slug !== item.slug &&
        (candidate.sector === item.sector || candidate.education.some((level) => item.education.includes(level))),
    )
    .slice(0, 3);

  const correctionSubject = encodeURIComponent(`Correction: ${item.shortTitle}`);

  return (
    <>
      <div className="exam-detail-top">
        <div className="page-shell">
          <nav className="breadcrumbs" aria-label="Breadcrumb">
            <Link href="/" prefetch={false}>Home</Link><span aria-hidden="true">/</span>
            <Link href="/exams" prefetch={false}>Exams</Link><span aria-hidden="true">/</span>
            <span aria-current="page">{item.shortTitle}</span>
          </nav>

          <div className="detail-hero-grid">
            <div className="detail-title">
              <div className="detail-labels">
                <span className={`status-pill status-${item.status.tone}`}>
                  <span className="status-dot" aria-hidden="true" />
                  {item.status.label}
                </span>
                <span className={`verification-badge verification-${item.verification}`}>
                  {item.verification === "verified" ? "Notice verified" : "Official listing · details pending"}
                </span>
                <span>{item.governmentLevel} · {item.jurisdiction}</span>
                {item.notificationNumber && <span>{item.notificationNumber}</span>}
              </div>
              <p className="detail-organisation">{item.organisation}</p>
              <h1>{item.title}</h1>
              <p className="detail-summary">{item.summary}</p>
            </div>

            <aside className={`action-panel action-${item.status.tone}`}>
              <span className="action-label">Your next action</span>
              <h2>{item.status.nextAction}</h2>
              <p>{item.status.detail}</p>
              <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="button button-primary">
                Open official source <span aria-hidden="true">↗</span>
              </a>
              <ShareExam
                path={`/exams/${item.slug}`}
                title={item.title}
                summary={`${item.status.label}: ${item.status.nextAction}`}
              />
              <div className="checked-line">
                <span aria-hidden="true">✓</span>
                <span>{item.verification === "verified" ? "Notice checked" : "Official listing checked"} {item.lastVerified}</span>
              </div>
            </aside>
          </div>
        </div>
      </div>

      <div className="page-shell detail-layout">
        <article className="detail-main">
          <section className="detail-section" aria-labelledby="at-a-glance">
            <div className="detail-section-heading">
              <span>01</span>
              <div><h2 id="at-a-glance">At a glance</h2><p>The facts most likely to change your decision.</p></div>
            </div>
            <dl className="glance-grid">
              <div><dt>Vacancies</dt><dd>{item.vacancyLabel}</dd><small>{item.vacancyNote}</small></div>
              <div><dt>Education</dt><dd>{item.education.join(" · ")}</dd><small>{item.qualification}</small></div>
              <div><dt>Age</dt><dd>{item.age}</dd><small>Relaxations and cut-off dates are category-specific.</small></div>
              <div><dt>Application fee</dt><dd>{item.fee}</dd><small>Use the official payment instructions only.</small></div>
              <div><dt>Pay</dt><dd>{item.pay}</dd><small>Gross and in-hand pay vary by posting and allowance.</small></div>
              <div><dt>Recruitment cycle</dt><dd>{item.cycle}</dd><small>{item.governmentLevel} · {item.jurisdiction}</small></div>
            </dl>
          </section>

          <section className="detail-section" aria-labelledby="vacancies">
            <div className="detail-section-heading">
              <span>02</span>
              <div><h2 id="vacancies">Vacancies & reservation</h2><p>What is known, what overlaps and what remains unreported.</p></div>
            </div>
            <div className="detail-card">
              <div className="vacancy-total-row">
                <div><span>Current published count</span><strong>{item.vacancyLabel}</strong></div>
                <a href={item.sourceUrl} target="_blank" rel="noreferrer" className="source-badge">Check source ↗</a>
              </div>
              {item.vacancyBreakdown?.length ? (
                <div className="table-wrap detail-table-wrap">
                  <table>
                    <caption>Category-wise vertical reservation reported for this recruitment</caption>
                    <thead><tr><th>Scope</th><th>UR</th><th>EWS</th><th>OBC</th><th>SC</th><th>ST</th><th>Total</th></tr></thead>
                    <tbody>
                      {item.vacancyBreakdown.map((row) => (
                        <tr key={row.label}>
                          <th scope="row">{row.label}</th>
                          <td>{row.ur?.toLocaleString("en-IN") ?? "—"}</td>
                          <td>{row.ews?.toLocaleString("en-IN") ?? "—"}</td>
                          <td>{row.obc?.toLocaleString("en-IN") ?? "—"}</td>
                          <td>{row.sc?.toLocaleString("en-IN") ?? "—"}</td>
                          <td>{row.st?.toLocaleString("en-IN") ?? "—"}</td>
                          <td><strong>{row.total.toLocaleString("en-IN")}</strong></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="missing-data">
                  <span aria-hidden="true">i</span>
                  <div>
                    <h3>Category table not available here</h3>
                    <p>Check the latest official notice for the post- and category-wise distribution.</p>
                  </div>
                </div>
              )}
              <p className="reservation-note">
                <strong>How to read reservation:</strong> UR, EWS, OBC, SC and ST are vertical categories. PwBD, women,
                ex-servicemen and similar horizontal reservations can overlap them and must not be added again to the total.
              </p>
            </div>
          </section>

          <section className="detail-section" aria-labelledby="timeline">
            <div className="detail-section-heading">
              <span>03</span>
              <div><h2 id="timeline">Complete timeline</h2><p>One record from notification to final outcome.</p></div>
            </div>
            {item.timeline.length ? (
              <ol className="detail-timeline">
                {item.timeline.map((event, index) => (
                  <li className={`timeline-${event.state}`} key={`${event.label}-${event.date ?? event.sortMonth ?? "unannounced"}-${index}`}>
                    <div className="timeline-marker" aria-hidden="true">
                      {event.state === "completed" ? "✓" : event.state === "postponed" ? "!" : index + 1}
                    </div>
                    <div><h3>{event.label}</h3><p>{event.displayDate}</p>{event.note && <small>{event.note}</small>}</div>
                    <span className="timeline-state">{event.state}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="missing-data">
                <span aria-hidden="true">i</span>
                <div><h3>No current-cycle dates announced</h3><p>This timeline will be dated only after the recruiting body publishes a schedule.</p></div>
              </div>
            )}
          </section>

          <section className="detail-section" aria-labelledby="eligibility">
            <div className="detail-section-heading">
              <span>04</span>
              <div><h2 id="eligibility">Who can apply?</h2><p>A readable first check—not a legal eligibility decision.</p></div>
            </div>
            <div className="two-column-cards">
              <div className="detail-card">
                <h3>Basic eligibility paths</h3>
                <ul className="check-list">
                  {item.eligibility.map((rule) => <li key={rule}><span aria-hidden="true">✓</span>{rule}</li>)}
                </ul>
              </div>
              <div className="detail-card">
                <h3>Relaxations & certificates</h3>
                <ul className="plain-list">
                  {item.relaxations.map((rule) => <li key={rule}>{rule}</li>)}
                </ul>
                <div className="eligibility-warning">
                  If your degree title, age, domicile or category certificate is unusual, mark yourself “check required” and read the official wording.
                </div>
              </div>
            </div>
          </section>

          <section className="detail-section" aria-labelledby="selection">
            <div className="detail-section-heading">
              <span>05</span>
              <div><h2 id="selection">Selection process & syllabus</h2><p>Stage by stage, without mixing recruitment years.</p></div>
            </div>
            <div className="two-column-cards">
              <div className="detail-card">
                <h3>Selection stages</h3>
                <ol className="number-list">
                  {item.selectionStages.map((stage, index) => <li key={stage}><span>{index + 1}</span>{stage}</li>)}
                </ol>
              </div>
              <div className="detail-card">
                <h3>Syllabus snapshot</h3>
                <ul className="plain-list">
                  {item.syllabus.map((line) => <li key={line}>{line}</li>)}
                </ul>
              </div>
            </div>
          </section>

          <section className="detail-section" aria-labelledby="documents">
            <div className="detail-section-heading">
              <span>06</span>
              <div><h2 id="documents">Application document checklist</h2><p>Prepare before the portal gets busy.</p></div>
            </div>
            <div className="document-grid">
              {item.documents.map((document, index) => (
                <div key={document}><span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><p>{document}</p></div>
              ))}
            </div>
          </section>

          <section className="detail-section" aria-labelledby="sources">
            <div className="detail-section-heading">
              <span>07</span>
              <div><h2 id="sources">Official links & source record</h2><p>Go straight to the recruiting body.</p></div>
            </div>
            <div className="official-links">
              {item.officialLinks.map((link) => (
                <a href={link.url} target="_blank" rel="noreferrer" key={link.url}>
                  <span className={`link-type link-${link.type}`}>{link.type}</span>
                  <strong>{link.label}</strong>
                  <span aria-hidden="true">↗</span>
                </a>
              ))}
            </div>
            <div className="source-record">
              <dl>
                <div><dt>Primary source</dt><dd>{item.sourceTitle}</dd></div>
                <div><dt>Published / changed</dt><dd>{item.sourcePublished}</dd></div>
                <div><dt>Last checked</dt><dd>{item.lastVerified}</dd></div>
              </dl>
              <p>Official notices, corrigenda and recruiting-body pages have final authority. This page is a reading aid.</p>
            </div>
          </section>
        </article>

        <aside className="detail-sidebar">
          <nav aria-label="On this page" className="on-this-page">
            <span>On this page</span>
            <a href="#at-a-glance">At a glance</a>
            <a href="#vacancies">Vacancies & reservation</a>
            <a href="#timeline">Timeline</a>
            <a href="#eligibility">Eligibility</a>
            <a href="#selection">Selection & syllabus</a>
            <a href="#documents">Documents</a>
            <a href="#sources">Official links</a>
          </nav>

          {item.changeLog.length > 0 && (
            <div className="change-card">
              <span>Recent changes</span>
              {item.changeLog.map((change) => (
                <div key={`${change.date}-${change.text}`}><time>{change.date}</time><p>{change.text}</p></div>
              ))}
            </div>
          )}

          <div className="correction-card">
            <span aria-hidden="true">?</span>
            <h2>Something looks wrong?</h2>
            <p>Send the official source so the record can be reviewed.</p>
            <a href={`mailto:corrections@governmentexamindia.com?subject=${correctionSubject}`}>Report a correction</a>
          </div>
        </aside>
      </div>

      <section className="related-section">
        <div className="page-shell">
          <div className="section-heading section-heading-split">
            <div><span className="kicker">Keep exploring</span><h2>Related exams</h2></div>
            <Link href="/exams" prefetch={false} className="text-link">View current exams →</Link>
          </div>
          <div className="related-grid">
            {related.map((candidate) => (
              <Link href={`/exams/${candidate.slug}`} prefetch={false} key={candidate.slug}>
                <span className={`status-pill status-${candidate.status.tone}`}><span className="status-dot" />{candidate.status.label}</span>
                <h3>{candidate.shortTitle}</h3>
                <p>{candidate.status.nextAction}</p>
                <strong>{candidate.education.join(" · ")}</strong>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
