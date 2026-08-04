import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { exams } from "../lib/exams";
import {
  applyFacets,
  defaultExplorerState,
  normalise,
  parseExplorerParams,
  rank,
  statusFilters,
  toExplorerParams,
  toSearchDoc,
  type ExplorerParamOptions,
  type Facets,
} from "../lib/search";
import { examTypeOptions, indiaRegions } from "../lib/discovery";

const docs = exams.map(toSearchDoc);

function top(query: string, count = 5) {
  return rank(docs, query)
    .slice(0, count)
    .map((entry) => entry.doc.s);
}

function hits(query: string) {
  return rank(docs, query).map((entry) => entry.doc.s);
}

test("finds an exam by its acronym", () => {
  const results = top("cgl");
  assert.ok(
    results.some((slug) => slug.includes("ssc-cgl")),
    `expected an SSC CGL record, got ${results.join(", ")}`,
  );
});

test("word order does not matter", () => {
  const forward = hits("ssc cgl");
  const reversed = hits("cgl ssc");
  assert.ok(forward.length > 0, "expected results for 'ssc cgl'");
  assert.deepEqual(new Set(forward), new Set(reversed));
});

test("every token must match, so unrelated words do not widen the result set", () => {
  const broad = hits("ssc");
  const narrow = hits("ssc cgl");
  assert.ok(narrow.length < broad.length, "adding a token must narrow, not widen");
  assert.ok(narrow.every((slug) => broad.includes(slug)));
});

test("a query that matches nothing returns nothing rather than everything", () => {
  assert.equal(hits("zzzznotanexam").length, 0);
});

test("generic candidate wording behaves like an unfiltered search", () => {
  assert.equal(hits("government exams").length, docs.length);
  assert.equal(hits("sarkari jobs").length, docs.length);
});

test("understands how candidates actually phrase things", () => {
  for (const query of ["bank po", "12th pass", "jobs after 12th", "class 12", "police constable"]) {
    assert.ok(hits(query).length > 0, `expected results for "${query}"`);
  }
});

test("tolerates a typo", () => {
  assert.ok(hits("cosntable").length > 0, "expected fuzzy match for 'cosntable'");
  assert.ok(hits("railwya").length > 0, "expected fuzzy match for 'railwya'");
});

test("ranks the titular match above incidental mentions", () => {
  const results = rank(docs, "ibps po");
  assert.ok(results.length > 0);
  assert.match(results[0].doc.st, /IBPS PO/i);
});

test("finds exams by state name and by recruiting body", () => {
  const bihar = hits("bihar");
  assert.ok(bihar.length > 0, "expected Bihar results");
  assert.ok(hits("public service commission").length > 0);
});

test("search is case and punctuation insensitive", () => {
  assert.deepEqual(new Set(hits("UPSC C.D.S.")), new Set(hits("upsc cds")));
  assert.deepEqual(new Set(hits("U.P.S.C.-CDS")), new Set(hits("upsc cds")));
});

test("the compact document includes qualification language", () => {
  for (const [index, item] of exams.entries()) {
    assert.ok(
      docs[index].h.includes(normalise(item.qualification)),
      `${item.slug} omitted its qualification from the search document`,
    );
  }
});

test("ranking never returns the same recruitment twice", () => {
  const item = docs.find((doc) => doc.s.includes("ssc-cgl")) ?? docs[0];
  const results = rank([item, item, ...docs], item.st);
  assert.equal(results.length, new Set(results.map((result) => result.doc.s)).size);
});

test("region facet narrows to that region's own recruitment", () => {
  const base: Facets = { education: "All", examType: "All", level: "All", region: "All", year: "All", tones: [] };
  for (const region of indiaRegions) {
    const filtered = applyFacets(docs, { ...base, region: region.code });
    for (const doc of filtered) {
      assert.ok(
        doc.r.includes(region.code),
        `${doc.s} surfaced under ${region.code} without listing it in regionCodes`,
      );
    }
  }
});

test("the central facet returns only all-India cycles", () => {
  const base: Facets = { education: "All", examType: "All", level: "All", region: "All", year: "All", tones: [] };
  const central = applyFacets(docs, { ...base, region: "central" });
  assert.ok(central.length > 0);
  assert.ok(central.every((doc) => doc.g === "Central"));
});

test("year, status, type, education and level facets compose", () => {
  const target = docs.find((doc) => doc.x.length && doc.e.length) ?? docs[0];
  const facets: Facets = {
    education: target.e[0],
    examType: target.x[0],
    level: target.g,
    region: target.g === "Central" ? "central" : target.r[0],
    year: target.y,
    tones: [target.n],
  };
  const filtered = applyFacets(docs, facets);
  assert.ok(filtered.some((doc) => doc.s === target.s));
  assert.ok(filtered.every((doc) => doc.y === target.y && doc.n === target.n && doc.g === target.g));
});

test("every state and union territory is available to the region facet", () => {
  assert.equal(indiaRegions.length, 36);
  assert.equal(new Set(indiaRegions.map((region) => region.code)).size, 36);
});

test("all declared discovery categories are selectable", () => {
  assert.ok(examTypeOptions.some((option) => option.value === "Judiciary & Legal"));
  assert.ok(examTypeOptions.some((option) => option.value === "Public Sector Undertakings"));
});

test("all explorer state round-trips through URL parameters", () => {
  const options: ExplorerParamOptions = {
    education: [...new Set(docs.flatMap((doc) => doc.e))],
    examTypes: examTypeOptions.map((option) => option.value),
    regions: indiaRegions.map((region) => region.code),
    years: [...new Set(docs.map((doc) => doc.y))],
  };
  const state = {
    ...defaultExplorerState,
    query: "bank po",
    education: "Graduate" as const,
    examType: "Banking & Finance" as const,
    level: "Central" as const,
    region: "central",
    year: options.years[0],
    status: statusFilters.find((filter) => filter.tones.includes("blue"))?.value ?? "upcoming",
    savedOnly: true,
  };

  assert.deepEqual(parseExplorerParams(toExplorerParams(state), options), state);
});

test("invalid URL facets fall back safely", () => {
  const options: ExplorerParamOptions = {
    education: [...new Set(docs.flatMap((doc) => doc.e))],
    examTypes: examTypeOptions.map((option) => option.value),
    regions: indiaRegions.map((region) => region.code),
    years: [...new Set(docs.map((doc) => doc.y))],
  };
  const params = new URLSearchParams("education=PhD&type=Unknown&level=District&region=XX&year=1900&status=lost&saved=maybe");
  assert.deepEqual(parseExplorerParams(params, options), defaultExplorerState);
});

test("the search document stays small enough to ship to the browser", () => {
  const bytes = Buffer.byteLength(JSON.stringify(docs));
  const perDoc = bytes / docs.length;
  assert.ok(bytes < 100_000, `search payload is ${bytes.toLocaleString()} bytes, expected under 100 KB`);
  assert.ok(perDoc < 700, `search doc averages ${Math.round(perDoc)} bytes, expected under 700`);
});

test("the live catalogue and dedicated route use the compact ranked search", async () => {
  const [explorerSource, catalogueSource, searchPageSource, headerSource] = await Promise.all([
    readFile(new URL("../components/ExamExplorer.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/exams/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/search/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/SiteHeader.tsx", import.meta.url), "utf8"),
  ]);

  assert.doesNotMatch(explorerSource, /from ["']@\/lib\/exams["']/);
  assert.match(explorerSource, /docs:\s*SearchDoc\[\]/);
  assert.match(explorerSource, /applyFacets\(uniqueDocs/);
  assert.match(explorerSource, /rank\(matches, filters\.query\)/);
  assert.match(explorerSource, /indiaRegions\.filter/);
  assert.match(explorerSource, /results\.slice\(0, page \* pageSize\)/);
  assert.match(explorerSource, /prefetch=\{false\}/);
  assert.doesNotMatch(catalogueSource, /toSearchDoc|ExamExplorer/);
  assert.match(catalogueSource, /\.slice\(0, 24\)/);
  assert.match(catalogueSource, /<ExamCollection items=\{currentHighlights\}/);
  assert.match(catalogueSource, /href="\/search"/);
  assert.match(searchPageSource, /exams\.map\(toSearchDoc\)/);
  assert.match(searchPageSource, /<ExamExplorer docs=\{searchDocs\} mode="search"/);
  assert.match(searchPageSource, /robots:\s*\{\s*index:\s*false,\s*follow:\s*true\s*\}/);
  assert.match(headerSource, /className="header-search" href="\/search"/);
});
