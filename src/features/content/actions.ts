"use server";

import { eq } from "drizzle-orm";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { contentBlockDefaults } from "@/content/content-blocks";
import { type Fail, ok } from "@/lib/result";
import { adminAction } from "@/server/action";
import { diffFields, recordAudit } from "@/server/audit";
import { db } from "@/server/db/client";
import { contentBlocks } from "@/server/db/schema";

import { contentBlockTag } from "./queries";
import { aboutBlockSchema, type AboutFormValues, aboutFormValues } from "./schemas";

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
