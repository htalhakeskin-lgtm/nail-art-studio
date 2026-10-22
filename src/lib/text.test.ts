import { describe, expect, it } from "vitest";

import { compareTurkish, fitTitle, slugify, toSearchKey, truncateWords } from "./text";

describe("Turkish text helpers", () => {
  it("builds diacritic-free search keys with Turkish casing", () => {
    expect(toSearchKey("IŞIK")).toBe("isik");
    expect(toSearchKey("İstanbul  Üsküdar")).toBe("istanbul uskudar");
  });

  it("creates ASCII kebab-case slugs", () => {
    expect(slugify("Diş Beyazlatma & Bakım")).toBe("dis-beyazlatma-bakim");
    expect(slugify("  Kadıköy 3+1 Satılık Daire ")).toBe("kadikoy-3-1-satilik-daire");
  });

  it("sorts with the Turkish alphabet", () => {
    expect(["Çorum", "Cide", "Ağrı", "Adana"].sort(compareTurkish)).toEqual([
      "Adana",
      "Ağrı",
      "Cide",
      "Çorum",
    ]);
  });
});

describe("truncateWords / fitTitle (09-seo §2)", () => {
  it("cuts at a whole word and marks the cut", () => {
    expect(truncateWords("Kısa metin", 160)).toBe("Kısa metin");
    expect(truncateWords("Kalıcı oje, jel güçlendirme ve protez tırnak", 24)).toBe(
      "Kalıcı oje, jel…",
    );
  });

  it("keeps the brand when it fits, otherwise drops it, then shortens", () => {
    const template = "%s · Nail Art Studios";
    expect(fitTitle("Online randevu", template)).toBe("Online randevu");
    const long = "Manikür ve pedikür bir arada: kalıcı oje ile uzun bakım";
    expect(fitTitle(long, template)).toEqual({ absolute: long });
    const longer = `${long} Kadıköy Moda`;
    const fitted = fitTitle(longer, template);
    expect(typeof fitted === "object" && fitted.absolute.length).toBeLessThanOrEqual(60);
  });
});
