"use client";

import { useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

/** Chromium's install prompt; not in the DOM typings because no other engine has it. */
type InstallPromptEvent = Event & { prompt: () => Promise<void> };

declare global {
  interface Window {
    /** Captured by the bootstrap script in app/layout.tsx, which runs before hydration. */
    __installPrompt?: InstallPromptEvent | null;
  }
}

/** Fired by the bootstrap script whenever `window.__installPrompt` changes. */
const CHANGE_EVENT = "installpromptchange";

type InstallMode = "prompt" | "ios" | "none";

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

/** iPadOS reports itself as a Mac, so a touch screen is the tell. */
function isIos() {
  const ua = navigator.userAgent;
  return /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
}

function snapshot(): InstallMode {
  if (isStandalone()) return "none";
  if (window.__installPrompt) return "prompt";
  // iOS has no install prompt; every iOS browser installs through its Share menu.
  if (isIos()) return "ios";
  return "none";
}

function subscribe(onChange: () => void) {
  const media = window.matchMedia("(display-mode: standalone)");
  window.addEventListener(CHANGE_EVENT, onChange);
  media.addEventListener("change", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    media.removeEventListener("change", onChange);
  };
}

function DownloadIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24">
      <path d="M12 4v10.5M7.5 10 12 14.5 16.5 10M5 19h14" />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="install-share-icon">
      <path d="M12 3.5v11M8 7.5l4-4 4 4M8.5 10.5H6.5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h11a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-2" />
    </svg>
  );
}

/**
 * "Install app" for the header (`variant="header"`) and, on phones too narrow
 * for another header button, the mobile menu (`variant="menu"`). Nothing
 * renders until the browser can actually install the site: Chromium offers its
 * own prompt, iOS gets Add to Home Screen steps, and an already-installed app
 * shows neither.
 */
export function InstallApp({ variant }: { variant: "header" | "menu" }) {
  const mode = useSyncExternalStore(subscribe, snapshot, (): InstallMode => "none");
  const dialog = useRef<HTMLDialogElement>(null);

  if (mode === "none") return null;

  async function install(event: React.MouseEvent<HTMLButtonElement>) {
    // The iOS dialog is portalled to <body>, so closing the menu cannot hide it.
    event.currentTarget.closest("details")?.removeAttribute("open");
    if (mode === "ios") {
      dialog.current?.showModal();
      return;
    }
    const prompt = window.__installPrompt;
    if (!prompt) return;
    // A captured prompt can be shown once; Chromium fires a fresh one later if
    // the reader dismisses this one.
    window.__installPrompt = null;
    window.dispatchEvent(new Event(CHANGE_EVENT));
    await prompt.prompt();
  }

  return (
    <>
      <button
        type="button"
        className={variant === "header" ? "install-app" : "install-menu-item"}
        aria-label={variant === "header" ? "Install the app" : undefined}
        title="Install the app"
        onClick={install}
      >
        <DownloadIcon />
        <span>Install app</span>
      </button>
      {mode === "ios" &&
        createPortal(
          <dialog ref={dialog} className="install-dialog" aria-labelledby={`install-dialog-title-${variant}`}>
            <h2 id={`install-dialog-title-${variant}`}>Install Government Exam India</h2>
            <p>Add it to your Home Screen to open it like an app, full screen and one tap away.</p>
            <ol>
              <li>
                Tap the <strong>Share</strong> button <ShareIcon /> in your browser.
              </li>
              <li>
                Scroll down and tap <strong>Add to Home Screen</strong>.
              </li>
              <li>
                Tap <strong>Add</strong>.
              </li>
            </ol>
            <form method="dialog">
              <button type="submit" className="button button-primary" autoFocus>
                Got it
              </button>
            </form>
          </dialog>,
          document.body,
        )}
    </>
  );
}
