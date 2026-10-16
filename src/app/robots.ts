import type { MetadataRoute } from "next";

import { env } from "@/lib/env";
import { absoluteUrl } from "@/lib/seo";

/** Demo: nothing is indexed. Live: panel, account, API and search results are excluded (09-seo §3). */
export default function robots(): MetadataRoute.Robots {
  if (env.DEMO_MODE) return { rules: [{ userAgent: "*", disallow: "/" }] };
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/panel", "/hesabim", "/api/", "/arama"] }],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}
