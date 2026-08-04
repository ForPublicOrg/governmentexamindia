import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="page-shell footer-grid">
        <div>
          <Link href="/" className="footer-brand">
            Government Exam India
          </Link>
          <p>
            Search central and state exams, eligibility, vacancies and timelines.
          </p>
          <p className="footer-disclaimer">
            Independent exam index; not a government website.
          </p>
        </div>
        <div>
          <h2>Explore</h2>
          <Link href="/exams">All exams</Link>
          <Link href="/states">Exams by state</Link>
          <Link href="/exam-types">Exam types</Link>
          <Link href="/calendar">Exam calendar</Link>
        </div>
        <div>
          <h2>About</h2>
          <Link href="/methodology">Sources & coverage</Link>
          <a href="mailto:corrections@governmentexamindia.com">Report a correction</a>
          <a href="mailto:hello@governmentexamindia.com">Contact</a>
        </div>
      </div>
      <div className="page-shell footer-bottom">
        <span>Independent exam index; not a government website.</span>
        <span>Official notice always has final authority.</span>
      </div>
    </footer>
  );
}
