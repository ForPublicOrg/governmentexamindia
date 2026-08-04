import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

const navItems = [
  { href: "/exams", label: "Current exams" },
  { href: "/states", label: "States" },
  { href: "/exam-types", label: "Exam types" },
  { href: "/calendar", label: "Calendar" },
  { href: "/updates", label: "Updates" },
  { href: "/#education", label: "By education" },
];

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="tricolour-rule" aria-hidden="true" />
      <div className="header-inner page-shell">
        <Link href="/" prefetch={false} className="brand" aria-label="Government Exam India home">
          <span className="brand-mark" aria-hidden="true">
            GE
          </span>
          <span className="brand-copy">
            <strong>Government Exam India</strong>
            <span>Exams · Seats · Timelines</span>
          </span>
        </Link>

        <nav className="desktop-nav" aria-label="Primary navigation">
          {navItems.map((item) => (
            <Link href={item.href} prefetch={false} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <ThemeToggle />
          <Link className="header-search" href="/search" prefetch={false} aria-label="Search the exam index">
            <span aria-hidden="true">⌕</span>
            <span>Search</span>
          </Link>
          <details className="mobile-menu">
            <summary aria-label="Open navigation menu">Menu</summary>
            <nav aria-label="Mobile navigation">
              {navItems.map((item) => (
                <Link href={item.href} prefetch={false} key={item.href}>
                  {item.label}
                </Link>
              ))}
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
