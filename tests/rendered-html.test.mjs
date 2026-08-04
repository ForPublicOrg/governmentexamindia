import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
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
  assert.match(html, /Find the right government exam/);
  assert.match(html, /IBPS Probationary Officer/);
  assert.match(html, /SSC Combined Graduate Level/);
  assert.match(html, /BPSC Integrated 72nd/);
  assert.match(html, /Checked <strong>4 Aug 2026/);
});

test("keeps cited data, Vercel-only deployment, and class-based dark mode", async () => {
  const [packageJson, examsSource, registry, mapPaths, vercelConfig, themeSource, globalCss, layoutSource] = await Promise.all([
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../lib/exams.ts", import.meta.url), "utf8"),
    readFile(new URL("../data/source-registry.json", import.meta.url), "utf8"),
    readFile(new URL("../data/geo/india-state-paths.json", import.meta.url), "utf8"),
    readFile(new URL("../vercel.json", import.meta.url), "utf8"),
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
  assert.match(mapPaths, /"shapes"/);
  assert.ok(Buffer.byteLength(mapPaths) < 100_000, "projected map payload should remain compact");
  assert.match(vercelConfig, /"framework": "nextjs"/);
  assert.match(themeSource, /localStorage\.setItem\(THEME_KEY, nextTheme\)/);
  assert.match(themeSource, /Switch to \$\{nextTheme\} mode/);
  assert.match(globalCss, /\.dark\s*\{[\s\S]*--paper: #0d1419/);
  assert.match(globalCss, /--map-empty: #303c43/);
  assert.match(globalCss, /@media print\s*\{[\s\S]*\.dark\s*\{/);
  assert.match(layoutSource, /suppressHydrationWarning/);
  assert.match(layoutSource, /colorScheme: "light dark"/);

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
