"use server";

import { eq, sql } from "drizzle-orm";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { nextSortOrder, planMove } from "@/features/faq";
import { type Fail, fail, ok } from "@/lib/result";
import { adminAction } from "@/server/action";
import { diffFields, recordAudit } from "@/server/audit";
import { db } from "@/server/db/client";
import { testimonials } from "@/server/db/schema";

import { TESTIMONIALS_TAG } from "./queries";
import {
  testimonialFormSchema,
  type TestimonialFormValues,
  testimonialFormValues,
  testimonialIdSchema,
  testimonialMoveSchema,
} from "./schemas";

// One list, one order: the FAQ ordering helpers work per "category", so every row shares one.
const ordered = async () =>
  (await db.select().from(testimonials)).map((row) => ({ ...row, category: "all" }));

/** Create or update a review (SCR-107, REQ-014). Rule: hidden instead of deleted (plan §5). */
export const saveTestimonial = adminAction({
  schema: testimonialFormSchema,
  permission: "content.edit",
  handler: async ({ id, serviceId, ...rest }, ctx) => {
    const values = { ...rest, serviceId: serviceId || null };
    if (id) {
      const [before] = await db.select().from(testimonials).where(eq(testimonials.id, id)).limit(1);
      if (!before) return fail("notFound");
      const changes = diffFields(
        {
          displayName: before.displayName,
          body: before.body,
          serviceId: before.serviceId,
          isSample: before.isSample,
          isVisible: before.isVisible,
        },
        values,
      );
      await db.update(testimonials).set(values).where(eq(testimonials.id, id));
      await recordAudit({
        actorId: ctx.session.user.id,
        action: "testimonial.update",
        entity: "testimonials",
        entityId: id,
        changes,
        ip: ctx.ip,
      });
      updateTag(TESTIMONIALS_TAG);
      return ok({ id });
    }

    const [created] = await db
      .insert(testimonials)
      .values({ ...values, sortOrder: nextSortOrder(await ordered(), "all") })
      .returning({ id: testimonials.id });
    if (!created) return fail("unexpected");
    await recordAudit({
      actorId: ctx.session.user.id,
      action: "testimonial.create",
      entity: "testimonials",
      entityId: created.id,
      ip: ctx.ip,
    });
    updateTag(TESTIMONIALS_TAG);
    return ok({ id: created.id });
  },
});

export const toggleTestimonialVisibility = adminAction({
  schema: testimonialIdSchema,
  permission: "content.edit",
  handler: async ({ id }, ctx) => {
    const [row] = await db
      .update(testimonials)
      // Flipped in SQL: two quick clicks can never both read the same old value.
      .set({ isVisible: sql`not ${testimonials.isVisible}` })
      .where(eq(testimonials.id, id))
      .returning({ id: testimonials.id, isVisible: testimonials.isVisible });
    if (!row) return fail("notFound");
    await recordAudit({
      actorId: ctx.session.user.id,
      action: row.isVisible ? "testimonial.show" : "testimonial.hide",
      entity: "testimonials",
      entityId: id,
      changes: { isVisible: { from: !row.isVisible, to: row.isVisible } },
      ip: ctx.ip,
    });
    updateTag(TESTIMONIALS_TAG);
    return ok({ isVisible: row.isVisible });
  },
});

export const moveTestimonial = adminAction({
  schema: testimonialMoveSchema,
  permission: "content.edit",
  handler: async ({ id, direction }, ctx) => {
    const updates = planMove(await ordered(), id, direction);
    if (!updates) return ok({ moved: false }); // already first / last: nothing to do
    await db.transaction(async (tx) => {
      for (const update of updates) {
        await tx
          .update(testimonials)
          .set({ sortOrder: update.sortOrder })
          .where(eq(testimonials.id, update.id));
      }
    });
    await recordAudit({
      actorId: ctx.session.user.id,
      action: "testimonial.move",
      entity: "testimonials",
      entityId: id,
      changes: { direction: { from: null, to: direction } },
      ip: ctx.ip,
    });
    updateTag(TESTIMONIALS_TAG);
    return ok({ moved: true });
  },
});

// ── Form adapters (useActionState / <form action>) ─────────────────────────────────────────

export type TestimonialFormState = { error?: Fail; values?: TestimonialFormValues };

/** Redirects to the list on success; on failure returns the error and what was typed. */
export async function submitTestimonialForm(
  _previous: TestimonialFormState,
  formData: FormData,
): Promise<TestimonialFormState> {
  const values = testimonialFormValues(formData);
  const result = await saveTestimonial(values);
  if (!result.ok) return { error: result, values };
  redirect("/panel/yorumlar?kaydedildi=1");
}

function formText(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export async function toggleTestimonialVisibilityForm(formData: FormData): Promise<void> {
  await toggleTestimonialVisibility({ id: formText(formData, "id") });
}

export async function moveTestimonialForm(formData: FormData): Promise<void> {
  const direction = formData.get("direction") === "down" ? "down" : "up";
  await moveTestimonial({ id: formText(formData, "id"), direction });
}
