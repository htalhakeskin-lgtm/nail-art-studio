import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { contentBlockDefaults } from "@/content/content-blocks";
import { faqs } from "@/server/db/schema";

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
const { auditLogs, contentBlocks } = await import("@/server/db/schema");
const { moveFaq, saveFaq, toggleFaqVisibility } = await import("@/features/faq");
const { saveAboutBlock } = await import("@/features/content");

const validFaq = {
  question: "Kalıcı oje ne kadar dayanır?",
  answer: "Genellikle 2–3 hafta dayanır.",
  category: "bakim" as const,
  isVisible: true,
};

beforeEach(async () => {
  await db.delete(faqs);
  await db.delete(contentBlocks);
  await db.delete(auditLogs);
  mocks.getSession.mockResolvedValue(sessionFor("owner"));
  mocks.updateTag.mockClear();
});

describe("panel content actions: permissions (14-test §3, S2)", () => {
  it("rejects an anonymous visitor and writes nothing", async () => {
    mocks.getSession.mockResolvedValue(null);
    const result = await saveFaq(validFaq);
    expect(result).toMatchObject({ ok: false, code: "unauthorized" });
    expect(await db.select().from(faqs)).toHaveLength(0);
  });

  it("rejects a role without content.edit", async () => {
    mocks.getSession.mockResolvedValue(sessionFor("staff"));
    expect(await saveFaq(validFaq)).toMatchObject({ ok: false, code: "forbidden" });
    expect(await saveAboutBlock(contentBlockDefaults.about)).toMatchObject({
      ok: false,
      code: "forbidden",
    });
  });
});

describe("saveFaq", () => {
  it("creates a question at the end of its category, logs it and refreshes the page", async () => {
    await saveFaq({ ...validFaq, question: "İlk soru burada" });
    const result = await saveFaq(validFaq);
    expect(result.ok).toBe(true);

    const rows = await db.select().from(faqs).where(eq(faqs.question, validFaq.question));
    expect(rows[0]).toMatchObject({ category: "bakim", sortOrder: 20, isVisible: true });
    const audit = await db.select().from(auditLogs).where(eq(auditLogs.action, "faq.create"));
    expect(audit).toHaveLength(2);
    expect(audit[0]?.actorId).toBe("user-owner");
    expect(mocks.updateTag).toHaveBeenCalledWith("faqs");
  });

  it("returns field errors with Turkish messages and saves nothing", async () => {
    const result = await saveFaq({ ...validFaq, question: "Kısa" });
    expect(result).toMatchObject({ ok: false, code: "validation" });
    if (result.ok) return;
    expect(result.fieldErrors?.question?.[0]).toBe("Soru en az 5 karakter olmalı.");
    expect(await db.select().from(faqs)).toHaveLength(0);
  });

  it("appends to the new category when the category changes and records the diff", async () => {
    await saveFaq({ ...validFaq, category: "hijyen", question: "Hijyen sorusu bir" });
    const created = await saveFaq(validFaq);
    if (!created.ok) throw new Error("setup failed");

    const updated = await saveFaq({ ...validFaq, id: created.data.id, category: "hijyen" });
    expect(updated.ok).toBe(true);
    const [row] = await db.select().from(faqs).where(eq(faqs.id, created.data.id));
    expect(row).toMatchObject({ category: "hijyen", sortOrder: 20 });
    const [audit] = await db.select().from(auditLogs).where(eq(auditLogs.action, "faq.update"));
    expect(audit?.changes).toEqual({ category: { from: "bakim", to: "hijyen" } });
  });

  it("answers notFound for an id that does not exist", async () => {
    const result = await saveFaq({ ...validFaq, id: "0190a1b2-c3d4-7e5f-8a9b-0c1d2e3f4a5b" });
    expect(result).toMatchObject({ ok: false, code: "notFound" });
  });
});

describe("toggleFaqVisibility and moveFaq", () => {
  it("hides and shows a question", async () => {
    const created = await saveFaq(validFaq);
    if (!created.ok) throw new Error("setup failed");
    expect(await toggleFaqVisibility({ id: created.data.id })).toMatchObject({
      ok: true,
      data: { isVisible: false },
    });
    expect(await toggleFaqVisibility({ id: created.data.id })).toMatchObject({
      ok: true,
      data: { isVisible: true },
    });
  });

  it("swaps two neighbours in the same category", async () => {
    const first = await saveFaq({ ...validFaq, question: "Birinci soru burada" });
    const second = await saveFaq({ ...validFaq, question: "İkinci soru burada" });
    if (!first.ok || !second.ok) throw new Error("setup failed");

    expect(await moveFaq({ id: second.data.id, direction: "up" })).toMatchObject({
      ok: true,
      data: { moved: true },
    });
    const ordered = await db.select().from(faqs).orderBy(faqs.sortOrder);
    expect(ordered.map((row) => row.question)).toEqual([
      "İkinci soru burada",
      "Birinci soru burada",
    ]);
    // Already first: nothing changes.
    expect(await moveFaq({ id: second.data.id, direction: "up" })).toMatchObject({
      ok: true,
      data: { moved: false },
    });
  });
});

describe("saveAboutBlock", () => {
  it("stores the about copy and refreshes the about page tag", async () => {
    const value = { ...contentBlockDefaults.about, closing: "Yeni kapanış metni burada." };
    expect((await saveAboutBlock(value)).ok).toBe(true);
    const [row] = await db.select().from(contentBlocks).where(eq(contentBlocks.key, "about"));
    expect(row?.value).toMatchObject({ closing: "Yeni kapanış metni burada." });
    expect(mocks.updateTag).toHaveBeenCalledWith("content-block:about");
    const [audit] = await db.select().from(auditLogs);
    expect(Object.keys(audit?.changes ?? {})).toEqual(["closing"]);
  });

  it("rejects more than four sections", async () => {
    const section = { title: "Başlık", body: "Metin" };
    const result = await saveAboutBlock({
      ...contentBlockDefaults.about,
      sections: Array.from({ length: 5 }, () => section),
    });
    expect(result).toMatchObject({ ok: false, code: "validation" });
  });
});
