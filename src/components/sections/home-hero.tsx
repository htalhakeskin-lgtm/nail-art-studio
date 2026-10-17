import { Camera, MessageCircle } from "lucide-react";

import { FramedImage } from "@/components/common/framed-image";
import { Button } from "@/components/ui/button";
import { demoImages } from "@/content/demo-images";
import { instagramHref, type SiteSettings, whatsappHref } from "@/features/site";
import { env } from "@/lib/env";

/** Home §1 (plan §6): value proposition + primary action + a small collage of works. */
export function HomeHero({ settings }: { settings: SiteSettings }) {
  const instagram = instagramHref(settings);
  const collageSizes = "(min-width: 1024px) 15rem, (min-width: 640px) 30vw, 45vw";

  return (
    <section className="container-page section-y">
      <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16">
        <div>
          <p className="text-sm font-semibold tracking-[0.2em] text-muted-foreground uppercase">
            {settings.company.district} · Moda
          </p>
          <h1 className="mt-4 text-4xl font-medium tracking-tight md:text-6xl">
            Tırnaklarınız için <em className="text-primary">küçük sanat eserleri</em>
          </h1>
          <p className="mt-6 max-w-prose text-lg text-muted-foreground">
            Kalıcı oje, jel ve protez tırnak, el boyaması nail art. Tasarımı birlikte seçer, her işi
            bir eser gibi özenle uygularız.
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
          {/* Offsets are transforms: they never change layout or cause overflow. */}
          <div className="grid grid-cols-2 gap-3 pb-8 sm:grid-cols-3 sm:gap-4 sm:pb-16">
            <FramedImage image={demoImages.heroStripes} sizes={collageSizes} lcp />
            <FramedImage
              image={demoImages.heroPetal}
              sizes={collageSizes}
              eager
              className="translate-y-6"
            />
            <FramedImage
              image={demoImages.heroBottles}
              sizes={collageSizes}
              className="hidden translate-y-12 sm:block"
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
