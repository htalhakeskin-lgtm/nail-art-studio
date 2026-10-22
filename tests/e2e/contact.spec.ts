import { expect, test } from "@playwright/test";
import { Pool } from "pg";

import { ADMIN_STATE } from "./session";

/** D-02: contact page (SCR-010, UC-07), local business data (REQ-010) and panel requests. */

const E2E_NAME = "E2E Ziyaretçi";

async function withDb<T>(run: (pool: Pool) => Promise<T>): Promise<T> {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
  try {
    return await run(pool);
  } finally {
    await pool.end();
  }
}

test("contact page shows the studio's details, hours and matching NailSalon data", async ({
  page,
}) => {
  await page.goto("/iletisim");
  await expect(page.getByRole("heading", { level: 1, name: "İletişim" })).toBeVisible();
  await expect(page.getByText(/^Şu an (açık|kapalı)|^Bugün kapalı/)).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Google Haritalar (yeni sekmede açılır)" }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Nasıl gelinir" })).toBeVisible();

  const structured = await page.locator('script[type="application/ld+json"]').allTextContents();
  const business = structured
    .map((text) => JSON.parse(text) as { "@type"?: string; telephone?: string; name?: string })
    .find((data) => data["@type"] === "NailSalon");
  expect(business?.telephone).toBe("+905423115888");
  // The same phone is written on the page (NAP consistency, 09-seo §5).
  await expect(page.getByRole("main").getByRole("link", { name: "0542 311 58 88" })).toBeVisible();
});

test("form checks fields before sending and focuses the first problem", async ({ page }) => {
  await page.goto("/iletisim");
  await page.getByRole("button", { name: "Mesajı gönder" }).click();
  await expect(page.getByText("Lütfen adınızı yazın.")).toBeVisible();
  await expect(page.getByLabel("Adınız")).toBeFocused();

  await page.getByLabel("Adınız").fill(E2E_NAME);
  await page.getByRole("radio", { name: "E-posta" }).check();
  await page.getByLabel("Mesajınız").fill("Telefonsuz ve e-postasız bir deneme mesajı.");
  await page.getByRole("button", { name: "Mesajı gönder" }).click();
  await expect(
    page.getByText("Lütfen adınızı ve telefon ya da e-posta bilgilerinizden birini girin."),
  ).toBeVisible();
  await expect(page).toHaveURL(/\/iletisim$/);
});

test.describe("sending a request", () => {
  // afterAll cleans shared rows: run this block in one worker so it never deletes data a test in
  // another worker is still using (fullyParallel).
  test.describe.configure({ mode: "serial" });
  // Writes data and counts against the per-IP limit: one project runs it.
  test.skip(({ isMobile }) => isMobile, "writes shared data: the desktop project runs it");

  test.beforeAll(async () => {
    await withDb((pool) => pool.query("delete from action_rate_limits"));
  });

  test.afterAll(async () => {
    await withDb(async (pool) => {
      await pool.query(
        "delete from demo_outbox where related_id in (select id::text from leads where name like $1)",
        [`${E2E_NAME}%`],
      );
      await pool.query(
        "delete from consent_records where subject_ref in (select id::text from leads where name like $1)",
        [`${E2E_NAME}%`],
      );
      await pool.query("delete from leads where name like $1", [`${E2E_NAME}%`]);
    });
  });

  test("UC-07: thanks the visitor with a request number", async ({ page }) => {
    await page.goto("/iletisim");
    await page.getByLabel("Adınız").fill(E2E_NAME);
    await page.getByRole("textbox", { name: "Telefon" }).fill("0532 000 99 88");
    await page.getByLabel("Mesajınız").fill("Gelin tırnağı için tasarım konuşmak istiyorum.");
    // A person needs a moment; the spam guard rejects forms sent within 1.5 s.
    await expect(page.getByRole("button", { name: "Mesajı gönder" })).toBeEnabled();
    await page.waitForFunction(
      () =>
        Date.now() -
          Number(document.querySelector<HTMLInputElement>('[name="formStartedAt"]')?.value) >
        1600,
    );
    await page.getByRole("button", { name: "Mesajı gönder" }).click();

    await expect(page).toHaveURL(/\/iletisim\/tesekkurler\?kod=TLP-\d{4}-\d{4}$/);
    await expect(
      page.getByRole("heading", { level: 1, name: /Mesajınız bize ulaştı/ }),
    ).toBeVisible();
    await expect(page.getByText(/Talep numaranız: TLP-/)).toBeVisible();
  });

  test.describe("panel", () => {
    test.use({ storageState: ADMIN_STATE });
    const PANEL_NAME = `${E2E_NAME} panel`;

    // Its own request, so it never depends on the form test above (14-test: independent tests).
    test.beforeAll(async () => {
      await withDb((pool) =>
        pool.query(
          `insert into leads (id, code, kind, name, phone, message, preferred_channel, source_path)
           values (gen_random_uuid(), 'TLP-2099-' || lpad((floor(random() * 9000) + 1000)::text, 4, '0'),
                   'contact', $1, '+905320009988', 'Panel testi için örnek mesaj.', 'whatsapp', '/iletisim')`,
          [PANEL_NAME],
        ),
      );
    });

    test("the owner opens the request, replies on WhatsApp and marks it answered", async ({
      page,
    }) => {
      await page.goto("/panel/talepler?durum=new");
      await page
        .getByRole("link", { name: new RegExp(E2E_NAME) })
        .first()
        .click();
      await expect(page.getByRole("heading", { level: 1, name: E2E_NAME })).toBeVisible();

      const reply = page.getByRole("link", { name: "WhatsApp ile yanıtla" });
      await expect(reply).toHaveAttribute("href", /^https:\/\/wa\.me\/905320009988\?text=/);

      await page.getByRole("button", { name: "Yanıtlandı" }).click();
      await expect(page.getByRole("status")).toContainText("Durum güncellendi");
      await expect(page.getByRole("button", { name: "Yanıtlandı" })).toHaveAttribute(
        "aria-pressed",
        "true",
      );
    });
  });
});
