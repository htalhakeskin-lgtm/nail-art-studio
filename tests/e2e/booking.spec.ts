import { expect, type Page, test } from "@playwright/test";
import { Pool } from "pg";

/** D-05: online booking (SCR-006 / 007, UC-01, UC-02, REQ-001, REQ-011). */

const E2E_NAME = "E2E Randevu";

async function withDb<T>(run: (pool: Pool) => Promise<T>): Promise<T> {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
  try {
    return await run(pool);
  } finally {
    await pool.end();
  }
}

/** Picks a free day (the first by default) and its first free time, as a visitor would. */
async function pickFirstFreeSlot(page: Page, dayIndex = 0) {
  await page.getByRole("list", { name: "Günler" }).getByRole("link").nth(dayIndex).click();
  await expect(page.getByRole("heading", { level: 2, name: "3. Saat" })).toBeVisible();
  await page.getByRole("region", { name: "3. Saat" }).getByRole("link").first().click();
  await expect(page.getByRole("heading", { level: 2, name: "4. Bilgileriniz" })).toBeVisible();
}

test("a service page opens the booking with that service chosen", async ({ page }) => {
  await page.goto("/hizmetler/kalici-oje");
  await page.getByRole("link", { name: "Bu hizmet için randevu al" }).click();
  await expect(page).toHaveURL(/\/randevu\?hizmet=kalici-oje#adim-gun$/);
  await expect(page.getByRole("region", { name: "1. Hizmet" })).toContainText("Kalıcı oje");
  await expect(page.getByRole("list", { name: "Günler" })).toBeVisible();
});

test("closed or full days cannot be chosen and only free times are offered", async ({ page }) => {
  await page.goto("/randevu?hizmet=kalici-oje");
  const days = page.getByRole("list", { name: "Günler" });
  // A Monday is always closed (P-12): it is shown greyed, not as a link.
  await expect(
    days.getByRole("img", { name: /Pazartesi, dolu ya da kapalı/ }).first(),
  ).toBeVisible();
  await pickFirstFreeSlot(page);
  await expect(page.getByText("Özet")).toBeVisible();
});

test("a time that is no longer free is reported, not offered", async ({ page }) => {
  await page.goto("/randevu?hizmet=kalici-oje");
  await page.getByRole("list", { name: "Günler" }).getByRole("link").first().click();
  await expect(page).toHaveURL(/tarih=/);
  const url = new URL(page.url());
  url.searchParams.set("saat", "03:00"); // outside opening hours
  url.hash = "";
  await page.goto(url.toString());
  await expect(page.getByText("Seçtiğiniz saat artık boş değil.")).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "4. Bilgileriniz" })).toHaveCount(0);
});

test("the form checks fields before sending", async ({ page }) => {
  await page.goto("/randevu?hizmet=kalici-oje");
  await pickFirstFreeSlot(page);
  await page
    .getByRole("button", { name: /Randevu/ })
    .last()
    .click();
  await expect(page.getByText("Lütfen adınızı yazın.")).toBeVisible();
  await expect(page.getByLabel("Adınız")).toBeFocused();
});

test("an unknown manage link shows the not-found page", async ({ page }) => {
  await page.goto(`/randevu/yonet/${"A".repeat(43)}`);
  await expect(page.getByRole("heading", { level: 1, name: "Bu sayfayı bulamadık" })).toBeVisible();
});

test.describe("sending a booking", () => {
  // Writes data and counts against the per-IP limit: one project runs it.
  test.skip(({ isMobile }) => isMobile, "writes shared data: the desktop project runs it");
  // One worker for both tests: a parallel worker's afterAll would delete the other's booking.
  test.describe.configure({ mode: "serial" });

  test.beforeAll(async () => {
    await withDb((pool) => pool.query("delete from action_rate_limits"));
  });

  test.afterAll(async () => {
    await withDb(async (pool) => {
      const ids = "select id::text from appointments where customer_name = $1";
      await pool.query(`delete from demo_outbox where related_id in (${ids})`, [E2E_NAME]);
      await pool.query(`delete from consent_records where subject_ref in (${ids})`, [E2E_NAME]);
      await pool.query("delete from appointments where customer_name = $1", [E2E_NAME]);
    });
  });

  test("UC-01: from a gallery work to a pending request with the work as reference", async ({
    page,
  }) => {
    await page.goto("/galeri/renkli-puantiye");
    await page.getByRole("link", { name: "Bu tasarımı istiyorum" }).click();
    await expect(page).toHaveURL(/\/randevu\?tasarim=renkli-puantiye/);
    await expect(page.getByRole("complementary", { name: "Referans tasarım" })).toContainText(
      "Renkli puantiye",
    );

    await pickFirstFreeSlot(page);
    await page.getByLabel("Adınız").fill(E2E_NAME);
    await page.getByRole("textbox", { name: "Telefon" }).fill("0532 000 66 55");
    await page.getByLabel("Notunuz").fill("Kısa badem form.");
    await page.waitForFunction(
      () =>
        Date.now() -
          Number(document.querySelector<HTMLInputElement>('[name="formStartedAt"]')?.value) >
        1600,
    );
    await page
      .getByRole("button", { name: /Randevu/ })
      .last()
      .click();

    await expect(page).toHaveURL(/\/randevu\/yonet\/[A-Za-z0-9_-]{43}\?yeni=1$/);
    await expect(
      page.getByRole("heading", { level: 1, name: /Talebiniz alındı|Randevunuz alındı/ }),
    ).toBeVisible();
    await expect(page.getByText(/^NAS-[A-Z0-9]{4}$/)).toBeVisible();
    await expect(page.getByText("Onay bekliyor")).toBeVisible();
    // Next.js keeps the previous page hidden in the DOM for instant back navigation.
    await expect(
      page.getByText("Referans tasarım · No. 001").filter({ visible: true }),
    ).toBeVisible();

    const share = page.getByRole("link", { name: "WhatsApp'tan ilet" });
    const text = new URL((await share.getAttribute("href")) ?? "").searchParams.get("text") ?? "";
    expect(text).toMatch(/Kod: NAS-[A-Z0-9]{4}/);
    expect(text).not.toMatch(/₺/);
  });

  test("UC-03: the visitor reschedules, downloads the calendar file and cancels", async ({
    page,
  }) => {
    await page.goto("/randevu?hizmet=kalici-oje");
    // The fourth free day is always more than P-05 (24 h) away, so changes are allowed.
    await pickFirstFreeSlot(page, 3);
    await page.getByLabel("Adınız").fill(E2E_NAME);
    await page.getByRole("textbox", { name: "Telefon" }).fill("0532 000 66 44");
    await page.waitForFunction(
      () =>
        Date.now() -
          Number(document.querySelector<HTMLInputElement>('[name="formStartedAt"]')?.value) >
        1600,
    );
    await page
      .getByRole("button", { name: /Randevu/ })
      .last()
      .click();
    await expect(page).toHaveURL(/\/randevu\/yonet\/[A-Za-z0-9_-]{43}\?yeni=1$/);
    const manageUrl = page.url().replace(/\?.*$/, "");

    const ics = await page.request.get(`${manageUrl}/takvim.ics`);
    expect(ics.headers()["content-type"]).toContain("text/calendar");
    expect(await ics.text()).toContain("SUMMARY:Nail Art Studios: Kalıcı oje");

    await page.getByRole("link", { name: "Ertele" }).click();
    await page.getByRole("list", { name: "Günler" }).getByRole("link").nth(1).click();
    await expect(page).toHaveURL(/islem=ertele&tarih=/);
    await page
      .getByRole("link", { name: /^\d{2}:\d{2}$/ })
      .first()
      .click();
    await page.getByRole("button", { name: "Yeni saati onayla" }).click();
    await expect(page.getByRole("status")).toContainText("Randevunuz yeni saate taşındı");

    await page.getByRole("link", { name: "İptal et" }).click();
    await page.getByLabel("İptal nedeni").fill("Planım değişti");
    await page.getByRole("button", { name: "Randevuyu iptal et" }).click();
    await expect(page.getByRole("status")).toContainText("Randevunuz iptal edildi");
    await expect(
      page.getByText("İptal edildi", { exact: true }).filter({ visible: true }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Ertele" })).toHaveCount(0);
  });
});
