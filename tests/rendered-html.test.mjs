import assert from "node:assert/strict";
import { access, readFile, stat } from "node:fs/promises";
import test from "node:test";

const outputRoot = new URL("../out/", import.meta.url);

function luminance(hex) {
  const channels = hex
    .slice(1)
    .match(/../g)
    .map((channel) => Number.parseInt(channel, 16) / 255)
    .map((channel) => (channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4));
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrast(first, second) {
  const [lighter, darker] = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

function cssHexVariable(block, name) {
  return block.match(new RegExp(`--${name}:\\s*(#[0-9a-f]{6})`, "i"))?.[1];
}

function assertNoAutomaticLinkPrefetch(source, label) {
  const tags = source.match(/<Link\b[\s\S]*?>/g) ?? [];
  assert.ok(tags.length > 0, `${label} should contain navigation links`);
  assert.ok(
    tags.every((tag) => /prefetch=\{false\}/.test(tag)),
    `${label} links should not trigger speculative route downloads`,
  );
}

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
  assert.match(html, /<title>Government Exam India [—-] Government exams across India<\/title>/i);
  assert.match(html, /Government exams across India/);
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
  assert.match(html, /data-theme-toggle/);
  assert.match(html, /localStorage\.getItem\("theme"\)/);
  assert.match(html, /prefers-color-scheme: dark/);
  assert.doesNotMatch(html, /Updated 4 Aug|Official sources checked|The trust contract|No citation, no claim/i);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Your site is taking shape/i);
});

test("exports the searchable catalogue as useful HTML before JavaScript", async () => {
  const response = await render("/exams");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Government exams worth checking now/);
  assert.match(html, /IBPS Probationary Officer/);
  assert.match(html, /SSC Combined Graduate Level/);
  assert.match(html, /BPSC Integrated 72nd/);
  assert.match(html, /Checked (?:<!-- -->)?4 Aug 2026/);
});

test("keeps discovery pages bounded and does not repeat national exams on every state page", async () => {
  const [homeResponse, searchResponse, tamilNaduResponse, homeSource, stateSource, collectionSource, calendarSource, updatesSource, detailSource] = await Promise.all([
    render(),
    render("/search"),
    render("/states/tamil-nadu"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/states/[state]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/ExamCollection.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/calendar/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/updates/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/exams/[slug]/page.tsx", import.meta.url), "utf8"),
  ]);

  const home = await homeResponse.text();
  const search = await searchResponse.text();
  const tamilNadu = await tamilNaduResponse.text();
  assert.ok(Buffer.byteLength(home) < 210_000, "home HTML should stay below 210 KB");
  assert.ok(Buffer.byteLength(search) < 150_000, "ranked-search HTML should stay below 150 KB");
  assert.match(search, /<meta name="robots" content="noindex, follow"/);
  assert.equal((search.match(/class="exam-card"/g) ?? []).length, 12, "search should render its first page before JavaScript");
  assert.match(home, /36<!-- -->\/36<\/strong><span>states &amp; UTs represented/);
  assert.equal((home.match(/class="exam-card"/g) ?? []).length, 0, "home should not render the full interactive catalogue");
  assert.match(homeSource, /action="\/search"/);
  assert.doesNotMatch(homeSource, /ExamExplorer/);

  assert.match(tamilNadu, /TNPSC/);
  assert.doesNotMatch(tamilNadu, /UPSC Civil Services|IBPS Probationary Officer|RRB NTPC/);
  assert.match(stateSource, /examsForRegion\(region\.code\)/);
  assert.doesNotMatch(stateSource, /centralExams|<ExamCollection items=\{central/);

  for (const source of [collectionSource, calendarSource, updatesSource, detailSource]) {
    assert.match(source, /prefetch=\{false\}/);
  }
});

test("runs the source monitor at its actual cadence and revalidates unchanged pages", async () => {
  const [workflow, ciWorkflow, watcher] = await Promise.all([
    readFile(new URL("../.github/workflows/source-watch.yml", import.meta.url), "utf8"),
    readFile(new URL("../.github/workflows/ci.yml", import.meta.url), "utf8"),
    readFile(new URL("../tools/data/watch-sources.ts", import.meta.url), "utf8"),
  ]);

  assert.match(workflow, /cron:\s*"17 1 \* \* \*"/);
  assert.match(workflow, /git diff --exit-code -- data\/source-registry\.json/);
  assert.match(ciWorkflow, /git diff --exit-code -- data\/source-registry\.json/);
  assert.match(workflow, /steps\.watch\.outputs\.actionable == 'true'/);
  assert.match(watcher, /headers\["if-none-match"\]/);
  assert.match(watcher, /headers\["if-modified-since"\]/);
  assert.match(watcher, /response\.status === 304/);
  assert.match(watcher, /REQUEST_TIMEOUT_MS = 12_000/);
  assert.match(watcher, /MAX_CONCURRENCY = 6/);
  assert.match(watcher, /DUE_EARLY_TOLERANCE_HOURS = 6/);
});

test("global navigation avoids speculative route downloads", async () => {
  const [headerSource, footerSource] = await Promise.all([
    readFile(new URL("../components/SiteHeader.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/SiteFooter.tsx", import.meta.url), "utf8"),
  ]);
  assertNoAutomaticLinkPrefetch(headerSource, "header");
  assertNoAutomaticLinkPrefetch(footerSource, "footer");
});

test("keeps cited data, Vercel-only deployment, and class-based dark mode", async () => {
  const [packageJson, examsSource, registry, mapPaths, vercelConfig, nextConfig, themeSource, globalCss, layoutSource] = await Promise.all([
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    Promise.all(
      ["upsc", "ssc", "banking-finance", "state-south"].map((name) =>
        readFile(new URL(`../data/exams/${name}.ts`, import.meta.url), "utf8"),
      ),
    ).then((parts) => parts.join("\n")),
    readFile(new URL("../data/source-registry.json", import.meta.url), "utf8"),
    readFile(new URL("../data/geo/india-state-paths.json", import.meta.url), "utf8"),
    readFile(new URL("../vercel.json", import.meta.url), "utf8"),
    readFile(new URL("../next.config.ts", import.meta.url), "utf8"),
    readFile(new URL("../components/ThemeToggle.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
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
  assert.ok(
    JSON.parse(registry).every((authority) => authority.watchUrls.every((source) => source.cadenceHours === 24)),
    "every official source should use the daily monitoring cadence",
  );
  assert.match(mapPaths, /"shapes"/);
  assert.ok(Buffer.byteLength(mapPaths) < 100_000, "projected map payload should remain compact");
  assert.match(vercelConfig, /"framework": "nextjs"/);
  assert.match(nextConfig, /output:\s*"export"/);
  assert.match(nextConfig, /unoptimized:\s*true/);
  assert.match(themeSource, /localStorage\.setItem\(THEME_KEY, nextTheme\)/);
  assert.match(themeSource, /Switch to \$\{nextTheme\} mode/);
  assert.match(globalCss, /\.dark\s*\{[\s\S]*--paper: #0d1419/);
  assert.match(globalCss, /--map-empty: #303c43/);
  assert.match(globalCss, /@media print\s*\{[\s\S]*\.dark\s*\{/);
  assert.match(layoutSource, /suppressHydrationWarning/);
  assert.match(layoutSource, /colorScheme: "light dark"/);
  assert.match(layoutSource, /governmentexamindia\.com\/og-v2\.jpg/);

  const darkBlock = globalCss.match(/\.dark\s*\{([\s\S]*?)\n\}/)?.[1];
  assert.ok(darkBlock, "dark theme token block should exist");
  for (const [foreground, background] of [
    ["muted", "surface-solid"],
    ["blue", "surface-solid"],
    ["green", "green-soft"],
    ["amber", "amber-soft"],
    ["red", "red-soft"],
    ["violet", "violet-soft"],
  ]) {
    assert.ok(
      contrast(cssHexVariable(darkBlock, foreground), cssHexVariable(darkBlock, background)) >= 4.5,
      `${foreground} must remain readable on ${background}`,
    );
  }
  for (const fill of ["blue-solid", "saffron-solid", "green-solid", "red-solid"]) {
    assert.ok(contrast("#ffffff", cssHexVariable(darkBlock, fill)) >= 4.5, `white text must remain readable on ${fill}`);
  }

  await access(new URL("../out/athena.svg", import.meta.url));
  const socialPreview = await stat(new URL("../out/og-v2.jpg", import.meta.url));
  assert.ok(socialPreview.size < 300_000, "social preview should remain below 300 KB");
  await assert.rejects(access(new URL("../out/og.jpg", import.meta.url)));
  await assert.rejects(access(new URL("../out/og.png", import.meta.url)));
  await assert.rejects(access(new URL("../.openai/hosting.json", import.meta.url)));
  await assert.rejects(access(new URL("../vite.config.ts", import.meta.url)));
  await assert.rejects(access(new URL("../worker/index.ts", import.meta.url)));
});

test("keeps display typography compact and makes navigational cards fully clickable", async () => {
  const [globalCss, explorerSource, collectionSource, updatesSource] = await Promise.all([
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../components/ExamExplorer.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/ExamCollection.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/updates/page.tsx", import.meta.url), "utf8"),
  ]);

  assert.match(globalCss, /--type-hero:\s*clamp\(2\.75rem,\s*3\.4vw,\s*4rem\)/);
  assert.match(globalCss, /--type-page-title:\s*clamp\(2\.25rem,\s*2\.8vw,\s*3\.25rem\)/);
  assert.match(globalCss, /--type-section-title:\s*clamp\(1\.75rem,\s*2vw,\s*2\.5rem\)/);
  assert.match(globalCss, /--section-space:\s*clamp\(3\.5rem,\s*5vw,\s*4rem\)/);
  assert.match(globalCss, /\.stretched-card-link::after\s*\{[\s\S]*?position:\s*absolute;[\s\S]*?inset:\s*0;/);
  assert.match(globalCss, /\.save-button[\s\S]*?z-index:\s*2;/);
  assert.match(globalCss, /\.detail-layout\s*>\s*\*\s*\{[\s\S]*?min-width:\s*0;/);

  assert.match(explorerSource, /className="stretched-card-link"/);
  assert.doesNotMatch(explorerSource, /Full exam details/);
  assert.match(collectionSource, /<Link[\s\S]*?className="collection-card"/);
  assert.doesNotMatch(collectionSource, /View exam/);
  assert.match(updatesSource, /className="stretched-card-link"/);
  assert.match(updatesSource, /className="update-method-card"/);
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
  const updatesHtml = await updates.text();
  assert.match(await calendar.text(), /One national timeline/);
  assert.match(await method.text(), /How exam information is updated/);
  assert.match(updatesHtml, /Corrections &amp; changes/);
  assert.match(updatesHtml, /<time dateTime="2026-08">Aug 2026<\/time>/);
  assert.ok(
    updatesHtml.indexOf("Aug 2026") < updatesHtml.indexOf("28 Jul 2026") &&
      updatesHtml.indexOf("28 Jul 2026") < updatesHtml.indexOf("20 Jul 2026") &&
      updatesHtml.indexOf("20 Jul 2026") < updatesHtml.indexOf("10 Jul 2026") &&
      updatesHtml.indexOf("10 Jul 2026") < updatesHtml.indexOf("6 Apr 2026"),
    "updates must be newest-first by ISO date rather than display-label text",
  );
  assert.match(await states.text(), /28 states · 8 union territories/);
  assert.match(await tamilNadu.text(), /Tamil Nadu(?:<!-- -->)? exams/);
  assert.match(await types.text(), /Browse by work/);
  assert.match(await railways.text(), /RRB NTPC/);
});
