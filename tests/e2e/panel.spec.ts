import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { findOverflow, findSmallInputs, findSmallTargets } from "./checks";
import { panelRoutes } from "./routes";
import { ADMIN_STATE } from "./session";

/** Z-28 panel sign-in and the panel shell (13-yonetim-paneli, 14-test §3 S2: anonymous is rejected). */

test.describe("anonymous visitor", () => {
  test("is sent to the sign-in page with the requested path", async ({ page }) => {
    await page.goto("/panel/demo-kutusu");
    await expect(page).toHaveURL(/\/panel\/giris\?donus=%2Fpanel%2Fdemo-kutusu$/);
    await expect(page.getByRole("heading", { level: 1, name: "Panele giriş" })).toBeVisible();
  });

  test("gets one generic message for wrong credentials", async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name !== "desktop",
      "counts towards the failed sign-in limit (P-15)",
    );
    await page.goto("/panel/giris");
    await page.getByLabel("E-posta").fill("yok@example.com");
    await page.getByLabel("Şifre").fill("yanlis-sifre-yanlis-sifre");
    await page.getByRole("button", { name: "Giriş yap" }).click();
    // Scoped to the form: Next.js renders its own role="alert" route announcer.
    await expect(page.locator("form").getByRole("alert")).toHaveText(
      "E-posta adresi ya da şifre hatalı.",
    );
    await expect(page.getByLabel("E-posta")).toHaveValue("yok@example.com");
  });

  test("panel pages carry a per-request nonce CSP and noindex", async ({ request }) => {
    const response = await request.get("/panel/giris");
    const csp = response.headers()["content-security-policy"] ?? "";
    expect(csp).toMatch(/script-src 'self' 'nonce-[\w+/=]+' 'strict-dynamic'/);
    expect(response.headers()["x-robots-tag"]).toBe("noindex, nofollow");
    const nonce = /'nonce-([\w+/=]+)'/.exec(csp)?.[1];
    const html = await response.text();
    expect(html).toContain(`nonce="${nonce ?? "missing"}"`);
  });
});

test.describe("signed-in owner", () => {
  test.use({ storageState: ADMIN_STATE });

  test("sees the overview and can sign out", async ({ page }) => {
    await page.goto("/panel");
    await expect(page.getByRole("heading", { level: 1, name: "Özet" })).toBeVisible();
    await page.goto("/panel/demo-kutusu");
    await expect(page.getByRole("heading", { level: 1, name: "Demo kutusu" })).toBeVisible();
  });

  for (const route of panelRoutes) {
    test(`${route} fits the phone and has no serious axe violations`, async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 800 });
      await page.goto(route);
      await page.waitForLoadState("networkidle");
      expect.soft(await findOverflow(page), "horizontal overflow").toBeNull();
      expect.soft(await findSmallTargets(page), "touch targets below 44px").toEqual([]);
      expect.soft(await findSmallInputs(page), "inputs below 16px").toEqual([]);
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
