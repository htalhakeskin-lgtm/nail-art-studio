"use client";

import Link from "next/link";
import { type SubmitEvent, useActionState, useState } from "react";

import { FormField } from "@/components/common/form-field";
import { UnsavedChangesGuard } from "@/components/common/unsaved-changes-guard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { focusFirstInvalid, issuesToFieldErrors } from "@/lib/form";

import { type FaqFormState, submitFaqForm } from "../actions";
import {
  faqCategories,
  faqCategoryLabels,
  faqFormSchema,
  type FaqFormValues,
  faqFormValues,
} from "../schemas";

const empty: FaqFormValues = { question: "", answer: "", category: "randevu", isVisible: true };

/** SCR-108: create / edit a question. Typed text survives validation and server errors. */
export function FaqForm({ initial }: { initial?: FaqFormValues & { id: string } }) {
  const [state, action, pending] = useActionState<FaqFormState, FormData>(submitFaqForm, {});
  const [clientErrors, setClientErrors] = useState<Record<string, string>>({});
  const values = state.values ?? initial ?? empty;
  const serverErrors = state.error?.fieldErrors;
  const errorFor = (name: string) => clientErrors[name] ?? serverErrors?.[name]?.[0];

  function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    const parsed = faqFormSchema.safeParse(faqFormValues(new FormData(event.currentTarget)));
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

      <FormField name="question" label="Soru" error={errorFor("question")}>
        {(control) => <Input {...control} defaultValue={values.question} maxLength={200} />}
      </FormField>

      <FormField
        name="answer"
        label="Cevap"
        hint="Sade metin. Bağlantı için: [Randevu koşulları](/randevu-kosullari)"
        error={errorFor("answer")}
      >
        {(control) => <Textarea {...control} defaultValue={values.answer} rows={6} />}
      </FormField>

      <FormField name="category" label="Kategori" error={errorFor("category")}>
        {(control) => (
          <select
            {...control}
            defaultValue={values.category}
            className="h-11 w-full rounded-lg border border-input bg-surface px-3 text-base aria-invalid:border-2 aria-invalid:border-danger"
          >
            {faqCategories.map((category) => (
              <option key={category} value={category}>
                {faqCategoryLabels[category]}
              </option>
            ))}
          </select>
        )}
      </FormField>

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
          <Link href="/panel/icerik">Vazgeç</Link>
        </Button>
      </div>
    </form>
  );
}
