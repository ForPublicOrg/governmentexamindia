import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { exams } from "../lib/exams";
import {
  applicationCloseDate,
  byLifecycle,
  groupByLifecycle,
  lifecyclePhase,
  lifecyclePhases,
  lifecycleSortKey,
} from "../lib/lifecycle";
import {
  applyFacets,
  compareDocs,
  defaultExplorerState,
  parseExplorerParams,
  phaseForStatus,
  phaseOfDoc,
  statusFilters,
  toExplorerParams,
  toSearchDoc,
  tonesForStatus,
  type ExplorerParamOptions,
} from "../lib/search";
import { examTypeOptions, indiaRegions } from "../lib/discovery";
import type { Exam, ExamEvent, StatusTone } from "../lib/exam-types";

const REFERENCE = "2026-08-04";

function fake(tone: StatusTone, timeline: ExamEvent[]) {
  return { status: { tone }, timeline };
}

test("a live tone is ongoing whatever the timeline says", () => {
  for (const tone of ["green", "violet", "red"] as const) {
    assert.equal(lifecyclePhase(fake(tone, [])), "ongoing");
  }
});

test("a complete cycle is past", () => {
  assert.equal(lifecyclePhase(fake("slate", [])), "past");
});

test("an awaited or scheduled cycle is upcoming until an official stage has run", () => {
  const scheduled: ExamEvent = { label: "Preliminary exam", date: "2026-10-10", displayDate: "10 Oct 2026", state: "scheduled" };
  assert.equal(lifecyclePhase(fake("blue", [scheduled])), "upcoming");
  assert.equal(lifecyclePhase(fake("amber", [])), "upcoming");

  const started: ExamEvent = { label: "Applications closed", date: "2026-07-26", displayDate: "26 Jul 2026", state: "completed" };
  assert.equal(lifecyclePhase(fake("blue", [started, scheduled])), "ongoing");
  assert.equal(lifecyclePhase(fake("amber", [started])), "ongoing");
});

test("the closing date comes from the last dated application-deadline event", () => {
  const timeline: ExamEvent[] = [
    { label: "Notification", date: "2026-07-01", displayDate: "1 Jul 2026", state: "completed" },
    { label: "Application deadline", date: "2026-07-20", displayDate: "20 Jul 2026", state: "completed" },
    { label: "Extended application deadline", date: "2026-07-26", displayDate: "26 Jul 2026", state: "completed" },
    { label: "Preliminary exam", date: "2026-08-22", displayDate: "22 Aug 2026", state: "scheduled" },
  ];
  assert.equal(applicationCloseDate(fake("blue", timeline)), "2026-07-26");
});

test("an opening date is never mistaken for a closing date", () => {
  const timeline: ExamEvent[] = [
    { label: "Applications open", date: "2026-07-01", displayDate: "1 Jul 2026", state: "completed" },
  ];
  assert.equal(applicationCloseDate(fake("green", timeline)), undefined);
});

test("an open submission window outranks every other date inside a phase", () => {
  const closingSoon = fake("green", [
    { label: "Applications close", date: "2026-08-20", displayDate: "20 Aug 2026", state: "current" },
  ]);
  const closingLater = fake("green", [
    { label: "Applications close", date: "2026-09-30", displayDate: "30 Sep 2026", state: "current" },
  ]);
  const noWindow = fake("violet", [
    { label: "Result", date: "2026-08-10", displayDate: "10 Aug 2026", state: "scheduled" },
  ]);

  const keys = [closingSoon, closingLater, noWindow].map((item) => lifecycleSortKey(item, REFERENCE));
  assert.ok(keys[0] < keys[1], "the sooner deadline must sort first");
  assert.ok(keys[1] < keys[2], "an open window must sort above a record without one");
});

test("a record with nothing left in the future sorts newest first", () => {
  const older = fake("slate", [{ label: "Result declared", date: "2025-09-01", displayDate: "1 Sep 2025", state: "completed" }]);
  const newer = fake("slate", [{ label: "Result declared", date: "2026-06-01", displayDate: "1 Jun 2026", state: "completed" }]);
  assert.ok(
    lifecycleSortKey(newer, REFERENCE) < lifecycleSortKey(older, REFERENCE),
    "the most recent finished cycle should lead the past group",
  );
});

test("an undated record sorts last within its phase", () => {
  const undated = fake("amber", [{ label: "Notification", displayDate: "To be announced", state: "tentative" }]);
  const dated = fake("amber", [{ label: "Exam", date: "2026-11-01", displayDate: "1 Nov 2026", state: "scheduled" }]);
  assert.ok(lifecycleSortKey(dated, REFERENCE) < lifecycleSortKey(undated, REFERENCE));
});

test("the published catalogue is ordered ongoing, then upcoming, then past", () => {
  const order = exams.map((item) => lifecyclePhases.indexOf(lifecyclePhase(item)));
  for (let index = 1; index < order.length; index += 1) {
    assert.ok(
      order[index] >= order[index - 1],
      `${exams[index].slug} (${lifecyclePhase(exams[index])}) follows a later phase`,
    );
  }
});

test("every catalogue record lands in exactly one phase group", () => {
  const groups = groupByLifecycle(exams);
  assert.equal(groups.reduce((total, group) => total + group.items.length, 0), exams.length);
  assert.equal(new Set(groups.flatMap((group) => group.items.map((item) => item.slug))).size, exams.length);
});

test("sorting is stable enough to be deterministic", () => {
  const once = [...exams].sort(byLifecycle(REFERENCE)).map((item) => item.slug);
  const twice = [...exams].reverse().sort(byLifecycle(REFERENCE)).map((item) => item.slug);
  assert.deepEqual(once, twice);
});

test("search documents carry the same phase and order as their record", () => {
  for (const item of exams) {
    const doc = toSearchDoc(item);
    assert.equal(phaseOfDoc(doc), lifecyclePhase(item), `${item.slug} phase drifted between record and document`);
  }

  const docs = exams.map(toSearchDoc);
  const sorted = [...docs].sort(compareDocs);
  for (let index = 1; index < sorted.length; index += 1) {
    assert.ok(sorted[index].p >= sorted[index - 1].p, "documents must sort by phase before anything else");
  }
});

test("a published closing date reaches the search document", () => {
  const withWindow = exams.filter((item) => applicationCloseDate(item));
  assert.ok(withWindow.length > 0, "expected at least one record with a dated application deadline");
  for (const item of withWindow) {
    assert.equal(toSearchDoc(item).cd, applicationCloseDate(item), `${item.slug} lost its closing date`);
  }
});

test("a record without a dated deadline ships no closing date at all", () => {
  const withoutWindow = exams.find((item) => !applicationCloseDate(item));
  assert.ok(withoutWindow, "expected a record with no dated deadline");
  assert.equal("cd" in toSearchDoc(withoutWindow as Exam), false);
});

test("the stage filter offers both the phase and the exact stage", () => {
  for (const phase of lifecyclePhases) {
    assert.ok(
      statusFilters.some((filter) => filter.phase === phase && filter.group === "phase"),
      `no filter offers the ${phase} phase`,
    );
  }
  for (const tone of ["green", "amber", "red", "blue", "violet", "slate"] as const) {
    assert.ok(
      statusFilters.some((filter) => filter.tones.includes(tone)),
      `no filter offers the ${tone} stage`,
    );
  }
});

test("selecting a phase narrows the list to that phase and survives the URL", () => {
  const docs = exams.map(toSearchDoc);
  const options: ExplorerParamOptions = {
    education: [...new Set(docs.flatMap((doc) => doc.e))],
    examTypes: examTypeOptions.map((option) => option.value),
    regions: indiaRegions.map((region) => region.code),
    years: [...new Set(docs.map((doc) => doc.y))],
  };

  let covered = 0;
  for (const phase of lifecyclePhases) {
    const parsed = parseExplorerParams(new URLSearchParams(`status=${phase}`), options);
    assert.equal(parsed.status, phase, `status=${phase} should survive parsing`);
    assert.equal(
      toExplorerParams({ ...defaultExplorerState, status: parsed.status }).get("status"),
      phase,
      `status=${phase} should survive serialising`,
    );

    const matches = applyFacets(docs, {
      education: "All",
      examType: "All",
      level: "All",
      region: "All",
      year: "All",
      tones: tonesForStatus(parsed.status),
      phase: phaseForStatus(parsed.status),
    });
    assert.ok(matches.length > 0, `expected records in the ${phase} phase`);
    assert.ok(matches.every((doc) => phaseOfDoc(doc) === phase), `${phase} filter leaked another phase`);
    covered += matches.length;
  }

  assert.equal(covered, docs.length, "the three phases should partition the catalogue");
});

test("lists render the phase boundary rather than only sorting by it", async () => {
  const [explorerSource, collectionSource] = await Promise.all([
    readFile(new URL("../components/ExamExplorer.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/ExamCollection.tsx", import.meta.url), "utf8"),
  ]);

  for (const source of [explorerSource, collectionSource]) {
    assert.match(source, /phase-heading/, "a list should label its phase groups");
    assert.match(source, /phase-count/, "a phase group should show how many records it holds");
  }
  assert.match(explorerSource, /compareDocs/, "the explorer should use the shared ordering");
  assert.match(collectionSource, /groupByLifecycle/, "the collection should use the shared grouping");
});

test("an exam page can be shared", async () => {
  const [shareSource, detailSource] = await Promise.all([
    readFile(new URL("../components/ShareExam.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/exams/[slug]/page.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(detailSource, /<ShareExam/, "the exam detail page should render the share control");
  assert.match(shareSource, /navigator\.share/, "share should use the native sheet where it exists");
  assert.match(shareSource, /clipboard\.writeText/, "share should fall back to copying the link");
  assert.match(shareSource, /wa\.me/, "share should offer WhatsApp");
  assert.match(shareSource, /mailto:/, "share should offer email");
  assert.match(shareSource, /aria-live="polite"/, "copying should be announced to a screen reader");
});
