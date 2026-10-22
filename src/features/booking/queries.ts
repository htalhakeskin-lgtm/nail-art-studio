import "server-only";

import { and, asc, eq, gt, inArray, lt, ne } from "drizzle-orm";

import { SLOT_HOLDING_STATUSES } from "@/config/booking";
import { getSiteSettings } from "@/features/site";
import { db } from "@/server/db/client";
import { appointments, galleryItems, services, staff, timeOff } from "@/server/db/schema";

import type { AvailabilityContext, Interval } from "./domain/availability";
import { addDays, istanbulDate, istanbulDateTime } from "./domain/time";
import { timeOffKindLabels } from "./schemas";

/**
 * Availability reads are never cached: a slot taken a second ago must disappear at once. They
 * run on request (Suspense hole or dynamic route), so the static pages around them stay fast.
 */

export type Staff = typeof staff.$inferSelect;
export type TimeOff = typeof timeOff.$inferSelect;

/** The expert who takes online bookings (single row today, K-14). */
export async function getBookableStaff(): Promise<Staff | null> {
  const [row] = await db
    .select()
    .from(staff)
    .where(eq(staff.isActive, true))
    .orderBy(asc(staff.createdAt))
    .limit(1);
  return row ?? null;
}

/**
 * Hours, rules, taken time and closures for [from, to) — the engine's whole input. When
 * rescheduling, the appointment being moved does not count as taken.
 */
export async function getAvailabilityContext(
  staffId: string,
  from: Date,
  to: Date,
  now: Date,
  excludeAppointmentId?: string,
): Promise<AvailabilityContext> {
  const [settings, busy, closures] = await Promise.all([
    getSiteSettings(),
    db
      .select({ start: appointments.startsAt, end: appointments.blockedUntil })
      .from(appointments)
      .where(
        and(
          eq(appointments.staffId, staffId),
          inArray(appointments.status, [...SLOT_HOLDING_STATUSES]),
          lt(appointments.startsAt, to),
          gt(appointments.blockedUntil, from),
          excludeAppointmentId ? ne(appointments.id, excludeAppointmentId) : undefined,
        ),
      ),
    db
      .select({ start: timeOff.startsAt, end: timeOff.endsAt })
      .from(timeOff)
      .where(and(eq(timeOff.staffId, staffId), lt(timeOff.startsAt, to), gt(timeOff.endsAt, from))),
  ]);
  return {
    weekly: settings.openingHours.weekly,
    rules: settings.booking,
    now,
    busy: busy satisfies Interval[],
    closures: closures satisfies Interval[],
  };
}

/** Panel list (SCR-104): closures that have not ended yet, soonest first. */
export async function listUpcomingTimeOff(staffId: string, now: Date): Promise<TimeOff[]> {
  return db
    .select()
    .from(timeOff)
    .where(and(eq(timeOff.staffId, staffId), gt(timeOff.endsAt, now)))
    .orderBy(asc(timeOff.startsAt));
}

/**
 * Whole days closed by leave, holidays or blocks in the next week, as "holidays" for the public
 * "open now" line (REQ-016): the owner enters a closure once, in the panel.
 */
export async function listClosedDays(now: Date): Promise<{ date: string; label: string }[]> {
  const expert = await getBookableStaff();
  if (!expert) return [];
  const today = istanbulDate(now);
  const until = istanbulDateTime(addDays(today, 8), "00:00");
  const rows = await db
    .select({ start: timeOff.startsAt, end: timeOff.endsAt, kind: timeOff.kind })
    .from(timeOff)
    .where(
      and(eq(timeOff.staffId, expert.id), lt(timeOff.startsAt, until), gt(timeOff.endsAt, now)),
    );
  const days: { date: string; label: string }[] = [];
  for (let offset = 0; offset < 8; offset += 1) {
    const date = addDays(today, offset);
    const dayStart = istanbulDateTime(date, "00:00");
    const dayEnd = istanbulDateTime(addDays(date, 1), "00:00");
    const closure = rows.find((row) => row.start <= dayStart && row.end >= dayEnd);
    if (closure) days.push({ date, label: timeOffKindLabels[closure.kind] });
  }
  return days;
}

export type ManagedAppointment = {
  id: string;
  code: string;
  status: (typeof appointments.$inferSelect)["status"];
  startsAt: Date;
  endsAt: Date;
  customerName: string;
  serviceId: string;
  serviceName: string;
  serviceSlug: string;
  refillIntervalDays: number | null;
  reference: { slug: string; title: string; number: number; imagePath: string } | null;
};

/**
 * BR-RND-009: the appointment behind a manage link, or null for an unknown or expired link.
 * The caller passes the token's hash; the raw token is never compared or stored.
 */
export async function getAppointmentByTokenHash(
  hash: string,
  now: Date,
): Promise<ManagedAppointment | null> {
  const [row] = await db
    .select({
      id: appointments.id,
      code: appointments.code,
      status: appointments.status,
      startsAt: appointments.startsAt,
      endsAt: appointments.endsAt,
      customerName: appointments.customerName,
      expiresAt: appointments.manageTokenExpiresAt,
      serviceId: services.id,
      serviceName: services.name,
      serviceSlug: services.slug,
      refillIntervalDays: services.refillIntervalDays,
      referenceSlug: galleryItems.slug,
      referenceTitle: galleryItems.title,
      referenceNumber: galleryItems.number,
      referenceImage: galleryItems.imagePath,
    })
    .from(appointments)
    .innerJoin(services, eq(services.id, appointments.serviceId))
    .leftJoin(galleryItems, eq(galleryItems.id, appointments.referenceGalleryItemId))
    .where(eq(appointments.manageTokenHash, hash))
    .limit(1);
  if (!row || !row.expiresAt || row.expiresAt <= now) return null;
  return {
    id: row.id,
    code: row.code,
    status: row.status,
    startsAt: row.startsAt,
    endsAt: row.endsAt,
    customerName: row.customerName,
    serviceId: row.serviceId,
    serviceName: row.serviceName,
    serviceSlug: row.serviceSlug,
    refillIntervalDays: row.refillIntervalDays,
    reference:
      row.referenceSlug && row.referenceTitle && row.referenceNumber && row.referenceImage
        ? {
            slug: row.referenceSlug,
            title: row.referenceTitle,
            number: row.referenceNumber,
            imagePath: row.referenceImage,
          }
        : null,
  };
}
