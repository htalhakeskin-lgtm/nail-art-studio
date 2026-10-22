import { formatWorkNumber } from "./neighbours";

type WorkImage = {
  number: number;
  title: string;
  imagePath: string;
  imageAlt: string;
  isRepresentative: boolean;
  creditName: string | null;
  creditUrl: string | null;
};

/**
 * `ImageObject` for a work page (G-07, REQ-020). Only what the page shows: a representative
 * stock photo credits its photographer and licence page, never the studio (VR-09, K-39); a
 * studio work is credited to the owner and held by the business.
 */
export function workImageData(
  work: WorkImage,
  options: { pageUrl: string; imageUrl: string; owner: string; businessId: string },
): Record<string, unknown> {
  const stock = work.isRepresentative && work.creditName;
  return {
    "@type": "ImageObject",
    contentUrl: options.imageUrl,
    url: options.pageUrl,
    name: `${work.title} · ${formatWorkNumber(work.number)}`,
    caption: work.imageAlt,
    ...(stock
      ? {
          creditText: `${work.creditName ?? ""}, Pexels`,
          creator: { "@type": "Person", name: work.creditName },
          ...(work.creditUrl ? { acquireLicensePage: work.creditUrl } : {}),
          license: "https://www.pexels.com/license/",
        }
      : {
          creditText: options.owner,
          creator: { "@type": "Person", name: options.owner },
          copyrightHolder: { "@id": options.businessId },
        }),
  };
}
