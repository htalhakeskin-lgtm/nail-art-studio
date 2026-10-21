import type { Metadata } from "next";

import { JsonLd } from "@/components/common/safe-html";
import { AboutTeaser } from "@/components/sections/about-teaser";
import { FaqTeaser } from "@/components/sections/faq-teaser";
import { HomeGallery } from "@/components/sections/home-gallery";
import { HomeHero } from "@/components/sections/home-hero";
import { LocationTeaser } from "@/components/sections/location-teaser";
import { getContentBlock } from "@/features/content";
import { getVisibleFaqGroups } from "@/features/faq";
import { listPublishedGalleryItems } from "@/features/gallery";
import { getSiteSettings, localBusinessData } from "@/features/site";
import { absoluteUrl, jsonLd, pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getSiteSettings();
  return {
    ...pageMetadata({ title: seo.defaultTitle, description: seo.defaultDescription, path: "/" }),
    title: { absolute: seo.defaultTitle },
  };
}

/**
 * Home (Z-07, plan §6 "Ana sayfa kurgusu"). Sections join as their slices ship: nearest free
 * slots (D-05), before / after (D-09), services (D-03), process and hygiene
 * (D-10), reviews (D-10). NailSalon data mirrors the location block (REQ-010).
 */
export default async function HomePage() {
  const [settings, about, faqGroups, works] = await Promise.all([
    getSiteSettings(),
    getContentBlock("about"),
    getVisibleFaqGroups(),
    listPublishedGalleryItems(),
  ]);
  return (
    <>
      <HomeHero settings={settings} />
      <HomeGallery items={works} />
      <AboutTeaser settings={settings} about={about} />
      <FaqTeaser groups={faqGroups} />
      <LocationTeaser settings={settings} />
      <JsonLd
        json={jsonLd(
          localBusinessData(settings, {
            url: absoluteUrl("/"),
            image: absoluteUrl("/demo/hero-puantiye-960.webp"),
          }),
        )}
      />
    </>
  );
}
