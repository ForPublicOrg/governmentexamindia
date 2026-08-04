import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const outputRoot = new URL("../out/", import.meta.url);

async function render(path = "/") {
  const normalized = path === "/" ? "" : `${path.replace(/^\//, "").replace(/\/$/, "")}/`;
  const html = await readFile(new URL(`${normalized}index.html`, outputRoot), "utf8");
  return new Response(html, {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

test("exports the finished public exam portal as static HTML", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Government Exam India [—-] Every exam, one clear next step<\/title>/i);
  assert.match(html, /Every government exam/);
  assert.match(html, /One clear next step/);
  assert.match(html, /Exams for your education level/);
  assert.match(html, /Choose your state/);
  assert.match(html, /Browse government exams by Indian state or union territory/);
  assert.match(html, /Exam types/);
  assert.match(html, /See exactly where the seats go/);
  assert.match(html, /Exams · Seats · Timelines/);
  assert.match(html, /Open source/);
  assert.match(html, /Built using Athena/);
  assert.match(html, /https:\/\/github\.com\/ForPublicOrg\/governmentexamindia/);
  assert.doesNotMatch(html, /Updated 4 Aug|Official sources checked|The trust contract|No citation, no claim/i);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Your site is taking shape/i);
});

test("exports the searchable catalogue as useful HTML before JavaScript", async () => {
  const response = await render("/exams");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Find the right government exam/);
  assert.match(html, /IBPS Probationary Officer/);
  assert.match(html, /SSC Combined Graduate Level/);
  assert.match(html, /BPSC Integrated 72nd/);
  assert.match(html, /Checked <strong>4 Aug 2026/);
});

test("keeps cited, classified seed data and a Vercel-only deployment shape", async () => {
  const [packageJson, examsSource, registry, mapPaths, vercelConfig] = await Promise.all([
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../lib/exams.ts", import.meta.url), "utf8"),
    readFile(new URL("../data/source-registry.json", import.meta.url), "utf8"),
    readFile(new URL("../data/geo/india-state-paths.json", import.meta.url), "utf8"),
    readFile(new URL("../vercel.json", import.meta.url), "utf8"),
  ]);

  assert.doesNotMatch(packageJson, /vinext|wrangler|@cloudflare\/vite-plugin/);
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
  assert.match(vercelConfig, /"framework": "nextjs"/);

  await access(new URL("../out/athena.svg", import.meta.url));
  await assert.rejects(access(new URL("../.openai/hosting.json", import.meta.url)));
  await assert.rejects(access(new URL("../vite.config.ts", import.meta.url)));
  await assert.rejects(access(new URL("../worker/index.ts", import.meta.url)));
});

test("exports calendar, sources, updates, state and exam-type routes", async () => {
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
