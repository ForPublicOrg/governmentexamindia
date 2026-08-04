import { writeFileSync } from "node:fs";
import { authorities } from "../../lib/exams";

/**
 * `data/source-registry.json` is derived from the `authorities` each data
 * module declares, so parallel edits to different modules never conflict on a
 * shared JSON file. Run via `npm run data:registry` (part of prebuild).
 */
const registry = authorities.map((authority) => ({
  id: authority.id,
  name: authority.name,
  level: authority.level,
  ...(authority.regionCodes?.length ? { regionCodes: authority.regionCodes } : {}),
  allowedHosts: authority.allowedHosts,
  watchUrls: authority.watchUrls.map((url, index) => ({
    id: `${authority.id}-${index + 1}`,
    url,
    cadenceHours: 24,
  })),
}));

writeFileSync("data/source-registry.json", `${JSON.stringify(registry, null, 2)}\n`);
console.log(`Wrote data/source-registry.json with ${registry.length} authorities.`);
