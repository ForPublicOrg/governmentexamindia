import { exams } from "../../lib/exams";
import sourceRegistry from "../../data/source-registry.json";

const errors: string[] = [];
const warnings: string[] = [];
const seenSlugs = new Set<string>();
const authorities = new Map(sourceRegistry.map((authority) => [authority.name, authority]));
const isoDate = /^\d{4}-\d{2}-\d{2}$/;
const checkedDate = /^\d{1,2} [A-Z][a-z]{2} \d{4}, \d{2}:\d{2} IST$/;
const scopeStart = "2025-06-01";

function fail(slug: string, message: string) {
  errors.push(`${slug}: ${message}`);
}

for (const item of exams) {
  if (seenSlugs.has(item.slug)) fail(item.slug, "duplicate slug");
  seenSlugs.add(item.slug);

  const authority = authorities.get(item.organisation);
  if (!authority) {
    fail(item.slug, `organisation is missing from data/source-registry.json: ${item.organisation}`);
    continue;
  }

  if (!item.title || !item.shortTitle || !item.summary) fail(item.slug, "title, short title and summary are required");
  if (!item.status.label || !item.status.nextAction) fail(item.slug, "status label and next action are required");
  if (!item.examTypes.length) fail(item.slug, "at least one exam type is required");
  if (!item.education.length) fail(item.slug, "at least one education path is required");
  if (item.governmentLevel === "State" && (!item.state || !item.stateCode)) fail(item.slug, "state records require state and stateCode");
  if (!checkedDate.test(item.lastVerified)) fail(item.slug, "lastVerified must use 'D Mon YYYY, HH:MM IST'");

  const primaryUrl = new URL(item.sourceUrl);
  if (primaryUrl.protocol !== "https:") fail(item.slug, "primary source must use HTTPS");
  if (!authority.allowedHosts.includes(primaryUrl.hostname)) {
    fail(item.slug, `primary source host ${primaryUrl.hostname} is not allowlisted for ${authority.id}`);
  }

  if (!item.officialLinks.length) fail(item.slug, "at least one official link is required");
  for (const link of item.officialLinks) {
    try {
      const url = new URL(link.url);
      if (url.protocol !== "https:") fail(item.slug, `official link must use HTTPS: ${link.url}`);
      if (!authority.allowedHosts.includes(url.hostname)) {
        warnings.push(`${item.slug}: linked host ${url.hostname} is outside ${authority.id}'s allowlist`);
      }
    } catch {
      fail(item.slug, `invalid official link: ${link.url}`);
    }
  }

  if (!item.timeline.length) fail(item.slug, "timeline is empty");
  for (const event of item.timeline) {
    if (!isoDate.test(event.date) || Number.isNaN(Date.parse(`${event.date}T00:00:00Z`))) {
      fail(item.slug, `invalid timeline date for '${event.label}': ${event.date}`);
    }
  }
  if (!item.timeline.some((event) => event.date >= scopeStart)) {
    fail(item.slug, `no official event falls on or after ${scopeStart}`);
  }

  for (const row of item.vacancyBreakdown ?? []) {
    const categories = [row.ur, row.ews, row.obc, row.sc, row.st];
    if (categories.every((value) => typeof value === "number")) {
      const sum = categories.reduce<number>((total, value) => total + (value ?? 0), 0);
      if (sum !== row.total) fail(item.slug, `vacancy row '${row.label}' totals ${sum}, expected ${row.total}`);
    }
  }

  if (item.vacancies != null && item.vacancies < 0) fail(item.slug, "vacancies cannot be negative");
  if (!item.sourceTitle || !item.sourcePublished) fail(item.slug, "source title and publication description are required");
}

if (warnings.length) {
  console.warn(`Data warnings (${warnings.length}):\n- ${warnings.join("\n- ")}`);
}

if (errors.length) {
  console.error(`Data validation failed (${errors.length}):\n- ${errors.join("\n- ")}`);
  process.exit(1);
}

console.log(`Validated ${exams.length} exam cycles across ${authorities.size} registered authorities.`);
