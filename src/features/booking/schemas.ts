import { z } from "zod";

import { BOOKING_MODES, TIME_OFF_KINDS } from "@/config/booking";

const clock = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Saati 10:00 biçiminde yazın.");
const isoDate = z.iso.date("Tarihi seçin.");

export const WEEKDAYS = ["1", "2", "3", "4", "5", "6", "7"] as const;
export const weekdayLabels: Record<(typeof WEEKDAYS)[number], string> = {
  "1": "Pazartesi",
  "2": "Salı",
  "3": "Çarşamba",
  "4": "Perşembe",
  "5": "Cuma",
  "6": "Cumartesi",
  "7": "Pazar",
};

export const timeOffKindLabels: Record<(typeof TIME_OFF_KINDS)[number], string> = {
  leave: "İzin",
  holiday: "Resmî tatil",
  block: "Blok (eğitim, özel iş)",
};

export const bookingModeLabels: Record<(typeof BOOKING_MODES)[number], string> = {
  request: "Onay beklemeli: talepleri ben onaylarım",
  instant: "Anında onay: boş saat seçilince randevu kesinleşir",
};

/** SCR-104 weekly hours: one range per day (the studio keeps a single shift). */
export const weeklyHoursSchema = z.object({
  days: z
    .array(
      z.object({ day: z.enum(WEEKDAYS), open: z.boolean(), opens: z.string(), closes: z.string() }),
    )
    .length(7)
    .superRefine((days, ctx) => {
      days.forEach((entry, index) => {
        if (!entry.open) return;
        for (const key of ["opens", "closes"] as const) {
          if (!clock.safeParse(entry[key]).success) {
            ctx.addIssue({
              code: "custom",
              path: [index, key],
              message: "Saati 10:00 biçiminde yazın.",
            });
          }
        }
        if (entry.opens >= entry.closes) {
          ctx.addIssue({
            code: "custom",
            path: [index, "closes"],
            message: "Kapanış açılıştan sonra olmalı.",
          });
        }
      });
    }),
});

export type WeeklyHoursValues = z.input<typeof weeklyHoursSchema>;

/** SCR-104 closure: whole days (inclusive) or a time range across days. */
export const timeOffFormSchema = z
  .object({
    kind: z.enum(TIME_OFF_KINDS, "Bir tür seçin."),
    startDate: isoDate,
    endDate: isoDate,
    allDay: z.boolean(),
    startTime: z.string(),
    endTime: z.string(),
    note: z.string().trim().max(200, "Not en fazla 200 karakter olabilir."),
  })
  .superRefine((value, ctx) => {
    if (value.endDate < value.startDate) {
      ctx.addIssue({
        code: "custom",
        path: ["endDate"],
        message: "Bitiş günü başlangıçtan önce olamaz.",
      });
    }
    if (value.allDay) return;
    for (const key of ["startTime", "endTime"] as const) {
      if (!clock.safeParse(value[key]).success) {
        ctx.addIssue({ code: "custom", path: [key], message: "Saati 14:00 biçiminde yazın." });
      }
    }
    if (value.startDate === value.endDate && value.startTime >= value.endTime) {
      ctx.addIssue({
        code: "custom",
        path: ["endTime"],
        message: "Bitiş saati başlangıçtan sonra olmalı.",
      });
    }
  });

export type TimeOffFormValues = z.input<typeof timeOffFormSchema>;

/** SCR-104 booking parameters (P-01…P-07). */
export const bookingRulesSchema = z.object({
  bufferMinutes: z.coerce
    .number<string>()
    .int("Tam sayı yazın.")
    .min(0, "0 ile 120 arasında olmalı.")
    .max(120, "0 ile 120 arasında olmalı."),
  slotStepMinutes: z.coerce
    .number<string>()
    .int("Tam sayı yazın.")
    .min(5, "5 ile 120 arasında olmalı.")
    .max(120, "5 ile 120 arasında olmalı."),
  minLeadHours: z.coerce
    .number<string>()
    .int("Tam sayı yazın.")
    .min(0, "0 ile 168 arasında olmalı.")
    .max(168, "0 ile 168 arasında olmalı."),
  horizonDays: z.coerce
    .number<string>()
    .int("Tam sayı yazın.")
    .min(1, "1 ile 365 arasında olmalı.")
    .max(365, "1 ile 365 arasında olmalı."),
  manageCutoffHours: z.coerce
    .number<string>()
    .int("Tam sayı yazın.")
    .min(0, "0 ile 168 arasında olmalı.")
    .max(168, "0 ile 168 arasında olmalı."),
  maxFuturePerPhone: z.coerce
    .number<string>()
    .int("Tam sayı yazın.")
    .min(1, "1 ile 10 arasında olmalı.")
    .max(10, "1 ile 10 arasında olmalı."),
  mode: z.enum(BOOKING_MODES),
});

export type BookingRulesValues = z.input<typeof bookingRulesSchema>;

export const idSchema = z.object({ id: z.uuid() });

const text = (formData: FormData, name: string) => {
  const value = formData.get(name);
  return typeof value === "string" ? value : "";
};

export function weeklyHoursValues(formData: FormData): WeeklyHoursValues {
  return {
    days: WEEKDAYS.map((day) => ({
      day,
      open: formData.get(`days.${day}.open`) === "on",
      opens: text(formData, `days.${day}.opens`),
      closes: text(formData, `days.${day}.closes`),
    })),
  };
}

export function timeOffFormValues(formData: FormData): TimeOffFormValues {
  return {
    kind: text(formData, "kind") as TimeOffFormValues["kind"],
    startDate: text(formData, "startDate"),
    endDate: text(formData, "endDate") || text(formData, "startDate"),
    allDay: formData.get("allDay") === "on",
    startTime: text(formData, "startTime"),
    endTime: text(formData, "endTime"),
    note: text(formData, "note"),
  };
}

export function bookingRulesValues(formData: FormData): BookingRulesValues {
  return {
    bufferMinutes: text(formData, "bufferMinutes"),
    slotStepMinutes: text(formData, "slotStepMinutes"),
    minLeadHours: text(formData, "minLeadHours"),
    horizonDays: text(formData, "horizonDays"),
    manageCutoffHours: text(formData, "manageCutoffHours"),
    maxFuturePerPhone: text(formData, "maxFuturePerPhone"),
    mode: text(formData, "mode") as BookingRulesValues["mode"],
  };
}
