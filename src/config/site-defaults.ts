/**
 * Defaults for the site_settings row (02-mimari §4). The panel edits the database copy;
 * these values seed it and are the fallback during the very first deploy.
 * Real by the owner's request (plan K-04): operator name, Instagram, phone / WhatsApp.
 * Fictional and marked as such (17-icerik §3): street address, e-mail (example.com).
 */
export const siteDefaults = {
  company: {
    name: "Nail Art Studios",
    owner: "Bahadır Karasu",
    legalName: "Nail Art Studios · Bahadır Karasu (örnek künye)",
    tagline: "Kadıköy'de nail art, kalıcı oje, jel ve protez tırnak",
    address: "Caferağa Mah. Moda Cad. No: 00, Kadıköy / İstanbul",
    district: "Kadıköy",
    city: "İstanbul",
    // General Moda area, deliberately not on top of a real business (17 §3, VR-03).
    geo: { lat: 40.9846, lng: 29.0271 },
  },
  contact: {
    phone: "+905423115888",
    whatsapp: "+905423115888",
    whatsappMessage: "[Demo site] Merhaba, web sitenizden yazıyorum.",
    email: "merhaba@nail-art-studios.example.com",
  },
  openingHours: {
    // ISO weekday 1 = Monday … 7 = Sunday; times in Europe/Istanbul (plan P-12, VR-06)
    weekly: {
      1: [],
      2: [["10:00", "20:00"]],
      3: [["10:00", "20:00"]],
      4: [["10:00", "20:00"]],
      5: [["10:00", "20:00"]],
      6: [["10:00", "20:00"]],
      7: [["11:00", "18:00"]],
    },
    holidays: [] as { date: string; label: string }[],
  },
  pricing: { display: "contact" },
  social: { instagram: "bahadirkarasunails", facebook: "", linkedin: "", youtube: "" },
  theme: { preset: "studyo-galeri" },
  features: { appointments: true, blog: false, newsletter: false },
  seo: {
    titleTemplate: "%s · Nail Art Studios",
    defaultTitle: "Nail Art Studios · Bahadır Karasu · Kadıköy",
    defaultDescription:
      "Kadıköy Moda'da Bahadır Karasu'nun nail art stüdyosu: kalıcı oje, jel ve protez tırnak, el boyaması tasarımlar. İşleri inceleyin, WhatsApp'tan yazın.",
  },
} as const;

export type SiteSettings = typeof siteDefaults;
