import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { contentBlockDefaults } from "@/content/content-blocks";

import { sessionFor } from "./helpers";

// D-10: reviews (REQ-014) and the process / hygiene blocks (REQ-013, REQ-015). Session, IP and
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
const { auditLogs, contentBlocks, testimonials } = await import("@/server/db/schema");
const { getVisibleTestimonials, moveTestimonial, saveTestimonial, toggleTestimonialVisibility } =
  await import("@/features/testimonials");
const { getContentBlock, saveStepsBlock } = await import("@/features/content");

const review = (overrides: Record<string, unknown> = {}) => ({
  displayName: "Ayşe K.",
  body: "Tasarımı birlikte seçtik, üç hafta oldu hiç kalkma yok.",
  serviceId: "",
  isSample: true,
  isVisible: true,
  ...overrides,
});

beforeEach(async () => {
  await db.delete(testimonials);
  await db.delete(contentBlocks);
  await db.delete(auditLogs);
  mocks.getSession.mockResolvedValue(sessionFor("owner"));
  mocks.updateTag.mockClear();
});

describe("testimonials (SCR-107, REQ-014)", () => {
  it("rejects anonymous visitors and roles without content.edit", async () => {
    mocks.getSession.mockResolvedValue(null);
    expect(await saveTestimonial(review())).toMatchObject({ code: "unauthorized" });
    mocks.getSession.mockResolvedValue(sessionFor("staff"));
    expect(await saveTestimonial(review())).toMatchObject({ code: "forbidden" });
    expect(await db.select().from(testimonials)).toHaveLength(0);
  });

  it("creates reviews in order, logs them and refreshes the home page", async () => {
    await saveTestimonial(review());
    const second = await saveTestimonial(review({ displayName: "Deniz T." }));
    expect(second.ok).toBe(true);
    const rows = await db.select().from(testimonials).orderBy(testimonials.sortOrder);
    expect(rows.map((row) => [row.displayName, row.sortOrder, row.serviceId])).toEqual([
      ["Ayşe K.", 10, null],
      ["Deniz T.", 20, null],
    ]);
    expect(await db.select().from(auditLogs)).toHaveLength(2);
    expect(mocks.updateTag).toHaveBeenCalledWith("testimonials");
  });

  it("asks for a name and a real sentence", async () => {
    const result = await saveTestimonial(review({ displayName: "A", body: "Güzel." }));
    expect(result).toMatchObject({ ok: false, code: "validation" });
    if (result.ok) return;
    expect(result.fieldErrors?.displayName?.[0]).toBe("Adı yazın (örn. Ayşe K.).");
    expect(result.fieldErrors?.body?.[0]).toBe("Yorum en az 20 karakter olmalı.");
  });

  it("edits, hides and reorders; hidden reviews leave the site", async () => {
    const first = await saveTestimonial(review());
    const second = await saveTestimonial(review({ displayName: "Deniz T." }));
    if (!first.ok || !second.ok) throw new Error("setup failed");

    await saveTestimonial(review({ id: first.data.id, isSample: false }));
    const [audit] = await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.action, "testimonial.update"));
    expect(audit?.changes).toEqual({ isSample: { from: true, to: false } });

    expect(await moveTestimonial({ id: second.data.id, direction: "up" })).toMatchObject({
      data: { moved: true },
    });
    expect(await toggleTestimonialVisibility({ id: first.data.id })).toMatchObject({
      data: { isVisible: false },
    });
    const visible = await getVisibleTestimonials();
    expect(visible.map((item) => item.displayName)).toEqual(["Deniz T."]);
  });

  it("answers notFound for an id that does not exist", async () => {
    const id = "0190a1b2-c3d4-7e5f-8a9b-0c1d2e3f4a5b";
    expect(await saveTestimonial(review({ id }))).toMatchObject({ code: "notFound" });
    expect(await toggleTestimonialVisibility({ id })).toMatchObject({ code: "notFound" });
  });
});

describe("saveStepsBlock (REQ-013, REQ-015)", () => {
  it("falls back to the defaults, then stores the owner's steps", async () => {
    expect(await getContentBlock("hygiene")).toEqual(contentBlockDefaults.hygiene);
    const value = {
      ...contentBlockDefaults.hygiene,
      note: "Hijyen eğitimi belgesi: HE-1234",
    };
    expect((await saveStepsBlock({ key: "hygiene", ...value })).ok).toBe(true);
    const [row] = await db.select().from(contentBlocks).where(eq(contentBlocks.key, "hygiene"));
    expect(row?.value).toMatchObject({ note: "Hijyen eğitimi belgesi: HE-1234" });
    expect(mocks.updateTag).toHaveBeenCalledWith("content-block:hygiene");
  });

  it("needs at least two steps and the content.edit permission", async () => {
    const [step] = contentBlockDefaults.process.steps;
    const result = await saveStepsBlock({
      key: "process",
      ...contentBlockDefaults.process,
      steps: step ? [step] : [],
    });
    expect(result).toMatchObject({ ok: false, code: "validation" });
    mocks.getSession.mockResolvedValue(sessionFor("staff"));
    expect(await saveStepsBlock({ key: "process", ...contentBlockDefaults.process })).toMatchObject(
      { code: "forbidden" },
    );
  });
});
