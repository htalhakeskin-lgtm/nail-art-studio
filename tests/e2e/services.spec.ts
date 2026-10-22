import { expect, test } from "@playwright/test";
import { Pool } from "pg";

import { ADMIN_STATE } from "./session";

/** D-03: service menu (SCR-002 / 003, REQ-004), price display (K-05) and panel (SCR-105). */

async function withDb<T>(run: (pool: Pool) => Promise<T>): Promise<T> {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
  try {
    return await run(pool);
  } finally {
    await pool.end();
  }
}

test("menu groups services by category and links to each one", async ({ page }) => {
  await page.goto("/hizmetler");
  await expect(page.getByRole("heading", { level: 1, name: "Hizmetler" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Protez tırnak" })).toBeVisible();
  await page
    .getByRole("navigation", { name: "Kategoriler" })
    .getByRole("link", { name: "Jel" })
    .click();
  await expect(page).toHaveURL(/\/hizmetler#jel$/);

  await page.getByRole("link", { name: /Jel güçlendirme/ }).click();
  await expect(page).toHaveURL(/\/hizmetler\/jel-guclendirme$/);
  await expect(page.getByRole("heading", { level: 1, name: "Jel güçlendirme" })).toBeVisible();
});

test("BR-HZM-001: no amount on the page, in the data or in WhatsApp texts", async ({ page }) => {
  await page.goto("/hizmetler/kalici-oje");
  await expect(page.getByText("Fiyat bilgisi için iletişime geçin").first()).toBeVisible();
  await expect(page.locator("main")).not.toContainText("₺");

  const booking = page.getByRole("link", { name: "Bu hizmet için randevu al" });
  const message = new URL((await booking.getAttribute("href")) ?? "").searchParams.get("text");
  expect(message).toContain("Şu hizmet için randevu almak istiyorum: Kalıcı oje");
  expect(message).not.toMatch(/₺|\d+,\d{2}/);

  const structured = await page.locator('script[type="application/ld+json"]').allTextContents();
  const service = structured
    .map((text) => JSON.parse(text) as Record<string, unknown>)
    .find((data) => data["@type"] === "Service");
  expect(service?.name).toBe("Kalıcı oje");
  expect(JSON.stringify(service)).not.toMatch(/offers|price/i);
});

test("a service that cannot be booked online sends people to WhatsApp", async ({ page }) => {
  await page.goto("/hizmetler/ozel-tasarim-danismanligi");
  await expect(page.getByRole("link", { name: "WhatsApp'tan danışın" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Bu hizmet için randevu al" })).toHaveCount(0);
});

test.describe("panel services", () => {
  test.use({ storageState: ADMIN_STATE });
  // Changes shared data: one project runs it, so parallel runs never collide.
  test.skip(({ isMobile }) => isMobile, "changes shared data: the desktop project runs it");

  test.afterAll(async () => {
    await withDb(async (pool) => {
      await pool.query(`update site_settings set pricing = '{"display":"contact"}'`);
      await pool.query("delete from services where slug like 'e2e-%'");
    });
  });

  test("turning prices on shows them on the site, turning them off hides them", async ({
    page,
  }) => {
    await page.goto("/panel/hizmetler");
    await page.getByRole("button", { name: "Fiyatları göster" }).click();
    await expect(page.getByRole("status")).toContainText("Fiyat gösterimi güncellendi");

    await page.goto("/hizmetler/kalici-oje");
    await expect(page.locator("main")).toContainText("650 ₺");

    await page.goto("/panel/hizmetler");
    await page.getByRole("button", { name: "Fiyatları gizle" }).click();
    await expect(page.getByRole("status")).toContainText("Fiyat gösterimi güncellendi");
    await page.goto("/hizmetler/kalici-oje");
    await expect(page.locator("main")).not.toContainText("₺");
  });

  test("adds a service with a generated slug; a duplicate slug is refused", async ({ page }) => {
    const name = `E2E ${String(Date.now())} bakım`;
    await page.goto("/panel/hizmetler/yeni");
    await page.getByLabel("Hizmet adı").fill(name);
    await expect(page.getByLabel("Kısa ad (adres)")).toHaveValue(/^e2e-\d+-bakim$/);
    await page.getByLabel("Özet").fill("Uçtan uca test için örnek hizmet özeti.");
    await page.getByRole("button", { name: "Kaydet" }).click();
    await expect(page).toHaveURL(/\/panel\/hizmetler\?kaydedildi=hizmet$/);
    await expect(page.getByText(name)).toBeVisible();

    await page.goto("/panel/hizmetler/yeni");
    await page.getByLabel("Hizmet adı").fill("Başka ad");
    await page.getByLabel("Kısa ad (adres)").fill("kalici-oje");
    await page.getByLabel("Özet").fill("Aynı kısa adı deneyen ikinci hizmet.");
    await page.getByRole("button", { name: "Kaydet" }).click();
    await expect(page.getByText("Bu kısa ad kullanılıyor.")).toBeVisible();
    await expect(page.getByLabel("Özet")).toHaveValue("Aynı kısa adı deneyen ikinci hizmet.");
  });
});
