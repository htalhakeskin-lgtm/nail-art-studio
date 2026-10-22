import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { PRICE_DISPLAY_MODES, SERVICE_CATEGORIES } from "@/config/services";

import { id, money, timestamps } from "../columns";

const list = (values: readonly string[]) => sql.raw(values.map((value) => `'${value}'`).join(", "));

export type ServiceFaq = { question: string; answer: string };

/**
 * Service menu (plan §9 `services`, REQ-004). Prices are stored in kuruş but hidden while P-08
 * is "contact" (K-05, BR-HZM-001); a service may override the global setting. Hidden services
 * (is_active = false) leave the site and the booking flow (BR-RND-014).
 */
export const services = pgTable(
  "services",
  {
    id: id(),
    slug: text().notNull(),
    name: text().notNull(),
    category: text({ enum: SERVICE_CATEGORIES }).notNull(),
    summary: text().notNull(),
    suitableFor: text(), // Markdown
    body: text(), // Markdown: how the appointment goes
    aftercare: text(), // Markdown
    durabilityText: text(),
    durationMinutes: integer().notNull(),
    refillIntervalDays: integer(),
    priceMinor: money(),
    priceDisplayOverride: text({ enum: PRICE_DISPLAY_MODES }),
    faqs: jsonb().$type<ServiceFaq[]>().notNull().default([]),
    coverImagePath: text(), // pre-encoded demo image (K-21); media_assets join with D-09
    isBookable: boolean().notNull().default(true),
    isActive: boolean().notNull().default(true),
    sortOrder: integer().notNull().default(0),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("ux_services_slug").on(table.slug),
    index("ix_services_category_sort").on(table.category, table.sortOrder),
    check("ck_services_category", sql`${table.category} in (${list(SERVICE_CATEGORIES)})`),
    check(
      "ck_services_price_display",
      sql`${table.priceDisplayOverride} is null or ${table.priceDisplayOverride} in (${list(PRICE_DISPLAY_MODES)})`,
    ),
    // BR-HZM-002: Turkish ASCII kebab-case.
    check("ck_services_slug", sql`${table.slug} ~ '^[a-z0-9]+(-[a-z0-9]+)*$'`),
    check("ck_services_duration", sql`${table.durationMinutes} between 5 and 600`),
    check(
      "ck_services_refill",
      sql`${table.refillIntervalDays} is null or ${table.refillIntervalDays} between 1 and 365`,
    ),
    check("ck_services_price", sql`${table.priceMinor} is null or ${table.priceMinor} >= 0`),
  ],
);
