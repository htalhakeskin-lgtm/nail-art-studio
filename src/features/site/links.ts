import { whatsappLink } from "@/lib/phone";

import type { SiteSettings } from "./schemas";

/** Outbound links built from site_settings (Z-09, Z-14, V-28, E-13). */

export function whatsappHref(settings: SiteSettings, message?: string): string {
  return whatsappLink(settings.contact.whatsapp, message ?? settings.contact.whatsappMessage);
}

export function phoneHref(settings: SiteSettings): string {
  return `tel:${settings.contact.phone}`;
}

export function instagramHref(settings: SiteSettings): string | null {
  const handle = settings.social.instagram.replace(/^@/, "").trim();
  return handle ? `https://www.instagram.com/${encodeURIComponent(handle)}/` : null;
}

export function directionsHref(settings: SiteSettings): string {
  const { lat, lng } = settings.company.geo;
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;
}

/** Directions in the three apps people in Türkiye use (REQ-010). */
export function directionLinks(settings: SiteSettings): { label: string; href: string }[] {
  const { lat, lng } = settings.company.geo;
  const name = encodeURIComponent(settings.company.name);
  return [
    { label: "Google Haritalar", href: directionsHref(settings) },
    { label: "Apple Haritalar", href: `https://maps.apple.com/?daddr=${lat},${lng}&q=${name}` },
    {
      label: "Yandex Haritalar",
      href: `https://yandex.com.tr/harita/?rtext=~${lat},${lng}&rtt=auto`,
    },
  ];
}
