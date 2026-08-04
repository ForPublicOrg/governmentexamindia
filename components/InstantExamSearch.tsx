"use client";

import { useRouter } from "next/navigation";
import { useCallback, useId, useMemo, useRef, useState, type FocusEvent, type KeyboardEvent } from "react";
import { rank, type SearchDoc } from "@/lib/search";

type SearchRuntime = { docs: SearchDoc[] };
type LoadState = "idle" | "loading" | "ready" | "error";

const RESULT_LIMIT = 5;
const SEARCH_INDEX_URL = "/search-index.json?v=2";
// Trailing slash to match `trailingSlash: true`, so Enter lands on the search
// page directly instead of taking a redirect on the way.
const SEARCH_PAGE = "/search/";

export function InstantExamSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [runtime, setRuntime] = useState<SearchRuntime | null>(null);
  const [loadState, setLoadState] = useState<LoadState>("idle");
  const [isOpen, setIsOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const runtimeRequest = useRef<Promise<SearchRuntime> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const instanceId = useId().replaceAll(":", "");
  const listboxId = `instant-search-listbox-${instanceId}`;

  const ensureRuntime = useCallback(async () => {
    if (runtime) return runtime;
    if (runtimeRequest.current) return runtimeRequest.current;

    setLoadState("loading");
    const request = (async () => {
      const response = await fetch(SEARCH_INDEX_URL);

      if (!response.ok) throw new Error(`Search index returned ${response.status}`);
      const payload: unknown = await response.json();
      if (!Array.isArray(payload)) throw new Error("Search index has an invalid shape");

      return { docs: payload as SearchDoc[] };
    })();

    runtimeRequest.current = request;
    try {
      const loaded = await request;
      setRuntime(loaded);
      setLoadState("ready");
      return loaded;
    } catch (error) {
      runtimeRequest.current = null;
      setLoadState("error");
      throw error;
    }
  }, [runtime]);

  const rankedMatches = useMemo(() => {
    const cleaned = query.trim();
    if (!runtime || !cleaned) return [];
    return rank(runtime.docs, cleaned).map((result) => result.doc);
  }, [query, runtime]);
  const matches = rankedMatches.slice(0, RESULT_LIMIT);

  const loadWithoutThrowing = useCallback(() => {
    void ensureRuntime().catch(() => undefined);
  }, [ensureRuntime]);

  /**
   * Enter runs the whole search rather than opening the top suggestion. The
   * typeahead is a shortcut, not a guess at what was meant: only a row the
   * reader has deliberately arrowed onto opens as an exam. Nothing here waits
   * on the index, so Enter works while the suggestions are still loading.
   */
  const submitSearch = useCallback(() => {
    const cleaned = query.trim();
    if (!cleaned) {
      inputRef.current?.focus();
      return;
    }

    const chosen = highlighted >= 0 ? matches[highlighted] : undefined;
    setIsOpen(false);
    setHighlighted(-1);
    router.push(chosen ? `/exams/${chosen.s}/` : `${SEARCH_PAGE}?q=${encodeURIComponent(cleaned)}`);
  }, [highlighted, matches, query, router]);

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      submitSearch();
      return;
    }

    if (event.key === "Escape") {
      if (isOpen) event.preventDefault();
      setIsOpen(false);
      setHighlighted(-1);
      return;
    }

    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    if (!matches.length) return;

    setIsOpen(true);
    setHighlighted((current) => {
      if (event.key === "ArrowDown") return current < 0 ? 0 : (current + 1) % matches.length;
      return current <= 0 ? matches.length - 1 : current - 1;
    });
  }

  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    const next = event.relatedTarget;
    if (!(next instanceof Node) || !event.currentTarget.contains(next)) setIsOpen(false);
  }

  const cleanedQuery = query.trim();
  const showPanel = isOpen && Boolean(cleanedQuery);
  const hasListbox = loadState === "ready" && matches.length > 0;
  const activeOptionId = hasListbox && matches[highlighted]
    ? `instant-search-option-${instanceId}-${highlighted}`
    : undefined;
  const fullResultsHref = `${SEARCH_PAGE}?q=${encodeURIComponent(cleanedQuery)}`;

  return (
    <div className="instant-exam-search" onBlur={handleBlur}>
      <form
        className="hero-search instant-search-form"
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          submitSearch();
        }}
      >
        <label htmlFor={`home-search-${instanceId}`} className="sr-only">
          Search the government exam index
        </label>
        <span aria-hidden="true">⌕</span>
        <input
          ref={inputRef}
          id={`home-search-${instanceId}`}
          name="q"
          type="search"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showPanel}
          aria-controls={showPanel && hasListbox ? listboxId : undefined}
          aria-activedescendant={showPanel && hasListbox ? activeOptionId : undefined}
          aria-busy={loadState === "loading"}
          placeholder="Try “12th pass”, “bank PO” or “Bihar”"
          autoComplete="off"
          spellCheck={false}
          value={query}
          onFocus={() => {
            loadWithoutThrowing();
            // Nothing starts selected: a highlighted row is a choice the reader
            // made with the arrow keys, and Enter honours only that.
            if (cleanedQuery) setIsOpen(true);
          }}
          onChange={(event) => {
            const value = event.target.value;
            setQuery(value);
            if (value.trim()) {
              setIsOpen(true);
              setHighlighted(-1);
              loadWithoutThrowing();
            } else {
              setIsOpen(false);
              setHighlighted(-1);
            }
          }}
          onKeyDown={handleKeyDown}
        />
        <button type="submit" disabled={!cleanedQuery}>Search</button>
      </form>

      {showPanel ? (
        <div className="instant-search-panel">
          {loadState === "loading" || loadState === "idle" ? (
            <p className="instant-search-state" role="status">Searching…</p>
          ) : loadState === "error" ? (
            <div className="instant-search-state instant-search-error" role="status">
              <span>Search unavailable</span>
              <button type="button" className="instant-search-retry" onClick={loadWithoutThrowing}>Retry</button>
            </div>
          ) : matches.length ? (
            <>
              <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
                {rankedMatches.length} matches. Press Enter for all of them, or arrow down to open one.
              </p>
              <ul className="instant-search-results" id={listboxId} role="listbox" aria-label="Matching exams">
                {matches.map((doc, index) => (
                  <li role="presentation" key={doc.s}>
                    <a
                      id={`instant-search-option-${instanceId}-${index}`}
                      className={`instant-search-result${highlighted === index ? " is-highlighted" : ""}`}
                      href={`/exams/${doc.s}/`}
                      role="option"
                      aria-selected={highlighted === index}
                    >
                      <span className="instant-search-result-copy">
                        <strong className="instant-search-result-title">{doc.t}</strong>
                        <span className="instant-search-result-meta">
                          {doc.o} <span aria-hidden="true">·</span> {doc.sn ?? doc.g}
                        </span>
                      </span>
                      <span className={`status-pill status-${doc.n} instant-search-status`}>
                        <span className="status-dot" aria-hidden="true" />
                        {doc.sl}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <p className="instant-search-state instant-search-empty" role="status">No matches</p>
          )}

          {loadState === "ready" ? (
            <a className="instant-search-footer" href={fullResultsHref}>
              <span>All {rankedMatches.length} {rankedMatches.length === 1 ? "match" : "matches"}</span>
              <span aria-hidden="true">→</span>
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
