import type { SiteSettings } from "../schemas";

/**
 * `NailSalon` structured data (REQ-010, G-10, 09-seo §5). Built from the same site_settings the
 * page shows, so name, address and phone (NAP) always match the visible text. No `priceRange`
 * or `Offer`: prices are not shown (K-05). No ratings: reviews are fictional (KURALLAR D).
 */
const SCHEMA_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export function localBusinessData(
  settings: SiteSettings,
  options: { url: string; image: string },
): Record<string, unknown> {
  const { company, contact, openingHours, social } = settings;
  const handle = social.instagram.replace(/^@/, "").trim();
  return {
    "@type": "NailSalon",
    "@id": `${options.url}#isletme`,
    name: company.name,
    founder: { "@type": "Person", name: company.owner },
    url: options.url,
    image: options.image,
    telephone: contact.phone,
    email: contact.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: company.address.split(",")[0]?.trim() ?? company.address,
      addressLocality: company.district,
      addressRegion: company.city,
      addressCountry: "TR",
    },
    geo: { "@type": "GeoCoordinates", latitude: company.geo.lat, longitude: company.geo.lng },
    openingHoursSpecification: SCHEMA_DAYS.flatMap((day, index) =>
      openingHours.weekly[String(index + 1) as keyof typeof openingHours.weekly].map(
        ([opens, closes]) => ({
          "@type": "OpeningHoursSpecification",
          dayOfWeek: `https://schema.org/${day}`,
          opens,
          closes,
        }),
      ),
    ),
    ...(handle ? { sameAs: [`https://www.instagram.com/${handle}/`] } : {}),
  };
}
