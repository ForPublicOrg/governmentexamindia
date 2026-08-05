import Image from "next/image";
import Link from "next/link";
import { todayIso } from "@/lib/lifecycle";

const REPO_URL = "https://github.com/ForPublicOrg/governmentexamindia";
const ATHENA_URL = "https://tryathena.dev";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2026-08-05" → "5 Aug 2026". */
function formatBuildDate(iso: string) {
  const [year, month, day] = iso.split("-");
  return `${Number(day)} ${MONTHS[Number(month) - 1]} ${year}`;
}

export function SiteFooter() {
  const buildDate = formatBuildDate(todayIso());
  return (
    <footer className="site-footer">
      <div className="page-shell footer-grid">
        <div>
          <Link href="/" prefetch={false} className="footer-brand">
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
          <Link href="/exams" prefetch={false}>Current exams</Link>
          <Link href="/states" prefetch={false}>Exams by state</Link>
          <Link href="/exam-types" prefetch={false}>Exam types</Link>
          <Link href="/calendar" prefetch={false}>Exam calendar</Link>
        </div>
        <div>
          <h2>About</h2>
          <Link href="/methodology" prefetch={false}>Sources & coverage</Link>
          <a href="mailto:corrections@governmentexamindia.com">Report a correction</a>
          <a href="mailto:hello@governmentexamindia.com">Contact</a>
        </div>
      </div>
      <div className="page-shell footer-bottom">
        {/* No year in the notice: it would be the *build* year, and this site
            is a static export that can sit deployed across a New Year. The
            build date is stated instead, which is a fact about the page and
            tells a reader how fresh what they are looking at is. */}
        <span>© Government Exam India · built {buildDate}</span>
        <div className="footer-credits">
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
            <svg aria-hidden="true" viewBox="0 0 24 24" width="14" height="14">
              <path d="M8.7 16.3 4.4 12l4.3-4.3 1.4 1.4L7.2 12l2.9 2.9-1.4 1.4Zm6.6 0-1.4-1.4 2.9-2.9-2.9-2.9 1.4-1.4 4.3 4.3-4.3 4.3ZM10.6 19l2.8-14 2 .4-2.8 14-2-.4Z" />
            </svg>
            Open source
          </a>
          <span aria-hidden="true">·</span>
          <a href={ATHENA_URL} target="_blank" rel="noopener noreferrer">
            <Image src="/athena.svg" alt="" width={14} height={14} unoptimized />
            Built using Athena
          </a>
        </div>
      </div>
    </footer>
  );
}
