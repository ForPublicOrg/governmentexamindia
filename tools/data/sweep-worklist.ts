import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { authorities, exams } from "../../lib/exams";
import { validateRecords } from "./rules";

/**
 * List the records a person should re-check against their official notices,
 * most urgent first: records failing the strict freshness gate, records whose
 * recruiting body's watched page changed, then time-sensitive records whose
 * review is getting old. The last group starts at REVIEW_AHEAD_DAYS so a whole
 * sweep's worth of reviews is picked up well before the 45-day gate instead of
 * expiring on one day. The daily watch posts this list as an issue; capped so
 * it stays readable and fits an issue body.
 *
 *   npx tsx tools/data/sweep-worklist.ts [--watch-report file] [--limit 30] [--out .sweep/worklist.md]
 *
 * Prints `count=`, `waiting=` and `failing=` (strict gate errors) lines for $GITHUB_OUTPUT.
 */
const REVIEW_AHEAD_DAYS = 25;

const option = (name: string) => {
  const index = process.argv.indexOf(name);
  return index === -1 ? undefined : process.argv[index + 1];
};
const limit = Number(option("--limit") ?? 30);
const out = option("--out") ?? ".sweep/worklist.md";
const watchReport = option("--watch-report");

const dataDir = resolve(import.meta.dirname, "../../data/exams");
const moduleOf = new Map<string, string>();
for (const file of readdirSync(dataDir).filter((name) => name.endsWith(".ts"))) {
  const name = file.slice(0, -3);
  const dataModule = (await import(`../../data/exams/${file}`)) as typeof import("../../data/exams/upsc");
  for (const item of dataModule.exams) moduleOf.set(item.slug, name);
}

const reasons = new Map<string, { tier: number; age: number; notes: string[] }>();
const flag = (slug: string, tier: number, note: string, age = 0) => {
  if (!moduleOf.has(slug)) return;
  const entry = reasons.get(slug) ?? { tier, age, notes: [] };
  entry.tier = Math.min(entry.tier, tier);
  entry.age = Math.max(entry.age, age);
  entry.notes.push(note);
  reasons.set(slug, entry);
};
const split = (message: string) => {
  const at = message.indexOf(": ");
  return [message.slice(0, at), message.slice(at + 2)] as const;
};
const ageOf = (message: string) => Number(/last reviewed (\d+) days/.exec(message)?.[1] ?? 0);

const { errors, warnings } = validateRecords(exams, authorities, {
  referenceDate: process.env.DATA_REFERENCE_DATE,
  freshness: "error",
});
for (const message of errors) {
  const [slug, text] = split(message);
  flag(slug, 1, `GATE: ${text}`, ageOf(text));
}

if (watchReport && existsSync(watchReport)) {
  const { results } = JSON.parse(readFileSync(watchReport, "utf8")) as {
    results: { authority: string; state: string; url: string }[];
  };
  const moved = results.filter(({ state }) => state === "changed" || state === "new");
  for (const item of exams) {
    for (const source of moved.filter(({ authority }) => authority === item.organisation)) {
      flag(item.slug, 2, `watched page ${source.state}: ${source.url}`);
    }
  }
}

for (const message of warnings) {
  const [slug, text] = split(message);
  const age = ageOf(text);
  if (age >= REVIEW_AHEAD_DAYS) flag(slug, 3, `review due: last reviewed ${age} days ago`, age);
}

const ranked = [...reasons.entries()].sort(([, a], [, b]) => a.tier - b.tier || b.age - a.age);
const picked = ranked.slice(0, limit);
const byModule = new Map<string, string[]>();
for (const [slug, { notes }] of picked) {
  const name = moduleOf.get(slug)!;
  byModule.set(name, [...(byModule.get(name) ?? []), `- **${slug}** — ${notes.join("; ")}`]);
}

const lines = [
  `## Records to re-check (${picked.length}${ranked.length > picked.length ? `, ${ranked.length - picked.length} more not listed` : ""})`,
  "",
  ...[...byModule.entries()].flatMap(([name, items]) => [`### ${name} (data/exams/${name}.ts)`, ...items, ""]),
];
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, `${lines.join("\n")}\n`, "utf8");
console.log(`count=${picked.length}`);
console.log(`waiting=${ranked.length - picked.length}`);
console.log(`failing=${errors.length}`);
