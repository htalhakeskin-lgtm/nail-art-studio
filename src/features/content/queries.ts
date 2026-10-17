import "server-only";

import { eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

import { contentBlockDefaults } from "@/content/content-blocks";
import { db } from "@/server/db/client";
import { contentBlocks } from "@/server/db/schema";
import { logger } from "@/server/logger";

import { type ContentBlock, type ContentBlockKey, contentBlockSchemas } from "./schemas";

/** Panel edits call updateTag(contentBlockTag(key)) (D-01b). */
export const contentBlockTag = (key: ContentBlockKey) => `content-block:${key}`;

export function parseContentBlock<K extends ContentBlockKey>(
  key: K,
  value: unknown,
): ContentBlock<K> {
  const parsed = contentBlockSchemas[key].safeParse(value);
  if (parsed.success) return parsed.data;
  logger.warn("content_block.invalid", { key });
  return contentBlockSchemas[key].parse(contentBlockDefaults[key]);
}

/** Cached for every visitor; falls back to the defaults when the row is missing. */
export async function getContentBlock<K extends ContentBlockKey>(key: K): Promise<ContentBlock<K>> {
  "use cache";
  cacheLife("hours");
  cacheTag(contentBlockTag(key));

  try {
    const [row] = await db
      .select({ value: contentBlocks.value })
      .from(contentBlocks)
      .where(eq(contentBlocks.key, key))
      .limit(1);
    return parseContentBlock(key, row?.value ?? contentBlockDefaults[key]);
  } catch (error) {
    logger.error("content_block.read_failed", { key, error: String(error) });
    return parseContentBlock(key, contentBlockDefaults[key]);
  }
}
