import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

/**
 * Raster icons are generated from `public/favicon.svg` so the tab icon, the
 * header logo and the iOS home-screen icon can never drift apart. iOS ignores
 * SVG, which is the only reason a PNG exists at all.
 *
 *   npm run icons:build
 */
/** sharp is not a direct dependency; Next ships its own copy, so try that too. */
function loadSharp() {
  for (const from of [import.meta.url, new URL("../node_modules/next/", import.meta.url)]) {
    try {
      return createRequire(from)("sharp");
    } catch {
      // Try the next resolution root.
    }
  }
  return undefined;
}

const sharp = loadSharp();
if (!sharp) {
  console.error(
    "sharp is required to regenerate icons. Install it with `npm i -D sharp`, " +
      "or edit public/favicon.svg only and leave the existing PNGs as-is.",
  );
  process.exit(1);
}

const source = readFileSync(new URL("../public/favicon.svg", import.meta.url));

const targets = [
  { file: "apple-touch-icon.png", size: 180 },
  { file: "icon-192.png", size: 192 },
  { file: "icon-512.png", size: 512 },
];

await Promise.all(
  targets.map(async ({ file, size }) => {
    await sharp(source, { density: 1200 })
      .resize(size, size, { fit: "contain" })
      .png()
      .toFile(fileURLToPath(new URL(`../public/${file}`, import.meta.url)));
    console.log(`wrote public/${file} (${size}px)`);
  }),
);
