"use client";

import { type SubmitEvent, useActionState, useState } from "react";
import type { z } from "zod";

import { FormField } from "@/components/common/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TIME_OFF_KINDS } from "@/config/booking";
import { focusFirstInvalid, issuesToFieldErrors } from "@/lib/form";

import {
  type BookingRulesState,
  submitBookingRules,
  submitTimeOff,
  submitWeeklyHours,
  type TimeOffState,
  type WeeklyHoursState,
} from "../availability-actions";
import {
  bookingModeLabels,
  bookingRulesSchema,
  type BookingRulesValues,
  bookingRulesValues,
  timeOffFormSchema,
  timeOffFormValues,
  timeOffKindLabels,
  weekdayLabels,
  WEEKDAYS,
  weeklyHoursSchema,
  type WeeklyHoursValues,
  weeklyHoursValues,
} from "../schemas";

const selectClass =
  "h-11 w-full rounded-lg border border-input bg-surface px-3 text-base aria-invalid:border-2 aria-invalid:border-danger";

/** Same check as the server before sending; focus moves to the first problem (06-arayuz §8). */
function useClientCheck(schema: z.ZodType, read: (formData: FormData) => unknown) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  function onSubmit(event: SubmitEvent<HTMLFormElement>) {
    const parsed = schema.safeParse(read(new FormData(event.currentTarget)));
    if (parsed.success) {
      setErrors({});
      return;
    }
    event.preventDefault();
    const found = issuesToFieldErrors(parsed.error);
    setErrors(found);
    focusFirstInvalid(event.currentTarget, found);
  }
  return { errors, onSubmit };
}

function ServerError({ state }: { state: { error?: { code: string; message: string } } }) {
  if (!state.error || state.error.code === "validation") return null;
  return (
    <p role="alert" className="rounded-lg bg-danger-muted px-4 py-3 font-semibold text-danger">
      {state.error.message}
    </p>
  );
}

/** Weekly hours: one row per day, closed days unchecked. */
export function WeeklyHoursForm({ initial }: { initial: WeeklyHoursValues }) {
  const [state, action, pending] = useActionState<WeeklyHoursState, FormData>(
    submitWeeklyHours,
    {},
  );
  const { errors, onSubmit } = useClientCheck(weeklyHoursSchema, weeklyHoursValues);
  const values = state.values ?? initial;
  const errorFor = (name: string) => errors[name] ?? state.error?.fieldErrors?.[name]?.[0];

  return (
    <form action={action} onSubmit={onSubmit} noValidate className="space-y-3">
      <ServerError state={state} />
      <ul className="divide-y rounded-xl border bg-surface">
        {WEEKDAYS.map((day, index) => {
          const entry = values.days[index];
          const opensError = errorFor(`days.${String(index)}.opens`);
          const closesError = errorFor(`days.${String(index)}.closes`);
          return (
            <li key={day} className="grid gap-2 p-3 sm:grid-cols-[10rem_1fr_1fr] sm:items-center">
              <label className="flex min-h-11 items-center gap-3 font-semibold">
                <input
                  type="checkbox"
                  name={`days.${day}.open`}
                  defaultChecked={entry?.open}
                  className="size-5 accent-brand"
                />
                {weekdayLabels[day]}
              </label>
              <div className="flex items-center gap-2 text-sm">
                <span className="w-14 shrink-0">Açılış</span>
                <Input
                  type="time"
                  name={`days.${day}.opens`}
                  defaultValue={entry?.opens}
                  aria-invalid={opensError ? true : undefined}
                  aria-label={`${weekdayLabels[day]} açılış`}
                />
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="w-14 shrink-0">Kapanış</span>
                <Input
                  type="time"
                  name={`days.${day}.closes`}
                  defaultValue={entry?.closes}
                  aria-invalid={closesError ? true : undefined}
                  aria-label={`${weekdayLabels[day]} kapanış`}
                />
              </div>
              {(opensError ?? closesError) && (
                <p className="text-sm font-semibold text-danger sm:col-span-3">
                  {weekdayLabels[day]}: {opensError ?? closesError}
                </p>
              )}
            </li>
          );
        })}
      </ul>
      <Button type="submit" disabled={pending}>
        {pending ? "Kaydediliyor…" : "Saatleri kaydet"}
      </Button>
    </form>
  );
}

/** A closure: whole days or hours. Times are Istanbul times. */
export function TimeOffForm({ today }: { today: string }) {
  const [state, action, pending] = useActionState<TimeOffState, FormData>(submitTimeOff, {});
  const { errors, onSubmit } = useClientCheck(timeOffFormSchema, timeOffFormValues);
  const values = state.values;
  const [allDay, setAllDay] = useState(values?.allDay ?? true);
  const errorFor = (name: string) => errors[name] ?? state.error?.fieldErrors?.[name]?.[0];

  return (
    <form action={action} onSubmit={onSubmit} noValidate className="space-y-4">
      <ServerError state={state} />
      <div className="grid gap-4 sm:grid-cols-3">
        <FormField name="kind" label="Tür" error={errorFor("kind")}>
          {(control) => (
            <select {...control} defaultValue={values?.kind ?? "leave"} className={selectClass}>
              {TIME_OFF_KINDS.map((kind) => (
                <option key={kind} value={kind}>
                  {timeOffKindLabels[kind]}
                </option>
              ))}
            </select>
          )}
        </FormField>
        <FormField name="startDate" label="Başlangıç günü" error={errorFor("startDate")}>
          {(control) => (
            <Input {...control} type="date" min={today} defaultValue={values?.startDate ?? today} />
          )}
        </FormField>
        <FormField name="endDate" label="Bitiş günü" error={errorFor("endDate")}>
          {(control) => (
            <Input {...control} type="date" min={today} defaultValue={values?.endDate ?? today} />
          )}
        </FormField>
      </div>
      <label className="flex min-h-11 items-center gap-3 font-semibold">
        <input
          type="checkbox"
          name="allDay"
          checked={allDay}
          onChange={(event) => {
            setAllDay(event.currentTarget.checked);
          }}
          className="size-5 accent-brand"
        />
        Tüm gün
      </label>
      {!allDay && (
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField name="startTime" label="Başlangıç saati" error={errorFor("startTime")}>
            {(control) => (
              <Input {...control} type="time" defaultValue={values?.startTime ?? "14:00"} />
            )}
          </FormField>
          <FormField name="endTime" label="Bitiş saati" error={errorFor("endTime")}>
            {(control) => (
              <Input {...control} type="time" defaultValue={values?.endTime ?? "17:00"} />
            )}
          </FormField>
        </div>
      )}
      <FormField
        name="note"
        label="Not"
        hint="İsteğe bağlı, yalnızca panelde görünür"
        error={errorFor("note")}
      >
        {(control) => <Input {...control} defaultValue={values?.note} maxLength={200} />}
      </FormField>
      <Button type="submit" disabled={pending}>
        {pending ? "Ekleniyor…" : "Kapalı zaman ekle"}
      </Button>
    </form>
  );
}

const ruleFields: {
  name: Exclude<keyof BookingRulesValues, "mode">;
  label: string;
  hint: string;
}[] = [
  {
    name: "bufferMinutes",
    label: "Randevu arası tampon (dk)",
    hint: "P-01: temizlik ve sterilizasyon",
  },
  { name: "slotStepMinutes", label: "Saat adımı (dk)", hint: "P-02: 15 → 10:00, 10:15, 10:30" },
  { name: "minLeadHours", label: "En erken randevu (saat sonra)", hint: "P-03" },
  { name: "horizonDays", label: "Kaç gün ileriye randevu", hint: "P-04" },
  { name: "manageCutoffHours", label: "Erteleme / iptal sınırı (saat önce)", hint: "P-05" },
  { name: "maxFuturePerPhone", label: "Bir telefona en fazla randevu", hint: "P-06" },
];

/** P-01…P-07. */
export function BookingRulesForm({ initial }: { initial: BookingRulesValues }) {
  const [state, action, pending] = useActionState<BookingRulesState, FormData>(
    submitBookingRules,
    {},
  );
  const { errors, onSubmit } = useClientCheck(bookingRulesSchema, bookingRulesValues);
  const values = state.values ?? initial;
  const errorFor = (name: string) => errors[name] ?? state.error?.fieldErrors?.[name]?.[0];

  return (
    <form action={action} onSubmit={onSubmit} noValidate className="space-y-4">
      <ServerError state={state} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ruleFields.map((field) => (
          <FormField
            key={field.name}
            name={field.name}
            label={field.label}
            hint={field.hint}
            error={errorFor(field.name)}
          >
            {(control) => (
              <Input {...control} inputMode="numeric" defaultValue={values[field.name]} />
            )}
          </FormField>
        ))}
      </div>
      <fieldset>
        <legend className="text-sm font-semibold">Online randevu (P-07)</legend>
        <div className="mt-2 space-y-1">
          {(["request", "instant"] as const).map((mode) => (
            <label key={mode} className="flex min-h-11 items-center gap-3">
              <input
                type="radio"
                name="mode"
                value={mode}
                defaultChecked={values.mode === mode}
                className="size-5 accent-brand"
              />
              {bookingModeLabels[mode]}
            </label>
          ))}
        </div>
      </fieldset>
      <Button type="submit" disabled={pending}>
        {pending ? "Kaydediliyor…" : "Kuralları kaydet"}
      </Button>
    </form>
  );
}
