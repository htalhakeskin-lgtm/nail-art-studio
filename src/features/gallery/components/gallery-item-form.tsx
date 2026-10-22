"use client";

import Link from "next/link";
import { type SubmitEvent, useActionState, useState } from "react";

import { FormField } from "@/components/common/form-field";
import { UnsavedChangesGuard } from "@/components/common/unsaved-changes-guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  GALLERY_COLORS,
  GALLERY_LENGTHS,
  GALLERY_STYLES,
  GALLERY_TECHNIQUES,
} from "@/config/gallery";
import { focusFirstInvalid, issuesToFieldErrors } from "@/lib/form";
import { slugify } from "@/lib/text";

import { type GalleryItemFormState, submitGalleryItemForm } from "../editor-actions";
import {
  galleryColorLabels,
  galleryItemFormSchema,
  type GalleryItemFormValues,
  galleryItemFormValues,
  galleryLengthLabels,
  galleryStyleLabels,
  galleryTechniqueLabels,
} from "../schemas";
import { ImageUploadField } from "./image-upload-field";
import { Swatch } from "./swatch";

const selectClass =
  "h-11 w-full rounded-lg border border-input bg-surface px-3 text-base aria-invalid:border-2 aria-invalid:border-danger";

const empty: GalleryItemFormValues = {
  title: "",
  slug: "",
  description: "",
  style: "sade",
  colors: [],
  length: "kisa",
  technique: "kalici-oje",
  durationMinutes: "",
  instagramUrl: "",
  imageAlt: "",
  beforeImageAlt: "",
  removeBefore: false,
  consent: false,
  isPublished: false,
  isFeatured: false,
};

export type GalleryItemFormInitial = GalleryItemFormValues & {
  id: string;
  isRepresentative: boolean;
  imagePath: string;
  beforeImagePath: string | null;
};

/**
 * SCR-106 (UC-06): upload the work (and optionally the same hand before), describe it so the
 * filters find it, confirm the client's consent, publish. Checked with the server's schema
 * before sending; typed text survives errors.
 */
export function GalleryItemForm({ initial }: { initial?: GalleryItemFormInitial }) {
  const [state, action, pending] = useActionState<GalleryItemFormState, FormData>(
    submitGalleryItemForm,
    {},
  );
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
  const values = state.values ?? initial ?? empty;
  const [slug, setSlug] = useState(values.slug);
  const [slugEdited, setSlugEdited] = useState(Boolean(initial));
  const errorFor = (name: string) => clientErrors[name] ?? state.error?.fieldErrors?.[name]?.[0];
  const representative = initial?.isRepresentative ?? false;

  function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    const parsed = galleryItemFormSchema.safeParse(
      galleryItemFormValues(new FormData(event.currentTarget)),
    );
    if (parsed.success) {
      setClientErrors({});
      return;
    }
    event.preventDefault();
    const errors = issuesToFieldErrors(parsed.error);
    setClientErrors(errors);
    focusFirstInvalid(event.currentTarget, errors);
  }

  return (
    <form action={action} onSubmit={onSubmit} noValidate className="max-w-3xl space-y-6">
      <UnsavedChangesGuard />
      {state.error && state.error.code !== "validation" && (
        <p role="alert" className="rounded-lg bg-danger-muted px-4 py-3 font-semibold text-danger">
          {state.error.message}
        </p>
      )}
      {initial && <input type="hidden" name="id" value={initial.id} />}

      <div className="grid gap-6 sm:grid-cols-2">
        <ImageUploadField
          name="mediaId"
          label={initial ? "Fotoğrafı değiştir" : "Fotoğraf"}
          hint="JPEG, PNG ya da WebP. 4:5 dikey kırpılır; konum bilgisi silinir."
          current={initial ? { path: initial.imagePath, alt: initial.imageAlt } : null}
          error={errorFor("mediaId")}
        />
        <ImageUploadField
          name="beforeMediaId"
          label="Öncesi fotoğrafı (isteğe bağlı)"
          hint="Aynı elin uygulamadan önceki hâli; sitede karşılaştırma olarak görünür."
          current={
            initial?.beforeImagePath
              ? { path: initial.beforeImagePath, alt: initial.beforeImageAlt }
              : null
          }
          error={errorFor("beforeMediaId")}
        />
      </div>

      <FormField
        name="imageAlt"
        label="Fotoğrafın açıklaması"
        hint="Görmeyen ziyaretçiler için: renkler, desen, form."
        error={errorFor("imageAlt")}
      >
        {(control) => <Input {...control} defaultValue={values.imageAlt} maxLength={200} />}
      </FormField>
      <FormField
        name="beforeImageAlt"
        label="Öncesi fotoğrafının açıklaması"
        hint="Yalnızca öncesi fotoğrafı varsa"
        error={errorFor("beforeImageAlt")}
      >
        {(control) => <Input {...control} defaultValue={values.beforeImageAlt} maxLength={200} />}
      </FormField>
      {initial?.beforeImagePath && (
        <label className="flex min-h-11 items-center gap-3 font-semibold">
          <input
            type="checkbox"
            name="removeBefore"
            defaultChecked={values.removeBefore}
            className="size-5 accent-brand"
          />
          Öncesi fotoğrafını kaldır
        </label>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <FormField name="title" label="Başlık" error={errorFor("title")}>
          {(control) => (
            <Input
              {...control}
              defaultValue={values.title}
              maxLength={90}
              onChange={(event) => {
                if (!slugEdited) setSlug(slugify(event.currentTarget.value));
              }}
            />
          )}
        </FormField>
        <FormField
          name="slug"
          label="Kısa ad (adres)"
          hint="/galeri/kisa-ad"
          error={errorFor("slug")}
        >
          {(control) => (
            <Input
              {...control}
              value={slug}
              maxLength={90}
              autoCapitalize="none"
              onChange={(event) => {
                setSlugEdited(true);
                setSlug(event.currentTarget.value);
              }}
            />
          )}
        </FormField>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <FormField name="style" label="Stil" error={errorFor("style")}>
          {(control) => (
            <select {...control} defaultValue={values.style} className={selectClass}>
              {GALLERY_STYLES.map((style) => (
                <option key={style} value={style}>
                  {galleryStyleLabels[style]}
                </option>
              ))}
            </select>
          )}
        </FormField>
        <FormField name="technique" label="Teknik" error={errorFor("technique")}>
          {(control) => (
            <select {...control} defaultValue={values.technique} className={selectClass}>
              {GALLERY_TECHNIQUES.map((technique) => (
                <option key={technique} value={technique}>
                  {galleryTechniqueLabels[technique]}
                </option>
              ))}
            </select>
          )}
        </FormField>
        <FormField name="length" label="Uzunluk" error={errorFor("length")}>
          {(control) => (
            <select {...control} defaultValue={values.length} className={selectClass}>
              {GALLERY_LENGTHS.map((length) => (
                <option key={length} value={length}>
                  {galleryLengthLabels[length]}
                </option>
              ))}
            </select>
          )}
        </FormField>
      </div>

      <fieldset aria-describedby={errorFor("colors") ? "alan-colors-hata" : undefined}>
        <legend className="text-sm font-semibold">Renkler</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {GALLERY_COLORS.map((color) => (
            <label
              key={color}
              className="inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border bg-surface px-3 text-sm font-semibold has-checked:border-transparent has-checked:bg-primary has-checked:text-primary-foreground"
            >
              <input
                type="checkbox"
                name="colors"
                value={color}
                defaultChecked={values.colors.includes(color)}
                className="sr-only"
              />
              <Swatch color={color} />
              {galleryColorLabels[color]}
            </label>
          ))}
        </div>
        {errorFor("colors") && (
          <p id="alan-colors-hata" className="mt-2 text-sm font-semibold text-danger">
            {errorFor("colors")}
          </p>
        )}
      </fieldset>

      <div className="grid gap-6 sm:grid-cols-2">
        <FormField
          name="durationMinutes"
          label="Yaklaşık süre (dakika)"
          hint="İsteğe bağlı"
          error={errorFor("durationMinutes")}
        >
          {(control) => (
            <Input {...control} inputMode="numeric" defaultValue={values.durationMinutes} />
          )}
        </FormField>
        <FormField
          name="instagramUrl"
          label="Instagram gönderisi"
          hint="İsteğe bağlı"
          error={errorFor("instagramUrl")}
        >
          {(control) => (
            <Input {...control} type="url" inputMode="url" defaultValue={values.instagramUrl} />
          )}
        </FormField>
      </div>

      <FormField
        name="description"
        label="Açıklama"
        hint="İsteğe bağlı, eser sayfasında görünür"
        error={errorFor("description")}
      >
        {(control) => (
          <Textarea {...control} rows={3} maxLength={400} defaultValue={values.description} />
        )}
      </FormField>

      <div className="space-y-1 rounded-xl border p-4">
        {representative ? (
          <p className="text-sm text-muted-foreground">
            Bu bir temsilî (stok) görsel; müşteri izni gerekmez. Gerçek işlerinizi “Yeni iş” ile
            ekleyin.
          </p>
        ) : (
          <label className="flex min-h-11 items-start gap-3 py-2 font-semibold">
            <input
              type="checkbox"
              name="consent"
              defaultChecked={values.consent}
              className="mt-0.5 size-5 shrink-0 accent-brand"
            />
            <span>
              Müşteri izni alındı
              <span className="block text-sm font-normal text-muted-foreground">
                Fotoğrafın sitede yayımlanmasına yazılı izin verdi (BR-GLR-003). İzin olmadan
                yayımlanamaz.
              </span>
            </span>
          </label>
        )}
        <label className="flex min-h-11 items-center gap-3 font-semibold">
          <input
            type="checkbox"
            name="isPublished"
            defaultChecked={values.isPublished}
            className="size-5 accent-brand"
          />
          Sitede yayımla
        </label>
        <label className="flex min-h-11 items-center gap-3 font-semibold">
          <input
            type="checkbox"
            name="isFeatured"
            defaultChecked={values.isFeatured}
            className="size-5 accent-brand"
          />
          Ana sayfa seçkisinde göster
        </label>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Kaydediliyor…" : "Kaydet"}
        </Button>
        <Button asChild size="lg" variant="ghost">
          <Link href="/panel/galeri">Vazgeç</Link>
        </Button>
      </div>
    </form>
  );
}
