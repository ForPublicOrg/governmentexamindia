/**
 * How the site reads as the calendar moves past the build.
 *
 * Every page ships with the date it was built on, so the interesting question
 * is not "is the data right today" but "what does a reader see a month from
 * now". This runs the shipped data forward and reports the two things that go
 * wrong: records the build would order or label wrongly, and findings that
 * would stop the site being rebuilt at all.
 *
 *   npm run data:time-travel
 *   npm run data:time-travel -- --days 1,30,365
 */
import { authorities, calendarEvents, exams } from "../../lib/exams";
import { applicationCloseDate, lifecycleSortKey, todayIso } from "../../lib/lifecycle";
import { calendarSection, toCalendarFeed } from "../../lib/calendar";
import { toSearchDoc, compareDocsAt, isWindowOpen } from "../../lib/search";
import { validateRecords } from "./rules";

function shiftIsoDate(date: string, days: number) {
  const value = new Date(`${date}T00:00:00Z`);
  value.setUTCDate(value.getUTCDate() + days);
  return value.toISOString().slice(0, 10);
}

const daysArg = process.argv.indexOf("--days");
const horizons =
  daysArg > -1 && process.argv[daysArg + 1]
    ? process.argv[daysArg + 1].split(",").map((value) => Number(value.trim()))
    : [1, 7, 30, 90, 180, 365];

if (horizons.some((days) => !Number.isFinite(days))) {
  console.error("--days takes a comma-separated list of whole numbers of days");
  process.exit(1);
}

const build = todayIso();
const docs = exams.map(toSearchDoc);
const feed = toCalendarFeed(
  calendarEvents.filter((event) => event.sortDate >= build),
  calendarEvents.filter((event) => event.sortDate < build),
);

// What the build bakes in, against which every horizon is compared.
const bakedOrder = [...docs].sort(compareDocsAt(build)).map((doc) => doc.s);
const bakedKey = new Map(exams.map((item) => [item.slug, lifecycleSortKey(item, build)]));

console.log(`build reference date: ${build} (IST)`);
console.log(`${exams.length} cycles, ${docs.filter((doc) => isWindowOpen(doc, build)).length} with an open window\n`);

const rows: string[][] = [
  ["horizon", "server order drift", "windows since closed", "calendar milestones moved", "build blocked?"],
];

for (const days of horizons) {
  const then = shiftIsoDate(build, days);

  // Records the baked ordering now places wrongly. Counted as "the key the
  // build froze differs from the key the day deserves" rather than as shifted
  // positions, which one insertion would saturate.
  const orderDrift = exams.filter((item) => lifecycleSortKey(item, then) !== bakedKey.get(item.slug)).length;

  // Windows the build called open that have since shut. The browser now
  // re-reads these from the published closing date, so this is what would be
  // wrong if it did not.
  const closedSince = exams.filter((item) => {
    const closing = applicationCloseDate(item);
    return closing != null && closing >= build && closing < then;
  }).length;

  const movedMilestones = feed.events.filter(
    (event) => calendarSection(event, build) !== calendarSection(event, then),
  ).length;

  const blocked = validateRecords(exams, authorities, { referenceDate: then }).errors.length;

  rows.push([
    `+${days}d`,
    String(orderDrift),
    String(closedSince),
    String(movedMilestones),
    blocked ? `yes (${blocked})` : "no",
  ]);
}

const widths = rows[0].map((_, column) => Math.max(...rows.map((row) => row[column].length)));
for (const [index, row] of rows.entries()) {
  console.log(row.map((cell, column) => cell.padEnd(widths[column])).join("  "));
  if (index === 0) console.log(widths.map((width) => "-".repeat(width)).join("  "));
}

console.log(
  "\nserver order drift and the calendar column are corrected in the browser and by the daily" +
    "\nrebuild; 'build blocked' must stay 'no' or the site cannot be redeployed at all.",
);

// Ordering is only self-correcting if the client comparator actually moves the
// expired windows down. Report the residual so a regression here is visible.
const worstHorizon = Math.max(...horizons);
const then = shiftIsoDate(build, worstHorizon);
const clientOrder = [...docs].sort(compareDocsAt(then)).map((doc) => doc.s);
const stillLeadingExpired = clientOrder
  .slice(0, 12)
  .filter((slug) => {
    const doc = docs.find((entry) => entry.s === slug)!;
    return doc.cd != null && doc.cd < then && bakedOrder.slice(0, 12).includes(slug);
  }).length;
console.log(
  `\nat +${worstHorizon}d the browser's first 12 results still hold ${stillLeadingExpired} expired window(s).`,
);
