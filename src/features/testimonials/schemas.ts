import { z } from "zod";

/** Same schema in the panel form (before submit) and in the server action (03-kod). */
export const testimonialFormSchema = z.object({
  id: z.uuid().optional(),
  displayName: z
    .string()
    .trim()
    .min(2, "Adı yazın (örn. Ayşe K.).")
    .max(40, "Ad en fazla 40 karakter olabilir."),
  body: z
    .string()
    .trim()
    .min(20, "Yorum en az 20 karakter olmalı.")
    .max(500, "Yorum en fazla 500 karakter olabilir."),
  serviceId: z.union([z.uuid(), z.literal("")]),
  isSample: z.boolean(),
  isVisible: z.boolean(),
});

export type TestimonialFormValues = z.input<typeof testimonialFormSchema>;

/** FormData → schema input; shared by the client check and the server action. */
export function testimonialFormValues(formData: FormData): TestimonialFormValues {
  const text = (name: string) => {
    const value = formData.get(name);
    return typeof value === "string" ? value : "";
  };
  const id = text("id");
  return {
    ...(id ? { id } : {}),
    displayName: text("displayName"),
    body: text("body"),
    serviceId: text("serviceId"),
    isSample: formData.get("isSample") === "on",
    isVisible: formData.get("isVisible") === "on",
  };
}

export const testimonialIdSchema = z.object({ id: z.uuid() });
export const testimonialMoveSchema = z.object({
  id: z.uuid(),
  direction: z.enum(["up", "down"]),
});
