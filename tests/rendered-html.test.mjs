import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${path}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the finished public exam portal", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Government Exam India — Every exam, one clear next step<\/title>/i);
  assert.match(html, /Every government exam/);
  assert.match(html, /One clear next step/);
  assert.match(html, /Exams for your education level/);
  assert.match(html, /Choose your state/);
  assert.match(html, /Browse government exams by Indian state or union territory/);
  assert.match(html, /Exam types/);
  assert.match(html, /See exactly where the seats go/);
  assert.match(html, /Exams · Seats · Timelines/);
  assert.doesNotMatch(html, /Updated 4 Aug|Official sources checked|The trust contract|No citation, no claim/i);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Your site is taking shape/i);
});

test("renders the searchable catalogue as useful HTML before JavaScript", async () => {
  const response = await render("/exams");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Find the right government exam/);
  assert.match(html, /IBPS Probationary Officer/);
  assert.match(html, /SSC Combined Graduate Level/);
  assert.match(html, /BPSC Integrated 72nd/);
  assert.match(html, /Checked <strong>4 Aug 2026/);
});

test("removes starter-only infrastructure and keeps cited, classified seed data", async () => {
  const [packageJson, examsSource, registry, mapPaths] = await Promise.all([
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../lib/exams.ts", import.meta.url), "utf8"),
    readFile(new URL("../data/source-registry.json", import.meta.url), "utf8"),
    readFile(new URL("../data/geo/india-state-paths.json", import.meta.url), "utf8"),
  ]);

  assert.doesNotMatch(packageJson, /site-creator-vinext-starter|react-loading-skeleton/);
  assert.match(packageJson, /government-exam-india/);
  assert.match(examsSource, /sourceUrl:/);
  assert.match(examsSource, /lastVerified:/);
  assert.match(examsSource, /examTypes:/);
  assert.match(examsSource, /stateCode:/);
  assert.match(examsSource, /vacancyBreakdown:/);
  assert.match(examsSource, /https:\/\/www\.ibps\.in/);
  assert.match(examsSource, /https:\/\/www\.upsc\.gov\.in/);
  assert.match(examsSource, /https:\/\/ssc\.gov\.in/);
  assert.match(registry, /allowedHosts/);
  assert.match(registry, /watchUrls/);
  assert.match(mapPaths, /"shapes"/);
  assert.ok(Buffer.byteLength(mapPaths) < 100_000, "projected map payload should remain compact");

  await assert.rejects(access(new URL("../app/_sites-preview/SkeletonPreview.tsx", import.meta.url)));
  await assert.rejects(access(new URL("../app/_sites-preview/preview.css", import.meta.url)));
});

test("provides calendar, sources, updates, state and exam-type routes", async () => {
  const [calendar, method, updates, states, tamilNadu, types, railways] = await Promise.all([
    render("/calendar"),
    render("/methodology"),
    render("/updates"),
    render("/states"),
    render("/states/tamil-nadu"),
    render("/exam-types"),
    render("/exam-types/railways"),
  ]);

  assert.equal(calendar.status, 200);
  assert.equal(method.status, 200);
  assert.equal(updates.status, 200);
  assert.equal(states.status, 200);
  assert.equal(tamilNadu.status, 200);
  assert.equal(types.status, 200);
  assert.equal(railways.status, 200);
  assert.match(await calendar.text(), /One national timeline/);
  assert.match(await method.text(), /How exam information is updated/);
  assert.match(await updates.text(), /Corrections &amp; changes/);
  assert.match(await states.text(), /28 states · 8 union territories/);
  assert.match(await tamilNadu.text(), /Tamil Nadu(?:<!-- -->)? exams/);
  assert.match(await types.text(), /Browse by work/);
  assert.match(await railways.text(), /RRB NTPC/);
});
