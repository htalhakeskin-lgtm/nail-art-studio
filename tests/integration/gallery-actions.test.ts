import { eq } from "drizzle-orm";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { galleryItems } from "@/server/db/schema";

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
const { auditLogs } = await import("@/server/db/schema");
const { listPublishedGalleryItems, toggleGalleryFeatured, toggleGalleryPublished } =
  await import("@/features/gallery");

type NewWork = typeof galleryItems.$inferInsert;

async function createWork(overrides: Partial<NewWork> = {}) {
  const [row] = await db
    .insert(galleryItems)
    .values({
      slug: `eser-${String(Math.random()).slice(2, 10)}`,
      title: "Test eseri",
      style: "sade",
      colors: ["pembe"],
      length: "kisa",
      technique: "kalici-oje",
      imagePath: "/demo/galeri-pembe-sade",
      imageWidth: 1064,
      imageHeight: 1330,
      imageAlt: "Pembe tırnaklar",
      isRepresentative: true,
      isPublished: true,
      ...overrides,
    })
    .returning();
  if (!row) throw new Error("setup failed");
  return row;
}

const UNKNOWN_ID = "01900000-0000-7000-8000-000000000000";

beforeEach(async () => {
  await db.delete(galleryItems);
  await db.delete(auditLogs);
  mocks.getSession.mockResolvedValue(sessionFor("owner"));
  mocks.updateTag.mockClear();
});

describe("gallery actions: permissions (14-test §3, S2)", () => {
  it("rejects an anonymous visitor and changes nothing", async () => {
    const work = await createWork();
    mocks.getSession.mockResolvedValue(null);
    expect(await toggleGalleryPublished({ id: work.id })).toMatchObject({
      ok: false,
      code: "unauthorized",
    });
    const [row] = await db.select().from(galleryItems).where(eq(galleryItems.id, work.id));
    expect(row?.isPublished).toBe(true);
  });

  it("rejects a role without gallery.edit", async () => {
    const work = await createWork();
    mocks.getSession.mockResolvedValue(sessionFor("staff"));
    expect(await toggleGalleryPublished({ id: work.id })).toMatchObject({ code: "forbidden" });
    expect(await toggleGalleryFeatured({ id: work.id })).toMatchObject({ code: "forbidden" });
  });

  it("answers notFound for an unknown work", async () => {
    expect(await toggleGalleryPublished({ id: UNKNOWN_ID })).toMatchObject({ code: "notFound" });
    expect(await toggleGalleryFeatured({ id: UNKNOWN_ID })).toMatchObject({ code: "notFound" });
  });
});

describe("toggleGalleryPublished", () => {
  it("unpublishes and republishes, logs both and refreshes the gallery", async () => {
    const work = await createWork();
    expect(await toggleGalleryPublished({ id: work.id })).toEqual({
      ok: true,
      data: { isPublished: false },
    });
    expect(await toggleGalleryPublished({ id: work.id })).toEqual({
      ok: true,
      data: { isPublished: true },
    });
    const audit = await db.select().from(auditLogs).where(eq(auditLogs.entityId, work.id));
    expect(audit.map((entry) => entry.action).toSorted()).toEqual([
      "gallery.publish",
      "gallery.unpublish",
    ]);
    expect(mocks.updateTag).toHaveBeenCalledWith("gallery");
  });

  it("BR-GLR-003: refuses to publish a client's photo without recorded consent", async () => {
    const work = await createWork({ isRepresentative: false, isPublished: false });
    expect(await toggleGalleryPublished({ id: work.id })).toMatchObject({
      ok: false,
      code: "BR-GLR-003",
    });
    const [row] = await db.select().from(galleryItems).where(eq(galleryItems.id, work.id));
    expect(row?.isPublished).toBe(false);

    const consented = await createWork({
      isRepresentative: false,
      isPublished: false,
      consentObtainedAt: new Date("2026-10-01T10:00:00Z"),
    });
    expect(await toggleGalleryPublished({ id: consented.id })).toMatchObject({ ok: true });
  });

  it("BR-GLR-003: the database refuses the same row even without the action", async () => {
    await expect(createWork({ isRepresentative: false, isPublished: true })).rejects.toThrow();
  });
});

describe("toggleGalleryFeatured", () => {
  it("adds a work to the home selection and takes it out again", async () => {
    const work = await createWork();
    expect(await toggleGalleryFeatured({ id: work.id })).toEqual({
      ok: true,
      data: { isFeatured: true },
    });
    expect(await toggleGalleryFeatured({ id: work.id })).toEqual({
      ok: true,
      data: { isFeatured: false },
    });
  });
});

describe("gallery data rules", () => {
  it("BR-GLR-004: work numbers are never reused after a delete", async () => {
    const first = await createWork();
    await db.delete(galleryItems).where(eq(galleryItems.id, first.id));
    const second = await createWork();
    expect(second.number).toBeGreaterThan(first.number);
  });

  it("rejects colours and styles outside the fixed sets", async () => {
    // @ts-expect-error -- invalid on purpose: the check constraint must stop it
    await expect(createWork({ colors: ["gri"] })).rejects.toThrow();
    await expect(createWork({ colors: [] })).rejects.toThrow();
  });

  it("lists only published works, in gallery order", async () => {
    await createWork({ slug: "ikinci", sortOrder: 20 });
    await createWork({ slug: "birinci", sortOrder: 10 });
    await createWork({ slug: "taslak", sortOrder: 5, isPublished: false });
    const items = await listPublishedGalleryItems();
    expect(items.map((item) => item.slug)).toEqual(["birinci", "ikinci"]);
  });
});
