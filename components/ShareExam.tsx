"use client";

import { useEffect, useRef, useState, type FocusEvent } from "react";

type ShareExamProps = {
  /** Canonical path of the exam, e.g. `/exams/ssc-cgl-2026`. */
  path: string;
  title: string;
  /** One line of context so a forwarded link explains itself. */
  summary: string;
};

const SITE_URL = "https://governmentexamindia.com";

type Copied = "idle" | "copied" | "failed";

export function ShareExam({ path, title, summary }: ShareExamProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState<Copied>("idle");
  const resetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (resetTimer.current) clearTimeout(resetTimer.current);
  }, []);

  // Rendered statically, so the real origin is only known in the browser. The
  // canonical domain keeps a shared link correct from a preview or local build.
  const url = typeof window === "undefined" ? `${SITE_URL}${path}` : new URL(path, window.location.origin).toString();
  const shareUrl = url.startsWith("http://localhost") ? `${SITE_URL}${path}` : url;
  const message = `${title} — ${summary}`;

  function flash(state: Copied) {
    setCopied(state);
    if (resetTimer.current) clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setCopied("idle"), 2500);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      flash("copied");
    } catch {
      flash("failed");
    }
  }

  async function handleShare() {
    // A phone opens the OS share sheet; everywhere else falls back to the menu.
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text: message, url: shareUrl });
        return;
      } catch {
        // Cancelling the sheet is not an error worth surfacing.
        return;
      }
    }
    setIsOpen((current) => !current);
  }

  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    const next = event.relatedTarget;
    if (!(next instanceof Node) || !event.currentTarget.contains(next)) setIsOpen(false);
  }

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedMessage = encodeURIComponent(message);
  const targets = [
    { label: "WhatsApp", href: `https://wa.me/?text=${encodeURIComponent(`${message} ${shareUrl}`)}` },
    { label: "Telegram", href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedMessage}` },
    { label: "X", href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedMessage}` },
    { label: "Email", href: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${message}\n\n${shareUrl}`)}` },
  ];

  return (
    <div className="share-exam" onBlur={handleBlur}>
      <button
        type="button"
        className="button button-secondary share-button"
        onClick={handleShare}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        <span aria-hidden="true">↗</span> Share this exam
      </button>

      {isOpen && (
        <div className="share-menu" role="menu" aria-label={`Share ${title}`}>
          {targets.map((target) => (
            <a
              key={target.label}
              className="share-menu-item"
              role="menuitem"
              href={target.href}
              target="_blank"
              rel="noreferrer"
              onClick={() => setIsOpen(false)}
            >
              {target.label}
            </a>
          ))}
          <button type="button" className="share-menu-item" role="menuitem" onClick={copyLink}>
            {copied === "copied" ? "Link copied" : copied === "failed" ? "Copy failed — select the URL" : "Copy link"}
          </button>
        </div>
      )}

      <span className="sr-only" role="status" aria-live="polite">
        {copied === "copied" ? "Link copied to clipboard" : copied === "failed" ? "Could not copy the link" : ""}
      </span>
    </div>
  );
}
