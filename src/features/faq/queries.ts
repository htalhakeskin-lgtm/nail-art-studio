import "server-only";

import { asc, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

import { db } from "@/server/db/client";
import { faqs } from "@/server/db/schema";
import { logger } from "@/server/logger";

import { faqCategories, type FaqCategory } from "./schemas";

/** Every FAQ mutation calls updateTag(FAQ_TAG). */
export const FAQ_TAG = "faqs";

export type Faq = typeof faqs.$inferSelect;
export type FaqGroup = { category: FaqCategory; items: Pick<Faq, "id" | "question" | "answer">[] };

const byCategoryThenOrder = (a: Faq, b: Faq) =>
  faqCategories.indexOf(a.category) - faqCategories.indexOf(b.category) ||
  a.sortOrder - b.sortOrder;

/** Public page (SCR-011): visible questions grouped by category, cached for every visitor. */
export async function getVisibleFaqGroups(): Promise<FaqGroup[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(FAQ_TAG);

  try {
    const rows = await db.select().from(faqs).where(eq(faqs.isVisible, true));
    const sorted = rows.toSorted(byCategoryThenOrder);
    return faqCategories
      .map((category) => ({
        category,
        items: sorted
          .filter((row) => row.category === category)
          .map(({ id, question, answer }) => ({ id, question, answer })),
      }))
      .filter((group) => group.items.length > 0);
  } catch (error) {
    // The page still renders (empty state) if the database is unreachable at build time.
    logger.error("faqs.read_failed", { error: String(error) });
    return [];
  }
}

/** Panel list: every question including hidden ones, never cached. */
export async function listFaqsForPanel(): Promise<Faq[]> {
  const rows = await db.select().from(faqs).orderBy(asc(faqs.sortOrder));
  return rows.toSorted(byCategoryThenOrder);
}

export async function getFaqForPanel(id: string): Promise<Faq | null> {
  const [row] = await db.select().from(faqs).where(eq(faqs.id, id)).limit(1);
  return row ?? null;
}
