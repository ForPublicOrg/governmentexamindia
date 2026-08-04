"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useState } from "react";
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

function readSaved(): string[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(SAVED_KEY) ?? "[]");
    return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
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
  mode?: "catalogue" | "search";
  /**
   * Where to fetch the rest of the catalogue once JavaScript runs. Serialising
   * the whole index into the page instead would grow the HTML with every exam
   * added, so the server sends a first page and the browser pulls the rest.
   */
  indexUrl?: string;
};

export function ExamExplorer({ docs, compact = false, mode = "catalogue", indexUrl }: ExamExplorerProps) {
  const controlId = useId();
  const [filters, setFilters] = useState<ExplorerState>(defaultExplorerState);
  const [savedOnlyReady, setSavedOnlyReady] = useState(false);
  const [saved, setSaved] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [loadedDocs, setLoadedDocs] = useState<SearchDoc[] | null>(null);

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

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const initialFilters = parseExplorerParams(new URLSearchParams(window.location.search), paramOptions);
      setFilters(initialFilters);
      setFiltersOpen(facetFilterCount(initialFilters) > 0);
      setSaved(readSaved());
      setSavedOnlyReady(true);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [paramOptions]);

  useEffect(() => {
    if (!savedOnlyReady) return;
    const params = toExplorerParams(filters).toString();
    const nextUrl = `${window.location.pathname}${params ? `?${params}` : ""}${window.location.hash}`;
    window.history.replaceState(window.history.state, "", nextUrl);
  }, [filters, savedOnlyReady]);

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
    setFilters((current) => ({ ...current, ...patch }));
    setPage(1);
  };

  const toggleSaved = (slug: string) => {
    setSaved((current) => {
      const next = current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug];
      try {
        localStorage.setItem(SAVED_KEY, JSON.stringify(next));
      } catch {
        // Saving is an enhancement; filtering and navigation must still work.
      }
      return next;
    });
    setPage(1);
  };

  const reset = () => {
    setFilters(defaultExplorerState);
    setPage(1);
    setFiltersOpen(false);
  };

  const savedResultsLoading = mode === "search" && filters.savedOnly && !savedOnlyReady;

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
            {savedResultsLoading ? (
              "Loading saved exams"
            ) : (
              <>
                <strong>{results.length}</strong> {results.length === 1 ? "exam" : "exams"}
                {activeFilterCount ? ` · ${activeFilterCount} active` : ""}
              </>
            )}
          </p>
          <div>
            <button
              type="button"
              className={`saved-filter${filtersOpen ? " is-active" : ""}`}
              onClick={() => setFiltersOpen((current) => !current)}
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
