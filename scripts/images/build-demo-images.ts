/**
 * Encodes the demo images listed in src/content/demo-images.ts (17-icerik §5, U-21).
 *   pnpm tsx scripts/images/build-demo-images.ts <download-dir>
 * <download-dir>/<sourceId>/original.jpg is the licensed file (kept out of the repository).
 * Output: public/demo/<name>-{480,960,1600}.webp — cover crop, no upscaling, metadata stripped.
 */
import { mkdir } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

import { demoImages } from "../../src/content/demo-images";
import { IMAGE_WIDTHS } from "../../src/lib/image-loader";

async function main() {
  const downloads = process.argv[2];
  if (!downloads) throw new Error("Usage: build-demo-images.ts <download-dir>");
  const out = path.join(process.cwd(), "public");
  await mkdir(path.join(out, "demo"), { recursive: true });

  for (const [key, image] of Object.entries(demoImages)) {
    const input = path.join(downloads, image.source.sourceId, "original.jpg");
    // sharp drops EXIF / XMP unless withMetadata() is called (U-13: location data never leaks).
    const master = await sharp(input)
      .rotate()
      .resize(image.width, image.height, { fit: "cover", position: image.position })
      .toBuffer();

    for (const width of IMAGE_WIDTHS) {
      const file = path.join(out, `${image.src}-${String(width)}.webp`);
      const info = await sharp(master)
        .resize({ width: Math.min(width, image.width), withoutEnlargement: true })
        .webp({ quality: 78, effort: 6 })
        .toFile(file);
      console.log(
        `✓ ${key} ${String(width)} → ${String(info.width)}×${String(info.height)} ${String(Math.round(info.size / 1024))} KB`,
      );
    }
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
