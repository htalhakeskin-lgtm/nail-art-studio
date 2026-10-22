"use server";

import { eq } from "drizzle-orm";
import { updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { getSiteSettings, SITE_SETTINGS_TAG } from "@/features/site";
import { type Fail, fail, ok } from "@/lib/result";
import { adminAction } from "@/server/action";
import { recordAudit } from "@/server/audit";
import { db } from "@/server/db/client";
import { siteSettings, timeOff } from "@/server/db/schema";

import { addDays, istanbulDateTime } from "./domain/time";
import { getBookableStaff } from "./queries";
import {
  bookingRulesSchema,
  type BookingRulesValues,
  bookingRulesValues,
  idSchema,
  timeOffFormSchema,
  type TimeOffFormValues,
  timeOffFormValues,
  weeklyHoursSchema,
  type WeeklyHoursValues,
  weeklyHoursValues,
} from "./schemas";

/** Writes one jsonb section of the settings row, creating the row on a fresh database. */
async function writeSettings(values: Partial<typeof siteSettings.$inferInsert>) {
  const [row] = await db
    .update(siteSettings)
    .set(values)
    .where(eq(siteSettings.id, "singleton"))
    .returning({ id: siteSettings.id });
  if (!row) await db.insert(siteSettings).values({ id: "singleton", ...values });
}

/** SCR-104: weekly hours. They drive the footer, "open now", JSON-LD and availability (K-34). */
export const saveWeeklyHours = adminAction({
  schema: weeklyHoursSchema,
  permission: "availability.edit",
  handler: async ({ days }, ctx) => {
    const settings = await getSiteSettings();
    const weekly = Object.fromEntries(
      days.map((entry) => [entry.day, entry.open ? [[entry.opens, entry.closes]] : []]),
    );
    await writeSettings({ openingHours: { ...settings.openingHours, weekly } });
    await recordAudit({
      actorId: ctx.session.user.id,
      action: "availability.hours",
      entity: "site_settings",
      entityId: "singleton",
      changes: { weekly: { from: settings.openingHours.weekly, to: weekly } },
      ip: ctx.ip,
    });
    updateTag(SITE_SETTINGS_TAG);
    return ok({ saved: true });
  },
});

/** SCR-104: a leave, holiday or block (BR-RND-002). Existing appointments are not touched. */
export const addTimeOff = adminAction({
  schema: timeOffFormSchema,
  permission: "availability.edit",
  handler: async (input, ctx) => {
    const expert = await getBookableStaff();
    if (!expert) return fail("notFound");
    const startsAt = input.allDay
      ? istanbulDateTime(input.startDate, "00:00")
      : istanbulDateTime(input.startDate, input.startTime);
    const endsAt = input.allDay
      ? istanbulDateTime(addDays(input.endDate, 1), "00:00")
      : istanbulDateTime(input.endDate, input.endTime);
    if (startsAt >= endsAt) {
      return fail("validation", { fieldErrors: { endTime: ["Bitiş başlangıçtan sonra olmalı."] } });
    }
    const [row] = await db
      .insert(timeOff)
      .values({ staffId: expert.id, startsAt, endsAt, kind: input.kind, note: input.note || null })
      .returning({ id: timeOff.id });
    if (!row) return fail("unexpected");
    await recordAudit({
      actorId: ctx.session.user.id,
      action: "availability.time_off.add",
      entity: "time_off",
      entityId: row.id,
      ip: ctx.ip,
    });
    updateTag(SITE_SETTINGS_TAG); // "open now" reads closures through the settings cache tag
    return ok({ id: row.id });
  },
});

export const deleteTimeOff = adminAction({
  schema: idSchema,
  permission: "availability.edit",
  handler: async ({ id }, ctx) => {
    const [row] = await db.delete(timeOff).where(eq(timeOff.id, id)).returning({ id: timeOff.id });
    if (!row) return fail("notFound");
    await recordAudit({
      actorId: ctx.session.user.id,
      action: "availability.time_off.delete",
      entity: "time_off",
      entityId: id,
      ip: ctx.ip,
    });
    updateTag(SITE_SETTINGS_TAG);
    return ok({ id });
  },
});

/** SCR-104: P-01…P-07. A settings change, so owner and admin only. */
export const saveBookingRules = adminAction({
  schema: bookingRulesSchema,
  permission: "settings.edit",
  handler: async (rules, ctx) => {
    const settings = await getSiteSettings();
    await writeSettings({ booking: rules });
    await recordAudit({
      actorId: ctx.session.user.id,
      action: "settings.booking",
      entity: "site_settings",
      entityId: "singleton",
      changes: { booking: { from: settings.booking, to: rules } },
      ip: ctx.ip,
    });
    updateTag(SITE_SETTINGS_TAG);
    return ok({ saved: true });
  },
});

// ── Form adapters ──────────────────────────────────────────────────────────────────────────

export type WeeklyHoursState = { error?: Fail; values?: WeeklyHoursValues };
export type TimeOffState = { error?: Fail; values?: TimeOffFormValues };
export type BookingRulesState = { error?: Fail; values?: BookingRulesValues };

export async function submitWeeklyHours(
  _previous: WeeklyHoursState,
  formData: FormData,
): Promise<WeeklyHoursState> {
  const values = weeklyHoursValues(formData);
  const result = await saveWeeklyHours(values);
  if (!result.ok) return { error: result, values };
  redirect("/panel/musaitlik?kaydedildi=saatler");
}

export async function submitTimeOff(
  _previous: TimeOffState,
  formData: FormData,
): Promise<TimeOffState> {
  const values = timeOffFormValues(formData);
  const result = await addTimeOff(values);
  if (!result.ok) return { error: result, values };
  redirect("/panel/musaitlik?kaydedildi=kapali");
}

export async function submitBookingRules(
  _previous: BookingRulesState,
  formData: FormData,
): Promise<BookingRulesState> {
  const values = bookingRulesValues(formData);
  const result = await saveBookingRules(values);
  if (!result.ok) return { error: result, values };
  redirect("/panel/musaitlik?kaydedildi=kurallar");
}

export async function deleteTimeOffForm(formData: FormData): Promise<void> {
  const id = formData.get("id");
  const result = await deleteTimeOff({ id: typeof id === "string" ? id : "" });
  redirect(`/panel/musaitlik?${result.ok ? "kaydedildi=silindi" : `hata=${result.code}`}`);
}
