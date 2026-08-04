import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import sourceRegistry from "../../data/source-registry.json";

type Snapshot = { hash: string; etag?: string; lastModified?: string; checkedAt: string };
type SnapshotFile = Record<string, Snapshot>;

const projectRoot = resolve(import.meta.dirname, "../..");
const statePath = resolve(projectRoot, "data/source-watch-state.json");
const shouldWrite = process.argv.includes("--write");
const previous = JSON.parse(await readFile(statePath, "utf8")) as SnapshotFile;
const next: SnapshotFile = { ...previous };
const results: { id: string; authority: string; state: string; url: string; detail?: string }[] = [];

function normalize(contentType: string, body: Buffer) {
  if (!contentType.includes("text/") && !contentType.includes("json") && !contentType.includes("xml")) return body;
  return Buffer.from(body.toString("utf8").replace(/\s+/g, " ").trim());
}

async function checkSource(authority: (typeof sourceRegistry)[number], source: (typeof authority.watchUrls)[number]) {
  const old = previous[source.id];
  const elapsedHours = old ? (Date.now() - Date.parse(old.checkedAt)) / 3_600_000 : Number.POSITIVE_INFINITY;
  if (elapsedHours < source.cadenceHours - 0.1) {
    results.push({ id: source.id, authority: authority.name, state: "not-due", url: source.url });
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20_000);
  try {
    const response = await fetch(source.url, {
      headers: { "user-agent": "GovernmentExamIndia source monitor (+https://governmentexamindia.com/methodology)" },
      redirect: "follow",
      signal: controller.signal,
    });
    if ([403, 405, 429].includes(response.status)) {
      results.push({ id: source.id, authority: authority.name, state: "blocked", url: source.url, detail: `HTTP ${response.status}` });
      return;
    }
    if (!response.ok) {
      results.push({ id: source.id, authority: authority.name, state: "unreachable", url: source.url, detail: `HTTP ${response.status}` });
      return;
    }

    const contentType = response.headers.get("content-type") ?? "";
    const body = normalize(contentType, Buffer.from(await response.arrayBuffer()));
    const snapshot: Snapshot = {
      hash: createHash("sha256").update(body).digest("hex"),
      etag: response.headers.get("etag") ?? undefined,
      lastModified: response.headers.get("last-modified") ?? undefined,
      checkedAt: new Date().toISOString(),
    };
    const state = !old ? "new" : old.hash === snapshot.hash ? "unchanged" : "changed";
    next[source.id] = snapshot;
    results.push({ id: source.id, authority: authority.name, state, url: source.url });
  } catch (error) {
    results.push({ id: source.id, authority: authority.name, state: "unreachable", url: source.url, detail: error instanceof Error ? error.message : String(error) });
  } finally {
    clearTimeout(timeout);
  }
}

const jobs = sourceRegistry.flatMap((authority) => authority.watchUrls.map((source) => ({ authority, source })));
for (let index = 0; index < jobs.length; index += 4) {
  await Promise.all(jobs.slice(index, index + 4).map(({ authority, source }) => checkSource(authority, source)));
}

if (shouldWrite) await writeFile(statePath, `${JSON.stringify(next, null, 2)}\n`, "utf8");
console.log(JSON.stringify({ checkedAt: new Date().toISOString(), writeState: shouldWrite, results }, null, 2));
