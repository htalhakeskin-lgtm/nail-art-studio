"use server";

import { eq, sql } from "drizzle-orm";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { fail, ok } from "@/lib/result";
import { adminAction } from "@/server/action";
import { recordAudit } from "@/server/audit";
import { db } from "@/server/db/client";
import { galleryItems } from "@/server/db/schema";

import { GALLERY_TAG } from "./queries";
import { galleryIdSchema } from "./schemas";

/**
 * Publish or unpublish a work (SCR-106). BR-GLR-003: a client's own photo needs recorded
 * consent before it is published; the check constraint enforces the same rule in the database.
 */
export const toggleGalleryPublished = adminAction({
  schema: galleryIdSchema,
  permission: "gallery.edit",
  handler: async ({ id }, ctx) => {
    const [row] = await db
      .select({
        isPublished: galleryItems.isPublished,
        isRepresentative: galleryItems.isRepresentative,
        consentObtainedAt: galleryItems.consentObtainedAt,
      })
      .from(galleryItems)
      .where(eq(galleryItems.id, id))
      .limit(1);
    if (!row) return fail("notFound");
    if (!row.isPublished && !row.isRepresentative && !row.consentObtainedAt) {
      return fail("BR-GLR-003");
    }
    const [updated] = await db
      .update(galleryItems)
      // Flipped in SQL: two quick clicks can never both read the same old value.
      .set({ isPublished: sql`not ${galleryItems.isPublished}` })
      .where(eq(galleryItems.id, id))
      .returning({ isPublished: galleryItems.isPublished });
    if (!updated) return fail("notFound");
    await recordAudit({
      actorId: ctx.session.user.id,
      action: updated.isPublished ? "gallery.publish" : "gallery.unpublish",
      entity: "gallery_items",
      entityId: id,
      changes: { isPublished: { from: !updated.isPublished, to: updated.isPublished } },
      ip: ctx.ip,
    });
    updateTag(GALLERY_TAG);
    return ok({ isPublished: updated.isPublished });
  },
});

/** Featured works appear in the home page "Seçki" (plan §6). */
export const toggleGalleryFeatured = adminAction({
  schema: galleryIdSchema,
  permission: "gallery.edit",
  handler: async ({ id }, ctx) => {
    const [updated] = await db
      .update(galleryItems)
      .set({ isFeatured: sql`not ${galleryItems.isFeatured}` })
      .where(eq(galleryItems.id, id))
      .returning({ isFeatured: galleryItems.isFeatured });
    if (!updated) return fail("notFound");
    await recordAudit({
      actorId: ctx.session.user.id,
      action: updated.isFeatured ? "gallery.feature" : "gallery.unfeature",
      entity: "gallery_items",
      entityId: id,
      changes: { isFeatured: { from: !updated.isFeatured, to: updated.isFeatured } },
      ip: ctx.ip,
    });
    updateTag(GALLERY_TAG);
    return ok({ isFeatured: updated.isFeatured });
  },
});

// ── Form adapters (<form action>) ──────────────────────────────────────────────────────────

function formText(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
}

/** A refused publish (BR-GLR-003) comes back to the list with its message. */
export async function toggleGalleryPublishedForm(formData: FormData): Promise<void> {
  const result = await toggleGalleryPublished({ id: formText(formData, "id") });
  if (!result.ok) redirect(`/panel/galeri?hata=${result.code}`);
}

export async function toggleGalleryFeaturedForm(formData: FormData): Promise<void> {
  await toggleGalleryFeatured({ id: formText(formData, "id") });
}
