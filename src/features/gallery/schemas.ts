import { z } from "zod";

import {
  GALLERY_COLORS,
  GALLERY_LENGTHS,
  GALLERY_STYLES,
  GALLERY_TECHNIQUES,
} from "@/config/gallery";

export {
  type GalleryColor,
  galleryColorLabels,
  type GalleryLength,
  galleryLengthLabels,
  type GalleryStyle,
  galleryStyleHints,
  galleryStyleLabels,
  type GalleryTechnique,
  galleryTechniqueLabels,
} from "./labels";

export const galleryIdSchema = z.object({ id: z.uuid() });

/**
 * Panel work form (SCR-106, UC-06). Same schema in the browser and in the action. A client's own
 * photo needs the consent box before it can be published (BR-GLR-003).
 */
export const galleryItemFormSchema = z
  .object({
    id: z.uuid().optional(),
    title: z
      .string()
      .trim()
      .min(3, "Başlık en az 3 karakter olmalı.")
      .max(90, "Başlık en fazla 90 karakter olabilir."),
    slug: z
      .string()
      .trim()
      .max(90, "Kısa ad en fazla 90 karakter olabilir.")
      .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Kısa ad yalnızca küçük harf, rakam ve tire içerebilir."),
    description: z.string().trim().max(400, "Açıklama en fazla 400 karakter olabilir."),
    style: z.enum(GALLERY_STYLES, "Bir stil seçin."),
    colors: z.array(z.enum(GALLERY_COLORS)).min(1, "En az bir renk seçin."),
    length: z.enum(GALLERY_LENGTHS, "Bir uzunluk seçin."),
    technique: z.enum(GALLERY_TECHNIQUES, "Bir teknik seçin."),
    durationMinutes: z
      .string()
      .trim()
      .transform((value, ctx) => {
        if (value === "") return null;
        if (!/^\d+$/.test(value) || Number(value) < 5 || Number(value) > 600) {
          ctx.addIssue({ code: "custom", message: "Süreyi 5–600 dakika olarak yazın." });
          return z.NEVER;
        }
        return Number(value);
      }),
    instagramUrl: z
      .string()
      .trim()
      .transform((value) => value || null)
      .pipe(
        z
          .url({
            hostname: /(^|\.)instagram\.com$/,
            error: "Bir Instagram gönderi bağlantısı yapıştırın.",
          })
          .nullable(),
      ),
    mediaId: z.uuid("Bir fotoğraf yükleyin.").optional(),
    imageAlt: z
      .string()
      .trim()
      .min(10, "Görseli birkaç kelimeyle anlatın (en az 10 karakter).")
      .max(200, "En fazla 200 karakter olabilir."),
    beforeMediaId: z.uuid().optional(),
    beforeImageAlt: z.string().trim().max(200, "En fazla 200 karakter olabilir."),
    removeBefore: z.boolean(),
    consent: z.boolean(),
    isPublished: z.boolean(),
    isFeatured: z.boolean(),
  })
  .superRefine((value, ctx) => {
    if (!value.id && !value.mediaId) {
      ctx.addIssue({ code: "custom", path: ["mediaId"], message: "Bir fotoğraf yükleyin." });
    }
    if (value.beforeMediaId && value.beforeImageAlt.length < 10) {
      ctx.addIssue({
        code: "custom",
        path: ["beforeImageAlt"],
        message: "Öncesi fotoğrafını birkaç kelimeyle anlatın (en az 10 karakter).",
      });
    }
  });

export type GalleryItemFormValues = z.input<typeof galleryItemFormSchema>;

export function galleryItemFormValues(formData: FormData): GalleryItemFormValues {
  const text = (name: string) => {
    const value = formData.get(name);
    return typeof value === "string" ? value : "";
  };
  const id = text("id");
  const mediaId = text("mediaId");
  const beforeMediaId = text("beforeMediaId");
  return {
    ...(id ? { id } : {}),
    title: text("title"),
    slug: text("slug"),
    description: text("description"),
    style: text("style") as GalleryItemFormValues["style"],
    colors: formData
      .getAll("colors")
      .filter(
        (value): value is string => typeof value === "string",
      ) as GalleryItemFormValues["colors"],
    length: text("length") as GalleryItemFormValues["length"],
    technique: text("technique") as GalleryItemFormValues["technique"],
    durationMinutes: text("durationMinutes"),
    instagramUrl: text("instagramUrl"),
    ...(mediaId ? { mediaId } : {}),
    imageAlt: text("imageAlt"),
    ...(beforeMediaId ? { beforeMediaId } : {}),
    beforeImageAlt: text("beforeImageAlt"),
    removeBefore: formData.get("removeBefore") === "on",
    consent: formData.get("consent") === "on",
    isPublished: formData.get("isPublished") === "on",
    isFeatured: formData.get("isFeatured") === "on",
  };
}
