import { expect, test } from "@playwright/test";

/** D-01a: navigation, about page and image delivery (07-mobil §4, Z-08, Z-18, U-21). */

test.describe("phone menu", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("opens as a dialog, traps focus, locks scroll and closes with Escape", async ({ page }) => {
    await page.goto("/");
    const trigger = page.getByRole("button", { name: "Menüyü aç" });
    await trigger.click();

    const dialog = page.getByRole("dialog", { name: "Menü" });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("navigation", { name: "Mobil menü" })).toBeVisible();
    await expect(page.locator("body")).toHaveCSS("overflow", "hidden");

    // Focus stays inside the drawer however far the visitor tabs.
    for (let step = 0; step < 8; step += 1) await page.keyboard.press("Tab");
    expect(await dialog.evaluate((node) => node.contains(document.activeElement))).toBe(true);

    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test("closes after following a link", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Menüyü aç" }).click();
    await page.getByRole("dialog").getByRole("link", { name: "Hakkında" }).click();
    await expect(page).toHaveURL(/\/hakkinda$/);
    await expect(page.getByRole("dialog")).toBeHidden();
  });
});

test.describe("desktop navigation", () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test("marks the current page", async ({ page }) => {
    await page.goto("/hakkinda");
    const link = page.getByRole("navigation", { name: "Ana menü" }).getByRole("link", {
      name: "Hakkında",
    });
    await expect(link).toHaveAttribute("aria-current", "page");
    await expect(page.getByRole("button", { name: "Menüyü aç" })).toBeHidden();
  });
});

test("about page shows the operator, the approach and a matching breadcrumb", async ({ page }) => {
  await page.goto("/hakkinda");
  await expect(page.getByRole("heading", { level: 1, name: "Bahadır Karasu" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "Nasıl çalışıyoruz" })).toBeVisible();
  await expect(page.getByRole("note").filter({ hasText: "Bu metin örnektir" })).toBeVisible();

  const crumbs = page.getByRole("navigation", { name: "Sayfa yolu" });
  await expect(crumbs.getByRole("link", { name: "Ana sayfa" })).toHaveAttribute("href", "/");
  await expect(crumbs.locator('[aria-current="page"]')).toHaveText("Hakkında");

  const structured = await page.locator('script[type="application/ld+json"]').allTextContents();
  const breadcrumb = structured
    .map((text) => JSON.parse(text) as { "@type"?: string; itemListElement?: { name: string }[] })
    .find((data) => data["@type"] === "BreadcrumbList");
  expect(breadcrumb?.itemListElement?.map((item) => item.name)).toEqual(["Ana sayfa", "Hakkında"]);
});

test("images come from pre-encoded variants, never the optimisation endpoint", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const images = page.locator('main img[src*="/demo/"]');
  await expect(images.first()).toBeVisible();
  for (const image of await images.all()) {
    const src = (await image.getAttribute("src")) ?? "";
    expect(src).toMatch(/^\/demo\/[a-z-]+-(480|960|1600)\.webp$/);
    // Meaningful alt text, unless the image only decorates a link that names itself (style tiles).
    if ((await image.getAttribute("alt")) === "") {
      const linkText = await image.evaluate((node) => node.closest("a")?.textContent.trim() ?? "");
      expect(linkText).not.toBe("");
    } else {
      expect(await image.getAttribute("alt")).toBeTruthy();
    }
  }
  await expect(page.locator('img[src*="/_next/image"]')).toHaveCount(0);
  const loaded = await images.first().evaluate((node) => (node as HTMLImageElement).naturalWidth);
  expect(loaded).toBeGreaterThan(0);
});
