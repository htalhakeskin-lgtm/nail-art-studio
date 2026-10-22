import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { services } from "@/server/db/schema";

import { sessionFor } from "./helpers";

// No request scope or Next.js cache outside Next: session, IP and cache tags are stubbed;
// the database is real (14-test §2).
const mocks = vi.hoisted(() => ({ getSession: vi.fn(), updateTag: vi.fn() }));
vi.mock("@/server/auth", () => ({ getSession: mocks.getSession }));
vi.mock("next/cache", () => ({
  updateTag: mocks.updateTag,
  cacheLife: vi.fn(),
  cacheTag: vi.fn(),
}));
vi.mock("@/server/request", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/server/request")>()),
  clientIp: () => Promise.resolve("127.0.0.1"),
}));

const { db } = await import("@/server/db/client");
const { auditLogs, siteSettings } = await import("@/server/db/schema");
const { listActiveServices, moveService, saveService, setPriceDisplay, toggleServiceActive } =
  await import("@/features/services");

const form = (overrides: Record<string, unknown> = {}) => ({
  name: "Kalıcı oje",
  slug: "kalici-oje",
  category: "kalici-oje" as const,
  summary: "Kendi tırnağınıza tek renk kalıcı oje.",
  suitableFor: "",
  body: "",
  aftercare: "",
  durabilityText: "Ortalama 2–3 hafta",
  durationMinutes: "60",
  refillIntervalDays: "21",
  price: "1.250,50",
  priceDisplayOverride: "" as const,
  faqs: [
    { question: "Zarar verir mi?", answer: "Doğru çıkarma ile vermez." },
    { question: "", answer: "" },
  ],
  isBookable: true,
  isActive: true,
  ...overrides,
});

async function create(overrides: Record<string, unknown> = {}) {
  const result = await saveService(form(overrides));
  if (!result.ok) throw new Error(`setup failed: ${result.code}`);
  return result.data.id;
}

beforeEach(async () => {
  await db.delete(services);
  await db.delete(auditLogs);
  await db.delete(siteSettings);
  mocks.getSession.mockResolvedValue(sessionFor("owner"));
  mocks.updateTag.mockClear();
});

describe("service actions: permissions (14-test §3, S2)", () => {
  it("rejects an anonymous visitor and a role without services.edit", async () => {
    mocks.getSession.mockResolvedValue(null);
    expect(await saveService(form())).toMatchObject({ code: "unauthorized" });
    mocks.getSession.mockResolvedValue(sessionFor("staff"));
    expect(await saveService(form())).toMatchObject({ code: "forbidden" });
    expect(await setPriceDisplay({ display: "show" })).toMatchObject({ code: "forbidden" });
    expect(await db.select().from(services)).toHaveLength(0);
  });
});

describe("saveService", () => {
  it("stores the price in kuruş, drops empty questions, logs it and refreshes the pages", async () => {
    const id = await create();
    const [row] = await db.select().from(services).where(eq(services.id, id));
    expect(row).toMatchObject({
      priceMinor: 125050,
      durationMinutes: 60,
      refillIntervalDays: 21,
      suitableFor: null,
      priceDisplayOverride: null,
      sortOrder: 10,
      faqs: [{ question: "Zarar verir mi?", answer: "Doğru çıkarma ile vermez." }],
    });
    const [audit] = await db.select().from(auditLogs).where(eq(auditLogs.entityId, id));
    expect(audit?.action).toBe("service.create");
    expect(mocks.updateTag).toHaveBeenCalledWith("services");
  });

  it("BR-HZM-002: refuses a slug another service uses, but keeps its own on update", async () => {
    const id = await create();
    const duplicate = await saveService(form({ name: "Başka hizmet" }));
    expect(duplicate).toMatchObject({ ok: false, code: "BR-HZM-002" });
    if (!duplicate.ok) expect(duplicate.fieldErrors?.slug?.[0]).toBe("Bu kısa ad kullanılıyor.");

    expect(await saveService(form({ id, durationMinutes: "75" }))).toMatchObject({ ok: true });
    const [row] = await db.select().from(services).where(eq(services.id, id));
    expect(row?.durationMinutes).toBe(75);
  });

  it("returns field errors in Turkish for a bad slug, duration, price and half-filled question", async () => {
    const result = await saveService(
      form({
        slug: "Kalıcı Oje",
        durationMinutes: "3",
        price: "12,345",
        faqs: [{ question: "Soru var", answer: "" }],
      }),
    );
    expect(result).toMatchObject({ ok: false, code: "validation" });
    if (result.ok) return;
    expect(result.fieldErrors?.slug?.[0]).toContain("küçük harf");
    expect(result.fieldErrors?.durationMinutes?.[0]).toBe(
      "Süreyi 5 ile 600 dakika arasında yazın.",
    );
    expect(result.fieldErrors?.price?.[0]).toBe("Tutarı 650 ya da 1.250,50 biçiminde yazın.");
    expect(result.fieldErrors?.faqs).toBeDefined();
  });

  it("moves to the end of a new category when the category changes", async () => {
    await create({ slug: "jel-guclendirme", category: "jel" });
    const id = await create();
    await saveService(form({ id, category: "jel" }));
    const [row] = await db.select().from(services).where(eq(services.id, id));
    expect(row).toMatchObject({ category: "jel", sortOrder: 20 });
  });
});

describe("hiding and ordering", () => {
  it("BR-RND-014: a hidden service leaves the public list", async () => {
    const id = await create();
    await create({ slug: "french", name: "French" });
    expect(await toggleServiceActive({ id })).toEqual({ ok: true, data: { isActive: false } });
    expect((await listActiveServices()).map((service) => service.slug)).toEqual(["french"]);
  });

  it("swaps places within a category", async () => {
    const first = await create();
    const second = await create({ slug: "french", name: "French" });
    expect(await moveService({ id: second, direction: "up" })).toEqual({
      ok: true,
      data: { moved: true },
    });
    expect((await listActiveServices()).map((service) => service.id)).toEqual([second, first]);
    expect(await moveService({ id: second, direction: "up" })).toEqual({
      ok: true,
      data: { moved: false },
    });
  });
});

describe("setPriceDisplay (P-08)", () => {
  it("creates or updates the site setting and refreshes settings and services", async () => {
    expect(await setPriceDisplay({ display: "show" })).toEqual({
      ok: true,
      data: { display: "show" },
    });
    const [row] = await db.select().from(siteSettings);
    expect(row?.pricing).toEqual({ display: "show" });
    await setPriceDisplay({ display: "contact" });
    const [after] = await db.select().from(siteSettings);
    expect(after?.pricing).toEqual({ display: "contact" });
    expect(mocks.updateTag).toHaveBeenCalledWith("site-settings");
    expect(mocks.updateTag).toHaveBeenCalledWith("services");
  });
});
