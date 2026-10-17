import type { z } from "zod";

/**
 * First message per field path ("question", "sections.0.title") from a Zod error, for showing
 * errors under fields before the form is sent (06-arayuz §8). The server repeats the check.
 */
export function issuesToFieldErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.map(String).join(".");
    errors[key] ??= issue.message;
  }
  return errors;
}

/** Moves focus to the first invalid field after a failed submit (06-arayuz §8). */
export function focusFirstInvalid(form: HTMLFormElement, errors: Record<string, string>): void {
  const first = Object.keys(errors)[0];
  if (!first) return;
  const field = form.elements.namedItem(first);
  if (field instanceof HTMLElement) field.focus();
}
