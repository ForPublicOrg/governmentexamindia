import assert from "node:assert/strict";
import test from "node:test";
import { authorities, calendarEvents, getExam } from "../lib/exams";
import { listedExam, type Exam } from "../lib/exam-types";
import { validateRecords } from "../tools/data/rules";

const base = getExam("ssc-gd-constable-2027");
assert.ok(base, "SSC GD fixture must exist");

function errorsFor(...records: Exam[]) {
  return validateRecords(records, authorities, { referenceDate: "2026-08-04" }).errors.join("\n");
}

/**
 * Findings that only mean "the clock has moved past this". They are errors for
 * the daily data job and warnings everywhere else, so a rule about them has to
 * be exercised in strict mode.
 */
function freshnessFor(...records: Exam[]) {
  const { errors, warnings } = validateRecords(records, authorities, {
    referenceDate: "2026-08-04",
    freshness: "error",
  });
  assert.equal(warnings.filter((line) => errors.includes(line)).length, 0, "a finding is one or the other");
  return errors.join("\n");
}

function warningsFor(...records: Exam[]) {
  return validateRecords(records, authorities, { referenceDate: "2026-08-04" }).warnings.join("\n");
}

test("strict date validation rejects calendar rollovers", () => {
  const record: Exam = {
    ...base,
    slug: "invalid-calendar-date",
    timeline: [{ label: "Exam", date: "2026-02-31", displayDate: "31 Feb 2026", state: "scheduled" }],
  };
  assert.match(errorsFor(record), /invalid timeline date/);
});

test("an official-looking sort date cannot hide an unannounced date", () => {
  const record: Exam = {
    ...base,
    slug: "placeholder-calendar-date",
    timeline: [{ label: "Result", date: "2026-12-01", displayDate: "To be announced", state: "tentative" }],
  };
  assert.match(errorsFor(record), /says its date is unannounced/);
});

test("listedExam produces an honest record with no invented dates or figures", () => {
  const record = listedExam({
    slug: "ssc-known-series-unannounced",
    title: "SSC Known Recruitment Series",
    shortTitle: "SSC Known Series",
    organisation: "Staff Selection Commission",
    governmentLevel: "Central",
    jurisdiction: "All India",
    cycle: "Next cycle",
    year: 2027,
    sector: "Administration",
    examTypes: ["Civil Services & Administration"],
    education: ["Graduate"],
    status: {
      label: "Notification awaited",
      tone: "amber",
      nextAction: "Wait for the official notification",
      detail: "No current-cycle schedule or vacancy count has been published.",
    },
    summary: "A known SSC recruitment series whose next cycle has not been announced.",
    officialLinks: [{ label: "SSC official website", url: "https://ssc.gov.in/", type: "website" }],
    sourceTitle: "SSC official website",
    sourceUrl: "https://ssc.gov.in/",
    sourcePublished: "Recruitment index checked 4 Aug 2026",
    lastVerified: "4 Aug 2026, 12:00 IST",
  });

  assert.equal(record.verification, "listed");
  assert.equal(record.vacancyLabel, "Not announced");
  assert.deepEqual(record.timeline, []);
  assert.equal(errorsFor(record), "");
});

test("the public calendar excludes undated stages", () => {
  assert.ok(
    !calendarEvents.some(
      (event) => event.examSlug === "upsc-nda-na-ii-2026" && event.label === "SSB",
    ),
  );
  assert.ok(calendarEvents.every((event) => /^\d{4}-\d{2}-\d{2}$/.test(event.sortDate)));
  assert.ok(calendarEvents.every((event) => /^\d{4}-\d{2}(?:-\d{2})?$/.test(event.dateTime)));
});

test("official month windows stay month-only while remaining sortable", () => {
  const record: Exam = {
    ...base,
    slug: "official-month-window",
    timeline: [{ label: "Exam window", sortMonth: "2026-08", displayDate: "Aug–Sep 2026", state: "tentative" }],
  };
  assert.equal(errorsFor(record), "");
});

test("scheduled events cannot remain scheduled after their official date", () => {
  const record: Exam = {
    ...base,
    slug: "stale-scheduled-event",
    timeline: [{ label: "Exam", date: "2026-08-03", displayDate: "3 Aug 2026", state: "scheduled" }],
  };
  assert.match(freshnessFor(record), /scheduled event 'Exam' is already in the past/);
  // …but it must not stop the site being rebuilt. The clock moving is not a
  // reason to be unable to deploy; see tools/data/validate.ts.
  assert.equal(errorsFor(record), "");
  assert.match(warningsFor(record), /scheduled event 'Exam' is already in the past/);
});

test("time-sensitive statuses require a review at least every 45 days", () => {
  const record: Exam = {
    ...base,
    slug: "stale-public-status",
    status: { ...base.status, tone: "blue" },
    lastVerified: "1 Jun 2026, 12:00 IST",
  };
  assert.match(freshnessFor(record), /time-sensitive status was last reviewed 64 days ago/);
  assert.equal(errorsFor(record), "", "an unreviewed record must not make the site unbuildable");
});

test("applications-open statuses require a verified current deadline", () => {
  const record: Exam = {
    ...base,
    slug: "unsupported-open-window",
    verification: "listed",
    status: { ...base.status, tone: "green" },
    timeline: [],
  };
  // Claiming "applications open" without verification is a malformed record and
  // always an error. Having no *live* deadline is only the clock catching up.
  assert.match(errorsFor(record), /applications-open status must be verified/);
  assert.match(freshnessFor(record), /applications-open status requires a current exact deadline/);
  assert.doesNotMatch(errorsFor(record), /requires a current exact deadline/);
});

test("official links outside an authority allowlist fail validation", () => {
  const record: Exam = {
    ...base,
    slug: "external-source-link",
    officialLinks: [
      ...base.officialLinks,
      { label: "Aggregator", url: "https://example.com/exam", type: "website" },
    ],
  };
  assert.match(errorsFor(record), /outside ssc's allowlist/);
});

test("aliases expose renamed semantic duplicates", () => {
  const duplicate: Exam = {
    ...base,
    slug: "renamed-duplicate-cycle",
    title: "A differently formatted title",
    shortTitle: "Different card title",
    aliases: [...base.aliases],
  };
  assert.match(errorsFor(base, duplicate), /semantic duplicate/);
});

test("notification numbers are unique within an authority and year", () => {
  const first: Exam = { ...base, slug: "notice-one", notificationNumber: "Notice 1/2027" };
  const second: Exam = {
    ...base,
    slug: "notice-two",
    title: "Different Recruitment 2027",
    shortTitle: "Different Recruitment",
    aliases: ["Unrelated series"],
    notificationNumber: "Notice 1/2027",
  };
  assert.match(errorsFor(first, second), /duplicate notification/);
});

test("change logs require sortable ISO dates and separate display labels", () => {
  const record: Exam = {
    ...base,
    slug: "bad-change-date",
    changeLog: [{ date: "28 Jul 2026", displayDate: "28 Jul 2026", text: "A sourced update." }],
  };
  assert.match(errorsFor(record), /change log date must be a real ISO month or date/);
});
