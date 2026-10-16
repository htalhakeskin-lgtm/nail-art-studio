import type { MetadataRoute } from "next";

import { legalDocuments } from "@/features/legal";
import { absoluteUrl } from "@/lib/seo";

/**
 * Only published, indexable pages (09-seo §3). Each slice adds its pages: services and gallery
 * items come from queries (D-03, D-08), e.g.
 * (await listPublishedServices()).map((s) => ({ url: absoluteUrl(`/hizmetler/${s.slug}`), lastModified: s.updatedAt }))
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const legal = Object.values(legalDocuments).map((document) => document.path);
  return ["/", ...legal].map((path) => ({ url: absoluteUrl(path) }));
}
