import { z } from "zod";

import { FAQ_CATEGORIES } from "@/config/faq";

/** Category order and labels on the public page and in the panel. */
export const faqCategoryLabels: Record<(typeof FAQ_CATEGORIES)[number], string> = {
  randevu: "Randevu ve iptal",
  uygulama: "Uygulamalar",
  bakim: "Bakım ve dayanım",
  hijyen: "Hijyen ve sağlık",
};

export const faqCategories = FAQ_CATEGORIES;
export type FaqCategory = (typeof FAQ_CATEGORIES)[number];

/** Same schema in the panel form (before submit) and in the server action (03-kod). */
export const faqFormSchema = z.object({
  id: z.uuid().optional(),
  question: z
    .string()
    .trim()
    .min(5, "Soru en az 5 karakter olmalı.")
    .max(200, "Soru en fazla 200 karakter olabilir."),
  answer: z
    .string()
    .trim()
    .min(10, "Cevap en az 10 karakter olmalı.")
    .max(2000, "Cevap en fazla 2000 karakter olabilir."),
  category: z.enum(FAQ_CATEGORIES, "Bir kategori seçin."),
  isVisible: z.boolean(),
});

export type FaqFormValues = z.input<typeof faqFormSchema>;

/** FormData → schema input; shared by the client check and the server action. */
export function faqFormValues(formData: FormData): FaqFormValues {
  const text = (name: string) => {
    const value = formData.get(name);
    return typeof value === "string" ? value : "";
  };
  const id = text("id");
  return {
    ...(id ? { id } : {}),
    question: text("question"),
    answer: text("answer"),
    category: text("category") as FaqCategory,
    isVisible: formData.get("isVisible") === "on",
  };
}

export const faqIdSchema = z.object({ id: z.uuid() });
export const faqMoveSchema = z.object({ id: z.uuid(), direction: z.enum(["up", "down"]) });
