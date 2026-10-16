import { Camera, MessageCircle } from "lucide-react";
import type { Metadata } from "next";

import { getSiteSettings, instagramHref, whatsappHref } from "@/features/site";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const { seo } = await getSiteSettings();
  return {
    ...pageMetadata({ title: seo.defaultTitle, description: seo.defaultDescription, path: "/" }),
    title: { absolute: seo.defaultTitle },
  };
}

/** Polish swatches behind the hero headline: the palette is the only decoration (plan §11). */
const swatches = ["bg-primary", "bg-accent", "bg-lila", "bg-nane", "bg-seftali", "bg-gok"];

/**
 * First version of the home page (Z-07). D-01 / D-10 add the curated works, before / after,
 * services, hygiene card and the nearest free slots (plan §6 "Ana sayfa kurgusu").
 */
export default async function HomePage() {
  const settings = await getSiteSettings();
  const instagram = instagramHref(settings);

  return (
    <section className="container-page section-y">
      <div className="grid items-center gap-12 md:grid-cols-[1.4fr_1fr]">
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
            <a
              href={whatsappHref(settings)}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 font-semibold text-primary-foreground transition-opacity duration-(--duration-fast) hover:opacity-90"
            >
              <MessageCircle aria-hidden="true" className="size-5" />
              WhatsApp&apos;tan yazın
            </a>
            {instagram && (
              <a
                href={instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-input px-6 font-semibold transition-colors duration-(--duration-fast) hover:bg-surface-muted"
              >
                <Camera aria-hidden="true" className="size-5" />
                İşleri Instagram&apos;da görün
                <span className="sr-only"> (yeni sekmede açılır)</span>
              </a>
            )}
          </div>
        </div>

        <div aria-hidden="true" className="flex min-w-0 justify-center gap-3 lg:gap-4">
          {swatches.map((color, index) => (
            <span
              key={color}
              className={`${color} block h-36 w-10 rounded-t-full rounded-b-2xl shadow-sm md:h-44 md:w-8 lg:h-56 lg:w-14`}
              style={{ transform: `translateY(${String((index % 3) * 18)}px)` }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
