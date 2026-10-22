import type { Metadata } from "next";
import { Suspense } from "react";

import { JsonLd } from "@/components/common/safe-html";
import { SectionBoundary } from "@/components/common/section-boundary";
import { AboutTeaser } from "@/components/sections/about-teaser";
import { FaqTeaser } from "@/components/sections/faq-teaser";
import { HomeBeforeAfter } from "@/components/sections/home-before-after";
import { HomeGallery } from "@/components/sections/home-gallery";
import { HomeHero } from "@/components/sections/home-hero";
import { HomeServices } from "@/components/sections/home-services";
import { HomeHygiene, HomeProcess } from "@/components/sections/home-steps";
import { HomeTestimonials } from "@/components/sections/home-testimonials";
import { LocationTeaser } from "@/components/sections/location-teaser";
import { NearestSlots, NearestSlotsSkeleton } from "@/components/sections/nearest-slots";
import { getContentBlock } from "@/features/content";
import { getVisibleFaqGroups } from "@/features/faq";
import { listPublishedGalleryItems } from "@/features/gallery";
import { listActiveServices } from "@/features/services";
import { getSiteSettings, localBusinessData } from "@/features/site";
import { getVisibleTestimonials } from "@/features/testimonials";
import { absoluteUrl, jsonLd, pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getSiteSettings();
  return {
    ...pageMetadata({ title: seo.defaultTitle, description: seo.defaultDescription, path: "/" }),
    title: { absolute: seo.defaultTitle },
  };
}

/**
 * Home (Z-07, plan §6 "Ana sayfa kurgusu", in its order). Everything but the nearest free
 * slots is cached; those stream in per request (Suspense). NailSalon data mirrors the location
 * block (REQ-010); reviews never become Review / AggregateRating data (VR-09).
 */
export default async function HomePage() {
  const [settings, about, process, hygiene, faqGroups, works, services, testimonials] =
    await Promise.all([
      getSiteSettings(),
      getContentBlock("about"),
      getContentBlock("process"),
      getContentBlock("hygiene"),
      getVisibleFaqGroups(),
      listPublishedGalleryItems(),
      listActiveServices(),
      getVisibleTestimonials(),
    ]);
  const slotService = services.find((service) => service.isBookable);
  return (
    <>
      <HomeHero settings={settings} />
      <SectionBoundary title="En yakın boş saatler">
        <Suspense fallback={<NearestSlotsSkeleton service={slotService} />}>
          <NearestSlots service={slotService} settings={settings} />
        </Suspense>
      </SectionBoundary>
      <HomeGallery items={works} />
      <HomeBeforeAfter items={works} />
      <HomeServices items={services} settings={settings} />
      <HomeProcess block={process} />
      <HomeHygiene block={hygiene} />
      <AboutTeaser settings={settings} about={about} />
      <HomeTestimonials items={testimonials} />
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
