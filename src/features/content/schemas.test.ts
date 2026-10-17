import { describe, expect, it } from "vitest";

import { contentBlockDefaults } from "@/content/content-blocks";

import { aboutBlockSchema, contentBlockSchemas } from "./schemas";

describe("content blocks", () => {
  it.each(Object.keys(contentBlockSchemas))("the %s default satisfies its schema", (key) => {
    const schema = contentBlockSchemas[key as keyof typeof contentBlockSchemas];
    const value = contentBlockDefaults[key as keyof typeof contentBlockDefaults];
    expect(schema.safeParse(value).success).toBe(true);
  });

  it("limits the about page to four sections", () => {
    const section = { title: "Başlık", body: "Metin" };
    const tooMany = { ...contentBlockDefaults.about, sections: Array(5).fill(section) };
    expect(aboutBlockSchema.safeParse(tooMany).success).toBe(false);
  });

  it("rejects empty copy after trimming", () => {
    const blank = { ...contentBlockDefaults.about, intro: "   " };
    expect(aboutBlockSchema.safeParse(blank).success).toBe(false);
  });

  it("keeps demo copy free of claims about the real operator", () => {
    const text = JSON.stringify(contentBlockDefaults.about).toLocaleLowerCase("tr-TR");
    // RSK-03: no invented experience, awards or certificates in the person's name.
    for (const claim of ["yıllık deneyim", "ödül", "sertifika", "en iyi", "garanti"]) {
      expect(text).not.toContain(claim);
    }
  });
});
