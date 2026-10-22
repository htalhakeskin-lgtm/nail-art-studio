import "server-only";

import { and, asc, count, desc, eq, gte, inArray, lt } from "drizzle-orm";

import { APPOINTMENT_STATUSES } from "@/config/booking";
import { db } from "@/server/db/client";
import { appointments, auditLogs, galleryItems, services } from "@/server/db/schema";

import type { AppointmentStatus } from "./domain/status";
import { addDays, istanbulDate, istanbulDateTime } from "./domain/time";

/** Panel reads are never cached: the owner must see a booking the moment it arrives. */

export type PanelAppointment = {
  id: string;
  code: string;
  status: AppointmentStatus;
  startsAt: Date;
  endsAt: Date;
  customerName: string;
  customerPhone: string;
  source: "online" | "admin";
  serviceName: string;
  hasReference: boolean;
  note: string | null;
};

const listColumns = {
  id: appointments.id,
  code: appointments.code,
  status: appointments.status,
  startsAt: appointments.startsAt,
  endsAt: appointments.endsAt,
  customerName: appointments.customerName,
  customerPhone: appointments.customerPhone,
  source: appointments.source,
  serviceName: services.name,
  referenceId: appointments.referenceGalleryItemId,
  note: appointments.note,
};

type ListRow = { referenceId: string | null } & Omit<PanelAppointment, "hasReference">;
const toPanel = ({ referenceId, ...row }: ListRow): PanelAppointment => ({
  ...row,
  hasReference: referenceId !== null,
});

/** Agenda: appointments starting in [from, to), optionally one status, in time order. */
export async function listAppointmentsForPanel(
  from: Date,
  to: Date,
  status?: AppointmentStatus,
): Promise<PanelAppointment[]> {
  const rows = await db
    .select(listColumns)
    .from(appointments)
    .innerJoin(services, eq(services.id, appointments.serviceId))
    .where(
      and(
        gte(appointments.startsAt, from),
        lt(appointments.startsAt, to),
        status ? eq(appointments.status, status) : undefined,
      ),
    )
    .orderBy(asc(appointments.startsAt));
  return rows.map(toPanel);
}

/** Pending requests still ahead, soonest first (UC-04). */
export async function listPendingForPanel(now: Date): Promise<PanelAppointment[]> {
  const rows = await db
    .select(listColumns)
    .from(appointments)
    .innerJoin(services, eq(services.id, appointments.serviceId))
    .where(and(eq(appointments.status, "pending"), gte(appointments.startsAt, now)))
    .orderBy(asc(appointments.startsAt))
    .limit(20);
  return rows.map(toPanel);
}

/** "Bugün" KPIs (A-16): today's appointments, pending approvals, this week's appointments. */
export async function getTodayKpis(now: Date) {
  const today = istanbulDate(now);
  const dayStart = istanbulDateTime(today, "00:00");
  const dayEnd = istanbulDateTime(addDays(today, 1), "00:00");
  const weekEnd = istanbulDateTime(addDays(today, 7), "00:00");
  const holding = inArray(appointments.status, ["pending", "confirmed", "completed"]);
  const [[todayCount], [pendingCount], [weekCount]] = await Promise.all([
    db
      .select({ value: count() })
      .from(appointments)
      .where(and(holding, gte(appointments.startsAt, dayStart), lt(appointments.startsAt, dayEnd))),
    db
      .select({ value: count() })
      .from(appointments)
      .where(and(eq(appointments.status, "pending"), gte(appointments.startsAt, now))),
    db
      .select({ value: count() })
      .from(appointments)
      .where(
        and(holding, gte(appointments.startsAt, dayStart), lt(appointments.startsAt, weekEnd)),
      ),
  ]);
  return {
    today: todayCount?.value ?? 0,
    pending: pendingCount?.value ?? 0,
    week: weekCount?.value ?? 0,
  };
}

/** Detail (SCR-103): the appointment, its service, reference work and history. */
export async function getAppointmentForPanel(id: string) {
  const [row] = await db
    .select({
      appointment: appointments,
      serviceName: services.name,
      serviceSlug: services.slug,
      reference: {
        slug: galleryItems.slug,
        title: galleryItems.title,
        number: galleryItems.number,
        imagePath: galleryItems.imagePath,
      },
    })
    .from(appointments)
    .innerJoin(services, eq(services.id, appointments.serviceId))
    .leftJoin(galleryItems, eq(galleryItems.id, appointments.referenceGalleryItemId))
    .where(eq(appointments.id, id))
    .limit(1);
  if (!row) return null;
  const history = await db
    .select({
      action: auditLogs.action,
      actorId: auditLogs.actorId,
      createdAt: auditLogs.createdAt,
    })
    .from(auditLogs)
    .where(and(eq(auditLogs.entity, "appointments"), eq(auditLogs.entityId, id)))
    .orderBy(desc(auditLogs.createdAt))
    .limit(20);
  return {
    ...row.appointment,
    serviceName: row.serviceName,
    serviceSlug: row.serviceSlug,
    reference: row.reference?.slug ? row.reference : null,
    history,
  };
}

export const appointmentStatuses = APPOINTMENT_STATUSES;
