import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  calendarFilterCount,
  calendarStageOptions,
  defaultCalendarFilter,
  filterCalendar,
  toCalendarFeed,
  type CalendarEventInput,
} from "../lib/calendar";
import { calendarEvents } from "../lib/exams";

function event(overrides: Partial<CalendarEventInput> = {}): CalendarEventInput {
  return {
    label: "Applications close",
    state: "current",
    sortDate: "2026-09-10",
    dateTime: "2026-09-10",
    displayDate: "10 Sep 2026",
    examSlug: "tnpsc-group-2",
    examTitle: "TNPSC Group 2",
    organisation: "Tamil Nadu Public Service Commission",
    examTypes: ["Civil Services & Administration"],
    governmentLevel: "State",
    regionCodes: ["TN"],
    ...overrides,
  };
}

test("the feed stores each exam once however many milestones it has", () => {
  const feed = toCalendarFeed(
    [
      event({ label: "Notification", sortDate: "2026-09-01", dateTime: "2026-09-01" }),
      event({ label: "Applications close" }),
      event({ examSlug: "ssc-cgl", examTitle: "SSC CGL", organisation: "Staff Selection Commission", governmentLevel: "Central", regionCodes: [] }),
    ],
    [event({ examSlug: "rrb-ntpc", examTitle: "RRB NTPC", organisation: "Railway Recruitment Board", examTypes: ["Railways"], governmentLevel: "Central", regionCodes: [] })],
  );

  assert.equal(feed.events.length, 4);
  assert.equal(feed.exams.length, 3, "three exams produced four milestones");
  assert.deepEqual(
    feed.events.map((item) => item.p),
    [0, 0, 0, 1],
    "the section flag says which list a milestone belongs to",
  );
});

test("an unfiltered calendar keeps every milestone", () => {
  const feed = toCalendarFeed([event(), event({ label: "Exam" })], []);
  assert.equal(filterCalendar(feed, defaultCalendarFilter).length, 2);
  assert.equal(calendarFilterCount(defaultCalendarFilter), 0);
});

test("category, region and milestone filters each narrow the calendar", () => {
  const feed = toCalendarFeed(
    [
      event(),
      event({
        examSlug: "rrb-ntpc",
        examTitle: "RRB NTPC",
        organisation: "Railway Recruitment Board",
        examTypes: ["Railways"],
        governmentLevel: "Central",
        regionCodes: [],
        state: "scheduled",
      }),
    ],
    [],
  );

  const only = (filters: Partial<typeof defaultCalendarFilter>) =>
    filterCalendar(feed, { ...defaultCalendarFilter, ...filters }).map((item) => item.s);

  assert.deepEqual(only({ examType: "Railways" }), ["rrb-ntpc"]);
  assert.deepEqual(only({ region: "TN" }), ["tnpsc-group-2"]);
  assert.deepEqual(only({ region: "central" }), ["rrb-ntpc"], "central is its own option, not every all-India cycle");
  assert.deepEqual(only({ stage: "scheduled" }), ["rrb-ntpc"]);
  assert.equal(calendarFilterCount({ ...defaultCalendarFilter, region: "TN", stage: "scheduled" }), 2);
});

test("the text filter needs every token to match, across exam and milestone", () => {
  const feed = toCalendarFeed(
    [
      event(),
      event({ examSlug: "tnpsc-group-4", examTitle: "TNPSC Group 4", label: "Exam", state: "scheduled" }),
    ],
    [],
  );

  const slugs = (query: string) =>
    filterCalendar(feed, { ...defaultCalendarFilter, query }).map((item) => item.s);

  assert.deepEqual(slugs("tnpsc"), ["tnpsc-group-2", "tnpsc-group-4"]);
  assert.deepEqual(slugs("tnpsc group 4"), ["tnpsc-group-4"], "every token has to match");
  assert.deepEqual(slugs("tamil nadu"), ["tnpsc-group-2", "tnpsc-group-4"], "the organisation is searchable");
  assert.deepEqual(slugs("applications close"), ["tnpsc-group-2"], "so is the milestone label");
  assert.deepEqual(slugs("kerala"), []);
});

test("every milestone state the dataset uses is offered as a filter option", () => {
  const offered = new Set(calendarStageOptions.map((option) => option.value));
  for (const state of new Set(calendarEvents.map((item) => item.state))) {
    assert.ok(offered.has(state), `milestone state "${state}" has no filter option`);
  }
});

test("the calendar filter stays a compact strip", async () => {
  const [component, css] = await Promise.all([
    readFile(new URL("../components/CalendarBrowser.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.equal(
    (component.match(/<select\b/g) ?? []).length,
    3,
    "three dropdowns plus one search box; a fourth belongs on the explorer, not here",
  );
  // Every dropdown is labelled, but the labels are visually hidden so the strip
  // stays one row rather than growing a caption per control.
  assert.equal((component.match(/className="sr-only"/g) ?? []).length, 4);
  assert.doesNotMatch(component, /filter-grid/, "the calendar must not reuse the explorer's full-size panel");
  assert.match(css, /\.calendar-filter \{[^}]*flex-wrap: wrap/, "the strip should wrap rather than overflow");
});
