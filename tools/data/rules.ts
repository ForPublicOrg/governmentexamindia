import { indiaRegions } from "../../lib/discovery";
import type { Authority, Exam } from "../../lib/exam-types";

export type RuleResult = { errors: string[]; warnings: string[] };
export type RuleOptions = { referenceDate?: string };

const regionByCode = new Map(indiaRegions.map((region) => [region.code, region.name]));
const validRegions = new Set(regionByCode.keys());
const isoDate = /^\d{4}-\d{2}-\d{2}$/;
const isoMonth = /^\d{4}-\d{2}$/;
const checkedDate = /^(\d{1,2}) ([A-Z][a-z]{2}) (\d{4}), (\d{2}):(\d{2}) IST$/;
const monthNumber: Record<string, number> = {
  Jan: 1,
  Feb: 2,
  Mar: 3,
  Apr: 4,
  May: 5,
  Jun: 6,
  Jul: 7,
  Aug: 8,
  Sep: 9,
  Oct: 10,
  Nov: 11,
  Dec: 12,
};
const scopeStart = "2025-06-01";
const freshnessTones = new Set(["green", "amber", "red", "blue", "violet"]);
const FRESHNESS_WARNING_DAYS = 14;
const FRESHNESS_ERROR_DAYS = 45;
const undatedWording = /\b(await(?:ed|ing)?|to be announced|not announced|date not announced|schedule not announced|tba)\b/i;

function normaliseIdentity(value: string) {
  return value.toLocaleLowerCase("en-IN").replace(/[^a-z0-9]+/g, "");
}

export function isRealIsoDate(value: string) {
  if (!isoDate.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

function isRealIsoMonth(value: string) {
  if (!isoMonth.test(value)) return false;
  const [, month] = value.split("-").map(Number);
  return month >= 1 && month <= 12;
}

function checkedDateKey(value: string) {
  const match = checkedDate.exec(value);
  if (!match) return undefined;
  const [, dayText, monthText, yearText, hourText, minuteText] = match;
  const month = monthNumber[monthText];
  const hour = Number(hourText);
  const minute = Number(minuteText);
  if (!month || hour > 23 || minute > 59) return undefined;
  const key = `${yearText}-${String(month).padStart(2, "0")}-${String(Number(dayText)).padStart(2, "0")}`;
  return isRealIsoDate(key) ? key : undefined;
}

export function validateRecords(exams: Exam[], authorities: Authority[], options: RuleOptions = {}): RuleResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const referenceDate = options.referenceDate ?? new Date().toISOString().slice(0, 10);
  const referenceTime = Date.parse(`${referenceDate}T00:00:00Z`);
  if (!isRealIsoDate(referenceDate)) errors.push(`validation: invalid reference date ${referenceDate}`);
  const seenSlugs = new Set<string>();
  const authorityByName = new Map<string, Authority>();
  const seenAuthorityIds = new Set<string>();
  const seenAuthorityNames = new Set<string>();

  const fail = (slug: string, message: string) => errors.push(`${slug}: ${message}`);
  const failAuthority = (id: string, message: string) => errors.push(`authority:${id}: ${message}`);

  for (const authority of authorities) {
    if (!/^[a-z0-9-]+$/.test(authority.id)) failAuthority(authority.id, "id must be lowercase kebab-case");
    if (seenAuthorityIds.has(authority.id)) failAuthority(authority.id, "duplicate authority id");
    if (seenAuthorityNames.has(authority.name)) failAuthority(authority.id, `duplicate authority name: ${authority.name}`);
    seenAuthorityIds.add(authority.id);
    seenAuthorityNames.add(authority.name);
    authorityByName.set(authority.name, authority);

    if (!authority.name.trim()) failAuthority(authority.id, "name is required");
    if (!authority.allowedHosts.length) failAuthority(authority.id, "at least one allowed host is required");
    if (!authority.watchUrls.length) failAuthority(authority.id, "at least one watch URL is required");

    const hostSet = new Set<string>();
    for (const host of authority.allowedHosts) {
      if (hostSet.has(host)) failAuthority(authority.id, `duplicate allowed host: ${host}`);
      hostSet.add(host);
      if (host !== host.toLocaleLowerCase("en-IN") || host.includes(":") || host.includes("/")) {
        failAuthority(authority.id, `allowed host must be a lowercase hostname: ${host}`);
      }
    }

    const regions = authority.regionCodes ?? [];
    if (authority.level === "State" && !regions.length) {
      failAuthority(authority.id, "state authority requires at least one regionCode");
    }
    if (new Set(regions).size !== regions.length) failAuthority(authority.id, "regionCodes contains duplicates");
    for (const code of regions) {
      if (!validRegions.has(code)) failAuthority(authority.id, `unknown region code: ${code}`);
    }

    const watchSet = new Set<string>();
    for (const watchUrl of authority.watchUrls) {
      if (watchSet.has(watchUrl)) failAuthority(authority.id, `duplicate watch URL: ${watchUrl}`);
      watchSet.add(watchUrl);
      try {
        const url = new URL(watchUrl);
        if (url.protocol !== "https:") failAuthority(authority.id, `watch URL must use HTTPS: ${watchUrl}`);
        if (!authority.allowedHosts.includes(url.hostname)) {
          failAuthority(authority.id, `watch host ${url.hostname} is outside the allowlist`);
        }
      } catch {
        failAuthority(authority.id, `invalid watch URL: ${watchUrl}`);
      }
    }
  }

  const notificationKeys = new Map<string, Set<string>>();
  const identityKeys = new Map<string, Set<string>>();

  for (const item of exams) {
    if (seenSlugs.has(item.slug)) fail(item.slug, "duplicate slug");
    seenSlugs.add(item.slug);

    if (!/^[a-z0-9-]+$/.test(item.slug)) fail(item.slug, "slug must be lowercase kebab-case");

    const authority = authorityByName.get(item.organisation);
    if (!authority) {
      fail(item.slug, `organisation is not declared in this validation scope: ${item.organisation}`);
      continue;
    }

    if (authority.level !== item.governmentLevel) {
      fail(item.slug, `governmentLevel ${item.governmentLevel} conflicts with authority level ${authority.level}`);
    }
    if (!item.title || !item.shortTitle || !item.summary) fail(item.slug, "title, short title and summary are required");
    if (!item.status.label || !item.status.nextAction || !item.status.detail) {
      fail(item.slug, "status label, next action and detail are required");
    }
    if (!item.examTypes.length) fail(item.slug, "at least one exam type is required");
    if (!item.education.length) fail(item.slug, "at least one education path is required");
    const lastVerifiedDate = checkedDateKey(item.lastVerified);
    if (!lastVerifiedDate) {
      fail(item.slug, "lastVerified must be a real date using 'D Mon YYYY, HH:MM IST'");
    } else if (freshnessTones.has(item.status.tone) && Number.isFinite(referenceTime)) {
      const ageDays = Math.floor((referenceTime - Date.parse(`${lastVerifiedDate}T00:00:00Z`)) / 86_400_000);
      if (ageDays < 0) {
        fail(item.slug, "lastVerified cannot be in the future");
      } else if (ageDays > FRESHNESS_ERROR_DAYS) {
        fail(item.slug, `time-sensitive status was last reviewed ${ageDays} days ago (maximum ${FRESHNESS_ERROR_DAYS})`);
      } else if (ageDays > FRESHNESS_WARNING_DAYS) {
        warnings.push(`${item.slug}: time-sensitive status was last reviewed ${ageDays} days ago`);
      }
    }
    if (!Number.isInteger(item.year) || item.year < 2024 || item.year > 2030) {
      fail(item.slug, `year out of range: ${item.year}`);
    }

    const regions = item.regionCodes ?? [];
    if (new Set(regions).size !== regions.length) fail(item.slug, "regionCodes contains duplicates");
    for (const code of regions) {
      if (!validRegions.has(code)) fail(item.slug, `unknown region code: ${code}`);
    }
    if (item.stateCode && !validRegions.has(item.stateCode)) fail(item.slug, `unknown stateCode: ${item.stateCode}`);

    if (item.governmentLevel === "State") {
      if (!item.state || !item.stateCode) {
        fail(item.slug, "state records require state and stateCode");
      } else {
        const expectedName = regionByCode.get(item.stateCode);
        if (expectedName && item.state !== expectedName) {
          fail(item.slug, `state ${item.state} does not match ${item.stateCode} (${expectedName})`);
        }
        if (!regions.includes(item.stateCode)) fail(item.slug, "regionCodes must include the record's own stateCode");
        if (!authority.regionCodes?.includes(item.stateCode)) {
          fail(item.slug, `authority ${authority.id} does not declare region ${item.stateCode}`);
        }
      }
    } else if (item.state || item.stateCode) {
      fail(item.slug, "central records must not set state or stateCode; use regionCodes for limited regional scope");
    }

    if (authority.regionCodes?.length) {
      for (const code of regions) {
        if (!authority.regionCodes.includes(code)) {
          fail(item.slug, `region ${code} is outside authority ${authority.id}'s declared regions`);
        }
      }
    }

    if (item.verification === "listed") {
      if (item.vacancies != null) fail(item.slug, "a 'listed' record cannot carry a numeric vacancy count");
      if (item.vacancyBreakdown?.length) fail(item.slug, "a 'listed' record cannot carry a vacancy breakdown");
      if (/\d/.test(item.vacancyLabel)) fail(item.slug, "a 'listed' record cannot imply a numeric vacancy count");
      if (item.timeline.some((event) => event.state === "completed")) {
        warnings.push(`${item.slug}: 'listed' record marks an event completed — promote it to 'verified' if sourced`);
      }
    }

    try {
      const primaryUrl = new URL(item.sourceUrl);
      if (primaryUrl.protocol !== "https:") fail(item.slug, "primary source must use HTTPS");
      if (!authority.allowedHosts.includes(primaryUrl.hostname)) {
        fail(item.slug, `primary source host ${primaryUrl.hostname} is not allowlisted for ${authority.id}`);
      }
    } catch {
      fail(item.slug, `invalid sourceUrl: ${item.sourceUrl}`);
    }

    if (!item.officialLinks.length) fail(item.slug, "at least one official link is required");
    const officialUrls = new Set<string>();
    for (const link of item.officialLinks) {
      if (officialUrls.has(link.url)) fail(item.slug, `duplicate official link: ${link.url}`);
      officialUrls.add(link.url);
      try {
        const url = new URL(link.url);
        if (url.protocol !== "https:") fail(item.slug, `official link must use HTTPS: ${link.url}`);
        if (!authority.allowedHosts.includes(url.hostname)) {
          fail(item.slug, `official link host ${url.hostname} is outside ${authority.id}'s allowlist`);
        }
      } catch {
        fail(item.slug, `invalid official link: ${link.url}`);
      }
    }
    if (!officialUrls.has(item.sourceUrl)) fail(item.slug, "primary sourceUrl must also appear in officialLinks");

    if (!item.timeline.length && item.verification === "verified") {
      fail(item.slug, "a verified record requires at least one timeline event");
    }
    const datedEvents: string[] = [];
    for (const event of item.timeline) {
      if (!event.label || !event.displayDate) fail(item.slug, "timeline events require label and displayDate");
      if (event.date && event.sortMonth) {
        fail(item.slug, `timeline event '${event.label}' cannot set both date and sortMonth`);
      }
      if (event.date != null) {
        if (!isRealIsoDate(event.date)) {
          fail(item.slug, `invalid timeline date for '${event.label}': ${event.date}`);
        } else {
          datedEvents.push(event.date);
        }
        if (undatedWording.test(event.displayDate)) {
          fail(item.slug, `dated event '${event.label}' says its date is unannounced`);
        }
        if (event.state === "scheduled" && event.date < referenceDate) {
          fail(item.slug, `scheduled event '${event.label}' is already in the past`);
        }
      } else if (event.sortMonth != null) {
        if (!isRealIsoMonth(event.sortMonth)) {
          fail(item.slug, `invalid timeline sortMonth for '${event.label}': ${event.sortMonth}`);
        } else {
          datedEvents.push(`${event.sortMonth}-01`);
        }
        if (!/\b20\d{2}\b/.test(event.displayDate)) {
          fail(item.slug, `month-only event '${event.label}' must show its year`);
        }
        if (event.state === "scheduled" && event.sortMonth < referenceDate.slice(0, 7)) {
          fail(item.slug, `scheduled month '${event.label}' is already in the past`);
        }
      } else {
        if (["completed", "scheduled", "postponed"].includes(event.state)) {
          fail(item.slug, `undated event '${event.label}' cannot be ${event.state}`);
        }
        if (!undatedWording.test(event.displayDate)) {
          fail(item.slug, `undated event '${event.label}' must clearly say its date is awaited or unannounced`);
        }
      }
    }
    for (let index = 1; index < datedEvents.length; index += 1) {
      if (datedEvents[index] < datedEvents[index - 1]) fail(item.slug, "dated timeline events must be chronological");
    }
    if (item.status.tone === "green") {
      if (item.verification !== "verified") {
        fail(item.slug, "an applications-open status must be verified against a dated notice");
      }
      const activeDeadline = item.timeline.some(
        (event) =>
          event.date != null &&
          event.date >= referenceDate &&
          event.state === "current" &&
          /\b(deadline|applications? close|last date|registration closes?)\b/i.test(event.label),
      );
      if (!activeDeadline) {
        fail(item.slug, "an applications-open status requires a current exact deadline");
      }
    }
    if (item.verification === "verified" && !datedEvents.some((date) => date >= scopeStart)) {
      fail(item.slug, `no verified official event falls on or after ${scopeStart}`);
    }

    const rowLabels = new Set<string>();
    for (const row of item.vacancyBreakdown ?? []) {
      if (rowLabels.has(row.label)) fail(item.slug, `duplicate vacancy row: ${row.label}`);
      rowLabels.add(row.label);
      const categories = [row.ur, row.ews, row.obc, row.sc, row.st];
      if (categories.every((value) => typeof value === "number")) {
        const sum = categories.reduce<number>((total, value) => total + (value ?? 0), 0);
        if (sum !== row.total) fail(item.slug, `vacancy row '${row.label}' totals ${sum}, expected ${row.total}`);
      }
    }
    if (item.vacancies != null && (!Number.isInteger(item.vacancies) || item.vacancies < 0)) {
      fail(item.slug, "vacancies must be a non-negative integer");
    }
    if (item.vacancies != null && item.vacancyBreakdown?.length) {
      const breakdownTotal = item.vacancyBreakdown.reduce((total, row) => total + row.total, 0);
      if (breakdownTotal !== item.vacancies) {
        fail(item.slug, `vacancy breakdown totals ${breakdownTotal}, expected ${item.vacancies}`);
      }
    }
    if (!item.sourceTitle || !item.sourcePublished) fail(item.slug, "source title and publication description are required");

    for (const change of item.changeLog) {
      if (!isRealIsoDate(change.date) && !isRealIsoMonth(change.date)) {
        fail(item.slug, `change log date must be a real ISO month or date: ${change.date}`);
      }
      if (!change.displayDate.trim() || !change.text.trim()) {
        fail(item.slug, "change log entries require displayDate and text");
      }
    }

    if (item.notificationNumber) {
      const key = `${normaliseIdentity(item.organisation)}::${item.year}::${normaliseIdentity(item.notificationNumber)}`;
      notificationKeys.set(key, new Set([...(notificationKeys.get(key) ?? []), item.slug]));
    }

    for (const identity of [item.title, item.shortTitle, ...item.aliases]) {
      const normalised = normaliseIdentity(identity);
      if (normalised.length < 6) continue;
      const key = `${normaliseIdentity(item.organisation)}::${item.year}::${normalised}`;
      identityKeys.set(key, new Set([...(identityKeys.get(key) ?? []), item.slug]));
    }
  }

  for (const [key, slugs] of notificationKeys) {
    if (slugs.size > 1) errors.push(`duplicate notification (${key}): ${[...slugs].join(", ")}`);
  }
  for (const [key, slugs] of identityKeys) {
    if (slugs.size > 1) errors.push(`semantic duplicate (${key}): ${[...slugs].join(", ")}`);
  }

  return { errors, warnings };
}
