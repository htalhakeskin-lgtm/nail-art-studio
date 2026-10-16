import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { findOverflow, findSmallInputs, findSmallTargets } from "./checks";
import { publicRoutes, widths } from "./routes";

/**
 * Mobile is a test, not a promise (07-mobil §10, MB-05). For every route and width:
 * no horizontal overflow, touch targets ≥ 44 px, inputs ≥ 16 px; axe at phone and laptop size.
 */

for (const route of publicRoutes) {
  test.describe(route, () => {
    for (const width of widths) {
      test(`no overflow, touch targets and inputs at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(route);
        await page.waitForLoadState("networkidle");

        expect.soft(await findOverflow(page), "horizontal overflow").toBeNull();
        if (width < 1024) {
          expect.soft(await findSmallTargets(page), "touch targets below 44px").toEqual([]);
          expect.soft(await findSmallInputs(page), "inputs below 16px (iOS zoom)").toEqual([]);
        }
      });
    }

    for (const width of [390, 1280]) {
      test(`axe has no serious or critical violations at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(route);
        const results = await new AxeBuilder({ page })
          .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
          .analyze();
        const blocking = results.violations.filter(
          (v) => v.impact === "serious" || v.impact === "critical",
        );
        expect(blocking.map((v) => `${v.id}: ${v.nodes.length} node(s)`)).toEqual([]);
      });
    }
  });
}

test("mobile action bar does not cover the footer", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const bar = page.getByRole("navigation", { name: "Hızlı işlemler" });
  await expect(bar).toBeVisible();
  await page.evaluate(() => {
    window.scrollTo(0, document.documentElement.scrollHeight);
  });
  const footer = page.locator("footer").last();
  const [barBox, footerBox] = await Promise.all([bar.boundingBox(), footer.boundingBox()]);
  if (!barBox || !footerBox) throw new Error("action bar or footer not rendered");
  expect(footerBox.y + footerBox.height).toBeLessThanOrEqual(barBox.y + 1);
});

test("skip link is reachable first and is a full-size target when focused", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "İçeriğe geç" });
  await expect(skip).toBeFocused();
  const box = await skip.boundingBox();
  expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
});
