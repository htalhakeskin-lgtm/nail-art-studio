import { beforeEach, describe, expect, it, vi } from "vitest";

import { siteDefaults } from "@/config/site-defaults";

import { sessionFor } from "./helpers";

// SCR-110 "Ayarlar": business details, contact, Instagram and the search snippet. Session, IP and
// cache tags are stubbed; the database is real (14-test §2).
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
const { getSiteSettings, saveBusinessSettings } = await import("@/features/site");

const form = (overrides: Record<string, string> = {}) => ({
  name: "Nail Art Studios",
  owner: "Bahadır Karasu",
  tagline: "Kadıköy'de nail art",
  address: "Caferağa Mah. Moda Cad. No: 00, Kadıköy / İstanbul",
  district: "Kadıköy",
  city: "İstanbul",
  phone: "0542 311 58 88",
  whatsapp: "+90 (542) 311 58 88",
  email: "merhaba@ornek.example.com",
  whatsappMessage: "Merhaba, web sitenizden yazıyorum.",
  instagram: "@bahadirkarasunails",
  defaultTitle: "Nail Art Studios · Kadıköy nail art",
  defaultDescription:
    "Kadıköy Moda'da kalıcı oje, jel, protez tırnak ve el boyaması nail art. Online randevu alın.",
  ...overrides,
});

beforeEach(async () => {
  await db.delete(siteSettings);
  await db.delete(auditLogs);
  mocks.getSession.mockResolvedValue(sessionFor("owner"));
  mocks.updateTag.mockClear();
});

describe("saveBusinessSettings (SCR-110)", () => {
  it("rejects visitors and staff without settings.edit", async () => {
    mocks.getSession.mockResolvedValue(null);
    expect(await saveBusinessSettings(form())).toMatchObject({ code: "unauthorized" });
    mocks.getSession.mockResolvedValue(sessionFor("staff"));
    expect(await saveBusinessSettings(form())).toMatchObject({ code: "forbidden" });
    expect(await db.select().from(siteSettings)).toHaveLength(0);
  });

  it("stores phones as E.164 and Instagram without @, keeps the other fields, refreshes the site", async () => {
    expect((await saveBusinessSettings(form({ tagline: "Yeni tanıtım" }))).ok).toBe(true);
    const [row] = await db.select().from(siteSettings);
    expect(row?.contact).toMatchObject({ phone: "+905423115888", whatsapp: "+905423115888" });
    expect(row?.social).toMatchObject({ instagram: "bahadirkarasunails" });
    // Untouched parts of each section stay as they were (geo, legal name, title template).
    expect(row?.company).toMatchObject({
      tagline: "Yeni tanıtım",
      geo: siteDefaults.company.geo,
      legalName: siteDefaults.company.legalName,
    });
    expect(row?.seo).toMatchObject({ titleTemplate: siteDefaults.seo.titleTemplate });
    expect(mocks.updateTag).toHaveBeenCalledWith("site-settings");
    const [audit] = await db.select().from(auditLogs);
    expect(audit?.action).toBe("settings.business");
    expect(Object.keys(audit?.changes ?? {})).toContain("tagline");
    expect((await getSiteSettings()).company.tagline).toBe("Yeni tanıtım");
  });

  it("explains each wrong field in Turkish and saves nothing", async () => {
    const result = await saveBusinessSettings(
      form({ phone: "123", instagram: "bad name!", defaultTitle: "Kısa" }),
    );
    expect(result).toMatchObject({ ok: false, code: "validation" });
    if (result.ok) return;
    expect(result.fieldErrors?.phone?.[0]).toBe("Telefon: 0532 123 45 67 biçiminde yazın.");
    expect(result.fieldErrors?.instagram?.[0]).toContain("@ olmadan");
    expect(result.fieldErrors?.defaultTitle?.[0]).toBe("Başlık en az 10 karakter olmalı.");
    expect(await db.select().from(siteSettings)).toHaveLength(0);
  });
});
