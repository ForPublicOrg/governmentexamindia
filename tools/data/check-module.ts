import { readFileSync } from "node:fs";
import { validateRecords } from "./rules";

/**
 * Validate one data module in isolation, so parallel authors can check their
 * own file without a sibling module's error masking theirs.
 *
 *   npx tsx tools/data/check-module.ts state-north
 *
 * --strict adds today's freshness gate (the one the daily watch enforces).
 * With --worklist <file>, only freshness errors on the records that file lists
 * count, so a sweep worker is not held to records it was not given.
 */
const worklistIndex = process.argv.indexOf("--worklist");
const worklist = worklistIndex === -1 ? undefined : process.argv[worklistIndex + 1];
const name = process.argv.slice(2).find((argument) => !argument.startsWith("--") && argument !== worklist);
if (!name) {
  console.error("usage: tsx tools/data/check-module.ts <module-name> [--strict [--worklist <file>]]");
  process.exit(2);
}

const dataModule = (await import(`../../data/exams/${name}.ts`)) as typeof import("../../data/exams/upsc");
const { errors, warnings } = validateRecords(dataModule.exams, dataModule.authorities);
if (process.argv.includes("--strict")) {
  const listed = worklist
    ? new Set([...readFileSync(worklist, "utf8").matchAll(/^- \*\*([a-z0-9-]+)\*\*/gm)].map((match) => match[1]))
    : undefined;
  const known = new Set(errors);
  const strict = validateRecords(dataModule.exams, dataModule.authorities, {
    referenceDate: process.env.DATA_REFERENCE_DATE,
    freshness: "error",
  });
  errors.push(...strict.errors.filter((message) => !known.has(message) && (!listed || listed.has(message.split(":")[0]))));
}

if (warnings.length) console.warn(`Warnings (${warnings.length}):\n- ${warnings.join("\n- ")}`);
if (errors.length) {
  console.error(`FAILED ${name} (${errors.length} errors):\n- ${errors.join("\n- ")}`);
  process.exit(1);
}

const verified = dataModule.exams.filter((item) => item.verification === "verified").length;
const regions = new Set(dataModule.exams.flatMap((item) => item.regionCodes ?? []));
console.log(
  `OK ${name}: ${dataModule.exams.length} records (${verified} verified, ${dataModule.exams.length - verified} listed), ` +
    `${dataModule.authorities.length} authorities, regions: ${[...regions].sort().join(", ") || "all-India"}`,
);
