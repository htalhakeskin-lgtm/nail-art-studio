"use client";

import { CalendarCheck } from "lucide-react";
import Link from "next/link";
import { type SubmitEvent, useActionState, useState } from "react";

import { FormField } from "@/components/common/form-field";
import { SpamGuard } from "@/components/common/spam-guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { focusFirstInvalid, issuesToFieldErrors } from "@/lib/form";
import { formatDate, formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";

import { type AppointmentFormState, submitAppointmentForm } from "../request-actions";
import {
  appointmentRequestSchema,
  appointmentRequestValues,
  BOOKING_CHANNELS,
  bookingChannelLabels,
} from "../request-schema";

type AppointmentFormProps = {
  serviceId: string;
  serviceName: string;
  startsAt: string;
  referenceWork?: string;
  instant: boolean;
};

const describe = (iso: string) => {
  const date = new Date(iso);
  return `${formatDate(date, "withWeekday")} ${formatTime(date)}`;
};

/**
 * UC-01 step 4–5 (REQ-001): visitor details and summary. Checked with the server's schema
 * before sending; typed text survives errors. If the time was taken meanwhile (BR-RND-003),
 * the nearest free times are offered right here and choosing one keeps everything typed.
 */
export function AppointmentForm({
  serviceId,
  serviceName,
  startsAt: initialStartsAt,
  referenceWork,
  instant,
}: AppointmentFormProps) {
  const [state, action, pending] = useActionState<AppointmentFormState, FormData>(
    submitAppointmentForm,
    {},
  );
  const [startsAt, setStartsAt] = useState(state.values?.startsAt ?? initialStartsAt);
  const [dismissed, setDismissed] = useState<AppointmentFormState | null>(null);
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
  const values = state.values;
  const serverError = state === dismissed ? undefined : state.error;
  const errorFor = (name: string) => clientErrors[name] ?? serverError?.fieldErrors?.[name]?.[0];
  const channelError = errorFor("preferredChannel");

  function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    const parsed = appointmentRequestSchema.safeParse(
      appointmentRequestValues(new FormData(event.currentTarget)),
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
    <form action={action} onSubmit={onSubmit} noValidate className="relative space-y-5">
      <SpamGuard />
      <input type="hidden" name="serviceId" value={serviceId} />
      <input type="hidden" name="startsAt" value={startsAt} />
      {referenceWork && <input type="hidden" name="referenceWork" value={referenceWork} />}

      <div className="rounded-[1.25rem] bg-surface-muted p-4">
        <p className="text-sm font-semibold text-muted-foreground">Özet</p>
        <p className="mt-1 font-display text-xl">{serviceName}</p>
        <p className="font-semibold tabular-nums">{describe(startsAt)}</p>
      </div>

      {serverError && serverError.code !== "validation" && (
        <div role="alert" className="rounded-lg bg-danger-muted px-4 py-3 text-danger">
          <p className="font-semibold">{serverError.message}</p>
          {state.alternatives && state.alternatives.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {state.alternatives.map((alternative) => (
                <Button
                  key={alternative}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setStartsAt(alternative);
                    setDismissed(state);
                  }}
                >
                  {describe(alternative)}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}

      <FormField name="name" label="Adınız" error={errorFor("name")}>
        {(control) => (
          <Input {...control} defaultValue={values?.name} autoComplete="name" maxLength={80} />
        )}
      </FormField>
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          name="phone"
          label="Telefon"
          hint="Randevu onayı bu numaraya gelir"
          error={errorFor("phone")}
        >
          {(control) => (
            <Input
              {...control}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="0532 123 45 67"
              defaultValue={values?.phone}
            />
          )}
        </FormField>
        <FormField
          name="email"
          label="E-posta"
          hint="İsteğe bağlı: onay ve bağlantı e-postayla da gelsin"
          error={errorFor("email")}
        >
          {(control) => (
            <Input
              {...control}
              type="email"
              inputMode="email"
              autoComplete="email"
              defaultValue={values?.email}
            />
          )}
        </FormField>
      </div>

      <fieldset aria-describedby={channelError ? "alan-preferredChannel-hata" : undefined}>
        <legend className="text-sm font-semibold">Size nasıl ulaşalım?</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {BOOKING_CHANNELS.map((channel) => (
            <label
              key={channel}
              className={cn(
                "inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border bg-surface px-4 text-sm font-semibold has-checked:border-transparent has-checked:bg-primary has-checked:text-primary-foreground has-focus-visible:outline-2 has-focus-visible:outline-ring",
                channelError && "border-danger",
              )}
            >
              <input
                type="radio"
                name="preferredChannel"
                value={channel}
                defaultChecked={(values?.preferredChannel ?? "whatsapp") === channel}
                className="size-4 accent-brand"
              />
              {bookingChannelLabels[channel]}
            </label>
          ))}
        </div>
        {channelError && (
          <p id="alan-preferredChannel-hata" className="mt-2 text-sm font-semibold text-danger">
            {channelError}
          </p>
        )}
      </fieldset>

      <FormField
        name="note"
        label="Notunuz"
        hint="Tasarım fikriniz, form ya da renk tercihiniz. Alerji gibi sağlık bilgilerinizi yazmayın; uygulamadan önce yüz yüze konuşuruz."
        error={errorFor("note")}
      >
        {(control) => (
          <Textarea {...control} defaultValue={values?.note} rows={3} maxLength={500} />
        )}
      </FormField>

      <p className="text-sm text-muted-foreground">
        Gönderdiğiniz bilgiler randevunuzu yönetmek amacıyla işlenir. Ayrıntılar için{" "}
        <Link href="/kvkk" className="font-semibold text-brand underline underline-offset-2">
          KVKK Aydınlatma Metni
        </Link>
        &apos;ni ve{" "}
        <Link
          href="/randevu-kosullari"
          className="font-semibold text-brand underline underline-offset-2"
        >
          Randevu ve İptal Koşulları
        </Link>
        &apos;nı inceleyebilirsiniz.
      </p>

      <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
        <CalendarCheck aria-hidden="true" />
        {pending ? "Gönderiliyor…" : instant ? "Randevuyu al" : "Randevu talebini gönder"}
      </Button>
    </form>
  );
}
