/**
 * Every route the responsive and accessibility checks visit (07-mobil §10).
 * Adding a page = adding it here (quality gate B). Use real seed slugs for detail pages.
 */
export const publicRoutes = [
  "/",
  "/randevu",
  "/randevu?hizmet=kalici-oje",
  "/randevu?tasarim=renkli-puantiye",
  "/hizmetler",
  "/hizmetler/kalici-oje",
  "/hizmetler/manikur-ve-pedikur-bir-arada-kalici-oje-ile-uzun-bakim", // longest name
  "/hizmetler/ozel-tasarim-danismanligi", // not bookable online
  "/galeri",
  "/galeri?stil=sade&uzunluk=kisa",
  "/galeri/renkli-puantiye",
  "/galeri/takili-siyah-beyaz", // longest seed title
  "/hakkinda",
  "/sss",
  "/iletisim",
  "/iletisim/tesekkurler?kod=TLP-2026-0001",
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
  "/panel/randevular",
  "/panel/randevular?gorunum=hafta",
  "/panel/randevular/yeni",
  "/panel/talepler",
  "/panel/hizmetler",
  "/panel/musaitlik",
  "/panel/hizmetler/yeni",
  "/panel/galeri",
  "/panel/icerik",
  "/panel/icerik/sss/yeni",
  "/panel/icerik/hakkinda",
  "/panel/icerik/surec",
  "/panel/icerik/hijyen",
  "/panel/yorumlar",
  "/panel/yorumlar/yeni",
  "/panel/onaylar",
  "/panel/demo-kutusu",
] as const;

/** Widths from 07-mobil §3. */
export const widths = [360, 390, 768, 1024, 1280, 1536] as const;
