import { expect, test } from "@playwright/test";
import { Pool } from "pg";

import { ADMIN_STATE } from "./session";

/** D-04: panel availability screen (SCR-104): closures and rules. */

const NOTE = "E2E kapalı zaman";

async function withDb<T>(run: (pool: Pool) => Promise<T>): Promise<T> {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
  try {
    return await run(pool);
  } finally {
    await pool.end();
  }
}

test.describe("panel availability", () => {
  // afterAll cleans shared rows: run this block in one worker so it never deletes data a test in
  // another worker is still using (fullyParallel).
  test.describe.configure({ mode: "serial" });
  test.use({ storageState: ADMIN_STATE });
  // Changes shared data: one project runs it, so parallel runs never collide.
  test.skip(({ isMobile }) => isMobile, "changes shared data: the desktop project runs it");

  test.afterAll(async () => {
    await withDb((pool) => pool.query("delete from time_off where note = $1", [NOTE]));
  });

  test("shows the live preview, adds a closure and removes it", async ({ page }) => {
    await page.goto("/panel/musaitlik");
    await expect(page.getByRole("heading", { level: 1, name: "Müsaitlik" })).toBeVisible();
    await expect(
      page.getByRole("heading", { name: /Sitede görünen en yakın boş saatler/ }),
    ).toBeVisible();

    await page.getByLabel("Not").fill(NOTE);
    await page.getByRole("button", { name: "Kapalı zaman ekle" }).click();
    await expect(page.getByRole("status")).toContainText("Kapalı zaman eklendi");
    const row = page.getByRole("listitem").filter({ hasText: NOTE });
    await expect(row).toBeVisible();

    await row.getByRole("button", { name: /^Sil:/ }).click();
    await expect(page.getByRole("status")).toContainText("Kapalı zaman silindi");
    await expect(page.getByRole("listitem").filter({ hasText: NOTE })).toHaveCount(0);
  });

  test("checks hours before saving: closing must be after opening", async ({ page }) => {
    await page.goto("/panel/musaitlik");
    await page.getByLabel("Salı kapanış").fill("09:00");
    await page.getByRole("button", { name: "Saatleri kaydet" }).click();
    await expect(page.getByText("Salı: Kapanış açılıştan sonra olmalı.")).toBeVisible();
    await expect(page).toHaveURL(/\/panel\/musaitlik$/);
  });
});
