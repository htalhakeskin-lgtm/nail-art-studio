/**
 * Renders the default share image (1200 × 630) with the site's own fonts and a hero photo:
 * public/og-varsayilan.jpg, the og:image / twitter:image of every page without its own
 * (src/lib/seo.ts, 09-seo §2). Needs a running build: `pnpm build && pnpm start`, then
 * `node scripts/generate-og-image.mjs [baseUrl]`.
 */
import { chromium } from "@playwright/test";

const base = process.argv[2] ?? "http://localhost:3000";
const home = await (await fetch(base)).text();
const css = [...home.matchAll(/href="(\/_next\/static\/[^"]+\.css)"/g)].map((m) => m[1]);

const html = `<!doctype html><html lang="tr"><head><meta charset="utf-8">
${css.map((href) => `<link rel="stylesheet" href="${base}${href}">`).join("")}
<style>
  body { margin: 0; width: 1200px; height: 630px; overflow: hidden;
    background: radial-gradient(circle at 15% 20%, #f3e3ff 0, transparent 45%),
      radial-gradient(circle at 85% 90%, #ffe1ec 0, transparent 50%), #fff7fb; }
  .wrap { display: flex; height: 100%; align-items: center; gap: 56px; padding: 0 72px; }
  .text { flex: 1; color: #3b1f33; font-family: Manrope, sans-serif; }
  .eyebrow { font-weight: 700; color: #b0336e; font-size: 26px; letter-spacing: 0.02em; }
  h1 { font-family: Fraunces, serif; font-variation-settings: "SOFT" 100; font-weight: 500;
    font-size: 76px; line-height: 1.05; margin: 18px 0 22px; }
  em { color: #b0336e; }
  p { font-size: 28px; margin: 0; color: #6b4a5f; }
  .photo { width: 400px; height: 500px; border-radius: 200px 200px 28px 28px; overflow: hidden;
    border: 12px solid #fff; box-shadow: 0 30px 60px -30px rgba(176, 51, 110, 0.5); rotate: 2deg; }
  .photo img { width: 100%; height: 100%; object-fit: cover; }
</style></head><body><div class="wrap">
  <div class="text">
    <div class="eyebrow">Kadıköy · Moda</div>
    <h1 lang="en">Nail Art Studios</h1>
    <p>Kalıcı oje, jel, protez tırnak ve el boyaması nail art.<br>Online randevu · Fiyat için WhatsApp</p>
  </div>
  <div class="photo"><img src="${base}/demo/hero-puantiye-960.webp" alt=""></div>
</div></body></html>`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
// Same origin as the site first: web fonts are CORS-restricted, about:blank could not load them.
await page.goto(`${base}/robots.txt`);
await page.setContent(html, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: "public/og-varsayilan.jpg", type: "jpeg", quality: 85 });
await browser.close();
console.log("✓ public/og-varsayilan.jpg");
