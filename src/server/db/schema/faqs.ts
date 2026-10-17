import { sql } from "drizzle-orm";
import { boolean, check, index, integer, pgTable, text } from "drizzle-orm/pg-core";

import { FAQ_CATEGORIES } from "@/config/faq";

import { id, timestamps } from "../columns";

// Fixed category set (04-veri: text + check, no pgEnum); labels live in src/features/faq.

/**
 * Frequently asked questions (Z-10, plan §9 `faqs`). Edited in the panel (SCR-108); hidden
 * instead of deleted (plan §5: no recycle bin for a single owner).
 */
export const faqs = pgTable(
  "faqs",
  {
    id: id(),
    question: text().notNull(),
    answer: text().notNull(), // Markdown
    category: text({ enum: FAQ_CATEGORIES }).notNull(),
    sortOrder: integer().notNull().default(0),
    isVisible: boolean().notNull().default(true),
    ...timestamps,
  },
  (table) => [
    index("ix_faqs_category_sort").on(table.category, table.sortOrder),
    check(
      "ck_faqs_category",
      sql`${table.category} in (${sql.raw(FAQ_CATEGORIES.map((c) => `'${c}'`).join(", "))})`,
    ),
  ],
);
