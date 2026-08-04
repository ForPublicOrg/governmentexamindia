import * as bankingFinance from "@/data/exams/banking-finance";
import * as defenceParamilitary from "@/data/exams/defence-paramilitary";
import * as healthMedical from "@/data/exams/health-medical";
import * as judiciaryLegal from "@/data/exams/judiciary-legal";
import * as psuTechnical from "@/data/exams/psu-technical";
import * as railways from "@/data/exams/railways";
import * as ssc from "@/data/exams/ssc";
import * as stateCentral from "@/data/exams/state-central";
import * as stateDeccan from "@/data/exams/state-deccan";
import * as stateEast from "@/data/exams/state-east";
import * as stateNorth from "@/data/exams/state-north";
import * as stateNortheast from "@/data/exams/state-northeast";
import * as stateSouth from "@/data/exams/state-south";
import * as stateWest from "@/data/exams/state-west";
import * as teachingResearch from "@/data/exams/teaching-research";
import * as upsc from "@/data/exams/upsc";
import { byLifecycle } from "@/lib/lifecycle";
import type { Authority, Exam, EducationLevel, StatusTone } from "@/lib/exam-types";

export type {
  Authority,
  EducationLevel,
  Exam,
  ExamEvent,
  ExamType,
  GovernmentLevel,
  OfficialLink,
  StatusTone,
  TimelineState,
  VacancyRow,
  Verification,
} from "@/lib/exam-types";

const modules = [
  upsc,
  ssc,
  bankingFinance,
  railways,
  defenceParamilitary,
  teachingResearch,
  healthMedical,
  psuTechnical,
  judiciaryLegal,
  stateNorth,
  stateWest,
  stateCentral,
  stateEast,
  stateSouth,
  stateDeccan,
  stateNortheast,
];

/**
 * Every recruitment record, ordered the way a candidate reads a list: ongoing
 * cycles first, then upcoming, then past, and inside each group by the
 * submission deadline they still have to act on.
 */
export const exams: Exam[] = modules.flatMap((module) => module.exams).sort(byLifecycle());

/** Every recruiting body referenced by a record, de-duplicated by id. */
export const authorities: Authority[] = Array.from(
  modules
    .flatMap((module) => module.authorities)
    .reduce((map, authority) => {
      const existing = map.get(authority.id);
      map.set(
        authority.id,
        existing
          ? {
              ...existing,
              allowedHosts: Array.from(new Set([...existing.allowedHosts, ...authority.allowedHosts])),
              watchUrls: Array.from(new Set([...existing.watchUrls, ...authority.watchUrls])),
            }
          : authority,
      );
      return map;
    }, new Map<string, Authority>())
    .values(),
).sort((a, b) => a.name.localeCompare(b.name));

export const educationOptions: { value: "All" | EducationLevel; label: string; description: string }[] = [
  { value: "All", label: "Any qualification", description: "See the full catalogue" },
  { value: "10th", label: "Class 10", description: "MTS, constable and support roles" },
  { value: "12th", label: "Class 12", description: "CHSL, NDA and 10+2 routes" },
  { value: "ITI / Diploma", label: "ITI / Diploma", description: "Technical and trade recruitments" },
  { value: "Graduate", label: "Any graduate", description: "Civil services, banks and railways" },
  { value: "Postgraduate", label: "Postgraduate", description: "Specialist and research posts" },
  { value: "Professional degree", label: "Professional degree", description: "Engineering, law, medical and domain roles" },
];

export const statusOrder: StatusTone[] = ["red", "green", "amber", "blue", "violet", "slate"];

const bySlug = new Map(exams.map((item) => [item.slug, item]));

export function getExam(slug: string) {
  return bySlug.get(slug);
}

export function getSearchText(item: Exam) {
  return [
    item.title,
    item.shortTitle,
    ...item.aliases,
    ...(item.keywords ?? []),
    item.organisation,
    item.jurisdiction,
    item.state,
    item.notificationNumber,
    item.sector,
    ...item.examTypes,
    ...item.education,
    item.qualification,
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase("en-IN");
}

/** State or multi-region records explicitly recruiting for this region.
 * Central/all-India cycles are intentionally kept in the national catalogue
 * instead of being duplicated on every state page.
 */
export function examsForRegion(code: string) {
  return exams.filter((item) => item.stateCode === code || item.regionCodes?.includes(code));
}

export const calendarEvents = exams
  .flatMap((item) =>
    item.timeline.flatMap((event) =>
      event.date || event.sortMonth
        ? [{
            ...event,
            sortDate: event.date ?? `${event.sortMonth!}-01`,
            dateTime: event.date ?? event.sortMonth!,
            examSlug: item.slug,
            examTitle: item.shortTitle,
            organisation: item.organisation,
            tone: item.status.tone,
          }]
        : [],
    ),
  )
  .sort((a, b) => a.sortDate.localeCompare(b.sortDate));
