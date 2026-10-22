/**
 * Conversion events (G-18, REQ-021, plan §14 "Ölçüm"). Cookieless Vercel Web Analytics (K-13,
 * K-19); no personal data ever leaves the page: URLs lose their query and secret tokens, event
 * properties carry only the redacted page path.
 */
export const ANALYTICS_EVENTS = [
  "booking_started",
  "booking_completed",
  "design_selected",
  "whatsapp_click",
  "call_click",
  "directions_click",
  "lead_submitted",
] as const;

export type AnalyticsEvent = (typeof ANALYTICS_EVENTS)[number];

const DIRECTION_HOSTS = ["www.google.com", "maps.apple.com", "yandex.com.tr"];

/** "/randevu/yonet/<secret>?yeni=1" → "/randevu/yonet/[token]": the manage link is a password. */
export function redactPath(path: string): string {
  const [pathname = "/"] = path.split(/[?#]/);
  return pathname.replace(/^\/randevu\/yonet\/[^/]+/, "/randevu/yonet/[token]");
}

/** Same rule for full URLs sent with page views. */
export function redactUrl(url: string): string {
  const parsed = new URL(url);
  return `${parsed.origin}${redactPath(parsed.pathname)}`;
}

/** Which conversion a clicked link stands for, if any. `currentPath` is where the click was. */
export function eventForLink(href: string, currentPath: string): AnalyticsEvent | null {
  let url: URL;
  try {
    url = new URL(href, "https://site.invalid");
  } catch {
    return null;
  }
  if (url.protocol === "tel:") return "call_click";
  if (url.hostname === "wa.me" || url.hostname === "api.whatsapp.com") return "whatsapp_click";
  if (
    DIRECTION_HOSTS.includes(url.hostname) &&
    (url.pathname.includes("/maps") ||
      url.hostname === "maps.apple.com" ||
      url.pathname.includes("/harita"))
  ) {
    return "directions_click";
  }
  if (url.hostname === "site.invalid" && url.pathname === "/randevu") {
    if (url.searchParams.has("tasarim")) return "design_selected";
    // Moving between steps of the booking flow is not a new start.
    if (redactPath(currentPath) !== "/randevu") return "booking_started";
  }
  return null;
}
