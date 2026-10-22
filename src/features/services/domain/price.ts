import type { PRICE_DISPLAY_MODES } from "@/config/services";
import { formatDuration, formatMoney } from "@/lib/format";

export type PriceDisplay = (typeof PRICE_DISPLAY_MODES)[number];

type Priced = { priceMinor: number | null; priceDisplayOverride: PriceDisplay | null };

export const CONTACT_FOR_PRICE = "Fiyat bilgisi için iletişime geçin";

/** A service's own setting wins over P-08; with neither, prices stay hidden (K-05). */
export function effectivePriceDisplay(service: Priced, global: PriceDisplay): PriceDisplay {
  return service.priceDisplayOverride ?? global;
}

/**
 * The only way a price reaches a page (BR-HZM-001). Null when it must not be shown: P-08 is
 * "contact", or no positive price is stored. Callers then show CONTACT_FOR_PRICE.
 */
export function visiblePrice(service: Priced, global: PriceDisplay): string | null {
  if (effectivePriceDisplay(service, global) !== "show") return null;
  if (service.priceMinor === null || service.priceMinor <= 0) return null;
  return formatMoney(service.priceMinor, { decimals: "auto" });
}

/**
 * WhatsApp texts for a service (REQ-005). They never carry an amount, whatever P-08 says: a
 * price in a chat message would outlive a later price change (BR-HZM-001).
 */
export function serviceBookingMessage(greeting: string, service: { name: string }): string {
  return `${greeting} Şu hizmet için randevu almak istiyorum: ${service.name}`;
}

export function servicePriceMessage(greeting: string, service: { name: string }): string {
  return `${greeting} Şu hizmetin fiyatını öğrenebilir miyim: ${service.name}`;
}

/** "45 dk – 1 sa 30 dk" for a category card; a single value when all durations are equal. */
export function durationRange(items: readonly { durationMinutes: number }[]): string | null {
  if (items.length === 0) return null;
  const minutes = items.map((item) => item.durationMinutes);
  const shortest = Math.min(...minutes);
  const longest = Math.max(...minutes);
  return shortest === longest
    ? formatDuration(shortest)
    : `${formatDuration(shortest)} – ${formatDuration(longest)}`;
}
