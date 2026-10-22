import { expect, test } from "@playwright/test";

import { ADMIN_STATE } from "./session";

/** D-12: unsaved changes warning on panel forms (U-26, REQ-022). Nothing is saved here. */

test.use({ storageState: ADMIN_STATE });

test("leaving a changed form asks first; staying keeps the typed text", async ({ page }) => {
  await page.goto("/panel/icerik/sss/yeni");
  // An untouched form never asks.
  await page.getByRole("link", { name: "Vazgeç" }).click();
  await expect(page).toHaveURL(/\/panel\/icerik$/);

  await page.goto("/panel/icerik/sss/yeni");
  await page.getByLabel("Soru", { exact: true }).fill("Yarım kalmış bir soru metni");

  page.once("dialog", (dialog) => {
    expect(dialog.message()).toContain("Kaydedilmemiş değişiklikleriniz var");
    void dialog.dismiss();
  });
  await page.getByRole("link", { name: "Vazgeç" }).click();
  await expect(page).toHaveURL(/\/panel\/icerik\/sss\/yeni$/);
  await expect(page.getByLabel("Soru", { exact: true })).toHaveValue("Yarım kalmış bir soru metni");

  page.once("dialog", (dialog) => void dialog.accept());
  await page.getByRole("link", { name: "Vazgeç" }).click();
  await expect(page).toHaveURL(/\/panel\/icerik$/);
});
