import { MessageCircle } from "lucide-react";
import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { PastelBlobs } from "@/components/common/pastel-blobs";
import { Button } from "@/components/ui/button";
import {
  durationRange,
  listActiveServices,
  ServiceCard,
  serviceCategories,
  serviceCategoryHints,
  serviceCategoryLabels,
} from "@/features/services";
import { getSiteSettings, whatsappHref } from "@/features/site";
import { env } from "@/lib/env";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Hizmetler: kalıcı oje, jel, protez, nail art",
  description:
    "Kadıköy Moda'da kalıcı oje, jel güçlendirme, protez tırnak, el boyaması nail art, manikür ve pedikür. Süreler, dayanım ve bakım önerileri.",
  path: "/hizmetler",
});

/** SCR-002 (REQ-004): active services grouped by category, with jump links on top. */
export default async function ServicesPage() {
  const [items, settings] = await Promise.all([listActiveServices(), getSiteSettings()]);
  const groups = serviceCategories
    .map((category) => ({ category, items: items.filter((item) => item.category === category) }))
    .filter((group) => group.items.length > 0);

  return (
    <>
      <section className="relative isolate overflow-hidden">
        <PastelBlobs className="opacity-70" />
        <div className="container-page pt-8 pb-10 md:pt-12">
          <Breadcrumbs items={[{ label: "Hizmetler", href: "/hizmetler" }]} />
          <h1 className="mt-8 text-4xl font-medium tracking-tight md:text-6xl">Hizmetler</h1>
          <p className="mt-4 max-w-prose text-lg text-muted-foreground">
            Kalıcı ojeden protez tırnağa, el boyaması tasarımdan bakıma. Süreler yaklaşıktır;
            tasarıma göre birlikte netleştiririz.
          </p>
          {env.DEMO_MODE && (
            <p className="mt-3 text-sm text-muted-foreground">
              Hizmet ayrıntıları ve süreler örnektir.
            </p>
          )}
          {groups.length > 1 && (
            <nav aria-label="Kategoriler" className="mt-6">
              <ul className="flex flex-wrap gap-2">
                {groups.map(({ category }) => (
                  <li key={category}>
                    <a
                      href={`#${category}`}
                      className="inline-flex min-h-11 items-center rounded-full border bg-surface px-4 text-sm font-semibold hover:bg-surface-muted"
                    >
                      {serviceCategoryLabels[category]}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>
      </section>

      <div className="container-page space-y-14 pb-(--section-y)">
        {groups.length === 0 && (
          <p className="rounded-[1.5rem] border border-dashed bg-surface p-8 text-center">
            Hizmetler şu an yüklenemedi. Bilgi için WhatsApp&apos;tan yazabilirsiniz.
          </p>
        )}
        {groups.map(({ category, items: group }) => (
          <section
            key={category}
            id={category}
            aria-labelledby={`baslik-${category}`}
            className="scroll-mt-24"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <h2 id={`baslik-${category}`} className="text-3xl font-medium">
                {serviceCategoryLabels[category]}
              </h2>
              <p className="text-sm text-muted-foreground">
                {serviceCategoryHints[category]} · {durationRange(group)}
              </p>
            </div>
            <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {group.map((service) => (
                <li key={service.id}>
                  <ServiceCard service={service} priceDisplay={settings.pricing.display} />
                </li>
              ))}
            </ul>
          </section>
        ))}

        <section
          aria-labelledby="fiyat-bilgisi"
          className="rounded-[2rem] bg-linear-to-br from-accent via-surface-muted to-seftali p-6 md:p-10"
        >
          <h2 id="fiyat-bilgisi" className="text-2xl font-medium md:text-3xl">
            Fiyat ve tasarım için yazın
          </h2>
          <p className="mt-2 max-w-prose text-muted-foreground">
            Fiyat tasarıma, uzunluğa ve uygulanan tekniğe göre değişir. Beğendiğiniz işin
            fotoğrafını gönderin, size net bilgi verelim.
          </p>
          <Button asChild size="lg" className="mt-6">
            <a href={whatsappHref(settings)}>
              <MessageCircle aria-hidden="true" />
              WhatsApp&apos;tan yazın
            </a>
          </Button>
        </section>
      </div>
    </>
  );
}
