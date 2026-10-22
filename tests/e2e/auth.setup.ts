import { expect, test as setup } from "@playwright/test";

/**
 * Signs in once with the seeded demo admin and stores the session for the panel specs
 * (playwright.config.ts "setup" project). Credentials come from .env.local / CI env.
 */
import { ADMIN_STATE } from "./session";

setup("sign in as the demo admin", async ({ page }) => {
  const email = process.env.DEMO_ADMIN_EMAIL;
  const password = process.env.DEMO_ADMIN_PASSWORD;
  if (!email || !password) throw new Error("DEMO_ADMIN_EMAIL / DEMO_ADMIN_PASSWORD are not set");

  await page.goto("/panel/giris");
  await page.getByLabel("E-posta").fill(email);
  await page.getByLabel("Şifre").fill(password);
  await page.getByRole("button", { name: "Giriş yap" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Bugün" })).toBeVisible();
  await page.context().storageState({ path: ADMIN_STATE });
});
