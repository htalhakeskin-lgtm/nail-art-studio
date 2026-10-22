"use server";

import { and, eq, min, ne } from "drizzle-orm";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { MAX_UPLOAD_BYTES, rateLimits } from "@/config/limits";
import { type Fail, fail, ok } from "@/lib/result";
import { adminAction } from "@/server/action";
import { diffFields, recordAudit } from "@/server/audit";
import { db } from "@/server/db/client";
import { newId } from "@/server/db/columns";
import { galleryItems, mediaAssets } from "@/server/db/schema";
import { detectImageType, encodeGalleryImage, ImageRejected } from "@/server/media/image";
import { storeVariants } from "@/server/media/storage";

import { GALLERY_TAG } from "./queries";
import {
  galleryItemFormSchema,
  type GalleryItemFormValues,
  galleryItemFormValues,
} from "./schemas";

const MAX_MB = Math.round(MAX_UPLOAD_BYTES / 1024 / 1024);

/**
 * UC-06 step 1 (BR-GLR-002, P-11, P-14): one photo per request. Type from the first bytes,
 * size limit, decode and re-encode (EXIF gone), variants stored, an asset row recorded.
 */
export const uploadGalleryImage = adminAction({
  schema: z.object({
    file: z
      .file("Bir fotoğraf seçin.")
      .min(1, "Dosya boş.")
      .max(MAX_UPLOAD_BYTES, `Dosya en fazla ${String(MAX_MB)} MB olabilir.`),
  }),
  permission: "gallery.edit",
  rateLimit: rateLimits.upload,
  handler: async ({ file }, ctx) => {
    const bytes = new Uint8Array(await file.arrayBuffer());
    const type = detectImageType(bytes);
    if (!type) return fail("BR-GLR-002");
    let image;
    try {
      image = await encodeGalleryImage(bytes);
    } catch (error) {
      if (error instanceof ImageRejected) return fail("BR-GLR-002", { message: error.message });
      throw error;
    }
    const id = newId();
    const stored = await storeVariants(id, image);
    await db.insert(mediaAssets).values({
      id,
      basePath: stored.basePath,
      driver: stored.driver,
      width: image.width,
      height: image.height,
      originalBytes: bytes.length,
      originalMime: `image/${type}`,
      uploadedBy: ctx.session.user.id,
    });
    return ok({ id, basePath: stored.basePath, width: image.width, height: image.height });
  },
});

async function loadAsset(id: string | undefined) {
  if (!id) return null;
  const [asset] = await db.select().from(mediaAssets).where(eq(mediaAssets.id, id)).limit(1);
  return asset ?? null;
}

/**
 * UC-06 step 2: create or edit a work. New works are the studio's own photos, so they are not
 * "representative" and need recorded consent before publishing (BR-GLR-003); they go to the
 * top of the gallery. Numbers come from the identity column (BR-GLR-004).
 */
export const saveGalleryItem = adminAction({
  schema: galleryItemFormSchema,
  permission: "gallery.edit",
  handler: async (input, ctx) => {
    const [taken] = await db
      .select({ id: galleryItems.id })
      .from(galleryItems)
      .where(
        input.id
          ? and(eq(galleryItems.slug, input.slug), ne(galleryItems.id, input.id))
          : eq(galleryItems.slug, input.slug),
      )
      .limit(1);
    if (taken) return fail("validation", { fieldErrors: { slug: ["Bu kısa ad kullanılıyor."] } });

    const [main, before] = await Promise.all([
      loadAsset(input.mediaId),
      loadAsset(input.beforeMediaId),
    ]);
    if (input.mediaId && !main)
      return fail("validation", { fieldErrors: { mediaId: ["Fotoğrafı yeniden yükleyin."] } });
    if (input.beforeMediaId && !before) {
      return fail("validation", {
        fieldErrors: { beforeMediaId: ["Öncesi fotoğrafını yeniden yükleyin."] },
      });
    }

    const [current] = input.id
      ? await db.select().from(galleryItems).where(eq(galleryItems.id, input.id)).limit(1)
      : [];
    if (input.id && !current) return fail("notFound");

    const isRepresentative = current?.isRepresentative ?? false;
    const consentObtainedAt = input.consent ? (current?.consentObtainedAt ?? ctx.now) : null;
    if (input.isPublished && !isRepresentative && !consentObtainedAt) return fail("BR-GLR-003");

    const values = {
      title: input.title,
      slug: input.slug,
      description: input.description || null,
      style: input.style,
      colors: input.colors,
      length: input.length,
      technique: input.technique,
      durationMinutes: input.durationMinutes,
      instagramUrl: input.instagramUrl,
      imageAlt: input.imageAlt,
      consentObtainedAt: isRepresentative
        ? (current?.consentObtainedAt ?? null)
        : consentObtainedAt,
      isPublished: input.isPublished,
      isFeatured: input.isFeatured,
      ...(main
        ? {
            mediaId: main.id,
            imagePath: main.basePath,
            imageWidth: main.width,
            imageHeight: main.height,
          }
        : {}),
      ...(before
        ? {
            beforeMediaId: before.id,
            beforeImagePath: before.basePath,
            beforeImageAlt: input.beforeImageAlt,
          }
        : input.removeBefore
          ? { beforeMediaId: null, beforeImagePath: null, beforeImageAlt: null }
          : current?.beforeImagePath
            ? { beforeImageAlt: input.beforeImageAlt || current.beforeImageAlt }
            : {}),
    };

    if (current) {
      await db.update(galleryItems).set(values).where(eq(galleryItems.id, current.id));
      await recordAudit({
        actorId: ctx.session.user.id,
        action: "gallery.update",
        entity: "gallery_items",
        entityId: current.id,
        changes: diffFields(
          {
            title: current.title,
            slug: current.slug,
            isPublished: current.isPublished,
            image: current.imagePath,
          },
          {
            title: values.title,
            slug: values.slug,
            isPublished: values.isPublished,
            image: main?.basePath ?? current.imagePath,
          },
        ),
        ip: ctx.ip,
      });
      updateTag(GALLERY_TAG);
      return ok({ id: current.id });
    }

    if (!main) return fail("validation", { fieldErrors: { mediaId: ["Bir fotoğraf yükleyin."] } });
    const [first] = await db.select({ value: min(galleryItems.sortOrder) }).from(galleryItems);
    const [created] = await db
      .insert(galleryItems)
      .values({
        ...values,
        imagePath: main.basePath,
        imageWidth: main.width,
        imageHeight: main.height,
        isRepresentative: false,
        sortOrder: (first?.value ?? 10) - 10,
      })
      .returning({ id: galleryItems.id });
    if (!created) return fail("unexpected");
    await recordAudit({
      actorId: ctx.session.user.id,
      action: "gallery.create",
      entity: "gallery_items",
      entityId: created.id,
      ip: ctx.ip,
    });
    updateTag(GALLERY_TAG);
    return ok({ id: created.id });
  },
});

// ── Form adapters ──────────────────────────────────────────────────────────────────────────

export type UploadState =
  | { ok: true; id: string; basePath: string; width: number; height: number }
  | { ok: false; message: string };

/** Called from the upload field with the (browser-shrunk) photo. */
export async function uploadGalleryImageForm(formData: FormData): Promise<UploadState> {
  const file = formData.get("file");
  if (!(file instanceof File)) return { ok: false, message: "Bir fotoğraf seçin." };
  const result = await uploadGalleryImage({ file });
  if (!result.ok) {
    return { ok: false, message: result.fieldErrors?.file?.[0] ?? result.message };
  }
  return { ok: true, ...result.data };
}

export type GalleryItemFormState = { error?: Fail; values?: GalleryItemFormValues };

export async function submitGalleryItemForm(
  _previous: GalleryItemFormState,
  formData: FormData,
): Promise<GalleryItemFormState> {
  const values = galleryItemFormValues(formData);
  const result = await saveGalleryItem(values);
  if (!result.ok) return { error: result, values };
  redirect("/panel/galeri?kaydedildi=eser");
}
