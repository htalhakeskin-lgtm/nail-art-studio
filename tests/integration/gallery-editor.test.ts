import { eq } from "drizzle-orm";
import sharp from "sharp";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { sessionFor } from "./helpers";

// No request scope or Next.js cache outside Next: session, IP and cache tags are stubbed;
// the database and sharp are real (14-test §2). Without a Blob token, variants go to the
// media_files table (K-39).
const mocks = vi.hoisted(() => ({ getSession: vi.fn() }));
vi.mock("@/server/auth", () => ({ getSession: mocks.getSession }));
vi.mock("next/cache", () => ({ updateTag: vi.fn(), cacheLife: vi.fn(), cacheTag: vi.fn() }));
vi.mock("@/server/request", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/server/request")>()),
  clientIp: () => Promise.resolve("127.0.0.1"),
}));

const { db } = await import("@/server/db/client");
const { actionRateLimits, appointments, auditLogs, galleryItems, mediaAssets, mediaFiles } =
  await import("@/server/db/schema");
const { saveGalleryItem, uploadGalleryImage } = await import("@/features/gallery");

const photo = async (width = 1200, height = 1600) =>
  new File(
    [
      new Uint8Array(
        await sharp({ create: { width, height, channels: 3, background: "#f7a9cb" } })
          .jpeg()
          .toBuffer(),
      ),
    ],
    "foto.jpg",
    { type: "image/jpeg" },
  );

async function upload() {
  const result = await uploadGalleryImage({ file: await photo() });
  if (!result.ok) throw new Error(result.code);
  return result.data.id;
}

const work = (overrides: Record<string, unknown> = {}) => ({
  title: "Pembe krom",
  slug: "pembe-krom",
  description: "",
  style: "simli" as const,
  colors: ["pembe" as const],
  length: "kisa" as const,
  technique: "jel" as const,
  durationMinutes: "90",
  instagramUrl: "",
  imageAlt: "Kısa tırnaklarda pembe krom jel",
  beforeImageAlt: "",
  removeBefore: false,
  consent: true,
  isPublished: true,
  isFeatured: false,
  ...overrides,
});

beforeEach(async () => {
  await db.update(appointments).set({ referenceGalleryItemId: null });
  await db.delete(galleryItems);
  await db.delete(mediaFiles);
  await db.delete(mediaAssets);
  await db.delete(auditLogs);
  await db.delete(actionRateLimits);
  mocks.getSession.mockResolvedValue(sessionFor("owner"));
});

describe("uploadGalleryImage (BR-GLR-002)", () => {
  it("rejects anonymous users and staff without gallery.edit", async () => {
    mocks.getSession.mockResolvedValue(null);
    expect(await uploadGalleryImage({ file: await photo() })).toMatchObject({
      code: "unauthorized",
    });
    mocks.getSession.mockResolvedValue(sessionFor("staff"));
    expect(await uploadGalleryImage({ file: await photo() })).toMatchObject({ code: "forbidden" });
  });

  it("stores three WebP variants and an asset row for a real photo", async () => {
    const result = await uploadGalleryImage({ file: await photo() });
    expect(result).toMatchObject({ ok: true, data: { width: 1200, height: 1500 } });
    if (!result.ok) return;
    expect(result.data.basePath).toBe(`/media/${result.data.id}`);
    const files = await db.select({ key: mediaFiles.key }).from(mediaFiles);
    expect(files.map((file) => file.key).toSorted()).toEqual(
      [480, 960, 1600].map((width) => `${result.data.id}-${String(width)}.webp`).toSorted(),
    );
  });

  it("refuses a file that is not an image, whatever its name says", async () => {
    const fake = new File([new TextEncoder().encode("<svg onload=alert(1)>")], "foto.jpg", {
      type: "image/jpeg",
    });
    expect(await uploadGalleryImage({ file: fake })).toMatchObject({ code: "BR-GLR-002" });
    expect(await db.select().from(mediaAssets)).toHaveLength(0);
  });

  it("refuses a photo that is too small, with a plain message", async () => {
    const result = await uploadGalleryImage({ file: await photo(400, 500) });
    expect(result).toMatchObject({ ok: false, code: "BR-GLR-002" });
    if (!result.ok) expect(result.message).toContain("en az 600 piksel");
  });
});

describe("saveGalleryItem (UC-06)", () => {
  it("BR-GLR-003: a client's photo is not published without consent", async () => {
    const mediaId = await upload();
    expect(await saveGalleryItem(work({ mediaId, consent: false }))).toMatchObject({
      code: "BR-GLR-003",
    });
    expect((await saveGalleryItem(work({ mediaId, consent: false, isPublished: false }))).ok).toBe(
      true,
    );
  });

  it("creates a published work at the top of the gallery with its before photo", async () => {
    await db.insert(galleryItems).values({
      slug: "eski",
      title: "Eski",
      style: "sade",
      colors: ["pembe"],
      length: "kisa",
      technique: "jel",
      imagePath: "/demo/x",
      imageWidth: 1,
      imageHeight: 1,
      imageAlt: "x",
      isRepresentative: true,
      isPublished: true,
      sortOrder: 10,
    });
    const [mediaId, beforeMediaId] = [await upload(), await upload()];
    const result = await saveGalleryItem(
      work({ mediaId, beforeMediaId, beforeImageAlt: "Aynı el, uygulamadan önce, çıplak tırnak" }),
    );
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    const [row] = await db.select().from(galleryItems).where(eq(galleryItems.id, result.data.id));
    expect(row).toMatchObject({
      isRepresentative: false,
      isPublished: true,
      sortOrder: 0,
      imagePath: `/media/${mediaId}`,
      beforeImagePath: `/media/${beforeMediaId}`,
      durationMinutes: 90,
    });
    expect(row?.consentObtainedAt).toBeInstanceOf(Date);
  });

  it("asks for a photo, a known slug and a described before photo", async () => {
    const missing = await saveGalleryItem(work());
    expect(missing).toMatchObject({ code: "validation" });
    if (!missing.ok) expect(missing.fieldErrors?.mediaId?.[0]).toBe("Bir fotoğraf yükleyin.");

    const mediaId = await upload();
    await saveGalleryItem(work({ mediaId }));
    const duplicate = await saveGalleryItem(work({ mediaId: await upload() }));
    if (!duplicate.ok) expect(duplicate.fieldErrors?.slug?.[0]).toBe("Bu kısa ad kullanılıyor.");

    const before = await saveGalleryItem(
      work({
        slug: "diger",
        mediaId: await upload(),
        beforeMediaId: await upload(),
        beforeImageAlt: "kısa",
      }),
    );
    if (!before.ok) expect(before.fieldErrors?.beforeImageAlt).toBeDefined();
  });

  it("edits a work and removes its before photo", async () => {
    const created = await saveGalleryItem(
      work({
        mediaId: await upload(),
        beforeMediaId: await upload(),
        beforeImageAlt: "Önceki hâli, çıplak tırnak",
      }),
    );
    if (!created.ok) throw new Error(created.code);
    const result = await saveGalleryItem(
      work({ id: created.data.id, title: "Pembe krom yeni", removeBefore: true }),
    );
    expect(result.ok).toBe(true);
    const [row] = await db.select().from(galleryItems).where(eq(galleryItems.id, created.data.id));
    expect(row).toMatchObject({
      title: "Pembe krom yeni",
      beforeImagePath: null,
      beforeImageAlt: null,
    });
  });
});
