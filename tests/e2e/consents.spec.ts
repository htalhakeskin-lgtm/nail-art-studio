import { expect, test } from "@playwright/test";

import { ADMIN_STATE } from "./session";

/** D-11: consent records screen (SCR-111, REQ-019); the seed adds one record per demo form. */

test.use({ storageState: ADMIN_STATE });

test("REQ-019: the owner sees each form's notice record and downloads them as CSV", async ({
  page,
}) => {
  await page.goto("/panel/onaylar");
  await expect(page.getByRole("heading", { level: 1, name: "Onay kayıtları" })).toBeVisible();
  await expect(page.getByRole("link", { name: /^Kayıt: (TLP|NAS)-/ }).first()).toBeVisible();
  await expect(page.getByText(/Aydınlatma metni bildirildi · Sürüm:/).first()).toBeVisible();
  const download = page.waitForEvent("download");
  await page.getByRole("link", { name: "CSV indir" }).click();
  expect((await download).suggestedFilename()).toMatch(/^onay-kayitlari-\d{4}-\d{2}-\d{2}\.csv$/);
});
