import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { leads } from "@/server/db/schema";

import { sessionFor } from "./helpers";

// No request scope or Next.js cache outside Next: session, IP and cache tags are stubbed;
// the database is real (14-test §2).
const mocks = vi.hoisted(() => ({ getSession: vi.fn(), ip: "198.51.100.7" }));
vi.mock("@/server/auth", () => ({ getSession: mocks.getSession }));
vi.mock("next/cache", () => ({ updateTag: vi.fn(), cacheLife: vi.fn(), cacheTag: vi.fn() }));
vi.mock("@/server/request", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/server/request")>()),
  clientIp: () => Promise.resolve(mocks.ip),
}));

const { db } = await import("@/server/db/client");
const { actionRateLimits, auditLogs, consentRecords, demoOutbox } =
  await import("@/server/db/schema");
const { saveLeadNote, sendContactMessage, updateLeadStatus } = await import("@/features/leads");

/** A person who took ten seconds to fill the form, sent with the hidden spam-guard fields. */
const visitor = (overrides: Record<string, unknown> = {}) => ({
  name: "Ayşe Örnek",
  phone: "0532 000 12 34",
  email: "",
  message: "Krom lila tasarım için bu hafta uygun saatiniz var mı?",
  preferredChannel: "whatsapp" as const,
  website: "",
  formStartedAt: Date.now() - 10_000,
  ...overrides,
});

let ipCounter = 0;

beforeEach(async () => {
  await db.delete(leads);
  await db.delete(consentRecords);
  await db.delete(demoOutbox);
  await db.delete(auditLogs);
  await db.delete(actionRateLimits);
  // A fresh IP per test so the rate limit never leaks between tests.
  ipCounter += 1;
  mocks.ip = `198.51.100.${String(ipCounter)}`;
  mocks.getSession.mockResolvedValue(sessionFor("owner"));
});

describe("sendContactMessage (UC-07)", () => {
  it("stores the request with a yearly code, logs the notice version and notifies the studio", async () => {
    const result = await sendContactMessage(visitor());
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.code).toMatch(/^TLP-\d{4}-0001$/);

    const [lead] = await db.select().from(leads).where(eq(leads.code, result.data.code));
    expect(lead).toMatchObject({
      kind: "contact",
      status: "new",
      phone: "+905320001234", // E.164
      email: null,
      preferredChannel: "whatsapp",
      sourcePath: "/iletisim",
    });

    const consents = await db.select().from(consentRecords);
    expect(consents).toHaveLength(1);
    expect(consents[0]).toMatchObject({
      kind: "information_notice",
      source: "contactForm",
      textVersion: "kvkk-1.0+form-1.0",
      subjectRef: lead?.id,
    });
    expect(consents[0]?.ipHash).not.toContain("198.51.100"); // never the raw IP

    // DEMO_MODE: nothing leaves the system; only the studio is told (no visitor e-mail given).
    const outbox = await db.select().from(demoOutbox);
    expect(outbox.map((message) => message.template)).toEqual(["leadReceivedBusiness"]);
  });

  it("numbers requests one after another and confirms by e-mail when one is given", async () => {
    await sendContactMessage(visitor());
    const second = await sendContactMessage(
      visitor({ email: "ayse@example.com", preferredChannel: "eposta" }),
    );
    expect(second.ok && second.data.code).toMatch(/-0002$/);
    const outbox = await db.select().from(demoOutbox);
    expect(outbox.filter((message) => message.to === "ayse@example.com")).toHaveLength(1);
  });

  it("BR-TLP-001: needs a phone or an e-mail and saves nothing without one", async () => {
    const result = await sendContactMessage(visitor({ phone: "", email: "" }));
    expect(result).toMatchObject({ ok: false, code: "validation" });
    if (result.ok) return;
    expect(result.fieldErrors?.phone?.[0]).toBe(
      "Lütfen adınızı ve telefon ya da e-posta bilgilerinizden birini girin.",
    );
    expect(await db.select().from(leads)).toHaveLength(0);
  });

  it("BR-TLP-001: the chosen reply channel must be one the visitor gave", async () => {
    const result = await sendContactMessage(visitor({ preferredChannel: "eposta" }));
    expect(result).toMatchObject({ ok: false, code: "validation" });
    if (result.ok) return;
    expect(result.fieldErrors?.email?.[0]).toBe("E-postayla dönüş için e-posta adresinizi yazın.");
  });

  it("rejects a malformed phone number with a hint", async () => {
    const result = await sendContactMessage(visitor({ phone: "12345" }));
    expect(result).toMatchObject({ ok: false, code: "validation" });
    if (result.ok) return;
    expect(result.fieldErrors?.phone?.[0]).toBe("Telefonu 0532 123 45 67 biçiminde yazın.");
  });

  it("drops a bot that fills the honeypot or sends too fast", async () => {
    expect(await sendContactMessage(visitor({ website: "https://spam.example" }))).toMatchObject({
      code: "spam",
    });
    expect(await sendContactMessage(visitor({ formStartedAt: Date.now() }))).toMatchObject({
      code: "spam",
    });
    expect(await db.select().from(leads)).toHaveLength(0);
  });

  it("P-10: allows five requests per IP per hour", async () => {
    for (let index = 0; index < 5; index += 1) {
      expect((await sendContactMessage(visitor())).ok).toBe(true);
    }
    expect(await sendContactMessage(visitor())).toMatchObject({ ok: false, code: "rateLimited" });
    expect(await db.select().from(leads)).toHaveLength(5);
  });
});

describe("panel lead actions", () => {
  async function createLead() {
    const result = await sendContactMessage(visitor());
    if (!result.ok) throw new Error("setup failed");
    const [lead] = await db.select().from(leads).where(eq(leads.code, result.data.code));
    if (!lead) throw new Error("setup failed");
    return lead;
  }

  it("rejects an anonymous visitor", async () => {
    const lead = await createLead();
    mocks.getSession.mockResolvedValue(null);
    expect(await updateLeadStatus({ id: lead.id, status: "contacted" })).toMatchObject({
      code: "unauthorized",
    });
    expect(await saveLeadNote({ id: lead.id, note: "x" })).toMatchObject({ code: "unauthorized" });
  });

  it("lets staff (leads.edit) change the status, marks it read and logs the change", async () => {
    const lead = await createLead();
    mocks.getSession.mockResolvedValue(sessionFor("staff"));
    expect(await updateLeadStatus({ id: lead.id, status: "contacted" })).toEqual({
      ok: true,
      data: { status: "contacted" },
    });
    const [row] = await db.select().from(leads).where(eq(leads.id, lead.id));
    expect(row?.status).toBe("contacted");
    expect(row?.readAt).toBeInstanceOf(Date);
    const [audit] = await db.select().from(auditLogs).where(eq(auditLogs.entityId, lead.id));
    expect(audit).toMatchObject({
      action: "lead.status",
      changes: { status: { from: "new", to: "contacted" } },
    });
  });

  it("saves and clears an internal note; unknown requests answer notFound", async () => {
    const lead = await createLead();
    await saveLeadNote({ id: lead.id, note: "Cuma 15:00 önerildi." });
    let [row] = await db.select().from(leads).where(eq(leads.id, lead.id));
    expect(row?.note).toBe("Cuma 15:00 önerildi.");
    await saveLeadNote({ id: lead.id, note: "  " });
    [row] = await db.select().from(leads).where(eq(leads.id, lead.id));
    expect(row?.note).toBeNull();

    const unknown = "01900000-0000-7000-8000-000000000000";
    expect(await updateLeadStatus({ id: unknown, status: "spam" })).toMatchObject({
      code: "notFound",
    });
    expect(await saveLeadNote({ id: unknown, note: "x" })).toMatchObject({ code: "notFound" });
  });
});
