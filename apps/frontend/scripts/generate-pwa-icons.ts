import sharp from "sharp";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const SVG_PATH = join(import.meta.dirname, "..", "public", "favicon.svg");
const OUT_DIR = join(import.meta.dirname, "..", "public");

const sizes = [
  { name: "pwa-192x192.png", size: 192 },
  { name: "pwa-512x512.png", size: 512 },
  { name: "apple-touch-icon-180x180.png", size: 180 },
];

const svgBuffer = readFileSync(SVG_PATH);

for (const { name, size } of sizes) {
  await sharp(svgBuffer)
    .resize(size, size)
    .png()
    .toFile(join(OUT_DIR, name));
  console.log(`Generated ${name}`);
}

console.log("Done.");
