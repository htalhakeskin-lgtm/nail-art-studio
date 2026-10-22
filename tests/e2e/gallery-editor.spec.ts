import { expect, test } from "@playwright/test";
import { Pool } from "pg";
import sharp from "sharp";

import { ADMIN_STATE } from "./session";

/** D-09: panel upload (UC-06, BR-GLR-002, 003) and the before / after slider (V-07, REQ-007). */

const SLUG = `e2e-krom-${String(Date.now())}`;

async function withDb<T>(run: (pool: Pool) => Promise<T>): Promise<T> {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
  try {
    return await run(pool);
  } finally {
    await pool.end();
  }
}

const photo = async (background: string) => ({
  name: "foto.png",
  mimeType: "image/png",
  buffer: await sharp({ create: { width: 900, height: 1200, channels: 3, background } })
    .png()
    .toBuffer(),
});

test.describe("panel gallery editor", () => {
  // afterAll cleans shared rows: run this block in one worker so it never deletes data a test in
  // another worker is still using (fullyParallel).
  test.describe.configure({ mode: "serial" });
  test.use({ storageState: ADMIN_STATE });
  test.skip(({ isMobile }) => isMobile, "writes shared data: the desktop project runs it");

  test.afterAll(async () => {
    await withDb(async (pool) => {
      await pool.query("delete from gallery_items where slug like 'e2e-krom-%'");
    });
  });

  test("UC-06: uploads a work with its before photo, needs consent, then shows the slider", async ({
    page,
  }) => {
    await page.goto("/panel/galeri/yeni");
    await page.getByLabel("Fotoğraf", { exact: true }).setInputFiles(await photo("#f7a9cb"));
    await expect(page.getByText("Fotoğraf yüklendi.").first()).toBeVisible();
    await page.getByLabel("Öncesi fotoğrafı (isteğe bağlı)").setInputFiles(await photo("#e8d5c4"));
    await expect(page.getByText("Fotoğraf yüklendi.")).toHaveCount(2);

    await page.getByLabel("Fotoğrafın açıklaması").fill("Kısa tırnaklarda pembe krom jel");
    await page
      .getByLabel("Öncesi fotoğrafının açıklaması")
      .fill("Aynı el, uygulamadan önce çıplak tırnaklar");
    await page.getByLabel("Başlık").fill("E2E krom");
    await page.getByLabel("Kısa ad (adres)").fill(SLUG);
    await page.locator("label", { hasText: "Pembe" }).first().click();
    await page.getByLabel("Sitede yayımla", { exact: true }).check();

    // BR-GLR-003: without the consent box the work cannot be published.
    await page.getByRole("button", { name: "Kaydet" }).click();
    await expect(page.locator("form").getByRole("alert")).toContainText("müşteri izni");

    await page.getByLabel(/Müşteri izni alındı/).check();
    await page.getByRole("button", { name: "Kaydet" }).click();
    await expect(page).toHaveURL(/\/panel\/galeri\?kaydedildi=eser$/);

    await page.goto(`/galeri/${SLUG}`);
    await expect(page.getByRole("heading", { level: 1, name: "E2E krom" })).toBeVisible();
    const slider = page.getByRole("slider", { name: /Öncesi ve sonrası karşılaştırma/ });
    await expect(slider).toHaveAttribute("aria-valuetext", "Sonrası yüzde 50 görünüyor");
    await slider.focus();
    await page.keyboard.press("ArrowLeft");
    await expect(slider).toHaveAttribute("aria-valuetext", "Sonrası yüzde 51 görünüyor");
    const image = page.locator('img[src*="/media/"]').first();
    await expect(image).toBeVisible();
    expect(await image.evaluate((node) => (node as HTMLImageElement).naturalWidth)).toBeGreaterThan(
      0,
    );
  });

  test("BR-GLR-002: a file that is not an image is refused in plain words", async ({ page }) => {
    await page.goto("/panel/galeri/yeni");
    await page.getByLabel("Fotoğraf", { exact: true }).setInputFiles({
      name: "foto.jpg",
      mimeType: "image/jpeg",
      buffer: Buffer.from("bu bir fotoğraf değil"),
    });
    await expect(page.getByText(/Fotoğraf yüklenemedi|JPEG, PNG ya da WebP/)).toBeVisible();
  });
});
