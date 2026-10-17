import { sql } from "drizzle-orm";
import { check, jsonb, pgTable, text } from "drizzle-orm/pg-core";

import { timestamps } from "../columns";

/**
 * Editable page copy (plan §9 `content_blocks`, Z-31): one row per block, value shaped by the
 * block's Zod schema in src/features/content/schemas.ts. Missing or malformed rows fall back to
 * src/content/content-blocks.ts, so a fresh database still renders the site.
 */
export const contentBlocks = pgTable(
  "content_blocks",
  {
    key: text().primaryKey(), // "about", "home.hero", "hygiene" …
    value: jsonb().$type<Record<string, unknown>>().notNull(),
    ...timestamps,
  },
  (table) => [check("ck_content_blocks_key", sql`${table.key} ~ '^[a-z]+(\\.[a-z-]+)*$'`)],
);
