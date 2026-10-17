"use client";

import Link from "next/link";
import { type SubmitEvent, useActionState, useState } from "react";

import { FormField } from "@/components/common/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { focusFirstInvalid, issuesToFieldErrors } from "@/lib/form";

import { type AboutFormState, submitAboutForm } from "../actions";
import { aboutBlockSchema, type AboutFormValues, aboutFormValues } from "../schemas";

const SECTION_SLOTS = 4;

/** SCR-108: about page copy. Up to four "Nasıl çalışıyoruz" sections; empty slots are ignored. */
export function AboutForm({ initial }: { initial: AboutFormValues }) {
  const [state, action, pending] = useActionState<AboutFormState, FormData>(submitAboutForm, {});
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
  const values = state.values ?? initial;
  const errorFor = (name: string) =>
    clientErrors[name] ?? state.error?.fieldErrors?.[name.split(".")[0] ?? name]?.[0];
  const slots = Array.from({ length: SECTION_SLOTS }, (_, index) => values.sections[index]);

  function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    const parsed = aboutBlockSchema.safeParse(aboutFormValues(new FormData(event.currentTarget)));
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
      {state.error && state.error.code !== "validation" && (
        <p role="alert" className="rounded-lg bg-danger-muted px-4 py-3 font-semibold text-danger">
          {state.error.message}
        </p>
      )}

      <FormField name="eyebrow" label="Üst başlık" error={errorFor("eyebrow")}>
        {(control) => <Input {...control} defaultValue={values.eyebrow} maxLength={60} />}
      </FormField>
      <FormField
        name="intro"
        label="Giriş metni"
        hint="Ana sayfadaki “Stüdyo” bölümünde de görünür."
        error={errorFor("intro")}
      >
        {(control) => <Textarea {...control} defaultValue={values.intro} rows={5} />}
      </FormField>

      <fieldset className="space-y-4">
        <legend className="font-display text-xl font-medium">Nasıl çalışıyoruz</legend>
        <p className="text-sm text-muted-foreground">
          En az bir, en fazla dört bölüm. Boş bıraktığınız bölüm sitede görünmez.
        </p>
        {errorFor("sections") && (
          <p className="text-sm font-semibold text-danger">{errorFor("sections")}</p>
        )}
        {slots.map((section, index) => (
          <div key={index} className="space-y-4 rounded-xl border bg-surface p-4">
            <p className="text-sm font-semibold text-muted-foreground">Bölüm {String(index + 1)}</p>
            <FormField
              name={`sections.${String(index)}.title`}
              label="Başlık"
              error={errorFor(`sections.${String(index)}.title`)}
            >
              {(control) => (
                <Input {...control} defaultValue={section?.title ?? ""} maxLength={80} />
              )}
            </FormField>
            <FormField
              name={`sections.${String(index)}.body`}
              label="Metin"
              error={errorFor(`sections.${String(index)}.body`)}
            >
              {(control) => <Textarea {...control} defaultValue={section?.body ?? ""} rows={4} />}
            </FormField>
          </div>
        ))}
      </fieldset>

      <FormField name="closing" label="Kapanış metni" error={errorFor("closing")}>
        {(control) => <Textarea {...control} defaultValue={values.closing} rows={3} />}
      </FormField>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="submit" size="lg" disabled={pending}>
          {pending ? "Kaydediliyor…" : "Kaydet"}
        </Button>
        <Button asChild size="lg" variant="ghost">
          <Link href="/panel/icerik">Vazgeç</Link>
        </Button>
      </div>
    </form>
  );
}
