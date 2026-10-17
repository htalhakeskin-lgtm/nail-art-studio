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

export const contentBlockSchemas = {
  about: aboutBlockSchema,
} as const;

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
