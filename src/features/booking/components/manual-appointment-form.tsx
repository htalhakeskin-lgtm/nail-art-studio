"use client";

import { type SubmitEvent, useActionState, useState } from "react";

import { FormField } from "@/components/common/form-field";
import { UnsavedChangesGuard } from "@/components/common/unsaved-changes-guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { focusFirstInvalid, issuesToFieldErrors } from "@/lib/form";

import { type ManualFormState, submitManualAppointment } from "../panel-actions";
import { appointmentRequestSchema } from "../request-schema";

const manualSchema = appointmentRequestSchema.pick({
  serviceId: true,
  startsAt: true,
  name: true,
  phone: true,
  email: true,
  note: true,
});

const read = (formData: FormData) => {
  const text = (name: string) => {
    const value = formData.get(name);
    return typeof value === "string" ? value : "";
  };
  return {
    serviceId: text("serviceId"),
    startsAt: text("startsAt"),
    name: text("name"),
    phone: text("phone"),
    email: text("email"),
    note: text("note"),
  };
};

/** UC-05: the customer part of a booking taken by phone or DM. Starts confirmed. */
export function ManualAppointmentForm({
  serviceId,
  startsAt,
}: {
  serviceId: string;
  startsAt: string;
}) {
  const [state, action, pending] = useActionState<ManualFormState, FormData>(
    submitManualAppointment,
    {},
  );
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
  const errorFor = (name: string) => clientErrors[name] ?? state.error?.fieldErrors?.[name]?.[0];

  function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    const parsed = manualSchema.safeParse(read(new FormData(event.currentTarget)));
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
    <form action={action} onSubmit={onSubmit} noValidate className="space-y-4">
      <UnsavedChangesGuard />
      {state.error && state.error.code !== "validation" && (
        <p role="alert" className="rounded-lg bg-danger-muted px-4 py-3 font-semibold text-danger">
          {state.error.message}
        </p>
      )}
      <input type="hidden" name="serviceId" value={serviceId} />
      <input type="hidden" name="startsAt" value={startsAt} />
      <FormField name="name" label="Müşteri adı" error={errorFor("name")}>
        {(control) => <Input {...control} defaultValue={state.values?.name} maxLength={80} />}
      </FormField>
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField name="phone" label="Telefon" error={errorFor("phone")}>
          {(control) => (
            <Input
              {...control}
              type="tel"
              inputMode="tel"
              placeholder="0532 123 45 67"
              defaultValue={state.values?.phone}
            />
          )}
        </FormField>
        <FormField name="email" label="E-posta" hint="İsteğe bağlı" error={errorFor("email")}>
          {(control) => (
            <Input {...control} type="email" inputMode="email" defaultValue={state.values?.email} />
          )}
        </FormField>
      </div>
      <FormField
        name="note"
        label="Not"
        hint="Tasarım, referans fotoğraf; sağlık bilgisi yazmayın."
        error={errorFor("note")}
      >
        {(control) => (
          <Textarea {...control} rows={3} maxLength={500} defaultValue={state.values?.note} />
        )}
      </FormField>
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? "Kaydediliyor…" : "Randevuyu kaydet"}
      </Button>
    </form>
  );
}
