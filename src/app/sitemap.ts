import type { MetadataRoute } from "next";

import { listPublishedGalleryItems } from "@/features/gallery";
import { legalDocuments } from "@/features/legal";
import { absoluteUrl } from "@/lib/seo";

/**
 * Only published, indexable pages (09-seo §3). Each slice adds its pages: services come from
 * a query in D-03; filtered gallery views (?stil=…) are left out, they share /galeri's canonical.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const legal = Object.values(legalDocuments).map((document) => document.path);
  const works = await listPublishedGalleryItems();
  return [
    ...["/", "/galeri", "/hakkinda", "/sss", ...legal].map((path) => ({ url: absoluteUrl(path) })),
    ...works.map((work) => ({
      url: absoluteUrl(`/galeri/${work.slug}`),
      lastModified: work.updatedAt,
    })),
  ];
}
