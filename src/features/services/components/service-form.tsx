"use client";

import Link from "next/link";
import { type SubmitEvent, useActionState, useState } from "react";

import { FormField } from "@/components/common/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MAX_SERVICE_FAQS } from "@/config/services";
import { focusFirstInvalid, issuesToFieldErrors } from "@/lib/form";
import { slugify } from "@/lib/text";

import { type ServiceFormState, submitServiceForm } from "../actions";
import {
  priceDisplayLabels,
  serviceCategories,
  serviceCategoryLabels,
  serviceFormSchema,
  type ServiceFormValues,
  serviceFormValues,
} from "../schemas";

const selectClass =
  "h-11 w-full rounded-lg border border-input bg-surface px-3 text-base aria-invalid:border-2 aria-invalid:border-danger";

const empty: ServiceFormValues = {
  name: "",
  slug: "",
  category: "kalici-oje",
  summary: "",
  suitableFor: "",
  body: "",
  aftercare: "",
  durabilityText: "",
  durationMinutes: "60",
  refillIntervalDays: "",
  price: "",
  priceDisplayOverride: "",
  faqs: [],
  isBookable: true,
  isActive: true,
};

/**
 * SCR-105: create / edit a service. Checked with the server's schema before sending; typed
 * text survives validation and server errors. The slug follows the name until edited by hand.
 */
export function ServiceForm({ initial }: { initial?: ServiceFormValues & { id: string } }) {
  const [state, action, pending] = useActionState<ServiceFormState, FormData>(
    submitServiceForm,
    {},
  );
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
  const values = state.values ?? initial ?? empty;
  const [slug, setSlug] = useState(values.slug);
  const [slugEdited, setSlugEdited] = useState(Boolean(initial));
  const serverErrors = state.error?.fieldErrors;
  const errorFor = (name: string) => clientErrors[name] ?? serverErrors?.[name]?.[0];

  function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    const parsed = serviceFormSchema.safeParse(
      serviceFormValues(new FormData(event.currentTarget)),
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
      {state.error && state.error.code !== "validation" && (
        <p role="alert" className="rounded-lg bg-danger-muted px-4 py-3 font-semibold text-danger">
          {state.error.message}
        </p>
      )}
      {initial && <input type="hidden" name="id" value={initial.id} />}

      <div className="grid gap-6 sm:grid-cols-2">
        <FormField name="name" label="Hizmet adı" error={errorFor("name")}>
          {(control) => (
            <Input
              {...control}
              defaultValue={values.name}
              maxLength={120}
              onChange={(event) => {
                if (!slugEdited) setSlug(slugify(event.currentTarget.value));
              }}
            />
          )}
        </FormField>
        <FormField
          name="slug"
          label="Kısa ad (adres)"
          hint="Sayfa adresi: /hizmetler/kisa-ad"
          error={errorFor("slug")}
        >
          {(control) => (
            <Input
              {...control}
              value={slug}
              maxLength={120}
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
        <FormField name="category" label="Kategori" error={errorFor("category")}>
          {(control) => (
            <select {...control} defaultValue={values.category} className={selectClass}>
              {serviceCategories.map((category) => (
                <option key={category} value={category}>
                  {serviceCategoryLabels[category]}
                </option>
              ))}
            </select>
          )}
        </FormField>
        <FormField name="durationMinutes" label="Süre (dakika)" error={errorFor("durationMinutes")}>
          {(control) => (
            <Input {...control} inputMode="numeric" defaultValue={values.durationMinutes} />
          )}
        </FormField>
        <FormField
          name="refillIntervalDays"
          label="Yenileme aralığı (gün)"
          hint="Boş: önerilmez"
          error={errorFor("refillIntervalDays")}
        >
          {(control) => (
            <Input {...control} inputMode="numeric" defaultValue={values.refillIntervalDays} />
          )}
        </FormField>
      </div>

      <FormField
        name="summary"
        label="Özet"
        hint="Listede görünen tek cümle"
        error={errorFor("summary")}
      >
        {(control) => (
          <Textarea {...control} defaultValue={values.summary} rows={2} maxLength={200} />
        )}
      </FormField>
      <FormField
        name="durabilityText"
        label="Dayanım"
        hint="Ör. Ortalama 2–3 hafta"
        error={errorFor("durabilityText")}
      >
        {(control) => <Input {...control} defaultValue={values.durabilityText} maxLength={60} />}
      </FormField>
      <FormField name="suitableFor" label="Kime uygun" error={errorFor("suitableFor")}>
        {(control) => <Textarea {...control} defaultValue={values.suitableFor} rows={3} />}
      </FormField>
      <FormField
        name="body"
        label="Nasıl uygulanıyor"
        hint="Sade metin; liste için satır başına - yazın"
        error={errorFor("body")}
      >
        {(control) => <Textarea {...control} defaultValue={values.body} rows={5} />}
      </FormField>
      <FormField name="aftercare" label="Bakım önerileri" error={errorFor("aftercare")}>
        {(control) => <Textarea {...control} defaultValue={values.aftercare} rows={4} />}
      </FormField>

      <fieldset className="space-y-4 rounded-xl border p-4">
        <legend className="px-1 text-sm font-bold">Fiyat</legend>
        <div className="grid gap-6 sm:grid-cols-2">
          <FormField
            name="price"
            label="Tutar (₺)"
            hint="Boş bırakılabilir"
            error={errorFor("price")}
          >
            {(control) => (
              <Input
                {...control}
                inputMode="decimal"
                defaultValue={values.price}
                placeholder="650"
              />
            )}
          </FormField>
          <FormField
            name="priceDisplayOverride"
            label="Bu hizmette fiyat"
            error={errorFor("priceDisplayOverride")}
          >
            {(control) => (
              <select
                {...control}
                defaultValue={values.priceDisplayOverride}
                className={selectClass}
              >
                <option value="">Site ayarını kullan</option>
                <option value="contact">{priceDisplayLabels.contact}</option>
                <option value="show">{priceDisplayLabels.show}</option>
              </select>
            )}
          </FormField>
        </div>
      </fieldset>

      <fieldset className="space-y-4 rounded-xl border p-4">
        <legend className="px-1 text-sm font-bold">
          Sık sorulanlar (en fazla {MAX_SERVICE_FAQS})
        </legend>
        {Array.from({ length: MAX_SERVICE_FAQS }, (_, index) => {
          const faq = values.faqs[index];
          const key = String(index);
          return (
            <div key={key} className="grid gap-4 sm:grid-cols-2">
              <FormField
                name={`faqs.${key}.question`}
                label={`Soru ${String(index + 1)}`}
                error={errorFor(`faqs.${key}.question`)}
              >
                {(control) => <Input {...control} defaultValue={faq?.question} maxLength={200} />}
              </FormField>
              <FormField
                name={`faqs.${key}.answer`}
                label={`Cevap ${String(index + 1)}`}
                error={errorFor(`faqs.${key}.answer`)}
              >
                {(control) => <Textarea {...control} defaultValue={faq?.answer} rows={2} />}
              </FormField>
            </div>
          );
        })}
      </fieldset>

      <div className="space-y-1">
        <label className="flex min-h-11 items-center gap-3 font-semibold">
          <input
            type="checkbox"
            name="isBookable"
            defaultChecked={values.isBookable}
            className="size-5 accent-brand"
          />
          Online randevuya açık
        </label>
        <label className="flex min-h-11 items-center gap-3 font-semibold">
          <input
            type="checkbox"
            name="isActive"
            defaultChecked={values.isActive}
            className="size-5 accent-brand"
          />
          Sitede göster
        </label>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Kaydediliyor…" : "Kaydet"}
        </Button>
        <Button asChild size="lg" variant="ghost">
          <Link href="/panel/hizmetler">Vazgeç</Link>
        </Button>
      </div>
    </form>
  );
}
