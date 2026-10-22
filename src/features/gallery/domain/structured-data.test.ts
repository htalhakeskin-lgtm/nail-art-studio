import { describe, expect, it } from "vitest";

import { workImageData } from "./structured-data";

const options = {
  pageUrl: "https://ornek.test/galeri/pembe",
  imageUrl: "https://ornek.test/media/x-1600.webp",
  owner: "Bahadır Karasu",
  businessId: "https://ornek.test/#isletme",
};

const work = {
  number: 7,
  title: "Pembe krom",
  imagePath: "/media/x",
  imageAlt: "Kısa tırnaklarda pembe krom",
  isRepresentative: false,
  creditName: null,
  creditUrl: null,
};

describe("workImageData (REQ-020)", () => {
  it("credits a studio work to the owner and the business", () => {
    expect(workImageData(work, options)).toMatchObject({
      "@type": "ImageObject",
      name: "Pembe krom · No. 007",
      caption: "Kısa tırnaklarda pembe krom",
      creator: { name: "Bahadır Karasu" },
      copyrightHolder: { "@id": "https://ornek.test/#isletme" },
    });
  });

  it("never credits a representative stock photo to the studio", () => {
    const data = workImageData(
      {
        ...work,
        isRepresentative: true,
        creditName: "Ayşe Fotoğraf",
        creditUrl: "https://www.pexels.com/photo/1",
      },
      options,
    );
    expect(data).toMatchObject({
      creator: { name: "Ayşe Fotoğraf" },
      creditText: "Ayşe Fotoğraf, Pexels",
      acquireLicensePage: "https://www.pexels.com/photo/1",
    });
    expect(JSON.stringify(data)).not.toContain("Bahadır");
    expect(data).not.toHaveProperty("copyrightHolder");
  });
});
