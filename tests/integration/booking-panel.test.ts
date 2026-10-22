import { randomBytes } from "node:crypto";

import { eq } from "drizzle-orm";
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
const { appointments, auditLogs, demoOutbox, services, siteSettings, staff, timeOff } =
  await import("@/server/db/schema");
const {
  addDays,
  createManageToken,
  createManualAppointment,
  generateAppointmentCode,
  getAppointmentByTokenHash,
  hashManageToken,
  istanbulDate,
  istanbulDateTime,
  setAppointmentStatus,
  shareManageLink,
} = await import("@/features/booking");

let serviceId = "";
let staffId = "";

/** A Tue–Sat date `days` ahead at the given Istanbul time. */
function openDay(days: number, clock: string): Date {
  let date = addDays(istanbulDate(new Date()), days);
  while ([0, 1].includes(new Date(`${date}T12:00:00Z`).getUTCDay())) date = addDays(date, 1);
  return istanbulDateTime(date, clock);
}

async function insert(startsAt: Date, status: "pending" | "confirmed" = "pending", email?: string) {
  const endsAt = new Date(startsAt.getTime() + 60 * 60_000);
  const { token, hash } = createManageToken();
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
      customerName: "Ayşe Kaya",
      customerPhone: "+905320001234",
      customerEmail: email ?? null,
      source: "online",
      manageTokenHash: hash,
      manageTokenExpiresAt: new Date(endsAt.getTime() + 30 * 86_400_000),
    })
    .returning({ id: appointments.id });
  return { id: row?.id ?? "", token };
}

beforeEach(async () => {
  await db.delete(appointments);
  await db.delete(timeOff);
  await db.delete(staff);
  await db.delete(services);
  await db.delete(siteSettings);
  await db.delete(demoOutbox);
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

describe("setAppointmentStatus (UC-04, BR-RND-008)", () => {
  it("rejects an anonymous visitor", async () => {
    const { id } = await insert(openDay(4, "12:00"));
    mocks.getSession.mockResolvedValue(null);
    expect(await setAppointmentStatus({ id, to: "confirmed" })).toMatchObject({
      code: "unauthorized",
    });
  });

  it("confirms, logs it and e-mails the customer when an address is known", async () => {
    const { id } = await insert(openDay(4, "12:00"), "pending", "ayse@example.com");
    mocks.getSession.mockResolvedValue(sessionFor("staff")); // staff may manage appointments
    expect(await setAppointmentStatus({ id, to: "confirmed" })).toEqual({
      ok: true,
      data: { status: "confirmed" },
    });
    const [row] = await db.select().from(appointments).where(eq(appointments.id, id));
    expect(row?.confirmedAt).toBeInstanceOf(Date);
    const outbox = await db.select().from(demoOutbox);
    expect(outbox.map((message) => message.template)).toEqual(["appointmentConfirmedVisitor"]);
    expect(JSON.stringify(outbox[0]?.data)).not.toMatch(/₺/);
  });

  it.each([
    ["pending", "completed"],
    ["pending", "no_show"],
  ] as const)("refuses %s → %s", async (from, to) => {
    const { id } = await insert(openDay(4, "12:00"), from);
    expect(await setAppointmentStatus({ id, to })).toMatchObject({ code: "BR-RND-008" });
  });

  it("a second identical change is refused (conditional update)", async () => {
    const { id } = await insert(openDay(4, "12:00"));
    await setAppointmentStatus({ id, to: "confirmed" });
    expect(await setAppointmentStatus({ id, to: "confirmed" })).toMatchObject({
      code: "BR-RND-008",
    });
  });

  it("cancelling frees the slot and keeps the reason", async () => {
    const start = openDay(4, "12:00");
    const { id } = await insert(start, "confirmed");
    await setAppointmentStatus({ id, to: "cancelled", reason: "Müşteri aradı" });
    const [row] = await db.select().from(appointments).where(eq(appointments.id, id));
    expect(row).toMatchObject({ cancelledBy: "admin", cancelReason: "Müşteri aradı" });
    await expect(insert(start)).resolves.toBeDefined();
  });
});

describe("createManualAppointment (UC-05)", () => {
  const manual = (startsAt: Date) => ({
    serviceId,
    startsAt: startsAt.toISOString(),
    name: "Zeynep A.",
    phone: "0532 000 33 44",
    email: "",
    note: "Telefonla aradı",
  });

  it("BR-RND-011: starts confirmed with source admin", async () => {
    const result = await createManualAppointment(manual(openDay(5, "11:00")));
    expect(result.ok).toBe(true);
    const [row] = await db.select().from(appointments);
    expect(row).toMatchObject({
      status: "confirmed",
      source: "admin",
      customerPhone: "+905320003344",
    });
  });

  it("BR-RND-003 / 001: the same rules as online booking", async () => {
    const start = openDay(5, "11:00");
    await insert(start, "confirmed");
    expect(await createManualAppointment(manual(start))).toMatchObject({ code: "BR-RND-003" });
    expect(await createManualAppointment(manual(openDay(5, "21:00")))).toMatchObject({
      code: "BR-RND-001",
    });
  });
});

describe("shareManageLink", () => {
  it("issues a new link, retires the old one and opens WhatsApp on the customer's number", async () => {
    const { id, token } = await insert(openDay(4, "12:00"), "confirmed");
    const result = await shareManageLink({ id });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const url = new URL(result.data.url);
    expect(url.pathname).toBe("/905320001234");
    const text = url.searchParams.get("text") ?? "";
    const newToken = /randevu\/yonet\/([A-Za-z0-9_-]{43})/.exec(text)?.[1] ?? "";
    expect(newToken).not.toBe(token);
    expect(await getAppointmentByTokenHash(hashManageToken(token), new Date())).toBeNull();
    expect(await getAppointmentByTokenHash(hashManageToken(newToken), new Date())).not.toBeNull();
  });
});
