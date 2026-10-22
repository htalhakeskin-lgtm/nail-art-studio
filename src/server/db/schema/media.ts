import { sql } from "drizzle-orm";
import { check, customType, index, integer, pgTable, text } from "drizzle-orm/pg-core";

import { createdAt, id } from "../columns";

const bytea = customType<{ data: Buffer; driverData: Buffer }>({
  dataType: () => "bytea",
});

export const MEDIA_DRIVERS = ["blob", "db"] as const;

/**
 * Uploaded images (plan §9 `media_assets`, BR-GLR-002, K-39). `base_path` is what pages store
 * and the image loader extends with "-<width>.webp": a Vercel Blob URL in production, or
 * "/media/<id>" served from `media_files` where no Blob store is configured (local, CI).
 */
export const mediaAssets = pgTable(
  "media_assets",
  {
    id: id(),
    basePath: text().notNull(),
    driver: text({ enum: MEDIA_DRIVERS }).notNull(),
    width: integer().notNull(),
    height: integer().notNull(),
    originalBytes: integer().notNull(),
    originalMime: text().notNull(),
    uploadedBy: text().notNull(),
    ...createdAt,
  },
  (table) => [
    check("ck_media_assets_driver", sql`${table.driver} in ('blob', 'db')`),
    index("ix_media_assets_created").on(table.createdAt),
  ],
);

/** Encoded variants for the "db" driver only: "<asset id>-480.webp" → bytes. */
export const mediaFiles = pgTable("media_files", {
  key: text().primaryKey(),
  content: bytea().notNull(),
  contentType: text().notNull(),
  ...createdAt,
});
