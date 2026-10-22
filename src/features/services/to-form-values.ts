import type { Service } from "./queries";
import type { ServiceFormValues } from "./schemas";

/** Stored service → the strings the panel form starts with (price back in lira, "1250,50"). */
export function toServiceFormValues(service: Service): ServiceFormValues & { id: string } {
  const lira = service.priceMinor === null ? "" : String(Math.trunc(service.priceMinor / 100));
  const kurus = service.priceMinor === null ? 0 : service.priceMinor % 100;
  return {
    id: service.id,
    name: service.name,
    slug: service.slug,
    category: service.category,
    summary: service.summary,
    suitableFor: service.suitableFor ?? "",
    body: service.body ?? "",
    aftercare: service.aftercare ?? "",
    durabilityText: service.durabilityText ?? "",
    durationMinutes: String(service.durationMinutes),
    refillIntervalDays:
      service.refillIntervalDays === null ? "" : String(service.refillIntervalDays),
    price: kurus === 0 ? lira : `${lira},${String(kurus).padStart(2, "0")}`,
    priceDisplayOverride: service.priceDisplayOverride ?? "",
    faqs: service.faqs,
    isBookable: service.isBookable,
    isActive: service.isActive,
  };
}
