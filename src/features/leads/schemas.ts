import { z } from "zod";

import { LEAD_STATUSES } from "@/config/leads";
import { ruleMessages } from "@/config/rules";
import { toE164TR } from "@/lib/phone";

export const PREFERRED_CHANNELS = ["whatsapp", "telefon", "eposta"] as const;
export type PreferredChannel = (typeof PREFERRED_CHANNELS)[number];

export const preferredChannelLabels: Record<PreferredChannel, string> = {
  whatsapp: "WhatsApp",
  telefon: "Telefon",
  eposta: "E-posta",
};

/** Label for a stored channel value; unknown values are shown as they are. */
export function preferredChannelLabel(value: string): string {
  return (PREFERRED_CHANNELS as readonly string[]).includes(value)
    ? preferredChannelLabels[value as PreferredChannel]
    : value;
}

export type LeadStatus = (typeof LEAD_STATUSES)[number];

/** Panel labels (plan §12 "Talepler": okundu / yanıtlandı / spam). */
export const leadStatusLabels: Record<LeadStatus, string> = {
  new: "Yeni",
  contacted: "Yanıtlandı",
  closed: "Tamamlandı",
  lost: "Sonuçsuz",
  spam: "Spam",
};

export const leadStatuses = LEAD_STATUSES;

const optionalText = z
  .string()
  .trim()
  .transform((value) => value || undefined);

/**
 * UC-07 contact form. Same schema in the browser (before submit) and in the server action.
 * BR-TLP-001: a name and at least one way to reach the visitor; the preferred channel must be
 * one they gave.
 */
export const contactFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Lütfen adınızı yazın.")
      .max(80, "Ad en fazla 80 karakter olabilir."),
    phone: optionalText.pipe(
      z
        .string()
        .transform((value, ctx) => {
          const e164 = toE164TR(value);
          if (!e164) {
            ctx.addIssue({
              code: "custom",
              message: "Telefonu 0532 123 45 67 biçiminde yazın.",
            });
            return z.NEVER;
          }
          return e164;
        })
        .optional(),
    ),
    email: optionalText.pipe(z.email("Geçerli bir e-posta adresi yazın.").optional()),
    message: z
      .string()
      .trim()
      .min(10, "Mesajınız en az 10 karakter olmalı.")
      .max(1500, "Mesajınız en fazla 1500 karakter olabilir."),
    preferredChannel: z.enum(PREFERRED_CHANNELS, "Size nasıl dönelim? Bir seçenek işaretleyin."),
    sourcePath: z.string().max(200).optional(),
  })
  .superRefine((value, ctx) => {
    if (!value.phone && !value.email) {
      ctx.addIssue({ code: "custom", path: ["phone"], message: ruleMessages["BR-TLP-001"] });
      return;
    }
    if (value.preferredChannel === "eposta" && !value.email) {
      ctx.addIssue({
        code: "custom",
        path: ["email"],
        message: "E-postayla dönüş için e-posta adresinizi yazın.",
      });
    }
    if (value.preferredChannel !== "eposta" && !value.phone) {
      ctx.addIssue({
        code: "custom",
        path: ["phone"],
        message: "WhatsApp ya da telefonla dönüş için numaranızı yazın.",
      });
    }
  });

export type ContactFormValues = z.input<typeof contactFormSchema>;

/** FormData → schema input; shared by the browser check and the server action. */
export function contactFormValues(formData: FormData): ContactFormValues {
  const text = (name: string) => {
    const value = formData.get(name);
    return typeof value === "string" ? value : "";
  };
  return {
    name: text("name"),
    phone: text("phone"),
    email: text("email"),
    message: text("message"),
    preferredChannel: text("preferredChannel") as PreferredChannel,
    sourcePath: text("sourcePath") || undefined,
  };
}

export const leadStatusSchema = z.object({ id: z.uuid(), status: z.enum(LEAD_STATUSES) });
export const leadNoteSchema = z.object({
  id: z.uuid(),
  note: z.string().trim().max(2000, "Not en fazla 2000 karakter olabilir."),
});
