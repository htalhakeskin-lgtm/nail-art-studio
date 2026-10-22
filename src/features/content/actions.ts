"use server";

import { eq } from "drizzle-orm";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { contentBlockDefaults } from "@/content/content-blocks";
import { type Fail, ok } from "@/lib/result";
import { adminAction } from "@/server/action";
import { diffFields, recordAudit } from "@/server/audit";
import { db } from "@/server/db/client";
import { contentBlocks } from "@/server/db/schema";

import { contentBlockTag } from "./queries";
import {
  aboutBlockSchema,
  type AboutFormValues,
  aboutFormValues,
  STEPS_BLOCK_KEYS,
  stepsBlockSchema,
  type StepsFormValues,
  stepsFormValues,
} from "./schemas";

/** Edit the about page copy (SCR-108 → content_blocks.about). */
export const saveAboutBlock = adminAction({
  schema: aboutBlockSchema,
  permission: "content.edit",
  handler: async (value, ctx) => {
    const [before] = await db
      .select({ value: contentBlocks.value })
      .from(contentBlocks)
      .where(eq(contentBlocks.key, "about"))
      .limit(1);
    await db
      .insert(contentBlocks)
      .values({ key: "about", value })
      .onConflictDoUpdate({ target: contentBlocks.key, set: { value } });
    await recordAudit({
      actorId: ctx.session.user.id,
      action: "content_block.update",
      entity: "content_blocks",
      entityId: "about",
      changes: diffFields(
        (before?.value ?? contentBlockDefaults.about) as Record<string, unknown>,
        value,
      ),
      ip: ctx.ip,
    });
    updateTag(contentBlockTag("about"));
    return ok({ key: "about" as const });
  },
});

export type AboutFormState = { error?: Fail; values?: AboutFormValues };

export async function submitAboutForm(
  _previous: AboutFormState,
  formData: FormData,
): Promise<AboutFormState> {
  const values = aboutFormValues(formData);
  const result = await saveAboutBlock(values);
  if (!result.ok) return { error: result, values };
  redirect("/panel/icerik?kaydedildi=hakkinda");
}

const stepsInputSchema = stepsBlockSchema.extend({ key: z.enum(STEPS_BLOCK_KEYS) });

/** Edit the home page step lists: "Nasıl ilerliyoruz" (V-16) and the hygiene card (V-15). */
export const saveStepsBlock = adminAction({
  schema: stepsInputSchema,
  permission: "content.edit",
  handler: async ({ key, ...value }, ctx) => {
    await db
      .insert(contentBlocks)
      .values({ key, value })
      .onConflictDoUpdate({ target: contentBlocks.key, set: { value } });
    await recordAudit({
      actorId: ctx.session.user.id,
      action: "content_block.update",
      entity: "content_blocks",
      entityId: key,
      ip: ctx.ip,
    });
    updateTag(contentBlockTag(key));
    return ok({ key });
  },
});

export type StepsFormState = { error?: Fail; values?: StepsFormValues };

export async function submitStepsForm(
  _previous: StepsFormState,
  formData: FormData,
): Promise<StepsFormState> {
  const key = formData.get("key") === "hygiene" ? "hygiene" : "process";
  const values = stepsFormValues(formData);
  const result = await saveStepsBlock({ key, ...values });
  if (!result.ok) return { error: result, values };
  redirect(`/panel/icerik?kaydedildi=${key === "hygiene" ? "hijyen" : "surec"}`);
}
