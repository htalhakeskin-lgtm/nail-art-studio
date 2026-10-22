import { beforeEach, describe, expect, it, vi } from "vitest";

import { sessionFor } from "./helpers";

// No request scope or Next.js cache outside Next: session, IP and cache tags are stubbed;
// the database is real (14-test §2).
const mocks = vi.hoisted(() => ({ getSession: vi.fn() }));
vi.mock("@/server/auth", () => ({ getSession: mocks.getSession }));
vi.mock("next/cache", () => ({ updateTag: vi.fn(), cacheLife: vi.fn(), cacheTag: vi.fn() }));
vi.mock("@/server/request", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/server/request")>()),
  clientIp: () => Promise.resolve("127.0.0.1"),
}));

const { db } = await import("@/server/db/client");
const { appointments, auditLogs, services, siteSettings, staff, timeOff } =
  await import("@/server/db/schema");
const {
  addTimeOff,
  deleteTimeOff,
  getAvailabilityContext,
  istanbulDateTime,
  saveBookingRules,
  saveWeeklyHours,
  slotsForDay,
} = await import("@/features/booking");
const { getSiteSettings } = await import("@/features/site");

let staffId = "";
let serviceId = "";

async function insertAppointment(start: string, end: string, status = "confirmed" as const) {
  return db.insert(appointments).values({
    code: `NAS-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    staffId,
    serviceId,
    startsAt: new Date(start),
    endsAt: new Date(end),
    blockedUntil: new Date(new Date(end).getTime() + 15 * 60_000),
    status,
    customerName: "Test Müşteri",
    customerPhone: "+905320000001",
    source: "online",
  });
}

const hours = (
  overrides: Partial<Record<string, { open: boolean; opens: string; closes: string }>> = {},
) => ({
  days: (["1", "2", "3", "4", "5", "6", "7"] as const).map((day) => ({
    day,
    ...(overrides[day] ?? { open: day !== "1", opens: "10:00", closes: "20:00" }),
  })),
});

beforeEach(async () => {
  await db.delete(appointments);
  await db.delete(timeOff);
  await db.delete(staff);
  await db.delete(services);
  await db.delete(siteSettings);
  await db.delete(auditLogs);
  mocks.getSession.mockResolvedValue(sessionFor("owner"));
  const [expert] = await db
    .insert(staff)
    .values({ name: "Bahadır Karasu", slug: "bahadir-karasu" })
    .returning({ id: staff.id });
  const [service] = await db
    .insert(services)
    .values({
      slug: "kalici-oje",
      name: "Kalıcı oje",
      category: "kalici-oje",
      summary: "Örnek",
      durationMinutes: 60,
    })
    .returning({ id: services.id });
  staffId = expert?.id ?? "";
  serviceId = service?.id ?? "";
});

describe("BR-RND-003: the database refuses overlapping appointments", () => {
  it("rejects a second appointment inside [start, end + buffer) with 23P01", async () => {
    await insertAppointment("2026-11-03T08:00:00Z", "2026-11-03T09:00:00Z");
    await expect(
      insertAppointment("2026-11-03T09:10:00Z", "2026-11-03T10:10:00Z"),
    ).rejects.toMatchObject({
      cause: { code: "23P01" },
    });
    // Back-to-back after the buffer is fine.
    await expect(
      insertAppointment("2026-11-03T09:15:00Z", "2026-11-03T10:15:00Z"),
    ).resolves.toBeDefined();
  });

  it("keeps only one of two simultaneous bookings for the same slot", async () => {
    const results = await Promise.allSettled([
      insertAppointment("2026-11-04T08:00:00Z", "2026-11-04T09:00:00Z"),
      insertAppointment("2026-11-04T08:30:00Z", "2026-11-04T09:30:00Z"),
    ]);
    expect(results.filter((result) => result.status === "fulfilled")).toHaveLength(1);
  });

  it("frees the slot of a cancelled appointment", async () => {
    await insertAppointment("2026-11-05T08:00:00Z", "2026-11-05T09:00:00Z", "cancelled" as never);
    await expect(
      insertAppointment("2026-11-05T08:00:00Z", "2026-11-05T09:00:00Z"),
    ).resolves.toBeDefined();
  });
});

describe("availability context", () => {
  it("BR-RND-002 / 003: taken time and closures remove slots from the day", async () => {
    await insertAppointment("2026-11-03T08:00:00Z", "2026-11-03T09:00:00Z"); // 11:00–12:00 Istanbul
    await db.insert(timeOff).values({
      staffId,
      startsAt: istanbulDateTime("2026-11-03", "15:00"),
      endsAt: istanbulDateTime("2026-11-03", "20:00"),
      kind: "block",
    });
    const now = istanbulDateTime("2026-11-02", "09:00");
    const context = await getAvailabilityContext(
      staffId,
      istanbulDateTime("2026-11-03", "00:00"),
      istanbulDateTime("2026-11-04", "00:00"),
      now,
    );
    const starts = slotsForDay(context, "2026-11-03", 60).map((slot) => slot.toISOString());
    expect(starts).not.toContain(istanbulDateTime("2026-11-03", "11:00").toISOString());
    expect(starts).not.toContain(istanbulDateTime("2026-11-03", "10:15").toISOString()); // buffer
    expect(starts).toContain(istanbulDateTime("2026-11-03", "12:15").toISOString());
    expect(starts.at(-1)).toBe(istanbulDateTime("2026-11-03", "14:00").toISOString());
  });
});

describe("availability actions (SCR-104)", () => {
  it("rejects anonymous users and staff without availability.edit / settings.edit", async () => {
    mocks.getSession.mockResolvedValue(null);
    expect(await saveWeeklyHours(hours())).toMatchObject({ code: "unauthorized" });
    mocks.getSession.mockResolvedValue(sessionFor("staff"));
    expect(await saveWeeklyHours(hours())).toMatchObject({ code: "forbidden" });
    expect(
      await addTimeOff({
        kind: "leave",
        startDate: "2026-11-10",
        endDate: "2026-11-10",
        allDay: true,
        startTime: "",
        endTime: "",
        note: "",
      }),
    ).toMatchObject({ code: "forbidden" });
  });

  it("saves weekly hours into the settings the site reads", async () => {
    const result = await saveWeeklyHours(
      hours({
        "1": { open: true, opens: "12:00", closes: "18:00" },
        "7": { open: false, opens: "", closes: "" },
      }),
    );
    expect(result.ok).toBe(true);
    const settings = await getSiteSettings();
    expect(settings.openingHours.weekly["1"]).toEqual([["12:00", "18:00"]]);
    expect(settings.openingHours.weekly["7"]).toEqual([]);
  });

  it("refuses a closing time before the opening time", async () => {
    const result = await saveWeeklyHours(
      hours({ "2": { open: true, opens: "18:00", closes: "10:00" } }),
    );
    expect(result).toMatchObject({ ok: false, code: "validation" });
    if (!result.ok) expect(result.fieldErrors?.days).toBeDefined();
  });

  it("adds a whole-day closure as Istanbul midnight to midnight and deletes it", async () => {
    const result = await addTimeOff({
      kind: "holiday",
      startDate: "2026-10-29",
      endDate: "2026-10-29",
      allDay: true,
      startTime: "",
      endTime: "",
      note: "Cumhuriyet Bayramı",
    });
    expect(result.ok).toBe(true);
    const [row] = await db.select().from(timeOff);
    expect(row?.startsAt.toISOString()).toBe("2026-10-28T21:00:00.000Z");
    expect(row?.endsAt.toISOString()).toBe("2026-10-29T21:00:00.000Z");
    if (!result.ok) return;
    expect(await deleteTimeOff({ id: result.data.id })).toMatchObject({ ok: true });
    expect(await deleteTimeOff({ id: result.data.id })).toMatchObject({ code: "notFound" });
  });

  it("saves booking rules (P-01…P-07) with Turkish errors for bad values", async () => {
    const bad = await saveBookingRules({
      bufferMinutes: "-5",
      slotStepMinutes: "15",
      minLeadHours: "3",
      horizonDays: "45",
      manageCutoffHours: "24",
      maxFuturePerPhone: "2",
      mode: "request",
    });
    expect(bad).toMatchObject({ ok: false, code: "validation" });
    if (!bad.ok) expect(bad.fieldErrors?.bufferMinutes?.[0]).toBe("0 ile 120 arasında olmalı.");

    await saveBookingRules({
      bufferMinutes: "10",
      slotStepMinutes: "30",
      minLeadHours: "2",
      horizonDays: "30",
      manageCutoffHours: "12",
      maxFuturePerPhone: "3",
      mode: "instant",
    });
    expect((await getSiteSettings()).booking).toEqual({
      bufferMinutes: 10,
      slotStepMinutes: 30,
      minLeadHours: 2,
      horizonDays: 30,
      manageCutoffHours: 12,
      maxFuturePerPhone: 3,
      mode: "instant",
    });
  });
});
