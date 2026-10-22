import { expect, test } from "@playwright/test";
import { Pool } from "pg";

import { contentBlockDefaults } from "../../src/content/content-blocks";
import { ADMIN_STATE } from "./session";

/** D-10: the complete home page (plan §6) and its panel modules (SCR-107, SCR-108). */

const E2E_NAME = "E2E Yorumcu";

async function withDb<T>(run: (pool: Pool) => Promise<T>): Promise<T> {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
  try {
    return await run(pool);
  } finally {
    await pool.end();
  }
}

test("REQ-001: the nearest free times open the booking with the time chosen", async ({ page }) => {
  await page.goto("/");
  const section = page.getByRole("region", { name: "En yakın boş saatler" });
  const first = section.getByRole("link", { name: /\d{2}:\d{2}/ }).first();
  await expect(first).toBeVisible();
  const clock = (await first.textContent())?.match(/\d{2}:\d{2}/)?.[0] ?? "";
  await first.click();
  await expect.poll(() => new URL(page.url()).searchParams.get("saat")).toBe(clock);
  await expect(page.getByRole("heading", { level: 2, name: "4. Bilgileriniz" })).toBeVisible();
});

test("sections follow the plan order; sample reviews are labelled and never Review data", async ({
  page,
}) => {
  await page.goto("/");
  const headings = await page.getByRole("heading", { level: 2 }).allTextContents();
  const order = [
    "En yakın boş saatler",
    "Hizmetler",
    "Nasıl ilerliyoruz",
    "Hijyen ve güven",
    "Müşterilerimiz ne diyor",
  ].map((name) => headings.findIndex((heading) => heading.includes(name)));
  expect(order.every((index) => index >= 0)).toBe(true);
  expect(order).toEqual(order.toSorted((a, b) => a - b));

  const reviews = page.getByRole("list", { name: "Yorumlar, yana kaydırılabilir" });
  await expect(reviews.getByRole("listitem")).toHaveCount(6);
  await expect(reviews.getByText("Örnek yorum").first()).toBeVisible();
  // Hidden in the seed: never on the page.
  await expect(page.getByText("Burcu E.")).toHaveCount(0);

  const structured = (
    await page.locator('script[type="application/ld+json"]').allTextContents()
  ).join("\n");
  expect(structured).not.toMatch(/"Review"|AggregateRating/);
});

test.describe("panel: reviews and home blocks", () => {
  test.use({ storageState: ADMIN_STATE });
  test.skip(({ isMobile }) => isMobile, "changes shared data: the desktop project runs it");
  test.describe.configure({ mode: "serial" });

  test.afterAll(async () => {
    await withDb(async (pool) => {
      await pool.query("delete from testimonials where display_name like $1", [`${E2E_NAME}%`]);
      await pool.query("update content_blocks set value = $1 where key = 'hygiene'", [
        JSON.stringify(contentBlockDefaults.hygiene),
      ]);
    });
  });

  test("REQ-014: a review added in the panel is on the home page until it is hidden", async ({
    page,
  }) => {
    const name = `${E2E_NAME} ${String(Date.now()).slice(-4)}`;
    await page.goto("/panel/yorumlar");
    await page.getByRole("link", { name: "Yeni yorum" }).click();
    await page.getByRole("button", { name: "Kaydet" }).click();
    await expect(page.getByText("Adı yazın (örn. Ayşe K.).")).toBeVisible();
    await expect(page.getByLabel("Müşterinin adı")).toBeFocused();

    await page.getByLabel("Müşterinin adı").fill(name);
    await page
      .getByLabel("Yorum", { exact: true })
      .fill("Randevudan önce tasarımı konuştuk, sonuç tam istediğim gibi.");
    await page.getByLabel("Hizmet (isteğe bağlı)").selectOption({ label: "Kalıcı oje" });
    await page.getByRole("button", { name: "Kaydet" }).click();
    await expect(page).toHaveURL(/\/panel\/yorumlar\?kaydedildi=1$/);

    // New reviews go last; the home page shows the first six, so move it to the top.
    const position = async () =>
      (await page.getByRole("main").getByRole("listitem").allTextContents()).findIndex((text) =>
        text.includes(name),
      );
    for (let before = await position(); before > 0; before -= 1) {
      await page.getByRole("button", { name: `Yukarı taşı: ${name}` }).click();
      await expect.poll(position).toBe(before - 1);
    }

    await page.goto("/");
    const reviews = page.getByRole("list", { name: "Yorumlar, yana kaydırılabilir" });
    await expect(reviews.getByText(name)).toBeVisible();
    await expect(reviews.getByText("Hizmet: Kalıcı oje").first()).toBeVisible();

    await page.goto("/panel/yorumlar");
    await page.getByRole("button", { name: `Gizle: ${name}` }).click();
    await expect(page.getByRole("button", { name: `Göster: ${name}` })).toBeVisible();
    await page.goto("/");
    await expect(page.getByText(name)).toHaveCount(0);
  });

  test("REQ-013: the hygiene card text comes from the panel", async ({ page }) => {
    const note = `Hijyen eğitimi belgesi: E2E-${String(Date.now()).slice(-5)}`;
    await page.goto("/panel/icerik");
    await page.getByRole("link", { name: "Hijyen kartı: düzenle" }).click();
    await expect(page).toHaveURL(/\/panel\/icerik\/hijyen$/);
    await page.getByLabel("Belge notu (örn. hijyen eğitimi belgesi no)").fill(note);
    await page.getByRole("button", { name: "Kaydet" }).click();
    await expect(page.getByRole("status")).toContainText("Hijyen kartı kaydedildi");

    await page.goto("/");
    await expect(
      page.getByRole("region", { name: "Hijyen ve güven" }).getByText(note),
    ).toBeVisible();
  });
});
