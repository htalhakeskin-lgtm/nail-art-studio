/**
 * Gallery taxonomy (plan §9 `gallery_items`, K-29): shared by the table's check constraints, the
 * filters and the seed, so this file has no dependencies. Values are URL slugs (`?stil=sade`);
 * Turkish labels live in src/features/gallery/schemas.ts.
 */
export const GALLERY_STYLES = [
  "sade",
  "french",
  "simli",
  "ombre",
  "desenli",
  "cicekli",
  "rengarenk",
] as const;

export const GALLERY_COLORS = [
  "pembe",
  "nude",
  "beyaz",
  "kirmizi",
  "mor",
  "mavi",
  "yesil",
  "sari",
  "turuncu",
  "siyah",
  "altin",
] as const;

export const GALLERY_LENGTHS = ["kisa", "orta", "uzun"] as const;

export const GALLERY_TECHNIQUES = ["kalici-oje", "jel", "protez"] as const;
