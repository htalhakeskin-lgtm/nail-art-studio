"use client";

import Link from "next/link";
import { type SubmitEvent, useActionState, useState } from "react";

import { FormField } from "@/components/common/form-field";
import { UnsavedChangesGuard } from "@/components/common/unsaved-changes-guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { focusFirstInvalid, issuesToFieldErrors } from "@/lib/form";

import { submitTestimonialForm, type TestimonialFormState } from "../actions";
import {
  testimonialFormSchema,
  type TestimonialFormValues,
  testimonialFormValues,
} from "../schemas";

const empty: TestimonialFormValues = {
  displayName: "",
  body: "",
  serviceId: "",
  isSample: false,
  isVisible: true,
};

/** SCR-107: create / edit a review. Typed text survives validation and server errors. */
export function TestimonialForm({
  services,
  initial,
}: {
  services: { id: string; name: string }[];
  initial?: TestimonialFormValues & { id: string };
}) {
  const [state, action, pending] = useActionState<TestimonialFormState, FormData>(
    submitTestimonialForm,
    {},
  );
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
  const values = state.values ?? initial ?? empty;
  const serverErrors = state.error?.fieldErrors;
  const errorFor = (name: string) => clientErrors[name] ?? serverErrors?.[name]?.[0];

  function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    const parsed = testimonialFormSchema.safeParse(
      testimonialFormValues(new FormData(event.currentTarget)),
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
    <form action={action} onSubmit={onSubmit} noValidate className="max-w-2xl space-y-6">
      <UnsavedChangesGuard />
      {state.error && state.error.code !== "validation" && (
        <p role="alert" className="rounded-lg bg-danger-muted px-4 py-3 font-semibold text-danger">
          {state.error.message}
        </p>
      )}
      {initial && <input type="hidden" name="id" value={initial.id} />}

      <FormField
        name="displayName"
        label="Müşterinin adı"
        hint="Ad ve soyadın baş harfi yeterli (örn. Ayşe K.)."
        error={errorFor("displayName")}
      >
        {(control) => <Input {...control} defaultValue={values.displayName} maxLength={40} />}
      </FormField>

      <FormField name="body" label="Yorum" error={errorFor("body")}>
        {(control) => <Textarea {...control} defaultValue={values.body} rows={5} maxLength={500} />}
      </FormField>

      <FormField name="serviceId" label="Hizmet (isteğe bağlı)" error={errorFor("serviceId")}>
        {(control) => (
          <select
            {...control}
            defaultValue={values.serviceId}
            className="h-11 w-full rounded-lg border border-input bg-surface px-3 text-base aria-invalid:border-2 aria-invalid:border-danger"
          >
            <option value="">Belirtme</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>
        )}
      </FormField>

      <div className="space-y-1">
        <label className="flex min-h-11 items-center gap-3 font-semibold">
          <input
            type="checkbox"
            name="isSample"
            defaultChecked={values.isSample}
            className="size-5 accent-primary"
          />
          Örnek yorum (gösterim amaçlı)
        </label>
        <p className="text-sm text-muted-foreground">
          Örnek yorumlar sitede “örnek yorum” etiketiyle görünür. Gerçek bir yorumu yalnızca
          müşterinin izniyle yayımlayın.
        </p>
      </div>

      <label className="flex min-h-11 items-center gap-3 font-semibold">
        <input
          type="checkbox"
          name="isVisible"
          defaultChecked={values.isVisible}
          className="size-5 accent-primary"
        />
        Sitede göster
      </label>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Kaydediliyor…" : "Kaydet"}
        </Button>
        <Button asChild size="lg" variant="ghost">
          <Link href="/panel/yorumlar">Vazgeç</Link>
        </Button>
      </div>
    </form>
  );
}
