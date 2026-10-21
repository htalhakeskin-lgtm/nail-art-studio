"use server";

import { desc, eq, like } from "drizzle-orm";
import { redirect } from "next/navigation";

import { rateLimits } from "@/config/limits";
import { getFormTexts, getLegalDocument } from "@/features/legal";
import { getSiteSettings } from "@/features/site";
import { type Fail, fail, ok } from "@/lib/result";
import { adminAction, publicAction } from "@/server/action";
import { diffFields, recordAudit } from "@/server/audit";
import { send } from "@/server/channels";
import { db } from "@/server/db/client";
import { consentRecords, leads } from "@/server/db/schema";
import { logger } from "@/server/logger";
import { hashIp } from "@/server/request";

import { nextLeadCode } from "./domain/lead-code";
import {
  contactFormSchema,
  type ContactFormValues,
  contactFormValues,
  leadNoteSchema,
  type LeadStatus,
  leadStatusSchema,
} from "./schemas";

const UNIQUE_VIOLATION = "23505";

function isUniqueViolation(error: unknown): boolean {
  const cause = (error as { cause?: { code?: string } }).cause;
  return (error as { code?: string }).code === UNIQUE_VIOLATION || cause?.code === UNIQUE_VIOLATION;
}

/** Inserts with the next yearly code; a parallel submission that took it makes us retry. */
async function insertLead(values: Omit<typeof leads.$inferInsert, "code">, now: Date) {
  const year = Number(
    new Intl.DateTimeFormat("en", { timeZone: "Europe/Istanbul", year: "numeric" }).format(now),
  );
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const latest = await db
      .select({ code: leads.code })
      .from(leads)
      .where(like(leads.code, `TLP-${String(year)}-%`))
      .orderBy(desc(leads.code))
      .limit(1);
    const code = nextLeadCode(
      latest.map((row) => row.code),
      year,
    );
    try {
      const [row] = await db
        .insert(leads)
        .values({ ...values, code })
        .returning({ id: leads.id, code: leads.code });
      if (row) return row;
    } catch (error) {
      if (!isUniqueViolation(error)) throw error;
    }
  }
  throw new Error("Could not allocate a lead code");
}

/**
 * UC-07 contact form (SCR-010, Z-29). Order: honeypot → validation (BR-TLP-001) → rate limit
 * (P-10) → lead → consent record (information notice version) → notifications (demo outbox
 * while DEMO_MODE=true). A notification failure never loses the lead.
 */
export const sendContactMessage = publicAction({
  schema: contactFormSchema,
  rateLimit: rateLimits.publicForm,
  handler: async (input, ctx) => {
    const lead = await insertLead(
      {
        kind: "contact",
        name: input.name,
        phone: input.phone ?? null,
        email: input.email ?? null,
        message: input.message,
        preferredChannel: input.preferredChannel,
        sourcePath: input.sourcePath ?? "/iletisim",
      },
      ctx.now,
    );

    const [notice, forms] = await Promise.all([getLegalDocument("kvkk"), getFormTexts()]);
    await db.insert(consentRecords).values({
      kind: "information_notice",
      granted: true,
      textVersion: `kvkk-${notice.meta.surum}+form-${forms.meta.surum}`,
      source: "contactForm",
      subjectRef: lead.id,
      ipHash: hashIp(ctx.ip),
    });

    try {
      const settings = await getSiteSettings();
      await send({
        channel: "email",
        to: settings.contact.email,
        template: "leadReceivedBusiness",
        data: { code: lead.code, kind: "iletişim formu" },
        relatedId: lead.id,
      });
      if (input.email) {
        await send({
          channel: "email",
          to: input.email,
          template: "leadReceivedVisitor",
          data: { code: lead.code, companyName: settings.company.name },
          relatedId: lead.id,
        });
      }
    } catch (error) {
      logger.error("lead.notify_failed", { leadId: lead.id, error: String(error) });
    }

    logger.info("lead.created", { leadId: lead.id, kind: "contact" });
    return ok({ code: lead.code });
  },
});

export type ContactFormState = { error?: Fail; values?: ContactFormValues };

/** Redirects to the thank-you page on success; on failure keeps what was typed. */
export async function submitContactForm(
  _previous: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const values = contactFormValues(formData);
  const website = formData.get("website");
  const startedAt = formData.get("formStartedAt");
  const result = await sendContactMessage({
    ...values,
    website: typeof website === "string" ? website : undefined,
    // Empty when the form was sent before the page finished loading: no timing check then.
    formStartedAt: typeof startedAt === "string" && startedAt ? Number(startedAt) : undefined,
  });
  if (!result.ok) return { error: result, values };
  redirect(`/iletisim/tesekkurler?kod=${result.data.code}`);
}

// ── Panel ("Talepler", plan §12) ───────────────────────────────────────────────────────────

export const updateLeadStatus = adminAction({
  schema: leadStatusSchema,
  permission: "leads.edit",
  handler: async ({ id, status }, ctx) => {
    const [before] = await db
      .select({ status: leads.status })
      .from(leads)
      .where(eq(leads.id, id))
      .limit(1);
    if (!before) return fail("notFound");
    await db.update(leads).set({ status, readAt: ctx.now }).where(eq(leads.id, id));
    await recordAudit({
      actorId: ctx.session.user.id,
      action: "lead.status",
      entity: "leads",
      entityId: id,
      changes: diffFields({ status: before.status }, { status }),
      ip: ctx.ip,
    });
    return ok({ status });
  },
});

export const saveLeadNote = adminAction({
  schema: leadNoteSchema,
  permission: "leads.edit",
  handler: async ({ id, note }, ctx) => {
    const [row] = await db
      .update(leads)
      .set({ note: note || null })
      .where(eq(leads.id, id))
      .returning({ id: leads.id });
    if (!row) return fail("notFound");
    await recordAudit({
      actorId: ctx.session.user.id,
      action: "lead.note",
      entity: "leads",
      entityId: id,
      ip: ctx.ip,
    });
    return ok({ id });
  },
});

function formText(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export async function updateLeadStatusForm(formData: FormData): Promise<void> {
  const id = formText(formData, "id");
  const result = await updateLeadStatus({
    id,
    status: formText(formData, "status") as LeadStatus, // validated by the action's schema
  });
  redirect(`/panel/talepler/${id}?${result.ok ? "kaydedildi=durum" : `hata=${result.code}`}`);
}

export async function saveLeadNoteForm(formData: FormData): Promise<void> {
  const id = formText(formData, "id");
  const result = await saveLeadNote({ id, note: formText(formData, "note") });
  redirect(`/panel/talepler/${id}?${result.ok ? "kaydedildi=not" : `hata=${result.code}`}`);
}
