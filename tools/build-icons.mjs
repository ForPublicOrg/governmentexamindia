import { createRequire } from "node:module";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

/**
 * Raster icons are generated from `public/favicon.svg` so the tab icon, the
 * header logo, the iOS home-screen icon and the installed-app icons can never
 * drift apart. iOS and Android ignore SVG, which is the only reason PNGs exist.
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

const source = readFileSync(new URL("../public/favicon.svg", import.meta.url), "utf8");

/**
 * Android crops an installed app's icon to the launcher's own shape (circle,
 * squircle, ...) and only promises to keep the centre 80% circle. The favicon
 * is a rounded tile with transparent corners, so the maskable variant fills the
 * whole square with the tile colour and scales the artwork into that safe zone.
 */
function maskable(svg) {
  const tile = svg.match(/<rect x="2" y="2" width="60" height="60" rx="15" fill="(#[0-9A-Fa-f]{6})" \/>/);
  if (!tile) throw new Error("public/favicon.svg no longer has the 60x60 tile the maskable icon is built from");
  const artwork = svg.slice(tile.index + tile[0].length, svg.lastIndexOf("</svg>"));
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">` +
    `<rect width="64" height="64" fill="${tile[1]}" />` +
    `<g transform="translate(32 32) scale(0.78) translate(-32 -32)">${artwork}</g>` +
    `</svg>`
  );
}

const targets = [
  { file: "apple-touch-icon.png", size: 180, svg: source },
  { file: "icon-192.png", size: 192, svg: source },
  { file: "icon-512.png", size: 512, svg: source },
  { file: "icon-maskable-512.png", size: 512, svg: maskable(source) },
];

await Promise.all(
  targets.map(async ({ file, size, svg }) => {
    await sharp(Buffer.from(svg), { density: 1200 })
      .resize(size, size, { fit: "contain" })
      .png()
      .toFile(fileURLToPath(new URL(`../public/${file}`, import.meta.url)));
    console.log(`wrote public/${file} (${size}px)`);
  }),
);
