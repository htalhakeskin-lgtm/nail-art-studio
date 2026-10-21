import "server-only";

import { asc, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

import { db } from "@/server/db/client";
import { galleryItems } from "@/server/db/schema";
import { logger } from "@/server/logger";

/** Every gallery mutation calls updateTag(GALLERY_TAG). */
export const GALLERY_TAG = "gallery";

export type GalleryRow = typeof galleryItems.$inferSelect;

/** What public pages need: no consent dates, flags or timestamps leave the server. */
const publicColumns = {
  id: galleryItems.id,
  number: galleryItems.number,
  slug: galleryItems.slug,
  title: galleryItems.title,
  description: galleryItems.description,
  style: galleryItems.style,
  colors: galleryItems.colors,
  length: galleryItems.length,
  technique: galleryItems.technique,
  durationMinutes: galleryItems.durationMinutes,
  imagePath: galleryItems.imagePath,
  imageWidth: galleryItems.imageWidth,
  imageHeight: galleryItems.imageHeight,
  imageAlt: galleryItems.imageAlt,
  creditName: galleryItems.creditName,
  creditUrl: galleryItems.creditUrl,
  instagramUrl: galleryItems.instagramUrl,
  isRepresentative: galleryItems.isRepresentative,
  isFeatured: galleryItems.isFeatured,
  updatedAt: galleryItems.updatedAt,
};

export type GalleryItem = Pick<GalleryRow, keyof typeof publicColumns>;

/** Public gallery (SCR-004 / 005, home "Seçki"): published works in gallery order, cached. */
export async function listPublishedGalleryItems(): Promise<GalleryItem[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(GALLERY_TAG);

  try {
    return await db
      .select(publicColumns)
      .from(galleryItems)
      .where(eq(galleryItems.isPublished, true))
      .orderBy(asc(galleryItems.sortOrder), asc(galleryItems.number));
  } catch (error) {
    // Pages still render (empty state) if the database is unreachable at build time.
    logger.error("gallery.read_failed", { error: String(error) });
    return [];
  }
}

/** Panel list (SCR-106): every work including drafts, never cached. */
export async function listGalleryItemsForPanel(): Promise<GalleryRow[]> {
  return db
    .select()
    .from(galleryItems)
    .orderBy(asc(galleryItems.sortOrder), asc(galleryItems.number));
}
