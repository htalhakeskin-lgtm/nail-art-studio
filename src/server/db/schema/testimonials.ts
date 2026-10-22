import { boolean, index, integer, pgTable, text, uuid } from "drizzle-orm/pg-core";

import { id, timestamps } from "../columns";
import { services } from "./services";

/**
 * Client reviews on the home page (plan §9 `testimonials`, REQ-014, V-01). Managed in the panel
 * (SCR-107); hidden instead of deleted. Demo rows are `is_sample` and carry an "örnek yorum"
 * label; no Review / AggregateRating structured data is ever emitted for them (VR-09).
 */
export const testimonials = pgTable(
  "testimonials",
  {
    id: id(),
    displayName: text().notNull(), // first name + initial, e.g. "Ayşe K."
    body: text().notNull(),
    serviceId: uuid().references(() => services.id, { onDelete: "set null" }),
    isSample: boolean().notNull().default(true),
    isVisible: boolean().notNull().default(true),
    sortOrder: integer().notNull().default(0),
    ...timestamps,
  },
  (table) => [index("ix_testimonials_sort").on(table.sortOrder)],
);
