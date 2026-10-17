import { describe, expect, it } from "vitest";
import { z } from "zod";

import { issuesToFieldErrors } from "./form";

describe("issuesToFieldErrors", () => {
  it("keys messages by path and keeps the first one per field", () => {
    const schema = z.object({
      title: z.string().min(3, "Kısa").max(5, "Uzun"),
      sections: z.array(z.object({ body: z.string().min(1, "Boş olamaz") })),
    });
    const result = schema.safeParse({ title: "a", sections: [{ body: "ok" }, { body: "" }] });
    expect(result.success).toBe(false);
    if (result.success) return;
    expect(issuesToFieldErrors(result.error)).toEqual({
      title: "Kısa",
      "sections.1.body": "Boş olamaz",
    });
  });
});
