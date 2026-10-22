import { expect, type Page, test } from "@playwright/test";

/** D-11: SEO layer audit (09-seo, REQ-020) and no third party without consent (REQ-021, K-13). */

// Indexable when the demo goes live: every public page except 404, thank-you and sign-in.
const indexable = [
  "/",
  "/randevu",
  "/hizmetler",
  "/hizmetler/kalici-oje",
  "/galeri",
  "/galeri/renkli-puantiye",
  "/hakkinda",
  "/sss",
  "/iletisim",
  "/kvkk",
  "/gizlilik",
  "/cerez-politikasi",
  "/randevu-kosullari",
];

type Structured = { "@type"?: string } & Record<string, unknown>;

async function structuredData(page: Page): Promise<Structured[]> {
  const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
  return scripts.map((text) => JSON.parse(text) as Structured);
}

test.describe("meta on every indexable page (09-seo §2)", () => {
  test.skip(({ isMobile }) => isMobile, "same HTML on both projects: the desktop one checks it");

  for (const path of indexable) {
    test(path, async ({ page }) => {
      await page.goto(path);
      const title = await page.title();
      expect(title.length, title).toBeGreaterThan(10);
      expect(title.length, title).toBeLessThanOrEqual(60);

      const description = await page.locator('meta[name="description"]').getAttribute("content");
      expect(description?.length ?? 0, description ?? "").toBeGreaterThanOrEqual(50);
      expect(description?.length ?? 0, description ?? "").toBeLessThanOrEqual(160);

      const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
      expect(new URL(canonical ?? "").pathname).toBe(path);
      for (const property of ["og:title", "og:description", "og:url", "og:locale"]) {
        await expect(page.locator(`meta[property="${property}"]`)).toHaveCount(1);
      }
      // Demo (DEMO_MODE=true): nothing is indexed (09-seo §7).
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);

      const data = await structuredData(page);
      expect(JSON.stringify(data)).not.toMatch(/"Review"|AggregateRating/);
    });
  }
});

test.describe("structured data by page type (REQ-020)", () => {
  test.skip(({ isMobile }) => isMobile, "same HTML on both projects: the desktop one checks it");

  test("a stock work credits its photographer; the about page names the owner", async ({
    page,
  }) => {
    await page.goto("/galeri/renkli-puantiye");
    const image = (await structuredData(page)).find((item) => item["@type"] === "ImageObject");
    expect(image).toMatchObject({ license: "https://www.pexels.com/license/" });
    expect(JSON.stringify(image)).not.toContain("Bahadır");
    expect(String(image?.contentUrl)).toMatch(/-1600\.webp$/);

    await page.goto("/hakkinda");
    const person = (await structuredData(page)).find((item) => item["@type"] === "Person");
    expect(person).toMatchObject({
      name: "Bahadır Karasu",
      sameAs: ["https://www.instagram.com/bahadirkarasunails/"],
    });

    await page.goto("/hizmetler/kalici-oje");
    expect((await structuredData(page)).map((item) => item["@type"])).toContain("Service");
  });

  test("sitemap lists the public pages only; demo robots.txt blocks everything", async ({
    request,
  }) => {
    const sitemap = await (await request.get("/sitemap.xml")).text();
    for (const path of ["/galeri/renkli-puantiye", "/hizmetler/kalici-oje", "/kvkk"]) {
      expect(sitemap).toContain(`${path}</loc>`);
    }
    expect(sitemap).not.toMatch(/\/panel|\/randevu\/yonet|tesekkurler|\?stil=/);
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toMatch(/Disallow: \/\s*$/m);
  });

  test("every page in the sitemap has a title of at most 60 characters", async ({ request }) => {
    const sitemap = await (await request.get("/sitemap.xml")).text();
    const paths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
      (match) => new URL(match[1] ?? "").pathname,
    );
    expect(paths.length).toBeGreaterThan(20);
    const tooLong: string[] = [];
    for (const path of paths) {
      const html = await (await request.get(path)).text();
      const title = (/<title>([^<]*)<\/title>/.exec(html)?.[1] ?? "").replace(/&amp;/g, "&");
      if (title.length === 0 || title.length > 60) tooLong.push(`${path}: ${title}`);
    }
    expect(tooLong).toEqual([]);
  });
});

test("REQ-021, K-13: no third-party request without consent, maps excepted", async ({ page }) => {
  test.setTimeout(90_000); // five pages, each until the network is idle (map tiles included)
  const foreign = new Set<string>();
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (!["http:", "https:"].includes(url.protocol)) return;
    if (url.origin === new URL(page.url() || "http://localhost").origin) return;
    if (url.hostname === "localhost" || url.hostname === "127.0.0.1") return;
    if (url.hostname === "tiles.openfreemap.org") return; // the map is the one allowed embed
    foreign.add(url.hostname);
  });
  for (const path of [
    "/",
    "/galeri",
    "/galeri/renkli-puantiye",
    "/randevu?hizmet=kalici-oje",
    "/iletisim",
  ]) {
    await page.goto(path);
    await page.mouse.wheel(0, 4000); // let lazy sections (map, images) load
    await page.waitForLoadState("networkidle");
  }
  expect([...foreign]).toEqual([]);
  const cookies = await page.context().cookies();
  expect(cookies.map((cookie) => cookie.name)).toEqual([]);
});
