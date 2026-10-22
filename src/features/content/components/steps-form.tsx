"use client";

import Link from "next/link";
import { type SubmitEvent, useActionState, useState } from "react";

import { FormField } from "@/components/common/form-field";
import { UnsavedChangesGuard } from "@/components/common/unsaved-changes-guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { focusFirstInvalid, issuesToFieldErrors } from "@/lib/form";

import { type StepsFormState, submitStepsForm } from "../actions";
import {
  type StepsBlockKey,
  stepsBlockSchema,
  type StepsFormValues,
  stepsFormValues,
} from "../schemas";

const STEP_SLOTS = 6;

/** SCR-108: a home page step list (process or hygiene). Empty step slots are ignored. */
export function StepsForm({
  blockKey,
  initial,
  noteLabel,
}: {
  blockKey: StepsBlockKey;
  initial: StepsFormValues;
  noteLabel?: string;
}) {
  const [state, action, pending] = useActionState<StepsFormState, FormData>(submitStepsForm, {});
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
  const values = state.values ?? initial;
  const errorFor = (name: string) =>
    clientErrors[name] ?? state.error?.fieldErrors?.[name.split(".")[0] ?? name]?.[0];
  const slots = Array.from({ length: STEP_SLOTS }, (_, index) => values.steps[index]);

  function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    const parsed = stepsBlockSchema.safeParse(stepsFormValues(new FormData(event.currentTarget)));
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
      <input type="hidden" name="key" value={blockKey} />
      <FormField name="heading" label="Başlık" error={errorFor("heading")}>
        {(control) => <Input {...control} defaultValue={values.heading} maxLength={80} />}
      </FormField>
      <FormField name="intro" label="Giriş" error={errorFor("intro")}>
        {(control) => (
          <Textarea {...control} defaultValue={values.intro} rows={2} maxLength={400} />
        )}
      </FormField>

      <fieldset className="space-y-4">
        <legend className="font-display text-xl font-medium">Adımlar</legend>
        {errorFor("steps") && (
          <p className="text-sm font-semibold text-danger">{errorFor("steps")}</p>
        )}
        {slots.map((step, index) => {
          const key = String(index);
          return (
            <div key={key} className="grid gap-3 rounded-xl border p-4 sm:grid-cols-[1fr_2fr]">
              <FormField
                name={`steps.${key}.title`}
                label={`${String(index + 1)}. adım`}
                error={errorFor(`steps.${key}.title`)}
              >
                {(control) => <Input {...control} defaultValue={step?.title} maxLength={60} />}
              </FormField>
              <FormField
                name={`steps.${key}.body`}
                label="Açıklama"
                error={errorFor(`steps.${key}.body`)}
              >
                {(control) => (
                  <Textarea {...control} defaultValue={step?.body} rows={2} maxLength={300} />
                )}
              </FormField>
            </div>
          );
        })}
      </fieldset>

      {noteLabel && (
        <FormField name="note" label={noteLabel} error={errorFor("note")}>
          {(control) => <Input {...control} defaultValue={values.note} maxLength={200} />}
        </FormField>
      )}
      {!noteLabel && <input type="hidden" name="note" value={values.note} />}

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
