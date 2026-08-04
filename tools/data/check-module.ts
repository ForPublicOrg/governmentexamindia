import { validateRecords } from "./rules";

/**
 * Validate one data module in isolation, so parallel authors can check their
 * own file without a sibling module's error masking theirs.
 *
 *   npx tsx tools/data/check-module.ts state-north
 */
const name = process.argv[2];
if (!name) {
  console.error("usage: tsx tools/data/check-module.ts <module-name>");
  process.exit(2);
}

const dataModule = (await import(`../../data/exams/${name}.ts`)) as typeof import("../../data/exams/upsc");
const { errors, warnings } = validateRecords(dataModule.exams, dataModule.authorities);

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
