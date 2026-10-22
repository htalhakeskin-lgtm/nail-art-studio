"use server";

import { randomBytes } from "node:crypto";

import { and, count, eq, gt, inArray } from "drizzle-orm";
import { redirect } from "next/navigation";

import { MANAGE_LINK_DAYS_AFTER } from "@/config/booking";
import { rateLimits } from "@/config/limits";
import { getFormTexts, getLegalDocument } from "@/features/legal";
import { getSiteSettings } from "@/features/site";
import { type Fail, fail, ok } from "@/lib/result";
import { absoluteUrl } from "@/lib/seo";
import { publicAction } from "@/server/action";
import { send } from "@/server/channels";
import { db } from "@/server/db/client";
import { appointments, consentRecords, galleryItems, services } from "@/server/db/schema";
import { logger } from "@/server/logger";
import { consumeRateLimit } from "@/server/rate-limit";
import { hashIp } from "@/server/request";

import { checkSlot, nextSlots } from "./domain/availability";
import { generateAppointmentCode } from "./domain/code";
import { describeAppointmentTime } from "./domain/messages";
import { appointmentStatusLabels } from "./domain/status";
import { addDays, addMinutes, istanbulDate, istanbulDateTime } from "./domain/time";
import { getAvailabilityContext, getBookableStaff } from "./queries";
import {
  appointmentRequestSchema,
  type AppointmentRequestValues,
  appointmentRequestValues,
} from "./request-schema";
import { createManageToken } from "./server/token";

const EXCLUSION_VIOLATION = "23P01";
const UNIQUE_VIOLATION = "23505";

function pgCode(error: unknown): string | undefined {
  const own = (error as { code?: string }).code;
  return own ?? (error as { cause?: { code?: string } }).cause?.code;
}

/**
 * Up to two free starts near the requested one, for "Bu saat az önce doldu" (UC-01). Not
 * exported: every export of a "use server" file is a public endpoint.
 */
async function suggestSlots(serviceId: string, near: Date): Promise<string[]> {
  const [service] = await db
    .select({ durationMinutes: services.durationMinutes })
    .from(services)
    .where(eq(services.id, serviceId))
    .limit(1);
  const expert = await getBookableStaff();
  if (!service || !expert) return [];
  const now = new Date();
  const settings = await getSiteSettings();
  const until = istanbulDateTime(
    addDays(istanbulDate(now), settings.booking.horizonDays + 1),
    "00:00",
  );
  const context = await getAvailabilityContext(expert.id, now, until, now);
  const from = near > now ? addMinutes(near, -120) : now;
  return nextSlots(context, service.durationMinutes, 2, from).map((slot) => slot.toISOString());
}

/**
 * UC-01 / UC-02 (REQ-001, REQ-002). Order: honeypot → validation → IP limit (P-10) → service
 * (BR-RND-014) → phone limits (P-10, BR-RND-006) → live slot check (BR-RND-001…005) → insert,
 * where the exclusion constraint settles a race (BR-RND-003) → consent record →
 * notifications to the demo outbox. Returns the manage token for the confirmation screen.
 */
export const requestAppointment = publicAction({
  schema: appointmentRequestSchema,
  rateLimit: rateLimits.appointmentCreate,
  handler: async (input, ctx) => {
    const [service] = await db
      .select()
      .from(services)
      .where(eq(services.id, input.serviceId))
      .limit(1);
    if (!service || !service.isActive || !service.isBookable) return fail("BR-RND-014");
    const expert = await getBookableStaff();
    if (!expert) return fail("BR-RND-014");

    const phoneLimit = await consumeRateLimit(rateLimits.appointmentPerPhone, input.phone, ctx.now);
    if (!phoneLimit.allowed) return fail("rateLimited");
    const [future] = await db
      .select({ value: count() })
      .from(appointments)
      .where(
        and(
          eq(appointments.customerPhone, input.phone),
          inArray(appointments.status, ["pending", "confirmed"]),
          gt(appointments.startsAt, ctx.now),
        ),
      );
    const settings = await getSiteSettings();
    if ((future?.value ?? 0) >= settings.booking.maxFuturePerPhone) return fail("BR-RND-006");

    const startsAt = new Date(input.startsAt);
    const endsAt = addMinutes(startsAt, service.durationMinutes);
    const blockedUntil = addMinutes(endsAt, settings.booking.bufferMinutes);
    const context = await getAvailabilityContext(
      expert.id,
      istanbulDateTime(istanbulDate(startsAt), "00:00"),
      istanbulDateTime(addDays(istanbulDate(startsAt), 1), "00:00"),
      ctx.now,
    );
    const check = checkSlot(context, startsAt, service.durationMinutes);
    if (!check.ok) return fail(check.rule);

    const [work] = input.referenceWork
      ? await db
          .select({ id: galleryItems.id })
          .from(galleryItems)
          .where(
            and(eq(galleryItems.slug, input.referenceWork), eq(galleryItems.isPublished, true)),
          )
          .limit(1)
      : [];

    const confirmed = settings.booking.mode === "instant";
    const manage = createManageToken();
    let created: { id: string; code: string } | undefined;
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
            blockedUntil,
            status: confirmed ? "confirmed" : "pending",
            confirmedAt: confirmed ? ctx.now : null,
            customerName: input.name,
            customerPhone: input.phone,
            customerEmail: input.email ?? null,
            note: input.note || null,
            preferredChannel: input.preferredChannel,
            referenceGalleryItemId: work?.id ?? null,
            source: "online",
            manageTokenHash: manage.hash,
            // P-09: the link works until 30 days after the appointment.
            manageTokenExpiresAt: addMinutes(endsAt, MANAGE_LINK_DAYS_AFTER * 24 * 60),
          })
          .returning({ id: appointments.id, code: appointments.code });
      } catch (error) {
        const code = pgCode(error);
        if (code === EXCLUSION_VIOLATION) return fail("BR-RND-003");
        if (code !== UNIQUE_VIOLATION) throw error;
      }
    }
    if (!created) return fail("unexpected");

    const [notice, forms] = await Promise.all([getLegalDocument("kvkk"), getFormTexts()]);
    await db.insert(consentRecords).values({
      kind: "information_notice",
      granted: true,
      textVersion: `kvkk-${notice.meta.surum}+form-${forms.meta.surum}`,
      source: "appointmentForm",
      subjectRef: created.id,
      ipHash: hashIp(ctx.ip),
    });

    const when = describeAppointmentTime(startsAt);
    try {
      await send({
        channel: "email",
        to: settings.contact.email,
        template: "appointmentRequestedBusiness",
        data: {
          code: created.code,
          serviceName: service.name,
          when,
          status: appointmentStatusLabels[confirmed ? "confirmed" : "pending"],
        },
        relatedId: created.id,
      });
      if (input.email) {
        await send({
          channel: "email",
          to: input.email,
          template: "appointmentReceivedVisitor",
          data: {
            code: created.code,
            companyName: settings.company.name,
            serviceName: service.name,
            when,
            confirmed,
            manageUrl: absoluteUrl(`/randevu/yonet/${manage.token}`),
          },
          relatedId: created.id,
        });
      }
    } catch (error) {
      logger.error("appointment.notify_failed", {
        appointmentId: created.id,
        error: String(error),
      });
    }

    logger.info("appointment.created", { appointmentId: created.id, source: "online" });
    return ok({ code: created.code, token: manage.token });
  },
});

// ── Form adapter ───────────────────────────────────────────────────────────────────────────

export type AppointmentFormState = {
  error?: Fail;
  values?: AppointmentRequestValues;
  /** ISO starts offered when the chosen time is no longer possible. */
  alternatives?: string[];
};

const SLOT_RULES = new Set(["BR-RND-001", "BR-RND-002", "BR-RND-003", "BR-RND-005"]);

export async function submitAppointmentForm(
  _previous: AppointmentFormState,
  formData: FormData,
): Promise<AppointmentFormState> {
  const values = appointmentRequestValues(formData);
  const website = formData.get("website");
  const startedAt = formData.get("formStartedAt");
  const result = await requestAppointment({
    ...values,
    website: typeof website === "string" ? website : undefined,
    formStartedAt: typeof startedAt === "string" && startedAt ? Number(startedAt) : undefined,
  });
  if (!result.ok) {
    const alternatives =
      SLOT_RULES.has(result.code) && values.serviceId && values.startsAt
        ? await suggestSlots(values.serviceId, new Date(values.startsAt))
        : undefined;
    return { error: result, values, ...(alternatives ? { alternatives } : {}) };
  }
  redirect(`/randevu/yonet/${result.data.token}?yeni=1`);
}
