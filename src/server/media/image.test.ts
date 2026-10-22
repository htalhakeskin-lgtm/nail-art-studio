import sharp from "sharp";
import { describe, expect, it } from "vitest";

import { detectImageType, encodeGalleryImage, ImageRejected } from "./image";

const solid = (width: number, height: number, format: "jpeg" | "png" | "webp") =>
  sharp({ create: { width, height, channels: 3, background: "#f7a9cb" } })
    .toFormat(format)
    .toBuffer();

describe("BR-GLR-002: upload checks", () => {
  it.each(["jpeg", "png", "webp"] as const)("recognises %s by its first bytes", async (format) => {
    expect(detectImageType(await solid(20, 20, format))).toBe(format);
  });

  it("rejects anything else whatever its name says", () => {
    expect(detectImageType(new TextEncoder().encode("<svg onload=alert(1)>"))).toBeNull();
    expect(detectImageType(new TextEncoder().encode("GIF89a........"))).toBeNull();
    expect(detectImageType(new Uint8Array())).toBeNull();
  });

  it("crops to 4:5 without upscaling and writes three WebP variants", async () => {
    const image = await encodeGalleryImage(await solid(2000, 1500, "jpeg"));
    expect(image).toMatchObject({ width: 1200, height: 1500 });
    expect(image.variants.map((variant) => variant.width)).toEqual([480, 960, 1600]);
    const largest = await sharp(image.variants[2]?.content).metadata();
    expect(largest).toMatchObject({ format: "webp", width: 1200 });
  });

  it("drops EXIF and GPS data by re-encoding", async () => {
    const withExif = await sharp(await solid(900, 1200, "jpeg"))
      .withExif({ IFD0: { Copyright: "secret" }, IFD3: { GPSLatitudeRef: "N" } })
      .jpeg()
      .toBuffer();
    expect((await sharp(withExif).metadata()).exif).toBeDefined();
    const image = await encodeGalleryImage(withExif);
    const meta = await sharp(image.variants[1]?.content).metadata();
    expect(meta.exif).toBeUndefined();
  });

  it("refuses an image that is too small", async () => {
    await expect(encodeGalleryImage(await solid(400, 600, "png"))).rejects.toBeInstanceOf(
      ImageRejected,
    );
  });
});
