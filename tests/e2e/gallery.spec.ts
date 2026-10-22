import { expect, type Page, test } from "@playwright/test";
import { Pool } from "pg";

import { ADMIN_STATE } from "./session";

/** D-08: gallery filters (REQ-006, K-29), work page (PRJ-02) and the panel gallery (SCR-106). */

async function withDb<T>(run: (pool: Pool) => Promise<T>): Promise<T> {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
  try {
    return await run(pool);
  } finally {
    await pool.end();
  }
}

const styleGroup = (page: Page) => page.getByRole("group", { name: "Stil" });
const cards = (page: Page) =>
  page
    .getByRole("list")
    .filter({ has: page.locator("h3") })
    .last();

/** Colour and length sit inline on desktop and in a bottom sheet on phones. */
async function chooseColour(page: Page, isMobile: boolean, colour: string) {
  if (isMobile) {
    await page.getByRole("button", { name: /Renk ve uzunluk/ }).click();
    const sheet = page.getByRole("dialog", { name: "Renk ve uzunluk" });
    await sheet.getByRole("button", { name: colour, exact: true }).click();
    await sheet.getByRole("button", { name: /eseri göster$/ }).click();
    await expect(sheet).toBeHidden();
  } else {
    await page.getByRole("button", { name: colour, exact: true }).click();
  }
}

test.describe("gallery filters", () => {
  test("filters by style through the URL and toggles back to all works", async ({ page }) => {
    await page.goto("/galeri");
    await expect(page.getByRole("heading", { level: 1, name: "Galeri" })).toBeVisible();
    // NFR-07: twelve works up front, the rest one tap at a time; focus moves to the 13th.
    await expect(cards(page).getByRole("listitem")).toHaveCount(12);
    const counter = await page.getByText(/eser gösteriliyor/).innerText();
    const total = Number(/\/ (\d+) eser/.exec(counter)?.[1]);
    expect(total).toBeGreaterThan(20);
    await page.getByRole("button", { name: /Daha fazla iş göster/ }).click();
    await expect(cards(page).getByRole("listitem").nth(12).getByRole("link")).toBeFocused();
    while (await page.getByRole("button", { name: /Daha fazla iş göster/ }).isVisible()) {
      await page.getByRole("button", { name: /Daha fazla iş göster/ }).click();
    }
    await expect(cards(page).getByRole("listitem")).toHaveCount(total);

    const french = styleGroup(page).getByRole("button", { name: "French" });
    await french.click();
    await expect(page).toHaveURL(/\/galeri\?stil=french$/);
    await expect(french).toHaveAttribute("aria-pressed", "true");
    const shown = cards(page).getByRole("listitem");
    await expect(shown).not.toHaveCount(total);
    for (const card of await shown.allTextContents()) expect(card).toContain("French");

    await french.click();
    await expect(page).toHaveURL(/\/galeri$/);
    // A new filter starts from the first page again.
    await expect(page.getByText(`12 / ${String(total)} eser gösteriliyor`)).toBeVisible();
  });

  test("combines style and colour, shows an empty state and clears it", async ({
    page,
    isMobile,
  }) => {
    await page.goto("/galeri?stil=french");
    await chooseColour(page, isMobile, "Siyah");
    await expect(page).toHaveURL(/\?stil=french&renk=siyah$/);
    await expect(page.getByText("Bu seçime uyan eser yok")).toBeVisible();
    await expect(page.getByText("0 eser gösteriliyor")).toBeVisible();

    await page.getByRole("button", { name: "Filtreleri temizle" }).first().click();
    await expect(page).toHaveURL(/\/galeri$/);
    await expect(styleGroup(page).getByRole("button", { name: "Tümü" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  test("opens a shared filtered link with the filter already applied", async ({ page }) => {
    await page.goto("/galeri?stil=sade&uzunluk=kisa");
    await expect(styleGroup(page).getByRole("button", { name: "Sade" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(page.getByRole("link", { name: /Pastel turkuaz/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /Mandalina/ })).toHaveCount(0); // orta
  });
});

test.describe("gallery work page", () => {
  test("PRJ-02: shows the label and asks for the design on WhatsApp with the work number", async ({
    page,
  }) => {
    await page.goto("/galeri/gokkusagi-stiletto");
    await expect(page.getByRole("heading", { level: 1, name: "Gökkuşağı stiletto" })).toBeVisible();
    await expect(page.getByText("No. 003").first()).toBeVisible();
    await expect(page.getByText("Protez tırnak").first()).toBeVisible();

    await expect(page.getByRole("link", { name: "Bu tasarımı istiyorum" })).toHaveAttribute(
      "href",
      "/randevu?tasarim=gokkusagi-stiletto#adim-gun",
    );
    const request = page.getByRole("link", { name: "WhatsApp'tan sorun" });
    const href = (await request.getAttribute("href")) ?? "";
    expect(href).toMatch(/^https:\/\/wa\.me\/905423115888\?text=/);
    const message = new URL(href).searchParams.get("text") ?? "";
    expect(message).toContain("Galerideki şu tasarımı istiyorum: No. 003 · Gökkuşağı stiletto");
    expect(message).toContain("/galeri/gokkusagi-stiletto");

    await expect(page.getByText(/Temsilî görsel/)).toBeVisible();
    const crumbs = page.getByRole("navigation", { name: "Sayfa yolu" });
    await expect(crumbs.getByRole("link", { name: "Galeri" })).toHaveAttribute("href", "/galeri");
  });

  test("walks to the next work and back to the gallery filtered by style", async ({ page }) => {
    await page.goto("/galeri/renkli-puantiye");
    const others = page.getByRole("navigation", { name: "Diğer eserler" });
    await others.getByRole("link", { name: /Sonraki eser/ }).click();
    await expect(page).toHaveURL(/\/galeri\/seker-pembesi-tasli$/);

    await page.getByRole("link", { name: "Benzer stilde diğer işler" }).click();
    await expect(page).toHaveURL(/\/galeri\?stil=simli$/);
  });

  test("a draft or unknown work shows the not-found page and is never indexed", async ({
    page,
  }) => {
    for (const path of ["/galeri/op-art", "/galeri/boyle-bir-eser-yok"]) {
      await page.goto(path);
      await expect(
        page.getByRole("heading", { level: 1, name: "Bu sayfayı bulamadık" }),
      ).toBeVisible();
      await expect(page.locator('meta[name="robots"][content*="noindex"]').first()).toBeAttached();
    }
  });
});

test("home page selection links into the gallery by style", async ({ page }) => {
  await page.goto("/");
  const selection = page.getByRole("region", { name: "Son işlerden seçtiklerimiz" });
  await expect(selection.getByRole("heading", { level: 3 }).first()).toBeVisible();
  await selection.getByRole("link", { name: /^French/ }).click();
  await expect(page).toHaveURL(/\/galeri\?stil=french$/);
  await expect(styleGroup(page).getByRole("button", { name: "French" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
});

test.describe("panel gallery", () => {
  // afterAll cleans shared rows: run this block in one worker so it never deletes data a test in
  // another worker is still using (fullyParallel).
  test.describe.configure({ mode: "serial" });
  test.use({ storageState: ADMIN_STATE });
  // Changes shared data: one project runs it, so parallel runs never collide.
  test.skip(({ isMobile }) => isMobile, "changes shared data: the desktop project runs it");

  test.afterAll(async () => {
    await withDb((pool) =>
      pool.query("update gallery_items set is_published = true where slug = 'mandalina'"),
    );
  });

  test("hides a work from the site and publishes it again", async ({ page }) => {
    await page.goto("/panel/galeri");
    await page.getByRole("button", { name: "Gizle: Mandalina" }).click();
    await expect(page.getByRole("button", { name: "Yayımla: Mandalina" })).toBeVisible();

    // The "Sade" filter keeps Mandalina on the first page of twelve.
    await page.goto("/galeri?stil=sade");
    await expect(page.getByRole("link", { name: /Mandalina/ })).toHaveCount(0);

    await page.goto("/panel/galeri");
    await page.getByRole("button", { name: "Yayımla: Mandalina" }).click();
    await expect(page.getByRole("button", { name: "Gizle: Mandalina" })).toBeVisible();
    await page.goto("/galeri?stil=sade");
    await expect(page.getByRole("link", { name: /Mandalina/ })).toBeVisible();
  });
});
