/**
 * Service menu sets (plan §9 `services`): shared by the table's check constraints, the panel
 * form and the seed, so this file has no dependencies. Values are URL fragments (`#kalici-oje`).
 */
export const SERVICE_CATEGORIES = [
  "kalici-oje",
  "jel",
  "protez",
  "nail-art",
  "manikur-pedikur",
  "bakim",
] as const;

/**
 * P-08 price display (K-05, BR-HZM-001): "contact" hides every amount and says
 * "Fiyat bilgisi için iletişime geçin"; "show" prints the stored price.
 */
export const PRICE_DISPLAY_MODES = ["contact", "show"] as const;

/** Questions per service in the panel form (detail page FAQ). */
export const MAX_SERVICE_FAQS = 3;
