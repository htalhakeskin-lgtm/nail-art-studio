"use client";

import { type SubmitEvent, useActionState, useState } from "react";

import { FormField } from "@/components/common/form-field";
import { UnsavedChangesGuard } from "@/components/common/unsaved-changes-guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { focusFirstInvalid, issuesToFieldErrors } from "@/lib/form";

import { type BusinessSettingsState, submitBusinessSettings } from "../actions";
import {
  businessSettingsSchema,
  type BusinessSettingsValues,
  businessSettingsValues,
} from "../settings-schemas";

/** SCR-110: one form, three groups. Typed text survives validation and server errors. */
export function BusinessSettingsForm({ initial }: { initial: BusinessSettingsValues }) {
  const [state, action, pending] = useActionState<BusinessSettingsState, FormData>(
    submitBusinessSettings,
    {},
  );
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
  const values = state.values ?? initial;
  const errorFor = (name: string) => clientErrors[name] ?? state.error?.fieldErrors?.[name]?.[0];

  function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    const parsed = businessSettingsSchema.safeParse(
      businessSettingsValues(new FormData(event.currentTarget)),
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

  const legend = "font-display text-xl font-medium";

  return (
    <form action={action} onSubmit={onSubmit} noValidate className="max-w-2xl space-y-10">
      <UnsavedChangesGuard />
      {state.error && state.error.code !== "validation" && (
        <p role="alert" className="rounded-lg bg-danger-muted px-4 py-3 font-semibold text-danger">
          {state.error.message}
        </p>
      )}

      <fieldset className="space-y-5">
        <legend className={legend}>İşletme</legend>
        <FormField name="name" label="İşletme adı" error={errorFor("name")}>
          {(control) => <Input {...control} defaultValue={values.name} maxLength={80} />}
        </FormField>
        <FormField name="owner" label="İşletmeci" error={errorFor("owner")}>
          {(control) => <Input {...control} defaultValue={values.owner} maxLength={80} />}
        </FormField>
        <FormField
          name="tagline"
          label="Kısa tanıtım"
          hint="Alt bilgide ve paylaşımlarda görünür."
          error={errorFor("tagline")}
        >
          {(control) => <Input {...control} defaultValue={values.tagline} maxLength={120} />}
        </FormField>
        <FormField name="address" label="Açık adres" error={errorFor("address")}>
          {(control) => (
            <Input
              {...control}
              defaultValue={values.address}
              maxLength={200}
              autoComplete="street-address"
            />
          )}
        </FormField>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField name="district" label="İlçe" error={errorFor("district")}>
            {(control) => <Input {...control} defaultValue={values.district} maxLength={60} />}
          </FormField>
          <FormField name="city" label="İl" error={errorFor("city")}>
            {(control) => <Input {...control} defaultValue={values.city} maxLength={60} />}
          </FormField>
        </div>
      </fieldset>

      <fieldset className="space-y-5">
        <legend className={legend}>İletişim</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField name="phone" label="Telefon" error={errorFor("phone")}>
            {(control) => (
              <Input
                {...control}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                defaultValue={values.phone}
              />
            )}
          </FormField>
          <FormField name="whatsapp" label="WhatsApp numarası" error={errorFor("whatsapp")}>
            {(control) => (
              <Input {...control} type="tel" inputMode="tel" defaultValue={values.whatsapp} />
            )}
          </FormField>
        </div>
        <FormField name="email" label="E-posta" error={errorFor("email")}>
          {(control) => (
            <Input {...control} type="email" autoComplete="email" defaultValue={values.email} />
          )}
        </FormField>
        <FormField
          name="whatsappMessage"
          label="WhatsApp karşılama mesajı"
          hint="Ziyaretçi WhatsApp düğmesine dokununca mesaj kutusunda hazır gelir."
          error={errorFor("whatsappMessage")}
        >
          {(control) => (
            <Textarea {...control} defaultValue={values.whatsappMessage} rows={2} maxLength={300} />
          )}
        </FormField>
        <FormField
          name="instagram"
          label="Instagram kullanıcı adı"
          hint="@ olmadan. Boş bırakırsanız Instagram bağlantıları gizlenir."
          error={errorFor("instagram")}
        >
          {(control) => (
            <Input {...control} defaultValue={values.instagram} maxLength={31} spellCheck={false} />
          )}
        </FormField>
      </fieldset>

      <fieldset className="space-y-5">
        <legend className={legend}>Arama sonuçlarında</legend>
        <FormField
          name="defaultTitle"
          label="Ana sayfa başlığı"
          hint="En fazla 60 karakter."
          error={errorFor("defaultTitle")}
        >
          {(control) => <Input {...control} defaultValue={values.defaultTitle} maxLength={60} />}
        </FormField>
        <FormField
          name="defaultDescription"
          label="Ana sayfa açıklaması"
          hint="50–160 karakter: ne yaptığınızı ve nerede olduğunuzu söyleyin."
          error={errorFor("defaultDescription")}
        >
          {(control) => (
            <Textarea
              {...control}
              defaultValue={values.defaultDescription}
              rows={3}
              maxLength={160}
            />
          )}
        </FormField>
      </fieldset>

      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Kaydediliyor…" : "Kaydet"}
      </Button>
    </form>
  );
}
