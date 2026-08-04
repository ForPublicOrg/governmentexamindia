import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { geoIdentity, geoPath } from "d3-geo";

const toolDirectory = dirname(fileURLToPath(import.meta.url));
const projectRoot = resolve(toolDirectory, "..");
const sourcePath = resolve(projectRoot, "data/geo/source/india-states.json");
const outputPath = resolve(projectRoot, "data/geo/india-state-paths.json");
const width = 520;
const height = 560;

function shrinkPathData(value, minDelta = 2) {
  const rings = value.match(/M[^M]*/g);
  if (!rings) return value;
  let output = "";

  for (const ring of rings) {
    const commandPattern = /([MLZ])([^MLZ]*)/g;
    let piece = "";
    let kept = 0;
    let lastX = Number.NaN;
    let lastY = Number.NaN;
    let match;

    while ((match = commandPattern.exec(ring))) {
      const command = match[1];
      if (command === "Z") {
        piece += "Z";
        continue;
      }

      const [x, y] = match[2].split(",").map(Number);
      if (command === "M") {
        piece += `M${x},${y}`;
        lastX = x;
        lastY = y;
        continue;
      }

      if (Math.abs(x - lastX) + Math.abs(y - lastY) < minDelta) continue;
      piece += `L${x},${y}`;
      kept += 1;
      lastX = x;
      lastY = y;
    }

    output += kept >= 2 ? piece : ring;
  }

  return output;
}

const featureCollection = JSON.parse(readFileSync(sourcePath, "utf8"));
const projection = geoIdentity().reflectY(true).fitSize([width, height], featureCollection);
const path = geoPath(projection).digits(0);
const shapes = featureCollection.features.map((feature) => {
  const [cx, cy] = path.centroid(feature);
  return {
    name: feature.properties.ST_NM,
    d: shrinkPathData(path(feature) || ""),
    cx: Number.isFinite(cx) ? Math.round(cx) : 0,
    cy: Number.isFinite(cy) ? Math.round(cy) : 0,
  };
});

mkdirSync(dirname(outputPath), { recursive: true });
writeFileSync(outputPath, `${JSON.stringify({ width, height, shapes })}\n`, "utf8");
console.log(`Generated ${shapes.length} state and union-territory paths at ${outputPath}`);
