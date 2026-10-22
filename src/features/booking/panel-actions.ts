"use server";

import { randomBytes } from "node:crypto";

import { and, eq } from "drizzle-orm";
import type { Route } from "next";
import { redirect } from "next/navigation";
import { z } from "zod";

import { APPOINTMENT_STATUSES, MANAGE_LINK_DAYS_AFTER } from "@/config/booking";
import { getSiteSettings } from "@/features/site";
import { whatsappLink } from "@/lib/phone";
import { type Fail, fail, ok } from "@/lib/result";
import { absoluteUrl } from "@/lib/seo";
import { adminAction } from "@/server/action";
import { recordAudit } from "@/server/audit";
import { send } from "@/server/channels";
import { db } from "@/server/db/client";
import { appointments, services } from "@/server/db/schema";
import { logger } from "@/server/logger";

import { checkSlot } from "./domain/availability";
import { generateAppointmentCode } from "./domain/code";
import { describeAppointmentTime } from "./domain/messages";
import { canTransition } from "./domain/status";
import { whatsappTemplate } from "./domain/templates";
import { addDays, addMinutes, istanbulDate, istanbulDateTime } from "./domain/time";
import { getAvailabilityContext, getBookableStaff } from "./queries";
import { appointmentRequestSchema } from "./request-schema";
import { createManageToken } from "./server/token";

const statusChangeSchema = z.object({
  id: z.uuid(),
  to: z.enum(APPOINTMENT_STATUSES),
  reason: z.string().trim().max(300).optional(),
});

/**
 * UC-04 (BR-RND-008): confirm, complete, no-show or cancel. The update is conditional on the
 * status the owner saw, so two quick taps (or two devices) can never apply a change twice.
 */
export const setAppointmentStatus = adminAction({
  schema: statusChangeSchema,
  permission: "appointments.manage",
  handler: async ({ id, to, reason }, ctx) => {
    const [current] = await db
      .select({
        status: appointments.status,
        code: appointments.code,
        startsAt: appointments.startsAt,
        email: appointments.customerEmail,
        serviceName: services.name,
      })
      .from(appointments)
      .innerJoin(services, eq(services.id, appointments.serviceId))
      .where(eq(appointments.id, id))
      .limit(1);
    if (!current) return fail("notFound");
    if (!canTransition(current.status, to)) return fail("BR-RND-008");
    const [updated] = await db
      .update(appointments)
      .set({
        status: to,
        ...(to === "confirmed" ? { confirmedAt: ctx.now } : {}),
        ...(to === "cancelled"
          ? { cancelledAt: ctx.now, cancelledBy: "admin", cancelReason: reason || null }
          : {}),
      })
      .where(and(eq(appointments.id, id), eq(appointments.status, current.status)))
      .returning({ id: appointments.id });
    if (!updated) return fail("BR-RND-008");
    await recordAudit({
      actorId: ctx.session.user.id,
      action: `appointment.${to}`,
      entity: "appointments",
      entityId: id,
      changes: { status: { from: current.status, to } },
      ip: ctx.ip,
    });
    if (to === "confirmed" && current.email) {
      try {
        const settings = await getSiteSettings();
        await send({
          channel: "email",
          to: current.email,
          template: "appointmentConfirmedVisitor",
          data: {
            code: current.code,
            companyName: settings.company.name,
            serviceName: current.serviceName,
            when: describeAppointmentTime(current.startsAt),
            address: settings.company.address,
          },
          relatedId: id,
        });
      } catch (error) {
        logger.error("appointment.notify_failed", { appointmentId: id, error: String(error) });
      }
    }
    return ok({ status: to });
  },
});

const manualSchema = appointmentRequestSchema.pick({
  serviceId: true,
  startsAt: true,
  name: true,
  phone: true,
  email: true,
  note: true,
});

/**
 * UC-05 (BR-RND-001…004, 011): a booking taken by phone or DM. Same hours, closures and overlap
 * rules as online — only the lead time (P-03) does not apply — and it starts confirmed.
 */
export const createManualAppointment = adminAction({
  schema: manualSchema,
  permission: "appointments.manage",
  handler: async (input, ctx) => {
    const [service] = await db
      .select()
      .from(services)
      .where(eq(services.id, input.serviceId))
      .limit(1);
    const expert = await getBookableStaff();
    if (!service || !expert) return fail("notFound");
    const settings = await getSiteSettings();
    const startsAt = new Date(input.startsAt);
    const day = istanbulDate(startsAt);
    const context = await getAvailabilityContext(
      expert.id,
      istanbulDateTime(day, "00:00"),
      istanbulDateTime(addDays(day, 1), "00:00"),
      ctx.now,
    );
    const check = checkSlot(
      { ...context, rules: { ...context.rules, minLeadHours: 0 } },
      startsAt,
      service.durationMinutes,
    );
    if (!check.ok) return fail(check.rule);

    const endsAt = addMinutes(startsAt, service.durationMinutes);
    const manage = createManageToken();
    let created: { id: string } | undefined;
    for (let attempt = 0; attempt < 5 && !created; attempt += 1) {
      try {
        [created] = await db
          .insert(appointments)
          .values({
            code: generateAppointmentCode((size) => randomBytes(size)),
            staffId: expert.id,
            serviceId: service.id,
            startsAt,
            endsAt,
            blockedUntil: addMinutes(endsAt, settings.booking.bufferMinutes),
            status: "confirmed",
            confirmedAt: ctx.now,
            customerName: input.name,
            customerPhone: input.phone,
            customerEmail: input.email ?? null,
            note: input.note || null,
            source: "admin",
            manageTokenHash: manage.hash,
            manageTokenExpiresAt: addMinutes(endsAt, MANAGE_LINK_DAYS_AFTER * 24 * 60),
          })
          .returning({ id: appointments.id });
      } catch (error) {
        const code =
          (error as { code?: string }).code ?? (error as { cause?: { code?: string } }).cause?.code;
        if (code === "23P01") return fail("BR-RND-003");
        if (code !== "23505") throw error;
      }
    }
    if (!created) return fail("unexpected");
    await recordAudit({
      actorId: ctx.session.user.id,
      action: "appointment.create",
      entity: "appointments",
      entityId: created.id,
      ip: ctx.ip,
    });
    return ok({ id: created.id });
  },
});

/**
 * Only the hash of a manage link is stored, so the panel cannot show the old one: sending the
 * link creates a new token (the old link stops working) and opens WhatsApp with the confirm
 * template and the new link (PRJ-01).
 */
export const shareManageLink = adminAction({
  schema: z.object({ id: z.uuid() }),
  permission: "appointments.manage",
  handler: async ({ id }, ctx) => {
    const [row] = await db
      .select({
        appointment: appointments,
        serviceName: services.name,
      })
      .from(appointments)
      .innerJoin(services, eq(services.id, appointments.serviceId))
      .where(eq(appointments.id, id))
      .limit(1);
    if (!row) return fail("notFound");
    const { appointment } = row;
    if (appointment.status !== "pending" && appointment.status !== "confirmed") {
      return fail("BR-RND-008");
    }
    const manage = createManageToken();
    await db
      .update(appointments)
      .set({
        manageTokenHash: manage.hash,
        manageTokenExpiresAt: addMinutes(appointment.endsAt, MANAGE_LINK_DAYS_AFTER * 24 * 60),
      })
      .where(eq(appointments.id, id));
    await recordAudit({
      actorId: ctx.session.user.id,
      action: "appointment.link_shared",
      entity: "appointments",
      entityId: id,
      ip: ctx.ip,
    });
    const settings = await getSiteSettings();
    const text = whatsappTemplate("confirm", {
      customerName: appointment.customerName,
      companyName: settings.company.name,
      serviceName: row.serviceName,
      code: appointment.code,
      startsAt: appointment.startsAt,
      address: settings.company.address,
      manageUrl: absoluteUrl(`/randevu/yonet/${manage.token}`),
    });
    return ok({ url: whatsappLink(appointment.customerPhone, text) });
  },
});

// ── Form adapters ──────────────────────────────────────────────────────────────────────────

function formText(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export async function setAppointmentStatusForm(formData: FormData): Promise<void> {
  const id = formText(formData, "id");
  const result = await setAppointmentStatus({
    id,
    to: formText(formData, "to") as (typeof APPOINTMENT_STATUSES)[number],
    reason: formText(formData, "reason"),
  });
  redirect(
    `/panel/randevular/${id}?${result.ok ? `kaydedildi=${result.data.status}` : `hata=${result.code}`}`,
  );
}

export async function shareManageLinkForm(formData: FormData): Promise<void> {
  const id = formText(formData, "id");
  const result = await shareManageLink({ id });
  if (!result.ok) redirect(`/panel/randevular/${id}?hata=${result.code}`);
  redirect(result.data.url as Route); // external wa.me link
}

export type ManualFormState = { error?: Fail; values?: Record<string, string> };

export async function submitManualAppointment(
  _previous: ManualFormState,
  formData: FormData,
): Promise<ManualFormState> {
  const values = {
    serviceId: formText(formData, "serviceId"),
    startsAt: formText(formData, "startsAt"),
    name: formText(formData, "name"),
    phone: formText(formData, "phone"),
    email: formText(formData, "email"),
    note: formText(formData, "note"),
  };
  const result = await createManualAppointment(values);
  if (!result.ok) return { error: result, values };
  redirect(`/panel/randevular/${result.data.id}?kaydedildi=olusturuldu`);
}
