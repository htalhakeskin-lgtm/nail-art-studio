import { Camera, MessageCircle } from "lucide-react";

import { FramedImage } from "@/components/common/framed-image";
import { PastelBlobs, Sparkle } from "@/components/common/pastel-blobs";
import { Button } from "@/components/ui/button";
import { demoImages } from "@/content/demo-images";
import { instagramHref, type SiteSettings, whatsappHref } from "@/features/site";
import { env } from "@/lib/env";

/** Home §1 (plan §6, K-28): value proposition + primary action + a nail-tip collage of works. */
export function HomeHero({ settings }: { settings: SiteSettings }) {
  const instagram = instagramHref(settings);
  const collageSizes = "(min-width: 1024px) 15rem, (min-width: 640px) 30vw, 45vw";

  return (
    <section className="relative isolate overflow-hidden">
      <PastelBlobs />
      <div className="container-page grid items-center gap-12 section-y lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full bg-surface/80 px-4 py-1.5 text-sm font-semibold text-brand shadow-glow">
            <Sparkle className="size-4" />
            {settings.company.district} · Moda
          </p>
          <h1 className="mt-5 text-4xl font-medium tracking-tight md:text-6xl">
            Tırnaklarınız için{" "}
            <em className="relative text-brand">
              küçük sanat eserleri
              <Sparkle className="absolute -top-3 -right-5 size-5 text-primary" />
            </em>
          </h1>
          <p className="mt-6 max-w-prose text-lg text-muted-foreground">
            Kalıcı oje, jel ve protez tırnak, el boyaması nail art. Sade bir pembeden rengârenk
            desenlere, tasarımı birlikte seçer, her işi bir eser gibi özenle uygularız.
          </p>
          <p className="mt-3 font-semibold">Nail artist: {settings.company.owner}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <a href={whatsappHref(settings)}>
                <MessageCircle aria-hidden="true" />
                WhatsApp&apos;tan yazın
              </a>
            </Button>
            {instagram && (
              <Button asChild size="lg" variant="outline">
                <a href={instagram} target="_blank" rel="noopener noreferrer">
                  <Camera aria-hidden="true" />
                  İşleri Instagram&apos;da görün
                  <span className="sr-only"> (yeni sekmede açılır)</span>
                </a>
              </Button>
            )}
          </div>
        </div>

        <div>
          {/* Offsets and tilts are transforms: they never change layout or cause overflow. */}
          <div className="grid grid-cols-2 gap-3 pb-8 sm:grid-cols-3 sm:gap-4 sm:pb-16">
            <FramedImage
              image={demoImages.heroDots}
              sizes={collageSizes}
              shape="arch"
              lcp
              className="-rotate-2"
            />
            <FramedImage
              image={demoImages.heroBloom}
              sizes={collageSizes}
              shape="arch"
              eager
              className="translate-y-6 rotate-2"
            />
            <FramedImage
              image={demoImages.heroBlossom}
              sizes={collageSizes}
              shape="arch"
              className="hidden translate-y-12 -rotate-1 sm:block"
            />
          </div>
          {env.DEMO_MODE && (
            <p className="text-right text-xs text-muted-foreground">Görseller temsilîdir.</p>
          )}
        </div>
      </div>
    </section>
  );
}
