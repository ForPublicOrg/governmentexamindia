import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "You are offline",
  robots: { index: false, follow: false },
};

/**
 * Served by public/sw.js when a page is requested with no connection and no
 * cached copy of it exists. Pages opened before are still served from cache.
 */
export default function Offline() {
  return (
    <div className="not-found page-shell">
      <span>Offline</span>
      <h1>You are offline.</h1>
      <p>
        This page has not been saved on this device yet. Pages you opened before still work offline, but exam dates
        change often, so check again once you are back online.
      </p>
      <div>
        <Link href="/" prefetch={false} className="button button-primary">Go home</Link>
      </div>
    </div>
  );
}
