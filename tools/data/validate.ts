import { authorities, exams } from "../../lib/exams";
import { indiaRegions } from "../../lib/discovery";
import { validateRecords } from "./rules";

/**
 * Freshness findings are warnings here and errors under --strict-freshness.
 * The build must not depend on the wall clock: a stage sliding into the past
 * makes the data stale, not invalid, and blocking the build on it would stop
 * the site being redeployed — leaving readers on exactly the stale copy the
 * alarm is about. The daily source-watch job runs with the flag.
 */
const strictFreshness =
  process.argv.includes("--strict-freshness") || process.env.STRICT_FRESHNESS === "1";

const { errors, warnings } = validateRecords(exams, authorities, {
  referenceDate: process.env.DATA_REFERENCE_DATE,
  freshness: strictFreshness ? "error" : "warning",
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

if (warnings.length) {
  // Loud enough to notice, capped so a synchronised freshness cliff does not
  // bury every other warning under hundreds of identical lines.
  const shown = warnings.slice(0, 20);
  const rest = warnings.length - shown.length;
  console.warn(
    `Data warnings (${warnings.length}):\n- ${shown.join("\n- ")}` +
      (rest > 0 ? `\n- …and ${rest} more (run with --strict-freshness to fail on these)` : ""),
  );
}

if (errors.length) {
  console.error(`Data validation failed (${errors.length}):\n- ${errors.join("\n- ")}`);
  process.exit(1);
}

const verified = exams.filter((item) => item.verification === "verified").length;
console.log(
  `Validated ${exams.length} exam cycles (${verified} verified, ${exams.length - verified} listed) ` +
    `across ${authorities.length} authorities and ${coveredRegions.size}/${indiaRegions.length} regions.`,
);
