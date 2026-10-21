/**
 * Every route the responsive and accessibility checks visit (07-mobil §10).
 * Adding a page = adding it here (quality gate B). Use real seed slugs for detail pages.
 */
export const publicRoutes = [
  "/",
  "/galeri",
  "/galeri?stil=sade&uzunluk=kisa",
  "/galeri/renkli-puantiye",
  "/galeri/takili-siyah-beyaz", // longest seed title
  "/hakkinda",
  "/sss",
  "/kvkk",
  "/gizlilik",
  "/cerez-politikasi",
  "/randevu-kosullari",
  "/panel/giris",
  "/bu-sayfa-yok", // 404 page
] as const;

/** Visited with the demo admin session (tests/e2e/panel.spec.ts signs in first). */
export const panelRoutes = [
  "/panel",
  "/panel/galeri",
  "/panel/icerik",
  "/panel/icerik/sss/yeni",
  "/panel/icerik/hakkinda",
  "/panel/demo-kutusu",
] as const;

/** Widths from 07-mobil §3. */
export const widths = [360, 390, 768, 1024, 1280, 1536] as const;
