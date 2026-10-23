import { readFileSync } from "node:fs";
import { mkdir } from "node:fs/promises";

import { type Browser, expect, type Page, test } from "@playwright/test";

import { ADMIN_STATE } from "./session";

/**
 * Portfolio screenshots (19-portfolyo §3). Run with `pnpm screenshots` after `pnpm db:reset`.
 * Desktop 1440×900 @2x, phone 390×844 @3x, tablet 820×1180 @2x. Animations end in their final
 * frame (reduced motion), there is no cookie banner (K-13), the demo banner stays visible.
 */

type Device = "masaustu" | "mobil" | "tablet";
type Shot = {
  dosya: string;
  yol: string;
  cihaz: Device;
  tamSayfa?: boolean;
  panel?: boolean;
  hazirla?: keyof typeof PREPARE;
};

/** Pick the first free day and time, as a visitor would (same steps as booking.spec.ts). */
async function pickFirstFreeSlot(page: Page) {
  await page.getByRole("list", { name: "Günler" }).getByRole("link").first().click();
  await expect(page.getByRole("heading", { level: 2, name: "3. Saat" })).toBeVisible();
}

/** Named steps a shot needs before the picture (plan §21: the flow, not just entry pages). */
const PREPARE = {
  "randevu-saat": pickFirstFreeSlot,
  "randevu-onay": async (page: Page) => {
    await pickFirstFreeSlot(page);
    await page.getByRole("region", { name: "3. Saat" }).getByRole("link").first().click();
    // Fictional visitor; phone from the 000 block (17-icerik §3), new last digits each run so
    // the per-phone daily limit (P-10) never blocks a rerun.
    const last = String(Date.now() % 10_000).padStart(4, "0");
    await page.getByLabel("Adınız").fill("Deniz Yıldız");
    await page
      .getByRole("textbox", { name: "Telefon" })
      .fill(`0532 000 ${last.slice(0, 2)} ${last.slice(2)}`);
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
  },
  "panel-randevu-detay": async (page: Page) => {
    const href = await page
      .locator('main a[href^="/panel/randevular/"]')
      .evaluateAll((links) =>
        links
          .map((link) => link.getAttribute("href") ?? "")
          .find((value) => /\/panel\/randevular\/[0-9a-f-]{36}$/.test(value)),
      );
    if (href) await page.goto(href, { waitUntil: "networkidle" });
  },
} satisfies Record<string, (page: Page) => Promise<void>>;

const DEVICES: Record<
  Device,
  {
    viewport: { width: number; height: number };
    deviceScaleFactor: number;
    isMobile: boolean;
    hasTouch: boolean;
  }
> = {
  masaustu: {
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    isMobile: false,
    hasTouch: false,
  },
  mobil: {
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  },
  tablet: {
    viewport: { width: 820, height: 1180 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  },
};

const OUT_DIR = "portfolyo/screenshot";
const shots = (JSON.parse(readFileSync("portfolyo/ekranlar.json", "utf8")) as { ekranlar: Shot[] })
  .ekranlar;

async function capture(browser: Browser, baseURL: string, shot: Shot) {
  const context = await browser.newContext({
    ...DEVICES[shot.cihaz],
    baseURL,
    locale: "tr-TR",
    timezoneId: "Europe/Istanbul",
    reducedMotion: "reduce",
    colorScheme: "light",
    storageState: shot.panel ? ADMIN_STATE : undefined,
  });
  const page = await context.newPage();
  await page.goto(shot.yol, { waitUntil: "networkidle" });
  if (shot.hazirla) await PREPARE[shot.hazirla](page);
  await page.evaluate(() => document.fonts.ready);
  // Trigger lazy images, then return to the top, or to the step the URL points at (#adim-saat).
  await page.evaluate(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += window.innerHeight) {
      window.scrollTo(0, y);
      await new Promise((resolve) => setTimeout(resolve, 120));
    }
    const target = window.location.hash ? document.querySelector(window.location.hash) : null;
    if (target) target.scrollIntoView({ block: "start" });
    else window.scrollTo(0, 0);
  });
  await page.waitForLoadState("networkidle");
  await page.addStyleTag({
    content: "::-webkit-scrollbar{display:none} *{caret-color:transparent !important}",
  });

  await page.screenshot({ path: `${OUT_DIR}/${shot.dosya}.png` });
  if (shot.tamSayfa)
    await page.screenshot({ path: `${OUT_DIR}/${shot.dosya}-tam.png`, fullPage: true });
  await context.close();
}

test.describe.configure({ mode: "parallel" });

test.beforeAll(async () => {
  await mkdir(OUT_DIR, { recursive: true });
});

for (const shot of shots) {
  test(shot.dosya, async ({ browser, baseURL }) => {
    test.setTimeout(60_000);
    await capture(browser, baseURL ?? "http://localhost:3000", shot);
  });
}
