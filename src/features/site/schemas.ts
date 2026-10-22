import { z } from "zod";

import { PRICE_DISPLAY_MODES } from "@/config/services";

/**
 * Shape of the site_settings row (02-mimari §4). The table stores each section as jsonb, so
 * every read goes through these schemas (03-kod: external data is `unknown` until parsed).
 */
const clock = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/);
const e164 = z.string().regex(/^\+\d{10,15}$/);
const weekday = z.enum(["1", "2", "3", "4", "5", "6", "7"]);

export const companySchema = z.object({
  name: z.string().min(1),
  owner: z.string().min(1),
  legalName: z.string().min(1),
  tagline: z.string(),
  address: z.string().min(1),
  district: z.string(),
  city: z.string(),
  geo: z.object({ lat: z.number(), lng: z.number() }),
});

export const contactSchema = z.object({
  phone: e164,
  whatsapp: e164,
  whatsappMessage: z.string(),
  email: z.email(),
});

export const openingHoursSchema = z.object({
  weekly: z.record(weekday, z.array(z.tuple([clock, clock]))),
  holidays: z.array(z.object({ date: z.iso.date(), label: z.string() })),
});

export const socialSchema = z.object({
  instagram: z.string(),
  facebook: z.string(),
  linkedin: z.string(),
  youtube: z.string(),
});

export const siteSettingsSchema = z.object({
  company: companySchema,
  contact: contactSchema,
  openingHours: openingHoursSchema,
  social: socialSchema,
  pricing: z.object({ display: z.enum(PRICE_DISPLAY_MODES) }),
  theme: z.object({ preset: z.string() }),
  features: z.object({ appointments: z.boolean(), blog: z.boolean(), newsletter: z.boolean() }),
  seo: z.object({
    titleTemplate: z.string().includes("%s"),
    defaultTitle: z.string().min(1),
    defaultDescription: z.string().min(1),
  }),
});

export type SiteSettings = z.infer<typeof siteSettingsSchema>;
export type WeeklyHours = SiteSettings["openingHours"]["weekly"];
