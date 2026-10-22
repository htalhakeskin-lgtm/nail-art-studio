import "server-only";

import sharp, { type Metadata } from "sharp";

import { IMAGE_WIDTHS } from "@/lib/image-loader";

/**
 * BR-GLR-002 image pipeline: the file's first bytes decide the type (never the name or the
 * browser's claim), the image is decoded and re-encoded, so EXIF / GPS and anything hidden in
 * the original never reach the site. Works are cropped to 4:5 like the rest of the gallery,
 * which also keeps a before / after pair the same shape (BR-GLR-001).
 */
export type ImageType = "jpeg" | "png" | "webp";

export function detectImageType(bytes: Uint8Array): ImageType | null {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "jpeg";
  }
  const png = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (png.every((byte, index) => bytes[index] === byte)) return "png";
  const ascii = (from: number, to: number) => String.fromCharCode(...bytes.slice(from, to));
  if (bytes.length >= 12 && ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "webp";
  return null;
}

export const MIN_UPLOAD_WIDTH = 600;
const MAX_WIDTH = 1280;
const ASPECT = 5 / 4; // height / width

export type EncodedImage = {
  width: number;
  height: number;
  variants: { width: number; content: Buffer }[];
};

export class ImageRejected extends Error {}

/** Decode, auto-rotate, crop to 4:5 (no upscaling), encode WebP variants at 480 / 960 / 1600. */
export async function encodeGalleryImage(bytes: Uint8Array): Promise<EncodedImage> {
  let meta: Metadata;
  try {
    meta = await sharp(bytes, { failOn: "error" }).metadata();
  } catch {
    throw new ImageRejected("Dosya açılamadı. Lütfen başka bir fotoğraf deneyin.");
  }
  const oriented = meta.orientation && meta.orientation >= 5;
  const sourceWidth = oriented ? meta.height : meta.width;
  const sourceHeight = oriented ? meta.width : meta.height;
  if (sourceWidth < MIN_UPLOAD_WIDTH) {
    throw new ImageRejected(
      `Fotoğraf en az ${String(MIN_UPLOAD_WIDTH)} piksel genişliğinde olmalı.`,
    );
  }
  // Largest 4:5 box that fits the source, capped at 1280 × 1600.
  const width = Math.min(MAX_WIDTH, sourceWidth, Math.floor(sourceHeight / ASPECT));
  const height = Math.round(width * ASPECT);
  const master = await sharp(bytes)
    .rotate()
    .resize(width, height, { fit: "cover", position: "attention" })
    .toBuffer();
  const variants = await Promise.all(
    IMAGE_WIDTHS.map(async (target) => ({
      width: target,
      content: await sharp(master)
        .resize({ width: Math.min(target, width), withoutEnlargement: true })
        .webp({ quality: 80, effort: 5 })
        .toBuffer(),
    })),
  );
  return { width, height, variants };
}
