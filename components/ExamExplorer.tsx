"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useState, useSyncExternalStore } from "react";
import { examTypeOptions, indiaRegions } from "@/lib/discovery";
import type { EducationLevel, ExamType, GovernmentLevel } from "@/lib/exam-types";
import { lifecyclePhaseMeta, lifecyclePhases } from "@/lib/lifecycle";
import {
  applyFacets,
  compareDocs,
  defaultExplorerState,
  parseExplorerParams,
  phaseForStatus,
  phaseOfDoc,
  rank,
  statusFilters,
  toExplorerParams,
  tonesForStatus,
  uniqueSearchDocs,
  type ExplorerParamOptions,
  type ExplorerState,
  type SearchDoc,
  type StatusFilter,
} from "@/lib/search";

const educationValues: readonly EducationLevel[] = [
  "10th",
  "12th",
  "ITI / Diploma",
  "Graduate",
  "Postgraduate",
  "Professional degree",
];

const educationOptions: { value: "All" | EducationLevel; label: string }[] = [
  { value: "All", label: "Any qualification" },
  { value: "10th", label: "Class 10" },
  { value: "12th", label: "Class 12" },
  { value: "ITI / Diploma", label: "ITI / Diploma" },
  { value: "Graduate", label: "Any graduate" },
  { value: "Postgraduate", label: "Postgraduate" },
  { value: "Professional degree", label: "Professional degree" },
];

const SAVED_KEY = "gei-saved-exams";
const DEFAULT_PAGE_SIZE = 12;
const COMPACT_PAGE_SIZE = 6;

function facetFilterCount(filters: ExplorerState) {
  return [
    filters.education !== "All",
    filters.examType !== "All",
    filters.level !== "All",
    filters.region !== "All",
    filters.year !== "All",
    filters.status !== "all",
  ].filter(Boolean).length;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2026-08-20" → "20 Aug 2026". */
function formatIsoDate(iso: string) {
  const [year, month, day] = iso.split("-");
  return `${Number(day)} ${MONTHS[Number(month) - 1]} ${year}`;
}

/*
 * The query string and the saved list are external stores, so they are
 * subscribed to rather than copied into state by an effect. An effect cannot
 * run before the first render, which is why an earlier version deferred the
 * read to a frame that never arrives in a tab the browser is not painting --
 * a search link opened in a background tab came up unfiltered. The server
 * snapshots below are what the static HTML was built with, so hydration still
 * matches and the real values arrive in the render straight after it.
 */

const NO_SEARCH = "";
const NO_SAVED: readonly string[] = [];

function subscribeToUrl(onChange: () => void) {
  window.addEventListener("popstate", onChange);
  return () => window.removeEventListener("popstate", onChange);
}

const savedListeners = new Set<() => void>();
let savedRaw: string | null = null;
let savedList: readonly string[] = NO_SAVED;
let storageWorks = true;

function parseSaved(raw: string | null): readonly string[] {
  try {
    const value: unknown = JSON.parse(raw ?? "[]");
    if (!Array.isArray(value)) return NO_SAVED;
    const list = value.filter((item): item is string => typeof item === "string");
    // Reusing the empty constant keeps the snapshot identical to the one the
    // server rendered, so a reader with nothing saved costs no extra render.
    return list.length ? list : NO_SAVED;
  } catch {
    return NO_SAVED;
  }
}

/**
 * React compares snapshots by identity, so the parsed list is cached against
 * the raw string instead of being rebuilt — and handed back new — every render.
 */
function savedSnapshot(): readonly string[] {
  if (!storageWorks) return savedList;
  let raw: string | null;
  try {
    raw = localStorage.getItem(SAVED_KEY);
  } catch {
    storageWorks = false;
    return savedList;
  }
  if (raw !== savedRaw) {
    savedRaw = raw;
    savedList = parseSaved(raw);
  }
  return savedList;
}

function subscribeToSaved(onChange: () => void) {
  // `storage` only fires in the tabs that did not write, so saving notifies
  // this one directly and other tabs through the event.
  savedListeners.add(onChange);
  window.addEventListener("storage", onChange);
  return () => {
    savedListeners.delete(onChange);
    window.removeEventListener("storage", onChange);
  };
}

function writeSaved(next: readonly string[]) {
  const raw = JSON.stringify(next);
  savedList = next;
  try {
    localStorage.setItem(SAVED_KEY, raw);
    savedRaw = raw;
  } catch {
    // Storage can be blocked or full. Saving is an enhancement, so the list
    // keeps working for this visit rather than the star going dead.
    storageWorks = false;
  }
  for (const listener of savedListeners) listener();
}

function ExamResultCard({
  item,
  saved,
  onSave,
}: {
  item: SearchDoc;
  saved: boolean;
  onSave: (slug: string) => void;
}) {
  return (
    <article className="exam-card exam-card-compact">
      <div className="exam-card-topline">
        <span className={`status-pill status-${item.n}`}>
          <span className="status-dot" aria-hidden="true" />
          {item.sl}
        </span>
        <button
          type="button"
          className={`save-button${saved ? " is-saved" : ""}`}
          onClick={() => onSave(item.s)}
          aria-label={saved ? `Remove ${item.st} from saved exams` : `Save ${item.st}`}
          aria-pressed={saved}
        >
          <span aria-hidden="true">{saved ? "★" : "☆"}</span>
        </button>
      </div>

      <div className="exam-card-heading">
        <p>{item.o} <span aria-hidden="true">·</span> {item.g === "Central" ? "All India" : (item.sn ?? "State")}</p>
        <h2>
          <Link
            href={`/exams/${item.s}`}
            className="stretched-card-link"
            aria-label={`Open ${item.t}`}
            prefetch={false}
          >
            {item.t}
          </Link>
        </h2>
      </div>

      <div className="next-action">
        <span>Next step</span>
        <strong>{item.na}</strong>
      </div>

      {item.cd && (
        // `k` is built at the same time as `cd`, so bucket "0" is the record's
        // own build-time answer to "is this window still open?".
        <p className={`deadline-line${item.k.startsWith("0") ? " is-open" : ""}`}>
          <span aria-hidden="true">⏳</span>
          {item.k.startsWith("0") ? "Applications close " : "Applications closed "}
          <strong>{formatIsoDate(item.cd)}</strong>
        </p>
      )}

      <dl className="exam-facts">
        <div>
          <dt>Vacancies</dt>
          <dd>{item.v}</dd>
        </div>
        <div>
          <dt>Education</dt>
          <dd>{item.e.join(" · ")}</dd>
        </div>
      </dl>

      <div className="exam-card-footer">
        <span className={`card-verification${item.vf ? " is-verified" : ""}`}>
          <strong>{item.vf ? "✓ Verified" : "Listed"}</strong> <span aria-hidden="true">·</span> {item.c}
        </span>
        <span className="card-cta" aria-hidden="true">Open →</span>
      </div>
    </article>
  );
}

type ExamExplorerProps = {
  /** Records rendered on the server. Keep this a bounded first page. */
  docs: SearchDoc[];
  compact?: boolean;
  /**
   * Where to fetch the rest of the catalogue once JavaScript runs. Serialising
   * the whole index into the page instead would grow the HTML with every exam
   * added, so the server sends a first page and the browser pulls the rest.
   */
  indexUrl?: string;
};

export function ExamExplorer({ docs, compact = false, indexUrl }: ExamExplorerProps) {
  const controlId = useId();
  // Everything the reader changes is an override on top of what the URL and
  // localStorage already say, so nothing has to be copied between the two.
  const [edited, setEdited] = useState<ExplorerState | null>(null);
  const [openedFilters, setOpenedFilters] = useState<boolean | null>(null);
  const [page, setPage] = useState(1);
  const [loadedDocs, setLoadedDocs] = useState<SearchDoc[] | null>(null);
  const search = useSyncExternalStore(subscribeToUrl, () => window.location.search, () => NO_SEARCH);
  const saved = useSyncExternalStore(subscribeToSaved, savedSnapshot, () => NO_SAVED);

  useEffect(() => {
    if (!indexUrl) return;
    let cancelled = false;
    fetch(indexUrl)
      .then((response) => (response.ok ? response.json() : Promise.reject(new Error(String(response.status)))))
      .then((payload: unknown) => {
        // The server-rendered first page keeps working if this never arrives.
        if (!cancelled && Array.isArray(payload)) setLoadedDocs(payload as SearchDoc[]);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [indexUrl]);

  const uniqueDocs = useMemo(() => uniqueSearchDocs(loadedDocs ?? docs), [docs, loadedDocs]);
  const years = useMemo(
    () => Array.from(new Set(uniqueDocs.map((doc) => doc.y))).sort((a, b) => b - a),
    [uniqueDocs],
  );
  const paramOptions = useMemo<ExplorerParamOptions>(
    () => ({
      education: educationValues,
      examTypes: examTypeOptions.map((option) => option.value),
      regions: indiaRegions.map((region) => region.code),
      years,
    }),
    [years],
  );

  const urlFilters = useMemo(
    () => parseExplorerParams(new URLSearchParams(search), paramOptions),
    [paramOptions, search],
  );
  const filters = edited ?? urlFilters;
  const filtersOpen = openedFilters ?? facetFilterCount(filters) > 0;

  const hasActiveFilters =
    Boolean(filters.query.trim()) ||
    filters.education !== "All" ||
    filters.examType !== "All" ||
    filters.level !== "All" ||
    filters.region !== "All" ||
    filters.year !== "All" ||
    filters.status !== "all" ||
    filters.savedOnly;
  const activeFilterCount = facetFilterCount(filters);

  // Only once the reader has changed something: the URL they arrived on is
  // theirs to keep, and rewriting it before the first render finishes would
  // erase the very parameters this component is about to read.
  useEffect(() => {
    if (!edited) return;
    const params = toExplorerParams(edited).toString();
    const nextUrl = `${window.location.pathname}${params ? `?${params}` : ""}${window.location.hash}`;
    window.history.replaceState(window.history.state, "", nextUrl);
  }, [edited]);

  const results = useMemo(() => {
    let matches = applyFacets(uniqueDocs, {
      education: filters.education,
      examType: filters.examType,
      level: filters.level,
      region: filters.region,
      year: filters.year,
      tones: tonesForStatus(filters.status),
      phase: phaseForStatus(filters.status),
    });

    if (filters.savedOnly) matches = matches.filter((doc) => saved.includes(doc.s));
    if (filters.query.trim()) return rank(matches, filters.query).map((result) => result.doc);

    return matches.sort(compareDocs);
  }, [filters, saved, uniqueDocs]);

  const pageSize = compact ? COMPACT_PAGE_SIZE : DEFAULT_PAGE_SIZE;
  const visibleResults = results.slice(0, page * pageSize);
  // Ranking and sorting already put the phases in order, so grouping the page
  // just adds the headings that make the boundary visible. The count is of
  // every match in the phase, not only the ones this page has loaded.
  const groupedResults = useMemo(
    () =>
      lifecyclePhases
        .map((phase) => ({
          phase,
          ...lifecyclePhaseMeta[phase],
          total: results.filter((doc) => phaseOfDoc(doc) === phase).length,
          items: visibleResults.filter((doc) => phaseOfDoc(doc) === phase),
        }))
        .filter((group) => group.items.length > 0),
    [results, visibleResults],
  );

  const updateFilters = (patch: Partial<ExplorerState>) => {
    // Pin the panel where it stands before changing anything. It holds the
    // control being operated, so deriving its visibility from the facet count
    // would shut it the moment the last facet went back to "All" — closing it
    // over the reader's hands and dropping focus.
    setOpenedFilters(filtersOpen);
    setEdited({ ...filters, ...patch });
    setPage(1);
  };

  const toggleSaved = (slug: string) => {
    writeSaved(saved.includes(slug) ? saved.filter((item) => item !== slug) : [...saved, slug]);
    setPage(1);
  };

  const reset = () => {
    setEdited(defaultExplorerState);
    setPage(1);
    setOpenedFilters(false);
  };

  return (
    <section className={`explorer${compact ? " explorer-compact" : ""}`} aria-labelledby={`${controlId}-title`}>
      <h2 id={`${controlId}-title`} className="sr-only">Government exam search and filters</h2>
      <div className="explorer-controls">
        <div className="search-field" role="search">
          <label htmlFor={`${controlId}-query`} className="sr-only">
            Search exams, posts, organisations or notification numbers
          </label>
          <span className="search-icon" aria-hidden="true">⌕</span>
          <input
            id={`${controlId}-query`}
            type="search"
            value={filters.query}
            onChange={(event) => updateFilters({ query: event.target.value })}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.preventDefault();
            }}
            placeholder="Search exams, posts or states"
            autoComplete="off"
          />
          {filters.query && (
            <button type="button" onClick={() => updateFilters({ query: "" })} aria-label="Clear search">
              Clear
            </button>
          )}
        </div>

        <div className="filter-summary">
          <p role="status" aria-live="polite" aria-atomic="true">
            <strong>{results.length}</strong> {results.length === 1 ? "exam" : "exams"}
            {activeFilterCount ? ` · ${activeFilterCount} active` : ""}
          </p>
          <div>
            <button
              type="button"
              className={`saved-filter${filtersOpen ? " is-active" : ""}`}
              onClick={() => setOpenedFilters(!filtersOpen)}
              aria-expanded={filtersOpen}
              aria-controls={`${controlId}-filters`}
            >
              Filters {activeFilterCount ? `(${activeFilterCount})` : ""}
            </button>
            <button
              type="button"
              className={`saved-filter${filters.savedOnly ? " is-active" : ""}`}
              onClick={() => updateFilters({ savedOnly: !filters.savedOnly })}
              disabled={!saved.length && !filters.savedOnly}
              aria-pressed={filters.savedOnly}
            >
              ★ Saved {saved.length ? `(${saved.length})` : ""}
            </button>
            <button type="button" className="reset-button" onClick={reset} disabled={!hasActiveFilters}>
              Reset
            </button>
          </div>
        </div>

        <div id={`${controlId}-filters`} className="filter-grid" hidden={!filtersOpen}>
          <label htmlFor={`${controlId}-education`}>
            <span>Education</span>
            <select
              id={`${controlId}-education`}
              value={filters.education}
              onChange={(event) => updateFilters({ education: event.target.value as "All" | EducationLevel })}
            >
              {educationOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>

          <label htmlFor={`${controlId}-type`}>
            <span>Exam type</span>
            <select
              id={`${controlId}-type`}
              value={filters.examType}
              onChange={(event) => updateFilters({ examType: event.target.value as "All" | ExamType })}
            >
              <option value="All">All exam types</option>
              {examTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.value}</option>
              ))}
            </select>
          </label>

          <label htmlFor={`${controlId}-level`}>
            <span>Government</span>
            <select
              id={`${controlId}-level`}
              value={filters.level}
              onChange={(event) => updateFilters({ level: event.target.value as "All" | GovernmentLevel })}
            >
              <option value="All">Central + state</option>
              <option value="Central">Central only</option>
              <option value="State">State only</option>
            </select>
          </label>

          <label htmlFor={`${controlId}-region`}>
            <span>Location</span>
            <select
              id={`${controlId}-region`}
              value={filters.region}
              onChange={(event) => updateFilters({ region: event.target.value })}
            >
              <option value="All">All India + every state</option>
              <option value="central">Central / All India only</option>
              <optgroup label="States">
                {indiaRegions.filter((region) => region.kind === "State").map((region) => (
                  <option key={region.code} value={region.code}>{region.name}</option>
                ))}
              </optgroup>
              <optgroup label="Union territories">
                {indiaRegions.filter((region) => region.kind === "Union territory").map((region) => (
                  <option key={region.code} value={region.code}>{region.name}</option>
                ))}
              </optgroup>
            </select>
          </label>

          <label htmlFor={`${controlId}-year`}>
            <span>Cycle year</span>
            <select
              id={`${controlId}-year`}
              value={filters.year}
              onChange={(event) => updateFilters({ year: event.target.value === "All" ? "All" : Number(event.target.value) })}
            >
              <option value="All">All years</option>
              {years.map((year) => <option key={year} value={year}>{year}</option>)}
            </select>
          </label>

          <label htmlFor={`${controlId}-status`}>
            <span>Stage</span>
            <select
              id={`${controlId}-status`}
              value={filters.status}
              onChange={(event) => updateFilters({ status: event.target.value as StatusFilter })}
            >
              {statusFilters.filter((filter) => !filter.group).map((filter) => (
                <option key={filter.value} value={filter.value}>{filter.label}</option>
              ))}
              <optgroup label="Where the cycle is">
                {statusFilters.filter((filter) => filter.group === "phase").map((filter) => (
                  <option key={filter.value} value={filter.value}>{filter.label}</option>
                ))}
              </optgroup>
              <optgroup label="Exact stage">
                {statusFilters.filter((filter) => filter.group === "stage").map((filter) => (
                  <option key={filter.value} value={filter.value}>{filter.label}</option>
                ))}
              </optgroup>
            </select>
          </label>
        </div>
      </div>

      {visibleResults.length ? (
        <>
          {groupedResults.map((group) => (
            <section className="phase-group" key={group.phase} aria-labelledby={`${controlId}-${group.phase}`}>
              <div className={`phase-heading phase-${group.phase}`}>
                <h3 id={`${controlId}-${group.phase}`}>
                  <span className="phase-dot" aria-hidden="true" />
                  {group.label}
                  <span className="phase-count">{group.total}</span>
                </h3>
                <p>
                  {group.blurb}
                  {group.items.length < group.total ? ` · showing ${group.items.length}` : ""}
                </p>
              </div>
              <div className="exam-results">
                {group.items.map((item) => (
                  <ExamResultCard key={item.s} item={item} saved={saved.includes(item.s)} onSave={toggleSaved} />
                ))}
              </div>
            </section>
          ))}
          {visibleResults.length < results.length && (
            <div className="load-more-row">
              <p>{visibleResults.length} of {results.length}</p>
              <button type="button" className="button button-secondary" onClick={() => setPage((current) => current + 1)}>
                Show {Math.min(pageSize, results.length - visibleResults.length)} more
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="empty-state">
          <span aria-hidden="true">⌕</span>
          <h2>No matches</h2>
          <button type="button" className="button button-primary" onClick={reset}>
            Reset
          </button>
        </div>
      )}
    </section>
  );
}
