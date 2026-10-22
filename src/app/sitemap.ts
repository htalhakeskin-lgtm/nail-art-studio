import type { MetadataRoute } from "next";

import { listPublishedGalleryItems } from "@/features/gallery";
import { legalDocuments } from "@/features/legal";
import { listActiveServices } from "@/features/services";
import { absoluteUrl } from "@/lib/seo";

/**
 * Only published, indexable pages (09-seo §3). Filtered gallery views (?stil=…) are left out,
 * they share /galeri's canonical.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const legal = Object.values(legalDocuments).map((document) => document.path);
  const [works, services] = await Promise.all([listPublishedGalleryItems(), listActiveServices()]);
  return [
    ...["/", "/hizmetler", "/galeri", "/hakkinda", "/sss", "/iletisim", ...legal].map((path) => ({
      url: absoluteUrl(path),
    })),
    ...services.map((service) => ({
      url: absoluteUrl(`/hizmetler/${service.slug}`),
      lastModified: service.updatedAt,
    })),
    ...works.map((work) => ({
      url: absoluteUrl(`/galeri/${work.slug}`),
      lastModified: work.updatedAt,
    })),
  ];
}
