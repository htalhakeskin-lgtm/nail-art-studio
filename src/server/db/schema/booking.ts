import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  jsonb,
  pgTable,
  text,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

import { APPOINTMENT_SOURCES, APPOINTMENT_STATUSES, TIME_OFF_KINDS } from "@/config/booking";

import { createdAt, id, instant, timestamps } from "../columns";
import { galleryItems } from "./gallery";
import { services } from "./services";

const list = (values: readonly string[]) => sql.raw(values.map((value) => `'${value}'`).join(", "));

/**
 * The expert (plan §9 `staff`, K-14). One row today; appointments and closures already point
 * at a staff member, so a second expert never changes the schema.
 */
export const staff = pgTable(
  "staff",
  {
    id: id(),
    name: text().notNull(),
    slug: text().notNull(),
    title: text(),
    isActive: boolean().notNull().default(true),
    ...timestamps,
  },
  (table) => [uniqueIndex("ux_staff_slug").on(table.slug)],
);

/** Leave, public holidays and blocks (BR-RND-002). Half-open [starts_at, ends_at). */
export const timeOff = pgTable(
  "time_off",
  {
    id: id(),
    staffId: uuid()
      .notNull()
      .references(() => staff.id, { onDelete: "cascade" }),
    startsAt: instant().notNull(),
    endsAt: instant().notNull(),
    kind: text({ enum: TIME_OFF_KINDS }).notNull(),
    note: text(),
    ...createdAt,
  },
  (table) => [
    index("ix_time_off_staff_starts").on(table.staffId, table.startsAt),
    check("ck_time_off_range", sql`${table.startsAt} < ${table.endsAt}`),
    check("ck_time_off_kind", sql`${table.kind} in (${list(TIME_OFF_KINDS)})`),
  ],
);

/**
 * Appointments (plan §9). `blocked_until` = end + cleaning buffer (P-01); the exclusion
 * constraint ex_appointments_staff_overlap (custom migration) keeps
 * [starts_at, blocked_until) of slot-holding appointments from overlapping (BR-RND-003).
 */
export const appointments = pgTable(
  "appointments",
  {
    id: id(),
    code: text().notNull(),
    staffId: uuid()
      .notNull()
      .references(() => staff.id),
    serviceId: uuid()
      .notNull()
      .references(() => services.id),
    startsAt: instant().notNull(),
    endsAt: instant().notNull(),
    blockedUntil: instant().notNull(),
    status: text({ enum: APPOINTMENT_STATUSES }).notNull(),
    customerName: text().notNull(),
    customerPhone: text().notNull(), // E.164
    customerEmail: text(),
    note: text(),
    preferredChannel: text(),
    referenceGalleryItemId: uuid().references(() => galleryItems.id, { onDelete: "set null" }),
    source: text({ enum: APPOINTMENT_SOURCES }).notNull(),
    utm: jsonb().$type<Record<string, string>>(),
    manageTokenHash: text(),
    manageTokenExpiresAt: instant(),
    confirmedAt: instant(),
    cancelledAt: instant(),
    cancelledBy: text(), // customer, admin
    cancelReason: text(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("ux_appointments_code").on(table.code),
    uniqueIndex("ux_appointments_manage_token").on(table.manageTokenHash),
    index("ix_appointments_staff_starts").on(table.staffId, table.startsAt),
    index("ix_appointments_status_starts").on(table.status, table.startsAt),
    index("ix_appointments_phone").on(table.customerPhone),
    index("ix_appointments_service").on(table.serviceId),
    check("ck_appointments_status", sql`${table.status} in (${list(APPOINTMENT_STATUSES)})`),
    check("ck_appointments_source", sql`${table.source} in (${list(APPOINTMENT_SOURCES)})`),
    check(
      "ck_appointments_range",
      sql`${table.startsAt} < ${table.endsAt} and ${table.endsAt} <= ${table.blockedUntil}`,
    ),
  ],
);
