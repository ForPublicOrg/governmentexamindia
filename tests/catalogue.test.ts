import assert from "node:assert/strict";
import test from "node:test";
import { examTypeOptions, indiaRegions } from "../lib/discovery";
import { authorities, exams, examsForRegion } from "../lib/exams";

test("the catalogue retains nationwide breadth", () => {
  assert.ok(exams.length >= 130, `expected at least 130 recruitment cycles, got ${exams.length}`);
  assert.ok(authorities.length >= 55, `expected at least 55 recruiting bodies, got ${authorities.length}`);
});

test("every state and union territory has an explicitly tagged cycle", () => {
  assert.equal(indiaRegions.length, 36);
  for (const region of indiaRegions) {
    const regional = examsForRegion(region.code);
    assert.ok(regional.length > 0, `${region.name} (${region.code}) has no explicitly tagged cycle`);
    assert.ok(
      regional.every((item) => item.regionCodes?.includes(region.code)),
      `${region.name} includes a record without an explicit ${region.code} region tag`,
    );
  }
});

test("every discovery category leads to a populated collection", () => {
  for (const option of examTypeOptions) {
    assert.ok(
      exams.some((item) => item.examTypes.includes(option.value)),
      `${option.value} has no recruitment cycle`,
    );
  }
});

test("verified and official-listing records remain distinguishable", () => {
  const verified = exams.filter((item) => item.verification === "verified");
  const listed = exams.filter((item) => item.verification === "listed");
  assert.ok(verified.length > 0, "expected notice-verified records");
  assert.ok(listed.length > 0, "expected honest official-listing records for cycles awaiting full notices");
  assert.ok(listed.every((item) => item.vacancies == null), "listed records must not expose numeric vacancies");
});
