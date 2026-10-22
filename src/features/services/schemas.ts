import { z } from "zod";

import { MAX_SERVICE_FAQS, PRICE_DISPLAY_MODES, SERVICE_CATEGORIES } from "@/config/services";
import { parseMoney } from "@/lib/money";

export type ServiceCategory = (typeof SERVICE_CATEGORIES)[number];

/** Category order and labels on the public pages and in the panel (plan §6 home §5). */
export const serviceCategoryLabels: Record<ServiceCategory, string> = {
  "kalici-oje": "Kalıcı oje",
  jel: "Jel",
  protez: "Protez tırnak",
  "nail-art": "Nail art",
  "manikur-pedikur": "Manikür ve pedikür",
  bakim: "Bakım",
};

export const serviceCategoryHints: Record<ServiceCategory, string> = {
  "kalici-oje": "Kendi tırnağınıza 2–3 hafta dayanan renk",
  jel: "Kırılan, incelen tırnaklar için güçlendirme",
  protez: "İstediğiniz uzunluk ve formda tırnak",
  "nail-art": "El boyaması desen, krom, taş ve süsleme",
  "manikur-pedikur": "El ve ayak bakımı",
  bakim: "Çıkarma ve dinlenme bakımı",
};

export const serviceCategories = SERVICE_CATEGORIES;

export const priceDisplayLabels: Record<(typeof PRICE_DISPLAY_MODES)[number], string> = {
  contact: "Gizle: “Fiyat bilgisi için iletişime geçin”",
  show: "Göster",
};

const optionalMarkdown = z.string().trim().max(3000, "En fazla 3000 karakter olabilir.");

const optionalInteger = (min: number, max: number, message: string) =>
  z
    .string()
    .trim()
    .transform((value, ctx) => {
      if (value === "") return null;
      if (!/^\d+$/.test(value) || Number(value) < min || Number(value) > max) {
        ctx.addIssue({ code: "custom", message });
        return z.NEVER;
      }
      return Number(value);
    });

/**
 * Panel service form (SCR-105). Same schema in the browser and in the action. Prices are typed
 * in lira ("650" or "1.250,50") and stored in kuruş (lib/money, KURALLAR D).
 */
export const serviceFormSchema = z.object({
  id: z.uuid().optional(),
  name: z
    .string()
    .trim()
    .min(3, "Hizmet adı en az 3 karakter olmalı.")
    .max(120, "Hizmet adı en fazla 120 karakter olabilir."),
  slug: z
    .string()
    .trim()
    .max(120, "Kısa ad en fazla 120 karakter olabilir.")
    .regex(
      /^[a-z0-9]+(-[a-z0-9]+)*$/,
      "Kısa ad yalnızca küçük harf, rakam ve tire içerebilir (ör. kalici-oje).",
    ),
  category: z.enum(SERVICE_CATEGORIES, "Bir kategori seçin."),
  summary: z
    .string()
    .trim()
    .min(10, "Özet en az 10 karakter olmalı.")
    .max(200, "Özet en fazla 200 karakter olabilir."),
  suitableFor: optionalMarkdown,
  body: optionalMarkdown,
  aftercare: optionalMarkdown,
  durabilityText: z.string().trim().max(60, "En fazla 60 karakter olabilir."),
  durationMinutes: optionalInteger(5, 600, "Süreyi 5 ile 600 dakika arasında yazın.").pipe(
    z.number({ error: "Süreyi dakika olarak yazın." }),
  ),
  refillIntervalDays: optionalInteger(1, 365, "Yenileme aralığını 1–365 gün olarak yazın."),
  price: z
    .string()
    .trim()
    .transform((value, ctx) => {
      if (value === "") return null;
      const minor = parseMoney(value);
      if (minor === null) {
        ctx.addIssue({ code: "custom", message: "Tutarı 650 ya da 1.250,50 biçiminde yazın." });
        return z.NEVER;
      }
      return minor;
    }),
  priceDisplayOverride: z.enum(["", ...PRICE_DISPLAY_MODES]),
  faqs: z
    .array(
      z.object({
        question: z.string().trim().max(200, "Soru en fazla 200 karakter olabilir."),
        answer: z.string().trim().max(1000, "Cevap en fazla 1000 karakter olabilir."),
      }),
    )
    .max(MAX_SERVICE_FAQS)
    .superRefine((items, ctx) => {
      items.forEach((item, index) => {
        if (Boolean(item.question) !== Boolean(item.answer)) {
          ctx.addIssue({
            code: "custom",
            path: [index, item.question ? "answer" : "question"],
            message: "Soru ve cevabı birlikte doldurun ya da ikisini de boş bırakın.",
          });
        }
      });
    }),
  isBookable: z.boolean(),
  isActive: z.boolean(),
});

export type ServiceFormValues = z.input<typeof serviceFormSchema>;

/** FormData → schema input; shared by the browser check and the server action. */
export function serviceFormValues(formData: FormData): ServiceFormValues {
  const text = (name: string) => {
    const value = formData.get(name);
    return typeof value === "string" ? value : "";
  };
  const id = text("id");
  return {
    ...(id ? { id } : {}),
    name: text("name"),
    slug: text("slug"),
    category: text("category") as ServiceCategory,
    summary: text("summary"),
    suitableFor: text("suitableFor"),
    body: text("body"),
    aftercare: text("aftercare"),
    durabilityText: text("durabilityText"),
    durationMinutes: text("durationMinutes"),
    refillIntervalDays: text("refillIntervalDays"),
    price: text("price"),
    priceDisplayOverride: text("priceDisplayOverride") as ServiceFormValues["priceDisplayOverride"],
    faqs: Array.from({ length: MAX_SERVICE_FAQS }, (_, index) => ({
      question: text(`faqs.${String(index)}.question`),
      answer: text(`faqs.${String(index)}.answer`),
    })),
    isBookable: formData.get("isBookable") === "on",
    isActive: formData.get("isActive") === "on",
  };
}

export const serviceIdSchema = z.object({ id: z.uuid() });
export const serviceMoveSchema = z.object({ id: z.uuid(), direction: z.enum(["up", "down"]) });
export const priceDisplaySchema = z.object({ display: z.enum(PRICE_DISPLAY_MODES) });
