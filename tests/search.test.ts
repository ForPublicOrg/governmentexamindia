import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { gzipSync } from "node:zlib";
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

async function readDirectComponentImports(source: string) {
  const componentPaths = [
    ...new Set(
      [...source.matchAll(/from\s+["']@\/components\/([^"']+)["']/g)].map((match) => match[1]),
    ),
  ];

  return Promise.all(
    componentPaths.map(async (componentPath) => ({
      componentPath,
      source: await readFile(new URL(`../components/${componentPath}.tsx`, import.meta.url), "utf8"),
    })),
  );
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
  assert.equal(indiaRegions.filter((region) => region.kind === "State").length, 28);
  assert.equal(indiaRegions.filter((region) => region.kind === "Union territory").length, 8);
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

test("the search index stays cheap to download", () => {
  const json = JSON.stringify(docs);
  const raw = Buffer.byteLength(json);
  const transferred = gzipSync(json).length;

  // Budget the thing users actually wait for: the compressed response. A
  // per-record average is deliberately NOT asserted — it rises whenever records
  // gain genuinely searchable detail (keywords, sourced qualifications), so it
  // measures editorial richness rather than waste, and would need raising every
  // time the data improves.
  //
  // Reaching this ceiling means the index needs splitting or a server-side
  // search — it is not a number to raise.
  assert.ok(
    transferred < 250_000,
    `search index is ${transferred.toLocaleString()} gzipped bytes; split the index rather than raising this`,
  );

  // What actually needs guarding is a single record bloating the index — a
  // whole Exam object serialised by mistake, or prose dumped into keywords.
  const largest = docs.reduce((worst, doc) => Math.max(worst, Buffer.byteLength(JSON.stringify(doc))), 0);
  assert.ok(largest < 4_000, `the largest search document is ${largest} bytes, expected under 4,000`);
  assert.ok(raw / docs.length < 1_500, `search doc averages ${Math.round(raw / docs.length)} raw bytes, expected under 1,500`);
});

test("home matches while typing, and Enter opens the full search rather than the top hit", async () => {
  const [homeSource, explorerSource] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/ExamExplorer.tsx", import.meta.url), "utf8"),
  ]);
  const importedHomeComponents = await readDirectComponentImports(homeSource);
  const liveHomeSearch = importedHomeComponents.find(
    ({ source }) => /type=["']search["']/.test(source) && /onChange=/.test(source),
  );

  assert.ok(liveHomeSearch, "home should render a client component that matches as the query changes");
  assert.doesNotMatch(homeSource, /action=["']\/search["']/);
  assert.doesNotMatch(liveHomeSearch.source, /action=["']\/search["']/);
  assert.match(liveHomeSearch.source, /(?:\brank|\.rank)\(/, "home search should use the ranked matcher");
  assert.match(liveHomeSearch.source, /onChange=/, "home should update while the user types");
  assert.match(liveHomeSearch.source, /role=["']combobox["']/);
  assert.match(liveHomeSearch.source, /aria-autocomplete=["']list["']/);
  assert.match(liveHomeSearch.source, /role=["']status["']/);
  assert.match(liveHomeSearch.source, /onSubmit=/);
  assert.match(liveHomeSearch.source, /\.preventDefault\(\)/, "home form must not perform native navigation");
  assert.match(liveHomeSearch.source, /SEARCH_INDEX_URL\s*=\s*["']\/search-index\.json\?v=\d+["']/);
  assert.match(liveHomeSearch.source, /fetch\(SEARCH_INDEX_URL/);
  assert.match(liveHomeSearch.source, /RESULT_LIMIT\s*=\s*5/);

  // Enter is "show me everything you have for this", not "open your best guess".
  assert.match(
    liveHomeSearch.source,
    /SEARCH_PAGE\s*=\s*["']\/search\/["']/,
    "Enter should land on the search page itself, not on a trailing-slash redirect",
  );
  assert.match(
    liveHomeSearch.source,
    /router\.push\([\s\S]{0,160}\$\{SEARCH_PAGE\}\?q=\$\{encodeURIComponent\(/,
    "Enter should navigate to the full search carrying the typed query",
  );
  assert.match(
    liveHomeSearch.source,
    /highlighted >= 0 \? matches\[highlighted\] : undefined/,
    "only a suggestion the reader arrowed onto should open as an exam",
  );
  assert.doesNotMatch(
    liveHomeSearch.source,
    /setHighlighted\(0\)/,
    "no suggestion may start selected, or Enter would open the top hit again",
  );
  assert.doesNotMatch(
    liveHomeSearch.source,
    /onMouseEnter=\{\(\) => setHighlighted/,
    "hovering must not arm Enter; :hover already paints the row",
  );

  // ?q= has to survive a tab that is never painted, so the query string is
  // subscribed to rather than copied into state once a frame comes along.
  assert.match(
    explorerSource,
    /useSyncExternalStore\(subscribeToUrl/,
    "the explorer should read the query string as an external store",
  );
  assert.doesNotMatch(
    explorerSource,
    /requestAnimationFrame/,
    "a frame never arrives in a background tab, so the filters would never apply",
  );
  // The panel holds the control being operated. Deriving its visibility from
  // the live facet count shuts it the moment the last facet returns to "All".
  assert.match(
    explorerSource,
    /const updateFilters = \([\s\S]{0,400}?setOpenedFilters\(filtersOpen\)/,
    "changing a facet must pin the filter panel open rather than let it derive shut",
  );
  assert.match(explorerSource, /type=["']search["']/, "search explorer should expose a search input");
  assert.match(explorerSource, /onChange=/, "search explorer should update while the user types");
  assert.match(explorerSource, /onKeyDown=/, "search explorer should handle Enter explicitly");
  assert.match(
    explorerSource,
    /\.key\s*===\s*["']Enter["'][\s\S]{0,300}?\.preventDefault\(\)/,
    "search explorer should prevent Enter from submitting or navigating",
  );
});

test("the catalogue and dedicated route use a compact, complete ranked search", async () => {
  const [explorerSource, catalogueSource, searchPageSource, indexRouteSource, headerSource] = await Promise.all([
    readFile(new URL("../components/ExamExplorer.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/exams/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/search/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/search-index.json/route.ts", import.meta.url), "utf8"),
    readFile(new URL("../components/SiteHeader.tsx", import.meta.url), "utf8"),
  ]);

  assert.doesNotMatch(explorerSource, /from ["']@\/lib\/exams["']/);
  assert.match(explorerSource, /docs:\s*SearchDoc\[\]/);
  assert.match(explorerSource, /applyFacets\(uniqueDocs/);
  // Ranking is date-aware: an expired window must not keep its deadline-first
  // ranking just because the page was built while it was open.
  assert.match(explorerSource, /rank\(matches, filters\.query, today\)/);
  assert.match(explorerSource, /compareDocsAt\(today\)/);
  assert.match(explorerSource, /indiaRegions\.filter\(\(region\) => region\.kind === "State"\)/);
  assert.match(explorerSource, /indiaRegions\.filter\(\(region\) => region\.kind === "Union territory"\)/);
  assert.match(explorerSource, /results\.slice\(0, page \* pageSize\)/);
  assert.match(explorerSource, /prefetch=\{false\}/);
  assert.doesNotMatch(catalogueSource, /toSearchDoc|ExamExplorer/);
  assert.match(catalogueSource, /\.slice\(0, 24\)/);
  assert.match(catalogueSource, /<ExamCollection items=\{currentHighlights\}/);
  assert.match(catalogueSource, /href="\/search"/);
  assert.match(searchPageSource, /\.map\(toSearchDoc\)/);
  assert.match(searchPageSource, /<ExamExplorer docs=\{searchDocs\}/);
  // The page must server-render a bounded first page and let the browser pull
  // the rest, so the HTML does not grow with every exam added to the index.
  assert.match(searchPageSource, /exams\.slice\(0, SSR_DOCS\)/);
  assert.match(searchPageSource, /indexUrl="\/search-index\.json/);
  assert.match(explorerSource, /fetch\(indexUrl\)/);
  assert.match(searchPageSource, /robots:\s*\{\s*index:\s*false,\s*follow:\s*true\s*\}/);
  assert.match(indexRouteSource, /dynamic\s*=\s*["']force-static["']/);
  assert.match(indexRouteSource, /Response\.json\(exams\.map\(toSearchDoc\)/);
  assert.match(indexRouteSource, /Cache-Control/);
  assert.match(headerSource, /className="header-search" href="\/search"/);
});
