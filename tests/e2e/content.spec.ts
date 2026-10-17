import { expect, test } from "@playwright/test";
import { Pool } from "pg";

import { contentBlockDefaults } from "../../src/content/content-blocks";
import { ADMIN_STATE } from "./session";

/** D-01b: FAQ page (Z-10) and the panel content module (SCR-108, Z-31). */

const E2E_PREFIX = "E2E soru";

async function withDb<T>(run: (pool: Pool) => Promise<T>): Promise<T> {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
  try {
    return await run(pool);
  } finally {
    await pool.end();
  }
}

test.describe("FAQ page", () => {
  test("groups questions, opens answers from the keyboard and matches FAQPage data", async ({
    page,
  }) => {
    await page.goto("/sss");
    await expect(
      page.getByRole("heading", { level: 1, name: "Sık sorulan sorular" }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { level: 2, name: "Randevu ve iptal" })).toBeVisible();

    const summary = page.locator("summary", { hasText: "Kalıcı oje ne kadar dayanır?" });
    await summary.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByText("Genellikle 2–3 hafta.")).toBeVisible();

    // Hidden in the seed: never on the page, never in the structured data.
    await expect(page.getByText("Hediye çeki var mı?")).toHaveCount(0);
    const structured = await page.locator('script[type="application/ld+json"]').allTextContents();
    const faqPage = structured
      .map((text) => JSON.parse(text) as { "@type"?: string; mainEntity?: { name: string }[] })
      .find((data) => data["@type"] === "FAQPage");
    const visible = await page.locator("details summary").allTextContents();
    expect(faqPage?.mainEntity?.map((question) => question.name)).toEqual(visible);
  });
});

test.describe("panel content module", () => {
  test.use({ storageState: ADMIN_STATE });
  // These tests change shared data: one project runs them, so parallel runs never collide.
  test.skip(({ isMobile }) => isMobile, "changes shared data: the desktop project runs it");

  test.afterAll(async () => {
    await withDb(async (pool) => {
      await pool.query("delete from faqs where question like $1", [`${E2E_PREFIX}%`]);
      await pool.query("update content_blocks set value = $1 where key = 'about'", [
        JSON.stringify(contentBlockDefaults.about),
      ]);
    });
  });

  test("checks the form before sending and focuses the first invalid field", async ({ page }) => {
    await page.goto("/panel/icerik/sss/yeni");
    await page.getByRole("button", { name: "Kaydet" }).click();
    await expect(page.getByText("Soru en az 5 karakter olmalı.")).toBeVisible();
    await expect(page.getByLabel("Soru", { exact: true })).toBeFocused();
    await expect(page.getByLabel("Soru", { exact: true })).toHaveAttribute("aria-invalid", "true");
    await expect(page).toHaveURL(/\/panel\/icerik\/sss\/yeni$/);
  });

  test("adds a question that appears on the site, then hides it", async ({ page }) => {
    const question = `${E2E_PREFIX} ${String(Date.now())}: kaç gün önceden randevu almalıyım?`;

    await page.goto("/panel/icerik");
    await page.getByRole("link", { name: "Yeni soru" }).click();
    await expect(page).toHaveURL(/\/panel\/icerik\/sss\/yeni$/);
    await page.getByLabel("Soru", { exact: true }).fill(question);
    await page
      .getByLabel("Cevap")
      .fill("Hafta sonları için birkaç gün önceden yazmanızı öneririz.");
    await page.getByLabel("Kategori").selectOption("randevu");
    await page.getByRole("button", { name: "Kaydet" }).click();

    await expect(page).toHaveURL(/\/panel\/icerik\?kaydedildi=sss$/);
    await expect(page.getByRole("status")).toContainText("Soru kaydedildi");

    await page.goto("/sss");
    await expect(page.locator("summary", { hasText: question })).toBeVisible();

    await page.goto("/panel/icerik");
    await page.getByRole("button", { name: `Gizle: ${question}` }).click();
    await expect(page.getByRole("button", { name: `Göster: ${question}` })).toBeVisible();

    await page.goto("/sss");
    await expect(page.locator("summary", { hasText: question })).toHaveCount(0);
  });

  test("edits the about page copy", async ({ page }) => {
    const closing = `Yeni kapanış metni ${String(Date.now())}.`;
    await page.goto("/panel/icerik/hakkinda");
    await page.getByLabel("Kapanış metni").fill(closing);
    await page.getByRole("button", { name: "Kaydet" }).click();
    await expect(page.getByRole("status")).toContainText("Hakkında metni kaydedildi");

    await page.goto("/hakkinda");
    await expect(page.getByText(closing)).toBeVisible();
  });
});
