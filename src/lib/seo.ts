import "server-only";

import type { Metadata } from "next";

import { env } from "@/lib/env";
import { publicEnv } from "@/lib/public-env";

/**
 * One helper for every public page's metadata (09-seo §2). Demo mode is enforced here:
 * while DEMO_MODE=true every page is noindex, nofollow (09-seo §7).
 */
type PageSeo = {
  title: string;
  description: string;
  path: string; // "/hizmetler/dis-beyazlatma"
  image?: string; // absolute or site-relative; defaults to the route's opengraph-image
  noindex?: boolean; // thank-you pages, filtered combinations…
};

export function absoluteUrl(path: string): string {
  return new URL(path, publicEnv.NEXT_PUBLIC_SITE_URL).toString();
}

export function pageMetadata({
  title,
  description,
  path,
  image,
  noindex = false,
}: PageSeo): Metadata {
  const index = !env.DEMO_MODE && !noindex;
  return {
    title,
    description,
    alternates: { canonical: absoluteUrl(path) },
    robots: { index, follow: index },
    openGraph: {
      type: "website",
      locale: "tr_TR",
      url: absoluteUrl(path),
      title,
      description,
      ...(image ? { images: [{ url: image, width: 1200, height: 630 }] } : {}),
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

/** JSON-LD script content with "<" escaped so data can never close the script tag (11-guvenlik §6). */
export function jsonLd(data: Record<string, unknown>): string {
  return JSON.stringify({ "@context": "https://schema.org", ...data }).replace(/</g, "\\u003c");
}
