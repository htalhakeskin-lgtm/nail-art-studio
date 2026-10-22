import {
  GALLERY_COLORS,
  GALLERY_LENGTHS,
  GALLERY_STYLES,
  GALLERY_TECHNIQUES,
} from "@/config/gallery";

// Kept apart from schemas.ts so browser components can show labels without loading Zod.

export type GalleryStyle = (typeof GALLERY_STYLES)[number];
export type GalleryColor = (typeof GALLERY_COLORS)[number];
export type GalleryLength = (typeof GALLERY_LENGTHS)[number];
export type GalleryTechnique = (typeof GALLERY_TECHNIQUES)[number];

/** Filter chips and labels, in display order (K-29). English nail terms stay as people say them. */
export const galleryStyleLabels: Record<GalleryStyle, string> = {
  sade: "Sade",
  french: "French",
  simli: "Simli & taşlı",
  ombre: "Ombre",
  desenli: "Desenli",
  cicekli: "Çiçek & kalp",
  rengarenk: "Rengârenk",
};

/** One-line hints on the home page style tiles. */
export const galleryStyleHints: Record<GalleryStyle, string> = {
  sade: "Tek renk, temiz ve her güne uygun",
  french: "Klasik beyaz uçtan renkli yorumlara",
  simli: "Sim, taş ve ışıltı",
  ombre: "Renkten renge yumuşak geçiş",
  desenli: "El boyaması desen ve çizimler",
  cicekli: "Çiçekler, kalpler, küçük süsler",
  rengarenk: "Her tırnak ayrı renk",
};

export const galleryColorLabels: Record<GalleryColor, string> = {
  pembe: "Pembe",
  nude: "Nude",
  beyaz: "Beyaz",
  kirmizi: "Kırmızı",
  mor: "Mor ve lila",
  mavi: "Mavi ve turkuaz",
  yesil: "Yeşil",
  sari: "Sarı",
  turuncu: "Turuncu",
  siyah: "Siyah",
  altin: "Altın",
};

export const galleryLengthLabels: Record<GalleryLength, string> = {
  kisa: "Kısa",
  orta: "Orta",
  uzun: "Uzun",
};

export const galleryTechniqueLabels: Record<GalleryTechnique, string> = {
  "kalici-oje": "Kalıcı oje",
  jel: "Jel",
  protez: "Protez tırnak",
};
