import { describe, expect, it } from "vitest";

import { siteDefaults } from "@/config/site-defaults";

import type { SiteSettings } from "../schemas";
import { localBusinessData, personData } from "./local-business";

const settings = siteDefaults as unknown as SiteSettings;
const data = localBusinessData(settings, {
  url: "https://ornek.test/",
  image: "https://ornek.test/og.png",
});

describe("localBusinessData (REQ-010)", () => {
  it("uses the same name, address and phone the site shows", () => {
    expect(data).toMatchObject({
      "@type": "NailSalon",
      name: "Nail Art Studios",
      telephone: "+905423115888",
      address: {
        streetAddress: "Caferağa Mah. Moda Cad. No: 00",
        addressLocality: "Kadıköy",
        addressRegion: "İstanbul",
        addressCountry: "TR",
      },
      sameAs: ["https://www.instagram.com/bahadirkarasunails/"],
    });
  });

  it("lists opening hours only for open days, with Monday closed", () => {
    const specs = data.openingHoursSpecification as { dayOfWeek: string; opens: string }[];
    expect(specs).toHaveLength(6);
    expect(specs.map((spec) => spec.dayOfWeek)).not.toContain("https://schema.org/Monday");
    expect(specs.at(-1)).toMatchObject({ dayOfWeek: "https://schema.org/Sunday", opens: "11:00" });
  });

  it("K-05: never carries prices or ratings", () => {
    const json = JSON.stringify(data);
    for (const key of ["priceRange", "Offer", "aggregateRating", "review"]) {
      expect(json).not.toContain(key);
    }
  });
});

describe("personData (REQ-020)", () => {
  it("names the owner, links the business and Instagram, and has no sample biography", () => {
    const person = personData(settings, {
      url: "https://ornek.test/hakkinda",
      businessId: "https://ornek.test/#isletme",
    });
    expect(person).toEqual({
      "@type": "Person",
      name: "Bahadır Karasu",
      jobTitle: "Nail artist",
      url: "https://ornek.test/hakkinda",
      worksFor: { "@id": "https://ornek.test/#isletme" },
      sameAs: ["https://www.instagram.com/bahadirkarasunails/"],
    });
  });
});
