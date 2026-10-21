"use client";

import { Send } from "lucide-react";
import Link from "next/link";
import { type SubmitEvent, useActionState, useState } from "react";

import { FormField } from "@/components/common/form-field";
import { SpamGuard } from "@/components/common/spam-guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { focusFirstInvalid, issuesToFieldErrors } from "@/lib/form";
import { cn } from "@/lib/utils";

import { type ContactFormState, submitContactForm } from "../actions";
import {
  contactFormSchema,
  contactFormValues,
  PREFERRED_CHANNELS,
  preferredChannelLabels,
} from "../schemas";

/**
 * UC-07 contact form (SCR-010). Checked with the server's schema before sending; typed text
 * survives validation and server errors. The information notice is a sentence with a link,
 * never a "read it" checkbox (10-yasal §3). No health details are asked for (K-11).
 */
export function ContactForm({ sourcePath = "/iletisim" }: { sourcePath?: string }) {
  const [state, action, pending] = useActionState<ContactFormState, FormData>(
    submitContactForm,
    {},
  );
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
  const values = state.values;
  const serverErrors = state.error?.fieldErrors;
  const errorFor = (name: string) => clientErrors[name] ?? serverErrors?.[name]?.[0];
  const channelError = errorFor("preferredChannel");

  function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    const parsed = contactFormSchema.safeParse(
      contactFormValues(new FormData(event.currentTarget)),
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
      {state.error && state.error.code !== "validation" && (
        <p role="alert" className="rounded-lg bg-danger-muted px-4 py-3 font-semibold text-danger">
          {state.error.message}
        </p>
      )}
      <SpamGuard />
      <input type="hidden" name="sourcePath" value={sourcePath} />

      <FormField name="name" label="Adınız" error={errorFor("name")}>
        {(control) => (
          <Input {...control} defaultValue={values?.name} autoComplete="name" maxLength={80} />
        )}
      </FormField>

      <div className="grid gap-5 sm:grid-cols-2">
        <FormField
          name="phone"
          label="Telefon"
          hint="WhatsApp ya da telefonla dönüş için"
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
        <FormField name="email" label="E-posta" hint="İsteğe bağlı" error={errorFor("email")}>
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
        <legend className="text-sm font-semibold">Size nasıl dönelim?</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {PREFERRED_CHANNELS.map((channel) => (
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
              {preferredChannelLabels[channel]}
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
        name="message"
        label="Mesajınız"
        hint="Alerji gibi sağlık bilgilerinizi buraya yazmayın; uygulamadan önce yüz yüze konuşuruz."
        error={errorFor("message")}
      >
        {(control) => (
          <Textarea {...control} defaultValue={values?.message} rows={5} maxLength={1500} />
        )}
      </FormField>

      <p className="text-sm text-muted-foreground">
        Gönderdiğiniz bilgiler talebinizi yönetmek amacıyla işlenir. Ayrıntılar için{" "}
        <Link href="/kvkk" className="font-semibold text-brand underline underline-offset-2">
          KVKK Aydınlatma Metni
        </Link>
        &apos;ni inceleyebilirsiniz.
      </p>

      <Button type="submit" size="lg" disabled={pending} className="w-full sm:w-auto">
        <Send aria-hidden="true" />
        {pending ? "Gönderiliyor…" : "Mesajı gönder"}
      </Button>
    </form>
  );
}
