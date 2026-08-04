import Link from "next/link";

export default function NotFound() {
  return (
    <div className="not-found page-shell">
      <span>404</span>
      <h1>This exam page is not in the index.</h1>
      <p>It may use a different name, belong to a cycle we have not covered yet, or have moved after a correction.</p>
      <div><Link href="/exams" className="button button-primary">Search all exams</Link><Link href="/" className="button button-secondary">Go home</Link></div>
    </div>
  );
}

