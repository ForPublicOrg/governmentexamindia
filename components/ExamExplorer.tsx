"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  educationOptions,
  exams,
  getSearchText,
  type EducationLevel,
  type Exam,
  type ExamType,
} from "@/lib/exams";
import { examTypeOptions } from "@/lib/discovery";

type StatusFilter = "All" | "Attention" | "Notification soon" | "Exam upcoming" | "In progress";

const statusFilters: { value: StatusFilter; tones: string[] }[] = [
  { value: "All", tones: [] },
  { value: "Attention", tones: ["red"] },
  { value: "Notification soon", tones: ["amber"] },
  { value: "Exam upcoming", tones: ["blue"] },
  { value: "In progress", tones: ["violet", "slate"] },
];

const SAVED_KEY = "gei-saved-exams";

function readSaved(): string[] {
  try {
    const value = localStorage.getItem(SAVED_KEY);
    return value ? (JSON.parse(value) as string[]) : [];
  } catch {
    return [];
  }
}

function ExamResultCard({
  item,
  saved,
  onSave,
}: {
  item: Exam;
  saved: boolean;
  onSave: (slug: string) => void;
}) {
  return (
    <article className="exam-card">
      <div className="exam-card-topline">
        <span className={`status-pill status-${item.status.tone}`}>
          <span className="status-dot" aria-hidden="true" />
          {item.status.label}
        </span>
        <button
          type="button"
          className={`save-button${saved ? " is-saved" : ""}`}
          onClick={() => onSave(item.slug)}
          aria-label={saved ? `Remove ${item.shortTitle} from saved exams` : `Save ${item.shortTitle}`}
          aria-pressed={saved}
        >
          <span aria-hidden="true">{saved ? "★" : "☆"}</span>
          {saved ? "Saved" : "Save"}
        </button>
      </div>

      <div className="exam-card-heading">
        <p>{item.organisation}</p>
        <h2>
          <Link href={`/exams/${item.slug}`}>{item.title}</Link>
        </h2>
      </div>

      <div className="next-action">
        <span>Next</span>
        <strong>{item.status.nextAction}</strong>
      </div>

      <dl className="exam-facts">
        <div>
          <dt>Vacancies</dt>
          <dd>{item.vacancyLabel}</dd>
        </div>
        <div>
          <dt>Education</dt>
          <dd>{item.education.join(" · ")}</dd>
        </div>
        <div>
          <dt>Level</dt>
          <dd>{item.governmentLevel === "Central" ? "Central / All India" : item.state}</dd>
        </div>
      </dl>

      <div className="exam-card-footer">
        <span>
          Checked <strong>{item.lastVerified.split(",")[0]}</strong>
        </span>
        <Link href={`/exams/${item.slug}`} className="text-link">
          Full exam details <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}

export function ExamExplorer({ compact = false }: { compact?: boolean }) {
  const [query, setQuery] = useState("");
  const [education, setEducation] = useState<"All" | EducationLevel>("All");
  const [examType, setExamType] = useState<"All" | ExamType>("All");
  const [level, setLevel] = useState<"All" | "Central" | "State">("All");
  const [status, setStatus] = useState<StatusFilter>("All");
  const [savedOnly, setSavedOnly] = useState(false);
  const [saved, setSaved] = useState<string[]>([]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const params = new URLSearchParams(window.location.search);
      const requestedEducation = params.get("education");
      if (educationOptions.some((option) => option.value === requestedEducation)) {
        setEducation(requestedEducation as "All" | EducationLevel);
      }
      setQuery(params.get("q") ?? "");
      const requestedType = params.get("type");
      if (examTypeOptions.some((option) => option.value === requestedType)) {
        setExamType(requestedType as ExamType);
      }
      setLevel(params.get("level") === "Central" || params.get("level") === "State" ? (params.get("level") as "Central" | "State") : "All");
      setSaved(readSaved());
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (education !== "All") params.set("education", education);
    if (examType !== "All") params.set("type", examType);
    if (level !== "All") params.set("level", level);
    const next = params.toString();
    window.history.replaceState(null, "", `${window.location.pathname}${next ? `?${next}` : ""}`);
  }, [query, education, examType, level]);

  const results = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase("en-IN");
    const tones = statusFilters.find((item) => item.value === status)?.tones ?? [];

    return exams.filter((item) => {
      if (needle && !getSearchText(item).includes(needle)) return false;
      if (education !== "All" && !item.education.includes(education)) return false;
      if (examType !== "All" && !item.examTypes.includes(examType)) return false;
      if (level !== "All" && item.governmentLevel !== level) return false;
      if (tones.length && !tones.includes(item.status.tone)) return false;
      if (savedOnly && !saved.includes(item.slug)) return false;
      return true;
    });
  }, [query, education, examType, level, status, savedOnly, saved]);

  const toggleSaved = (slug: string) => {
    setSaved((current) => {
      const next = current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug];
      localStorage.setItem(SAVED_KEY, JSON.stringify(next));
      return next;
    });
  };

  const reset = () => {
    setQuery("");
    setEducation("All");
    setExamType("All");
    setLevel("All");
    setStatus("All");
    setSavedOnly(false);
  };

  return (
    <section className={`explorer${compact ? " explorer-compact" : ""}`} aria-labelledby="exam-explorer-title">
      <div className="explorer-controls">
        <label className="search-field">
          <span className="search-icon" aria-hidden="true">⌕</span>
          <span className="sr-only">Search exams, posts, organisations or notification numbers</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search exam, post, state or notification no."
            autoComplete="off"
          />
          {query && (
            <button type="button" onClick={() => setQuery("")} aria-label="Clear search">
              Clear
            </button>
          )}
        </label>

        <div className="filter-grid">
          <label>
            <span>Education</span>
            <select value={education} onChange={(event) => setEducation(event.target.value as "All" | EducationLevel)}>
              {educationOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Exam type</span>
            <select value={examType} onChange={(event) => setExamType(event.target.value as "All" | ExamType)}>
              <option value="All">All exam types</option>
              {examTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.value}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Government</span>
            <select value={level} onChange={(event) => setLevel(event.target.value as "All" | "Central" | "State")}>
              <option value="All">Central + state</option>
              <option value="Central">Central only</option>
              <option value="State">State only</option>
            </select>
          </label>
          <label>
            <span>Current stage</span>
            <select value={status} onChange={(event) => setStatus(event.target.value as StatusFilter)}>
              {statusFilters.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.value}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="filter-summary">
          <p id="exam-explorer-title" aria-live="polite">
            <strong>{results.length}</strong> {results.length === 1 ? "exam" : "exams"} found
          </p>
          <div>
            <button
              type="button"
              className={`saved-filter${savedOnly ? " is-active" : ""}`}
              onClick={() => setSavedOnly((value) => !value)}
              disabled={!saved.length}
            >
              ★ Saved {saved.length ? `(${saved.length})` : ""}
            </button>
            <button type="button" className="reset-button" onClick={reset}>
              Reset filters
            </button>
          </div>
        </div>
      </div>

      {results.length ? (
        <div className="exam-results">
          {results.map((item) => (
            <ExamResultCard key={item.slug} item={item} saved={saved.includes(item.slug)} onSave={toggleSaved} />
          ))}
        </div>
      ) : (
        <div className="empty-state">
          <span aria-hidden="true">⌕</span>
          <h2>No exact match yet</h2>
          <p>Try a broader education level, remove a filter, or search by recruiting body.</p>
          <button type="button" className="button button-primary" onClick={reset}>
            Show all exams
          </button>
        </div>
      )}
    </section>
  );
}
