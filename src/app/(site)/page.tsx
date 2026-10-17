import type { Metadata } from "next";

import { AboutTeaser } from "@/components/sections/about-teaser";
import { FaqTeaser } from "@/components/sections/faq-teaser";
import { HomeHero } from "@/components/sections/home-hero";
import { getContentBlock } from "@/features/content";
import { getVisibleFaqGroups } from "@/features/faq";
import { getSiteSettings } from "@/features/site";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getSiteSettings();
  return {
    ...pageMetadata({ title: seo.defaultTitle, description: seo.defaultDescription, path: "/" }),
    title: { absolute: seo.defaultTitle },
  };
}

/**
 * Home (Z-07, plan §6 "Ana sayfa kurgusu"). Sections join as their slices ship: nearest free
 * slots (D-05), curated works and before / after (D-08), services (D-03), process and hygiene
 * (D-10), reviews (D-10), location next to the FAQ teaser (D-02).
 */
export default async function HomePage() {
  const [settings, about, faqGroups] = await Promise.all([
    getSiteSettings(),
    getContentBlock("about"),
    getVisibleFaqGroups(),
  ]);
  return (
    <>
      <HomeHero settings={settings} />
      <AboutTeaser settings={settings} about={about} />
      <FaqTeaser groups={faqGroups} />
    </>
  );
}
