import { expect, test } from "@playwright/test";
import { Pool } from "pg";

import { ADMIN_STATE } from "./session";

/** D-07: panel "Bugün", agenda, appointment detail and manual booking (SCR-101…103, UC-04, UC-05). */

const E2E_NAME = "E2E Elle Randevu";

async function withDb<T>(run: (pool: Pool) => Promise<T>): Promise<T> {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
  try {
    return await run(pool);
  } finally {
    await pool.end();
  }
}

test.describe("panel appointments", () => {
  test.use({ storageState: ADMIN_STATE });

  test("the today screen shows its numbers and links to every module", async ({ page }) => {
    await page.goto("/panel");
    await expect(page.getByRole("heading", { level: 1, name: "Bugün" })).toBeVisible();
    await expect(page.getByText("Onay bekleyen", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Günün ajandası" })).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "Bölümler" }).getByRole("link", { name: /Müsaitlik/ }),
    ).toBeVisible();
  });

  test("the agenda switches to a week and filters by status", async ({ page }) => {
    await page.goto("/panel/randevular");
    await page
      .getByRole("navigation", { name: "Görünüm" })
      .getByRole("link", { name: "Hafta" })
      .click();
    await expect(page).toHaveURL(/gorunum=hafta/);
    await page
      .getByRole("navigation", { name: "Durum" })
      .getByRole("link", { name: "Onay bekliyor" })
      .click();
    await expect(page).toHaveURL(/durum=pending/);
    const cards = page.getByRole("main").getByRole("listitem").filter({ hasText: "NAS-" });
    for (const text of await cards.allTextContents()) expect(text).toContain("Onay bekliyor");
  });

  test.describe("writes", () => {
    test.skip(({ isMobile }) => isMobile, "changes shared data: the desktop project runs it");

    test.afterAll(async () => {
      await withDb(async (pool) => {
        const ids = "select id::text from appointments where customer_name = $1";
        await pool.query(`delete from audit_logs where entity_id in (${ids})`, [E2E_NAME]);
        await pool.query("delete from appointments where customer_name = $1", [E2E_NAME]);
      });
    });

    test("UC-05: a phone booking is saved confirmed, offers WhatsApp templates and can be cancelled", async ({
      page,
    }) => {
      await page.goto("/panel/randevular/yeni");
      await page
        .getByRole("link", { name: /Kalıcı oje/ })
        .first()
        .click();
      await page.getByRole("list", { name: "Günler" }).getByRole("link").nth(2).click();
      await page
        .getByRole("link", { name: /^\d{2}:\d{2}$/ })
        .first()
        .click();
      await page.getByLabel("Müşteri adı").fill(E2E_NAME);
      await page.getByRole("textbox", { name: "Telefon" }).fill("0532 000 55 11");
      await page.getByRole("button", { name: "Randevuyu kaydet" }).click();

      await expect(page).toHaveURL(/\/panel\/randevular\/[0-9a-f-]{36}\?kaydedildi=olusturuldu$/);
      await expect(page.getByRole("status")).toContainText("Randevu kaydedildi ve onaylandı");
      await expect(
        page.getByText("Onaylandı", { exact: true }).filter({ visible: true }),
      ).toBeVisible();

      const confirm = page.getByRole("link", { name: "Onay mesajı" });
      const href = (await confirm.getAttribute("href")) ?? "";
      expect(href).toMatch(/^https:\/\/wa\.me\/905320005511\?text=/);
      expect(new URL(href).searchParams.get("text")).toContain("Merhaba E2E,");

      await page.getByLabel("İptal nedeni (isteğe bağlı)").fill("Müşteri aradı");
      await page.getByRole("button", { name: "Randevuyu iptal et" }).click();
      await expect(page.getByRole("status")).toContainText("Randevu iptal edildi");
      await expect(page.getByText("Müşteri aradı").filter({ visible: true })).toBeVisible();
    });
  });
});
