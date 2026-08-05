import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { calendarSection, splitCalendar, toCalendarFeed, type CalendarEventInput } from "../lib/calendar";
import { authorities, calendarEvents, exams } from "../lib/exams";
import { indiaDateKey, lastVerifiedIso, todayIso } from "../lib/lifecycle";
import { compareDocsAt, isWindowOpen, toSearchDoc } from "../lib/search";
import { validateRecords } from "../tools/data/rules";

/**
 * The site is a static export with no server, so every page ships frozen with
 * the date it was built on. These tests are about the two ways that is kept
 * from turning into wrong information: the build must never become impossible,
 * and anything the browser can re-derive must be re-derived.
 */

const BUILD = todayIso();

function shift(iso: string, days: number) {
  const value = new Date(`${iso}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

const HORIZONS = [1, 7, 30, 90, 365, 1_000];

test("the clock alone can never stop the site being rebuilt", () => {
  for (const days of HORIZONS) {
    const referenceDate = shift(BUILD, days);
    const { errors } = validateRecords(exams, authorities, { referenceDate });
    assert.deepEqual(
      errors,
      [],
      `the build would be blocked at +${days} days by data nobody touched:\n${errors.slice(0, 5).join("\n")}`,
    );
  }
});

test("the daily data job still fails on data that has gone stale", () => {
  // The alarm has to keep working, or moving it off the build path would just
  // have deleted it. Far enough out that every review is past its 45 days.
  const { errors } = validateRecords(exams, authorities, {
    referenceDate: shift(BUILD, 400),
    freshness: "error",
  });
  assert.ok(errors.length > 0, "strict freshness should report data that is a year unreviewed");
});

test("an expired application window stops being described as open", () => {
  const withWindow = exams.map(toSearchDoc).filter((doc) => doc.cd != null);
  assert.ok(withWindow.length > 0, "the fixture needs at least one published closing date");

  for (const doc of withWindow) {
    const dayAfter = shift(doc.cd!, 1);
    assert.equal(isWindowOpen(doc, doc.cd!), true, `${doc.s} should be open on its closing date`);
    assert.equal(isWindowOpen(doc, dayAfter), false, `${doc.s} still reads as open the day after it shut`);
  }
});

test("expired windows lose their place at the top of the results", () => {
  const docs = exams.map(toSearchDoc);
  const openNow = docs.filter((doc) => isWindowOpen(doc, BUILD));
  assert.ok(openNow.length > 0, "the fixture needs at least one open window");

  // A year on, every window open at build time has shut. None of them may
  // still be sorting above the records that are actually actionable.
  const later = shift(BUILD, 365);
  const ordered = [...docs].sort(compareDocsAt(later));
  const leadingExpired = ordered
    .slice(0, 12)
    .filter((doc) => doc.cd != null && doc.cd < later && doc.k.startsWith("0"));

  assert.deepEqual(
    leadingExpired.map((doc) => doc.s),
    [],
    "a closing date that has passed must not keep its deadline-first ranking",
  );
});

test("the calendar files a milestone by the reader's date, not the build's", () => {
  const event = (overrides: Partial<CalendarEventInput> = {}): CalendarEventInput => ({
    label: "Exam",
    state: "scheduled",
    sortDate: "2026-09-10",
    dateTime: "2026-09-10",
    displayDate: "10 Sep 2026",
    examSlug: "ssc-cgl",
    examTitle: "SSC CGL",
    organisation: "Staff Selection Commission",
    examTypes: ["Railways"],
    governmentLevel: "Central",
    regionCodes: [],
    ...overrides,
  });

  const feed = toCalendarFeed([event()], []);
  const milestone = feed.events[0];

  assert.equal(calendarSection(milestone, "2026-09-01"), 0, "still to come");
  assert.equal(calendarSection(milestone, "2026-09-10"), 0, "the day itself is not history");
  assert.equal(calendarSection(milestone, "2026-09-11"), 1, "the day after belongs to history");

  // A month-only window is only ever as precise as its month.
  const monthOnly = toCalendarFeed([event({ dateTime: "2026-09", sortDate: "2026-09-01" })], []).events[0];
  assert.equal(calendarSection(monthOnly, "2026-09-30"), 0, "a month window lasts its whole month");
  assert.equal(calendarSection(monthOnly, "2026-10-01"), 1);
});

test("re-splitting the calendar keeps each section in its own order", () => {
  const feed = toCalendarFeed(
    calendarEvents.filter((item) => item.sortDate >= BUILD),
    calendarEvents.filter((item) => item.sortDate < BUILD),
  );
  const { upcoming, history } = splitCalendar(feed.events, shift(BUILD, 45));

  assert.ok(upcoming.length > 0 && history.length > 0, "45 days on, both sections should hold something");
  assert.deepEqual([...upcoming].sort((a, b) => a.d.localeCompare(b.d)), upcoming, "soonest first");
  assert.deepEqual([...history].sort((a, b) => b.d.localeCompare(a.d)), history, "newest first");
  assert.equal(upcoming.length + history.length, feed.events.length, "no milestone may be dropped");
});

test("the whole site reasons from one IST date", async () => {
  const [calendarPage, footer] = await Promise.all([
    readFile(new URL("../app/calendar/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/SiteFooter.tsx", import.meta.url), "utf8"),
  ]);

  // Every deadline here is an Indian one. A UTC "today" is yesterday until
  // 05:30 IST, which had the calendar and the ordering disagreeing nightly.
  assert.match(BUILD, /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(indiaDateKey(new Date("2026-08-05T19:00:00Z")), "2026-08-06", "18:30 UTC is already tomorrow in IST");
  assert.equal(indiaDateKey(new Date("2026-08-05T18:29:00Z")), "2026-08-05");

  assert.doesNotMatch(calendarPage, /new Date\(\)/, "the calendar should take its date from todayIso()");
  assert.match(calendarPage, /todayIso\(\)/);
  assert.doesNotMatch(footer, /getFullYear/, "a build-time year is wrong from the next 1 January");
});

test("SITE_REFERENCE_DATE pins the build so a deploy can be reproduced", async () => {
  const source = await readFile(new URL("../lib/lifecycle.ts", import.meta.url), "utf8");
  assert.match(source, /process\.env\.SITE_REFERENCE_DATE/);
  // The override is a build-time affordance; the browser always uses the reader.
  assert.match(source, /typeof window === "undefined"/);
});

test("every record's review stamp parses, so the sitemap can date it", () => {
  for (const item of exams) {
    assert.ok(
      lastVerifiedIso(item.lastVerified),
      `${item.slug} has an unparseable lastVerified: ${item.lastVerified}`,
    );
  }
});
