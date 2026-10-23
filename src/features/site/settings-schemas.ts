import { z } from "zod";

import { toE164TR } from "@/lib/phone";

const phone = (label: string) =>
  z
    .string()
    .trim()
    .transform((value, ctx) => {
      const e164 = toE164TR(value);
      if (!e164) {
        ctx.addIssue({ code: "custom", message: `${label}: 0532 123 45 67 biçiminde yazın.` });
        return z.NEVER;
      }
      return e164;
    });

/**
 * SCR-110 "Ayarlar": business details, contact channels, Instagram and search snippet. Same
 * schema in the panel form and the action. Opening hours and booking rules live on
 * "Müsaitlik", price display on "Hizmetler" (one place per setting).
 */
export const businessSettingsSchema = z.object({
  name: z.string().trim().min(2, "İşletme adını yazın.").max(80, "En fazla 80 karakter."),
  owner: z.string().trim().min(2, "İşletmecinin adını yazın.").max(80, "En fazla 80 karakter."),
  tagline: z.string().trim().max(120, "En fazla 120 karakter."),
  address: z.string().trim().min(5, "Açık adresi yazın.").max(200, "En fazla 200 karakter."),
  district: z.string().trim().min(2, "İlçeyi yazın.").max(60),
  city: z.string().trim().min(2, "İli yazın.").max(60),
  phone: phone("Telefon"),
  whatsapp: phone("WhatsApp"),
  email: z.email("Geçerli bir e-posta adresi yazın."),
  whatsappMessage: z
    .string()
    .trim()
    .min(5, "WhatsApp karşılama mesajını yazın.")
    .max(300, "En fazla 300 karakter."),
  instagram: z
    .string()
    .trim()
    .transform((value) => value.replace(/^@/, ""))
    .pipe(
      z
        .string()
        .regex(/^[A-Za-z0-9._]{0,30}$/, "Instagram kullanıcı adını @ olmadan yazın (örn. studyo)."),
    ),
  defaultTitle: z
    .string()
    .trim()
    .min(10, "Başlık en az 10 karakter olmalı.")
    .max(60, "Başlık en fazla 60 karakter olabilir (arama sonuçlarında kesilir)."),
  defaultDescription: z
    .string()
    .trim()
    .min(50, "Açıklama en az 50 karakter olmalı.")
    .max(160, "Açıklama en fazla 160 karakter olabilir (arama sonuçlarında kesilir)."),
});

export type BusinessSettingsValues = z.input<typeof businessSettingsSchema>;

const FIELDS = [
  "name",
  "owner",
  "tagline",
  "address",
  "district",
  "city",
  "phone",
  "whatsapp",
  "email",
  "whatsappMessage",
  "instagram",
  "defaultTitle",
  "defaultDescription",
] as const satisfies readonly (keyof BusinessSettingsValues)[];

/** FormData → schema input; shared by the client check and the server action. */
export function businessSettingsValues(formData: FormData): BusinessSettingsValues {
  const text = (name: string) => {
    const value = formData.get(name);
    return typeof value === "string" ? value : "";
  };
  return Object.fromEntries(FIELDS.map((key) => [key, text(key)])) as BusinessSettingsValues;
}
