"use server";

import { eq, sql } from "drizzle-orm";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { type Fail, fail, ok } from "@/lib/result";
import { adminAction } from "@/server/action";
import { diffFields, recordAudit } from "@/server/audit";
import { db } from "@/server/db/client";
import { faqs } from "@/server/db/schema";

import { nextSortOrder, planMove } from "./domain/order";
import { FAQ_TAG } from "./queries";
import {
  faqFormSchema,
  type FaqFormValues,
  faqFormValues,
  faqIdSchema,
  faqMoveSchema,
} from "./schemas";

/** Create or update a question (SCR-108). Rule: hidden instead of deleted (plan §5). */
export const saveFaq = adminAction({
  schema: faqFormSchema,
  permission: "content.edit",
  handler: async ({ id, ...values }, ctx) => {
    if (id) {
      const [before] = await db.select().from(faqs).where(eq(faqs.id, id)).limit(1);
      if (!before) return fail("notFound");
      const changes = diffFields(
        {
          question: before.question,
          answer: before.answer,
          category: before.category,
          isVisible: before.isVisible,
        },
        values,
      );
      // Moving to another category appends it there, so per-category order stays unique.
      const sortOrder =
        values.category === before.category
          ? before.sortOrder
          : nextSortOrder(await db.select().from(faqs), values.category);
      await db
        .update(faqs)
        .set({ ...values, sortOrder })
        .where(eq(faqs.id, id));
      await recordAudit({
        actorId: ctx.session.user.id,
        action: "faq.update",
        entity: "faqs",
        entityId: id,
        changes,
        ip: ctx.ip,
      });
      updateTag(FAQ_TAG);
      return ok({ id });
    }

    const all = await db.select().from(faqs);
    const [created] = await db
      .insert(faqs)
      .values({ ...values, sortOrder: nextSortOrder(all, values.category) })
      .returning({ id: faqs.id });
    if (!created) return fail("unexpected");
    await recordAudit({
      actorId: ctx.session.user.id,
      action: "faq.create",
      entity: "faqs",
      entityId: created.id,
      ip: ctx.ip,
    });
    updateTag(FAQ_TAG);
    return ok({ id: created.id });
  },
});

export const toggleFaqVisibility = adminAction({
  schema: faqIdSchema,
  permission: "content.edit",
  handler: async ({ id }, ctx) => {
    const [row] = await db
      .update(faqs)
      // Flipped in SQL: two quick clicks can never both read the same old value.
      .set({ isVisible: sql`not ${faqs.isVisible}` })
      .where(eq(faqs.id, id))
      .returning({ id: faqs.id, isVisible: faqs.isVisible });
    if (!row) return fail("notFound");
    await recordAudit({
      actorId: ctx.session.user.id,
      action: row.isVisible ? "faq.show" : "faq.hide",
      entity: "faqs",
      entityId: id,
      changes: { isVisible: { from: !row.isVisible, to: row.isVisible } },
      ip: ctx.ip,
    });
    updateTag(FAQ_TAG);
    return ok({ isVisible: row.isVisible });
  },
});

export const moveFaq = adminAction({
  schema: faqMoveSchema,
  permission: "content.edit",
  handler: async ({ id, direction }, ctx) => {
    const all = await db.select().from(faqs);
    const updates = planMove(all, id, direction);
    if (!updates) return ok({ moved: false }); // already first / last: nothing to do
    await db.transaction(async (tx) => {
      for (const update of updates) {
        await tx.update(faqs).set({ sortOrder: update.sortOrder }).where(eq(faqs.id, update.id));
      }
    });
    await recordAudit({
      actorId: ctx.session.user.id,
      action: "faq.move",
      entity: "faqs",
      entityId: id,
      changes: { direction: { from: null, to: direction } },
      ip: ctx.ip,
    });
    updateTag(FAQ_TAG);
    return ok({ moved: true });
  },
});

// ── Form adapters (useActionState / <form action>) ─────────────────────────────────────────

export type FaqFormState = { error?: Fail; values?: FaqFormValues };

/** Redirects to the list on success; on failure returns the error and what was typed. */
export async function submitFaqForm(
  _previous: FaqFormState,
  formData: FormData,
): Promise<FaqFormState> {
  const values = faqFormValues(formData);
  const result = await saveFaq(values);
  if (!result.ok) return { error: result, values };
  redirect("/panel/icerik?kaydedildi=sss");
}

function formText(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

export async function toggleFaqVisibilityForm(formData: FormData): Promise<void> {
  await toggleFaqVisibility({ id: formText(formData, "id") });
}

export async function moveFaqForm(formData: FormData): Promise<void> {
  const direction = formData.get("direction") === "down" ? "down" : "up";
  await moveFaq({ id: formText(formData, "id"), direction });
}
