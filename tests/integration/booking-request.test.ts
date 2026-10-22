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
  consentRecords,
  demoOutbox,
  galleryItems,
  services,
  siteSettings,
  staff,
  timeOff,
} = await import("@/server/db/schema");
const {
  addDays,
  getAppointmentByTokenHash,
  getAvailabilityContext,
  hashManageToken,
  istanbulDate,
  istanbulDateTime,
  nextSlots,
  requestAppointment,
} = await import("@/features/booking");

let serviceId = "";
let staffId = "";
let ipCounter = 0;

/** Free starts from the live engine, as the page would offer them. */
async function freeSlots(count = 3): Promise<string[]> {
  const now = new Date();
  const context = await getAvailabilityContext(
    staffId,
    now,
    istanbulDateTime(addDays(istanbulDate(now), 46), "00:00"),
    now,
  );
  return nextSlots(context, 60, count).map((slot) => slot.toISOString());
}

const visitor = (startsAt: string, overrides: Record<string, unknown> = {}) => ({
  serviceId,
  startsAt,
  name: "Ayşe Örnek",
  phone: "0532 000 12 34",
  email: "",
  note: "",
  preferredChannel: "whatsapp" as const,
  website: "",
  formStartedAt: Date.now() - 10_000,
  ...overrides,
});

beforeEach(async () => {
  await db.delete(appointments);
  await db.delete(timeOff);
  await db.delete(staff);
  await db.delete(services);
  await db.delete(galleryItems);
  await db.delete(siteSettings);
  await db.delete(consentRecords);
  await db.delete(demoOutbox);
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

describe("requestAppointment (UC-01, REQ-001)", () => {
  it("BR-RND-011: an online booking starts pending, with a code, a hashed manage link and records", async () => {
    const [slot = ""] = await freeSlots();
    const result = await requestAppointment(visitor(slot, { email: "ayse@example.com" }));
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.code).toMatch(/^NAS-[A-Z0-9]{4}$/);

    const [row] = await db.select().from(appointments);
    expect(row).toMatchObject({
      status: "pending",
      source: "online",
      customerPhone: "+905320001234",
      startsAt: new Date(slot),
      manageTokenHash: hashManageToken(result.data.token),
    });
    expect(row?.blockedUntil.getTime()).toBe(new Date(slot).getTime() + 75 * 60_000); // + P-01
    expect(row?.manageTokenHash).not.toBe(result.data.token); // only the hash is stored

    const consents = await db.select().from(consentRecords);
    expect(consents[0]).toMatchObject({ source: "appointmentForm", subjectRef: row?.id });
    const outbox = await db.select().from(demoOutbox);
    expect(outbox.map((message) => message.template).toSorted()).toEqual([
      "appointmentReceivedVisitor",
      "appointmentRequestedBusiness",
    ]);
    expect(JSON.stringify(outbox)).not.toMatch(/₺/); // BR-HZM-001
  });

  it("BR-RND-011: instant mode (P-07) confirms at once", async () => {
    await db.insert(siteSettings).values({
      id: "singleton",
      booking: {
        bufferMinutes: 15,
        slotStepMinutes: 15,
        minLeadHours: 3,
        horizonDays: 45,
        manageCutoffHours: 24,
        maxFuturePerPhone: 2,
        mode: "instant",
      },
    });
    const [slot = ""] = await freeSlots();
    expect((await requestAppointment(visitor(slot))).ok).toBe(true);
    const [row] = await db.select().from(appointments);
    expect(row?.status).toBe("confirmed");
    expect(row?.confirmedAt).toBeInstanceOf(Date);
  });

  it("REQ-011: keeps the gallery work as reference", async () => {
    const [work] = await db
      .insert(galleryItems)
      .values({
        slug: "renkli-puantiye",
        title: "Renkli puantiye",
        style: "rengarenk",
        colors: ["pembe"],
        length: "kisa",
        technique: "kalici-oje",
        imagePath: "/demo/hero-puantiye",
        imageWidth: 1064,
        imageHeight: 1330,
        imageAlt: "Örnek",
        isRepresentative: true,
        isPublished: true,
      })
      .returning({ id: galleryItems.id });
    const [slot = ""] = await freeSlots();
    const result = await requestAppointment(visitor(slot, { referenceWork: "renkli-puantiye" }));
    if (!result.ok) throw new Error(result.code);
    const managed = await getAppointmentByTokenHash(hashManageToken(result.data.token), new Date());
    expect(managed?.reference?.title).toBe("Renkli puantiye");
    const [row] = await db.select().from(appointments);
    expect(row?.referenceGalleryItemId).toBe(work?.id);
  });

  it("BR-RND-014: refuses a service that is hidden or not bookable online", async () => {
    const [slot = ""] = await freeSlots();
    await db.update(services).set({ isBookable: false }).where(eq(services.id, serviceId));
    expect(await requestAppointment(visitor(slot))).toMatchObject({ code: "BR-RND-014" });
    await db
      .update(services)
      .set({ isBookable: true, isActive: false })
      .where(eq(services.id, serviceId));
    expect(await requestAppointment(visitor(slot))).toMatchObject({ code: "BR-RND-014" });
    expect(await db.select().from(appointments)).toHaveLength(0);
  });

  it("BR-RND-001 / 005: re-checks the time on the server", async () => {
    const tooSoon = new Date(Date.now() + 30 * 60_000).toISOString();
    expect(await requestAppointment(visitor(tooSoon))).toMatchObject({ code: "BR-RND-005" });
    // A Monday (closed) a week ahead at noon.
    let date = addDays(istanbulDate(new Date()), 7);
    while (new Date(`${date}T12:00:00Z`).getUTCDay() !== 1) date = addDays(date, 1);
    const monday = istanbulDateTime(date, "12:00").toISOString();
    expect(await requestAppointment(visitor(monday))).toMatchObject({ code: "BR-RND-001" });
  });

  it("BR-RND-003: of two simultaneous requests for one slot, one wins", async () => {
    const [slot = ""] = await freeSlots();
    const results = await Promise.all([
      requestAppointment(visitor(slot, { phone: "0532 000 11 11" })),
      requestAppointment(visitor(slot, { phone: "0532 000 22 22" })),
    ]);
    expect(results.filter((result) => result.ok)).toHaveLength(1);
    expect(results.find((result) => !result.ok)).toMatchObject({ code: "BR-RND-003" });
    expect(await db.select().from(appointments)).toHaveLength(1);
  });

  it("BR-RND-006: at most two upcoming appointments per phone (P-06)", async () => {
    // 12 steps (3 h) apart: never inside the previous booking plus its cleaning buffer.
    const slots = await freeSlots(25);
    expect((await requestAppointment(visitor(slots[0] ?? ""))).ok).toBe(true);
    mocks.ip = "203.0.113.9";
    expect((await requestAppointment(visitor(slots[12] ?? ""))).ok).toBe(true);
    expect(await requestAppointment(visitor(slots[24] ?? ""))).toMatchObject({
      code: "BR-RND-006",
    });
  });

  it("drops a bot that fills the honeypot", async () => {
    const [slot = ""] = await freeSlots();
    expect(await requestAppointment(visitor(slot, { website: "x" }))).toMatchObject({
      code: "spam",
    });
  });
});

describe("manage link (BR-RND-009)", () => {
  it("opens only with the right token and stops working after expiry", async () => {
    const [slot = ""] = await freeSlots();
    const result = await requestAppointment(visitor(slot));
    if (!result.ok) throw new Error(result.code);
    const hash = hashManageToken(result.data.token);
    expect((await getAppointmentByTokenHash(hash, new Date()))?.code).toBe(result.data.code);
    expect(await getAppointmentByTokenHash(hashManageToken("x".repeat(43)), new Date())).toBeNull();
    const farFuture = new Date(Date.now() + 120 * 86_400_000);
    expect(await getAppointmentByTokenHash(hash, farFuture)).toBeNull();
  });
});
