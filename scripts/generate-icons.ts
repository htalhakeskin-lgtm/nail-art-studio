/**
 * Raster icons from src/app/icon.svg (Z-19). Run after changing the SVG: pnpm tsx scripts/generate-icons.ts
 * Outputs are committed: src/app/apple-icon.png (180), public/icons/icon-{192,512}.png and a
 * maskable 512 with safe-zone padding.
 */
import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

const root = process.cwd();
const BACKGROUND = "#f7a9cb";

async function main() {
  const svg = await readFile(path.join(root, "src/app/icon.svg"));
  await mkdir(path.join(root, "public/icons"), { recursive: true });

  await sharp(svg, { density: 600 })
    .resize(180, 180)
    .png()
    .toFile(path.join(root, "src/app/apple-icon.png"));
  for (const size of [192, 512]) {
    await sharp(svg, { density: 600 })
      .resize(size, size)
      .png()
      .toFile(path.join(root, `public/icons/icon-${String(size)}.png`));
  }

  // Maskable: the mark sits inside the central 80 % safe zone on a full-bleed background.
  const inner = await sharp(svg, { density: 600 }).resize(368, 368).png().toBuffer();
  await sharp({ create: { width: 512, height: 512, channels: 4, background: BACKGROUND } })
    .composite([{ input: inner, gravity: "center" }])
    .png()
    .toFile(path.join(root, "public/icons/icon-maskable-512.png"));

  console.log("✓ İkonlar üretildi");
}

void main();
