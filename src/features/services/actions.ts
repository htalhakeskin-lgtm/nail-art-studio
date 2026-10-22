"use server";

import { and, eq, ne, sql } from "drizzle-orm";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { nextSortOrder, planMove } from "@/features/faq";
import { SITE_SETTINGS_TAG } from "@/features/site";
import { type Fail, fail, ok } from "@/lib/result";
import { adminAction } from "@/server/action";
import { diffFields, recordAudit } from "@/server/audit";
import { db } from "@/server/db/client";
import { services, siteSettings } from "@/server/db/schema";

import { SERVICES_TAG } from "./queries";
import {
  priceDisplaySchema,
  serviceFormSchema,
  type ServiceFormValues,
  serviceFormValues,
  serviceIdSchema,
  serviceMoveSchema,
} from "./schemas";

/** The fields worth a line in the audit log (long texts are left out). */
function auditedFields(service: {
  name: string;
  slug: string;
  category: string;
  durationMinutes: number;
  priceMinor: number | null;
  isBookable: boolean;
  isActive: boolean;
}) {
  const { name, slug, category, durationMinutes, priceMinor, isBookable, isActive } = service;
  return { name, slug, category, durationMinutes, priceMinor, isBookable, isActive };
}

/** Create or update a service (SCR-105). BR-HZM-002: the slug is unique. */
export const saveService = adminAction({
  schema: serviceFormSchema,
  permission: "services.edit",
  handler: async ({ id, price, priceDisplayOverride, faqs, ...input }, ctx) => {
    const [taken] = await db
      .select({ id: services.id })
      .from(services)
      .where(
        id
          ? and(eq(services.slug, input.slug), ne(services.id, id))
          : eq(services.slug, input.slug),
      )
      .limit(1);
    if (taken) return fail("BR-HZM-002", { fieldErrors: { slug: ["Bu kısa ad kullanılıyor."] } });

    const values = {
      ...input,
      suitableFor: input.suitableFor || null,
      body: input.body || null,
      aftercare: input.aftercare || null,
      durabilityText: input.durabilityText || null,
      priceMinor: price,
      priceDisplayOverride: priceDisplayOverride || null,
      faqs: faqs.filter((faq) => faq.question && faq.answer),
    };

    if (id) {
      const [before] = await db.select().from(services).where(eq(services.id, id)).limit(1);
      if (!before) return fail("notFound");
      const sortOrder =
        values.category === before.category
          ? before.sortOrder
          : nextSortOrder(await db.select().from(services), values.category);
      await db
        .update(services)
        .set({ ...values, sortOrder })
        .where(eq(services.id, id));
      await recordAudit({
        actorId: ctx.session.user.id,
        action: "service.update",
        entity: "services",
        entityId: id,
        changes: diffFields(auditedFields(before), auditedFields(values)),
        ip: ctx.ip,
      });
      updateTag(SERVICES_TAG);
      return ok({ id });
    }

    const [created] = await db
      .insert(services)
      .values({
        ...values,
        sortOrder: nextSortOrder(await db.select().from(services), values.category),
      })
      .returning({ id: services.id });
    if (!created) return fail("unexpected");
    await recordAudit({
      actorId: ctx.session.user.id,
      action: "service.create",
      entity: "services",
      entityId: created.id,
      ip: ctx.ip,
    });
    updateTag(SERVICES_TAG);
    return ok({ id: created.id });
  },
});

/** Hidden instead of deleted (plan §12): appointments keep pointing at the service. */
export const toggleServiceActive = adminAction({
  schema: serviceIdSchema,
  permission: "services.edit",
  handler: async ({ id }, ctx) => {
    const [row] = await db
      .update(services)
      .set({ isActive: sql`not ${services.isActive}` })
      .where(eq(services.id, id))
      .returning({ isActive: services.isActive });
    if (!row) return fail("notFound");
    await recordAudit({
      actorId: ctx.session.user.id,
      action: row.isActive ? "service.show" : "service.hide",
      entity: "services",
      entityId: id,
      changes: { isActive: { from: !row.isActive, to: row.isActive } },
      ip: ctx.ip,
    });
    updateTag(SERVICES_TAG);
    return ok({ isActive: row.isActive });
  },
});

export const moveService = adminAction({
  schema: serviceMoveSchema,
  permission: "services.edit",
  handler: async ({ id, direction }, ctx) => {
    const updates = planMove(await db.select().from(services), id, direction);
    if (!updates) return ok({ moved: false });
    await db.transaction(async (tx) => {
      for (const update of updates) {
        await tx
          .update(services)
          .set({ sortOrder: update.sortOrder })
          .where(eq(services.id, update.id));
      }
    });
    await recordAudit({
      actorId: ctx.session.user.id,
      action: "service.move",
      entity: "services",
      entityId: id,
      changes: { direction: { from: null, to: direction } },
      ip: ctx.ip,
    });
    updateTag(SERVICES_TAG);
    return ok({ moved: true });
  },
});

/** P-08 for the whole site (K-05). Changing it is a settings change: owner and admin only. */
export const setPriceDisplay = adminAction({
  schema: priceDisplaySchema,
  permission: "settings.edit",
  handler: async ({ display }, ctx) => {
    const [row] = await db
      .update(siteSettings)
      .set({ pricing: { display } })
      .where(eq(siteSettings.id, "singleton"))
      .returning({ id: siteSettings.id });
    if (!row) {
      await db.insert(siteSettings).values({ id: "singleton", pricing: { display } });
    }
    await recordAudit({
      actorId: ctx.session.user.id,
      action: "settings.price_display",
      entity: "site_settings",
      entityId: "singleton",
      changes: { display: { from: null, to: display } },
      ip: ctx.ip,
    });
    updateTag(SITE_SETTINGS_TAG);
    updateTag(SERVICES_TAG);
    return ok({ display });
  },
});

// ── Form adapters ──────────────────────────────────────────────────────────────────────────

export type ServiceFormState = { error?: Fail; values?: ServiceFormValues };

export async function submitServiceForm(
  _previous: ServiceFormState,
  formData: FormData,
): Promise<ServiceFormState> {
  const values = serviceFormValues(formData);
  const result = await saveService(values);
  if (!result.ok) return { error: result, values };
  redirect("/panel/hizmetler?kaydedildi=hizmet");
}

function formText(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export async function toggleServiceActiveForm(formData: FormData): Promise<void> {
  await toggleServiceActive({ id: formText(formData, "id") });
}

export async function moveServiceForm(formData: FormData): Promise<void> {
  const direction = formData.get("direction") === "down" ? "down" : "up";
  await moveService({ id: formText(formData, "id"), direction });
}

export async function setPriceDisplayForm(formData: FormData): Promise<void> {
  const display = formData.get("display") === "show" ? "show" : "contact";
  const result = await setPriceDisplay({ display });
  redirect(`/panel/hizmetler?${result.ok ? "kaydedildi=fiyat" : `hata=${result.code}`}`);
}
