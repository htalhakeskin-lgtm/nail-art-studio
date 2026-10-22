"use server";

import { and, eq, inArray } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";

import { MANAGE_LINK_DAYS_AFTER } from "@/config/booking";
import { rateLimits } from "@/config/limits";
import { getSiteSettings } from "@/features/site";
import { type Fail, fail, ok } from "@/lib/result";
import { publicAction } from "@/server/action";
import { recordAudit } from "@/server/audit";
import { send } from "@/server/channels";
import { db } from "@/server/db/client";
import { appointments, services } from "@/server/db/schema";
import { logger } from "@/server/logger";

import { checkSlot } from "./domain/availability";
import { canSelfManage } from "./domain/manage";
import { describeAppointmentTime } from "./domain/messages";
import { addDays, addMinutes, istanbulDate, istanbulDateTime } from "./domain/time";
import { getAvailabilityContext } from "./queries";
import { hashManageToken } from "./server/token";

const tokenSchema = z.string().regex(/^[A-Za-z0-9_-]{43}$/);

/** The appointment behind a manage token, with what the rules need; null when unknown / expired. */
async function loadByToken(token: string, now: Date) {
  const [row] = await db
    .select({
      id: appointments.id,
      code: appointments.code,
      status: appointments.status,
      staffId: appointments.staffId,
      startsAt: appointments.startsAt,
      expiresAt: appointments.manageTokenExpiresAt,
      serviceName: services.name,
      durationMinutes: services.durationMinutes,
    })
    .from(appointments)
    .innerJoin(services, eq(services.id, appointments.serviceId))
    .where(eq(appointments.manageTokenHash, hashManageToken(token)))
    .limit(1);
  return row && row.expiresAt && row.expiresAt > now ? row : null;
}

async function notifyBusiness(
  appointmentId: string,
  data: { code: string; change: string; when: string; serviceName: string },
) {
  try {
    const settings = await getSiteSettings();
    await send({
      channel: "email",
      to: settings.contact.email,
      template: "appointmentChangedBusiness",
      data,
      relatedId: appointmentId,
    });
  } catch (error) {
    logger.error("appointment.notify_failed", { appointmentId, error: String(error) });
  }
}

/**
 * UC-03 cancel (BR-RND-007, 009): only with the manage link, only until P-05 hours before the
 * start, only from pending / confirmed (the WHERE clause also stops double submits).
 */
export const cancelByToken = publicAction({
  schema: z.object({
    token: tokenSchema,
    reason: z.string().trim().max(300, "En fazla 300 karakter yazabilirsiniz."),
  }),
  rateLimit: rateLimits.publicForm,
  handler: async ({ token, reason }, ctx) => {
    const appointment = await loadByToken(token, ctx.now);
    if (!appointment) return fail("BR-RND-009");
    const settings = await getSiteSettings();
    if (!canSelfManage(appointment, ctx.now, settings.booking.manageCutoffHours)) {
      return fail(
        appointment.status === "pending" || appointment.status === "confirmed"
          ? "BR-RND-007"
          : "BR-RND-008",
      );
    }
    const [updated] = await db
      .update(appointments)
      .set({
        status: "cancelled",
        cancelledAt: ctx.now,
        cancelledBy: "customer",
        cancelReason: reason || null,
      })
      .where(
        and(
          eq(appointments.id, appointment.id),
          inArray(appointments.status, ["pending", "confirmed"]),
        ),
      )
      .returning({ id: appointments.id });
    if (!updated) return fail("BR-RND-008");
    await recordAudit({
      actorId: "customer",
      action: "appointment.cancel",
      entity: "appointments",
      entityId: appointment.id,
      changes: { status: { from: appointment.status, to: "cancelled" } },
      ip: ctx.ip,
    });
    await notifyBusiness(appointment.id, {
      code: appointment.code,
      change: "iptal",
      when: describeAppointmentTime(appointment.startsAt),
      serviceName: appointment.serviceName,
    });
    return ok({ cancelled: true });
  },
});

/**
 * UC-03 reschedule (BR-RND-012): the new time runs through BR-RND-001…005 again with the
 * appointment's own slot freed; the code stays; in "request" mode it waits for approval again.
 */
export const rescheduleByToken = publicAction({
  schema: z.object({
    token: tokenSchema,
    startsAt: z.iso.datetime({ offset: true, error: "Yeni bir saat seçin." }),
  }),
  rateLimit: rateLimits.publicForm,
  handler: async ({ token, startsAt: requested }, ctx) => {
    const appointment = await loadByToken(token, ctx.now);
    if (!appointment) return fail("BR-RND-009");
    const settings = await getSiteSettings();
    if (!canSelfManage(appointment, ctx.now, settings.booking.manageCutoffHours)) {
      return fail(
        appointment.status === "pending" || appointment.status === "confirmed"
          ? "BR-RND-007"
          : "BR-RND-008",
      );
    }
    const startsAt = new Date(requested);
    const day = istanbulDate(startsAt);
    const context = await getAvailabilityContext(
      appointment.staffId,
      istanbulDateTime(day, "00:00"),
      istanbulDateTime(addDays(day, 1), "00:00"),
      ctx.now,
      appointment.id,
    );
    const check = checkSlot(context, startsAt, appointment.durationMinutes);
    if (!check.ok) return fail(check.rule);

    const endsAt = addMinutes(startsAt, appointment.durationMinutes);
    const nextStatus = settings.booking.mode === "request" ? "pending" : appointment.status;
    try {
      const [updated] = await db
        .update(appointments)
        .set({
          startsAt,
          endsAt,
          blockedUntil: addMinutes(endsAt, settings.booking.bufferMinutes),
          status: nextStatus,
          confirmedAt: nextStatus === "pending" ? null : undefined,
          manageTokenExpiresAt: addMinutes(endsAt, MANAGE_LINK_DAYS_AFTER * 24 * 60), // P-09
        })
        .where(
          and(
            eq(appointments.id, appointment.id),
            inArray(appointments.status, ["pending", "confirmed"]),
          ),
        )
        .returning({ id: appointments.id });
      if (!updated) return fail("BR-RND-008");
    } catch (error) {
      const code =
        (error as { code?: string }).code ?? (error as { cause?: { code?: string } }).cause?.code;
      if (code === "23P01") return fail("BR-RND-003");
      throw error;
    }
    await recordAudit({
      actorId: "customer",
      action: "appointment.reschedule",
      entity: "appointments",
      entityId: appointment.id,
      changes: {
        startsAt: { from: appointment.startsAt.toISOString(), to: startsAt.toISOString() },
        status: { from: appointment.status, to: nextStatus },
      },
      ip: ctx.ip,
    });
    await notifyBusiness(appointment.id, {
      code: appointment.code,
      change: "erteleme",
      when: describeAppointmentTime(startsAt),
      serviceName: appointment.serviceName,
    });
    return ok({ status: nextStatus });
  },
});

// ── Form adapters ──────────────────────────────────────────────────────────────────────────

function formText(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export type ManageFormState = { error?: Fail };

export async function submitCancel(
  _previous: ManageFormState,
  formData: FormData,
): Promise<ManageFormState> {
  const token = formText(formData, "token");
  const result = await cancelByToken({ token, reason: formText(formData, "reason") });
  if (!result.ok) return { error: result };
  redirect(`/randevu/yonet/${token}?sonuc=iptal`);
}

export async function submitReschedule(
  _previous: ManageFormState,
  formData: FormData,
): Promise<ManageFormState> {
  const token = formText(formData, "token");
  const result = await rescheduleByToken({ token, startsAt: formText(formData, "startsAt") });
  if (!result.ok) return { error: result };
  redirect(`/randevu/yonet/${token}?sonuc=erteleme`);
}
