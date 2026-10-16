import type { MetadataRoute } from "next";

import { getSiteSettings } from "@/features/site";

/** Z-19: web app manifest. Colours mirror the --background and --primary tokens. */
export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const { company, seo } = await getSiteSettings();
  return {
    name: company.name,
    short_name: "Nail Art",
    description: seo.defaultDescription,
    lang: "tr",
    start_url: "/",
    display: "standalone",
    background_color: "#fdf9f4",
    theme_color: "#8d2e4b",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
