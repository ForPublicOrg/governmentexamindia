import { authorities, exams } from "../../lib/exams";
import { indiaRegions } from "../../lib/discovery";
import { validateRecords } from "./rules";

const { errors, warnings } = validateRecords(exams, authorities, {
  referenceDate: process.env.DATA_REFERENCE_DATE,
});
const coveredRegions = new Set(
  exams.flatMap((item) => item.regionCodes ?? (item.stateCode ? [item.stateCode] : [])),
);
const uncovered = indiaRegions.filter((region) => !coveredRegions.has(region.code));

const minimumArg = process.argv.find((argument) => argument.startsWith("--min-region-coverage="));
const requestedMinimum = minimumArg?.split("=")[1] ?? process.env.MIN_REGION_COVERAGE;
const requireFullCoverage = process.argv.includes("--require-full-coverage") || process.env.REQUIRE_FULL_REGION_COVERAGE === "1";
const minimumCoverage = requireFullCoverage ? indiaRegions.length : requestedMinimum == null ? 0 : Number(requestedMinimum);

if (!Number.isInteger(minimumCoverage) || minimumCoverage < 0 || minimumCoverage > indiaRegions.length) {
  errors.push(`invalid region coverage threshold: ${requestedMinimum ?? minimumCoverage}`);
} else if (coveredRegions.size < minimumCoverage) {
  errors.push(
    `region coverage ${coveredRegions.size}/${indiaRegions.length} is below required minimum ${minimumCoverage}`,
  );
}

if (uncovered.length) {
  const message = `regions with no state-level record: ${uncovered.map((region) => region.code).join(", ")}`;
  if (minimumCoverage === indiaRegions.length) errors.push(message);
  else warnings.push(message);
}

if (warnings.length) console.warn(`Data warnings (${warnings.length}):\n- ${warnings.join("\n- ")}`);

if (errors.length) {
  console.error(`Data validation failed (${errors.length}):\n- ${errors.join("\n- ")}`);
  process.exit(1);
}

const verified = exams.filter((item) => item.verification === "verified").length;
console.log(
  `Validated ${exams.length} exam cycles (${verified} verified, ${exams.length - verified} listed) ` +
    `across ${authorities.length} authorities and ${coveredRegions.size}/${indiaRegions.length} regions.`,
);
