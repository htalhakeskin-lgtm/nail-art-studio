import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import {
  GALLERY_COLORS,
  GALLERY_LENGTHS,
  GALLERY_STYLES,
  GALLERY_TECHNIQUES,
} from "@/config/gallery";

import { id, timestamps } from "../columns";
import { mediaAssets } from "./media";

const list = (values: readonly string[]) => sql.raw(values.map((value) => `'${value}'`).join(", "));

/**
 * Gallery works (plan §9 `gallery_items`, K-29). Every work has one style, one or more colours
 * and a length (the public filters) plus the technique shown on its label. Images are
 * pre-encoded WebP variants under `image_path` (K-21); uploads and before / after pairs join
 * with D-09 (`media_assets`).
 */
export const galleryItems = pgTable(
  "gallery_items",
  {
    id: id(),
    // BR-GLR-004: an identity column never hands out the same number twice, even after a delete.
    number: integer().notNull().generatedAlwaysAsIdentity(),
    slug: text().notNull(),
    title: text().notNull(),
    description: text(),
    style: text({ enum: GALLERY_STYLES }).notNull(),
    colors: text({ enum: GALLERY_COLORS }).array().notNull(),
    length: text({ enum: GALLERY_LENGTHS }).notNull(),
    technique: text({ enum: GALLERY_TECHNIQUES }).notNull(),
    durationMinutes: integer(),
    /** Public path without width and extension: "/demo/galeri-..." → "...-960.webp" (K-21). */
    imagePath: text().notNull(),
    imageWidth: integer().notNull(),
    imageHeight: integer().notNull(),
    imageAlt: text().notNull(),
    mediaId: uuid().references(() => mediaAssets.id, { onDelete: "set null" }),
    /** Optional "before" photo of the same hand (V-07); same 4:5 crop as the work (BR-GLR-001). */
    beforeImagePath: text(),
    beforeImageAlt: text(),
    beforeMediaId: uuid().references(() => mediaAssets.id, { onDelete: "set null" }),
    /** Stock photo credit (demo); empty for the studio's own work. */
    creditName: text(),
    creditUrl: text(),
    instagramUrl: text(),
    /** Stock / sample image rather than the studio's own work (RSK-01). */
    isRepresentative: boolean().notNull().default(false),
    consentObtainedAt: timestamp({ withTimezone: true, mode: "date" }),
    isFeatured: boolean().notNull().default(false),
    isPublished: boolean().notNull().default(false),
    sortOrder: integer().notNull().default(0),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("ux_gallery_items_slug").on(table.slug),
    uniqueIndex("ux_gallery_items_number").on(table.number),
    index("ix_gallery_items_published_sort").on(table.isPublished, table.sortOrder),
    check("ck_gallery_items_style", sql`${table.style} in (${list(GALLERY_STYLES)})`),
    check(
      "ck_gallery_items_colors",
      sql`cardinality(${table.colors}) > 0 and ${table.colors} <@ array[${list(GALLERY_COLORS)}]::text[]`,
    ),
    check("ck_gallery_items_length", sql`${table.length} in (${list(GALLERY_LENGTHS)})`),
    check("ck_gallery_items_technique", sql`${table.technique} in (${list(GALLERY_TECHNIQUES)})`),
    // BR-GLR-003: a client's own photo is never published without recorded consent.
    check(
      "ck_gallery_items_consent",
      sql`not ${table.isPublished} or ${table.isRepresentative} or ${table.consentObtainedAt} is not null`,
    ),
    // BR-GLR-001: a before photo always comes with its alt text.
    check(
      "ck_gallery_items_before",
      sql`(${table.beforeImagePath} is null) = (${table.beforeImageAlt} is null)`,
    ),
    check("ck_gallery_items_slug", sql`${table.slug} ~ '^[a-z0-9]+(-[a-z0-9]+)*$'`),
  ],
);
