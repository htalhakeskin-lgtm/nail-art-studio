import { randomBytes } from "node:crypto";

import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it, vi } from "vitest";

// No request scope or Next.js cache outside Next: IP and cache tags are stubbed; the database
// is real (14-test §2).
const mocks = vi.hoisted(() => ({ ip: "198.51.100.1" }));
vi.mock("@/server/auth", () => ({ getSession: vi.fn() }));
vi.mock("next/cache", () => ({ updateTag: vi.fn(), cacheLife: vi.fn(), cacheTag: vi.fn() }));
vi.mock("@/server/request", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/server/request")>()),
  clientIp: () => Promise.resolve(mocks.ip),
}));

const { db } = await import("@/server/db/client");
const {
  actionRateLimits,
  appointments,
  auditLogs,
  demoOutbox,
  services,
  siteSettings,
  staff,
  timeOff,
} = await import("@/server/db/schema");
const {
  addDays,
  cancelByToken,
  createManageToken,
  generateAppointmentCode,
  istanbulDate,
  istanbulDateTime,
  rescheduleByToken,
} = await import("@/features/booking");

let serviceId = "";
let staffId = "";
let ipCounter = 0;

/** A weekday (Tue–Sat) `days` ahead at the given Istanbul time. */
function openDay(days: number, clock: string): Date {
  let date = addDays(istanbulDate(new Date()), days);
  while (["1", "7"].includes(String(new Date(`${date}T12:00:00Z`).getUTCDay() || 7))) {
    date = addDays(date, 1);
  }
  return istanbulDateTime(date, clock);
}

async function createAppointment(
  startsAt: Date,
  status: "pending" | "confirmed" | "completed" = "confirmed",
) {
  const { token, hash } = createManageToken();
  const endsAt = new Date(startsAt.getTime() + 60 * 60_000);
  const [row] = await db
    .insert(appointments)
    .values({
      code: generateAppointmentCode((size) => randomBytes(size)),
      staffId,
      serviceId,
      startsAt,
      endsAt,
      blockedUntil: new Date(endsAt.getTime() + 15 * 60_000),
      status,
      customerName: "Ayşe Örnek",
      customerPhone: "+905320001234",
      source: "online",
      manageTokenHash: hash,
      manageTokenExpiresAt: new Date(endsAt.getTime() + 30 * 86_400_000),
    })
    .returning({ id: appointments.id });
  return { token, id: row?.id ?? "" };
}

beforeEach(async () => {
  await db.delete(appointments);
  await db.delete(timeOff);
  await db.delete(staff);
  await db.delete(services);
  await db.delete(siteSettings);
  await db.delete(demoOutbox);
  await db.delete(auditLogs);
  await db.delete(actionRateLimits);
  ipCounter += 1;
  mocks.ip = `198.51.100.${String(ipCounter)}`;
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

describe("cancelByToken (UC-03)", () => {
  it("cancels, frees the slot, logs it and tells the studio", async () => {
    const start = openDay(5, "12:00");
    const { token, id } = await createAppointment(start);
    expect(await cancelByToken({ token, reason: "Planım değişti" })).toEqual({
      ok: true,
      data: { cancelled: true },
    });
    const [row] = await db.select().from(appointments).where(eq(appointments.id, id));
    expect(row).toMatchObject({
      status: "cancelled",
      cancelledBy: "customer",
      cancelReason: "Planım değişti",
    });
    const outbox = await db.select().from(demoOutbox);
    expect(outbox.map((message) => message.template)).toEqual(["appointmentChangedBusiness"]);
    // The freed slot can be booked again.
    await expect(createAppointment(start)).resolves.toBeDefined();
  });

  it("BR-RND-007: not within the last P-05 hours", async () => {
    const soon = new Date(Date.now() + 5 * 3_600_000);
    const { token } = await createAppointment(soon);
    expect(await cancelByToken({ token, reason: "" })).toMatchObject({ code: "BR-RND-007" });
  });

  it("BR-RND-008: a finished appointment cannot be cancelled; a second cancel is refused", async () => {
    const { token } = await createAppointment(openDay(6, "12:00"), "completed");
    expect(await cancelByToken({ token, reason: "" })).toMatchObject({ code: "BR-RND-008" });
    const other = await createAppointment(openDay(8, "12:00"));
    await cancelByToken({ token: other.token, reason: "" });
    expect(await cancelByToken({ token: other.token, reason: "" })).toMatchObject({
      code: "BR-RND-008",
    });
  });

  it("BR-RND-009: an unknown token opens nothing", async () => {
    await createAppointment(openDay(5, "12:00"));
    expect(await cancelByToken({ token: "x".repeat(43), reason: "" })).toMatchObject({
      code: "BR-RND-009",
    });
    expect(await cancelByToken({ token: "short", reason: "" })).toMatchObject({
      code: "validation",
    });
  });
});

describe("rescheduleByToken (BR-RND-012)", () => {
  it("moves the appointment, keeps the code and waits for approval again in request mode", async () => {
    const { token, id } = await createAppointment(openDay(5, "12:00"));
    const [before] = await db.select().from(appointments).where(eq(appointments.id, id));
    const target = openDay(9, "15:00");
    expect(await rescheduleByToken({ token, startsAt: target.toISOString() })).toEqual({
      ok: true,
      data: { status: "pending" },
    });
    const [row] = await db.select().from(appointments).where(eq(appointments.id, id));
    expect(row).toMatchObject({
      code: before?.code,
      startsAt: target,
      status: "pending",
      confirmedAt: null,
    });
    expect(row?.blockedUntil.getTime()).toBe(target.getTime() + 75 * 60_000);
  });

  it("may move into its own old slot's neighbourhood (its own time does not count as taken)", async () => {
    const start = openDay(5, "12:00");
    const { token } = await createAppointment(start);
    const later = new Date(start.getTime() + 30 * 60_000); // overlaps the old 12:00–13:15
    expect((await rescheduleByToken({ token, startsAt: later.toISOString() })).ok).toBe(true);
  });

  it("BR-RND-003 / 001: refuses a taken time and a time outside opening hours", async () => {
    const taken = openDay(7, "14:00");
    await createAppointment(taken);
    const { token } = await createAppointment(openDay(5, "12:00"));
    expect(await rescheduleByToken({ token, startsAt: taken.toISOString() })).toMatchObject({
      code: "BR-RND-003",
    });
    expect(
      await rescheduleByToken({ token, startsAt: openDay(7, "21:00").toISOString() }),
    ).toMatchObject({
      code: "BR-RND-001",
    });
  });
});
