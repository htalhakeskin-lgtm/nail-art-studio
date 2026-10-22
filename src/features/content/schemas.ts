import { z } from "zod";

/**
 * Shapes of the editable content blocks (content_blocks.value). The panel editor (D-01b) and
 * every read use the same schema; text fields are Markdown rendered by <MarkdownContent>.
 */
const markdown = z.string().trim().min(1).max(2000);

export const aboutBlockSchema = z.object({
  eyebrow: z.string().trim().min(1).max(60),
  intro: markdown,
  sections: z
    .array(z.object({ title: z.string().trim().min(1).max(80), body: markdown }))
    .min(1)
    .max(4),
  closing: markdown,
});

/**
 * Step lists on the home page (V-16 "Nasıl ilerliyoruz", V-15 hygiene card): a heading, a
 * short intro, 2–6 steps and an optional note (the hygiene card's training certificate).
 */
export const stepsBlockSchema = z.object({
  heading: z.string().trim().min(3, "Başlık en az 3 karakter olmalı.").max(80),
  intro: z.string().trim().max(400, "Giriş en fazla 400 karakter olabilir."),
  steps: z
    .array(
      z.object({
        title: z.string().trim().min(2, "Adım başlığını yazın.").max(60),
        body: z.string().trim().min(10, "Adımı bir cümleyle anlatın.").max(300),
      }),
    )
    .min(2, "En az iki adım yazın.")
    .max(6),
  note: z.string().trim().max(200),
});

export const STEPS_BLOCK_KEYS = ["process", "hygiene"] as const;
export type StepsBlockKey = (typeof STEPS_BLOCK_KEYS)[number];

export const contentBlockSchemas = {
  about: aboutBlockSchema,
  process: stepsBlockSchema,
  hygiene: stepsBlockSchema,
} as const;

export type StepsFormValues = z.input<typeof stepsBlockSchema>;

/** Panel form → schema input. Up to six step slots; empty slots are dropped. */
export function stepsFormValues(formData: FormData): StepsFormValues {
  const text = (name: string) => {
    const value = formData.get(name);
    return typeof value === "string" ? value : "";
  };
  const steps = [0, 1, 2, 3, 4, 5]
    .map((index) => ({
      title: text(`steps.${String(index)}.title`),
      body: text(`steps.${String(index)}.body`),
    }))
    .filter((step) => step.title.trim() !== "" || step.body.trim() !== "");
  return { heading: text("heading"), intro: text("intro"), steps, note: text("note") };
}

export type ContentBlockKey = keyof typeof contentBlockSchemas;
export type ContentBlock<K extends ContentBlockKey> = z.infer<(typeof contentBlockSchemas)[K]>;

export type AboutFormValues = z.input<typeof aboutBlockSchema>;

/** Panel form → schema input. Up to four section slots; empty slots are dropped. */
export function aboutFormValues(formData: FormData): AboutFormValues {
  const text = (name: string) => {
    const value = formData.get(name);
    return typeof value === "string" ? value : "";
  };
  const sections = [0, 1, 2, 3]
    .map((index) => ({
      title: text(`sections.${String(index)}.title`),
      body: text(`sections.${String(index)}.body`),
    }))
    .filter((section) => section.title.trim() !== "" || section.body.trim() !== "");
  return { eyebrow: text("eyebrow"), intro: text("intro"), sections, closing: text("closing") };
}
