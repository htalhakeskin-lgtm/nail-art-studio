import {
  CalendarHeart,
  ChevronDown,
  Clock,
  MessageCircle,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import type { Metadata, Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { MarkdownContent } from "@/components/common/markdown";
import { JsonLd } from "@/components/common/safe-html";
import { Button } from "@/components/ui/button";
import {
  CONTACT_FOR_PRICE,
  listActiveServices,
  serviceBookingMessage,
  ServiceCard,
  serviceCategoryLabels,
  servicePriceMessage,
  visiblePrice,
} from "@/features/services";
import { getSiteSettings, whatsappHref } from "@/features/site";
import { env } from "@/lib/env";
import { formatDuration } from "@/lib/format";
import { markdownToPlainText } from "@/lib/markdown";
import { absoluteUrl, jsonLd, pageMetadata } from "@/lib/seo";

/**
 * Every active service is prerendered; one added later renders on its first visit. Params are
 * read outside Suspense because the whole page depends on the service (see /galeri/[slug]).
 */
export const instant = false;

const NO_SERVICE = "hizmet-yok";

export async function generateStaticParams() {
  const items = await listActiveServices();
  return items.length > 0 ? items.map(({ slug }) => ({ slug })) : [{ slug: NO_SERVICE }];
}

async function findService(slug: string) {
  const items = await listActiveServices();
  const service = items.find((item) => item.slug === slug);
  return service ? { service, items } : null;
}

export async function generateMetadata({
  params,
}: PageProps<"/hizmetler/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const found = await findService(slug);
  if (!found) return { title: "Hizmet bulunamadı", robots: { index: false } };
  const { service } = found;
  return pageMetadata({
    title: `${service.name} Kadıköy`,
    description: service.summary.slice(0, 160),
    path: `/hizmetler/${service.slug}`,
    ...(service.coverImagePath ? { image: absoluteUrl(`${service.coverImagePath}-960.webp`) } : {}),
  });
}

/**
 * SCR-003 (REQ-004): what the service is, who it suits, how it goes, how long it lasts,
 * aftercare and questions. Booking happens on WhatsApp until online booking ships (D-05);
 * a service that cannot be booked online says so. No amount anywhere while P-08 is "contact".
 */
export default async function ServicePage({ params }: PageProps<"/hizmetler/[slug]">) {
  const { slug } = await params;
  const [found, settings] = await Promise.all([findService(slug), getSiteSettings()]);
  if (!found) notFound();
  const { service, items } = found;
  const price = visiblePrice(service, settings.pricing.display);
  const greeting = settings.contact.whatsappMessage;
  const related = items
    .filter((item) => item.category === service.category && item.id !== service.id)
    .slice(0, 3);

  return (
    <article className="container-page section-y">
      <JsonLd
        json={jsonLd({
          "@type": "Service",
          name: service.name,
          description: markdownToPlainText(service.summary),
          serviceType: serviceCategoryLabels[service.category],
          areaServed: "Kadıköy, İstanbul",
          provider: { "@id": `${absoluteUrl("/")}#isletme` },
          url: absoluteUrl(`/hizmetler/${service.slug}`),
        })}
      />
      <Breadcrumbs
        items={[
          { label: "Hizmetler", href: "/hizmetler" },
          { label: service.name, href: `/hizmetler/${service.slug}` as Route },
        ]}
      />

      <div className="mt-8 grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
        <div>
          <p className="text-sm font-semibold text-brand">
            {serviceCategoryLabels[service.category]}
          </p>
          <h1 className="mt-2 text-4xl font-medium tracking-tight break-words md:text-5xl">
            {service.name}
          </h1>
          <p className="mt-4 max-w-prose text-lg text-muted-foreground">{service.summary}</p>

          <dl className="mt-6 grid grid-cols-2 gap-4 rounded-[1.5rem] bg-surface-muted p-5 sm:grid-cols-3">
            <div>
              <dt className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground">
                <Clock aria-hidden="true" className="size-3.5" />
                Süre
              </dt>
              <dd className="mt-1 font-semibold">
                Yaklaşık {formatDuration(service.durationMinutes)}
              </dd>
            </div>
            {service.durabilityText && (
              <div>
                <dt className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground">
                  <Sparkles aria-hidden="true" className="size-3.5" />
                  Dayanım
                </dt>
                <dd className="mt-1 font-semibold">{service.durabilityText}</dd>
              </div>
            )}
            {service.refillIntervalDays && (
              <div>
                <dt className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground">
                  <RefreshCw aria-hidden="true" className="size-3.5" />
                  Yenileme
                </dt>
                <dd className="mt-1 font-semibold">{service.refillIntervalDays} günde bir</dd>
              </div>
            )}
            <div className="col-span-2 sm:col-span-3">
              <dt className="text-xs font-bold text-muted-foreground">Fiyat</dt>
              <dd className="mt-1 font-semibold">{price ?? CONTACT_FOR_PRICE}</dd>
            </div>
          </dl>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <a href={whatsappHref(settings, serviceBookingMessage(greeting, service))}>
                {service.isBookable ? (
                  <CalendarHeart aria-hidden="true" />
                ) : (
                  <MessageCircle aria-hidden="true" />
                )}
                {service.isBookable ? "Bu hizmet için randevu al" : "WhatsApp'tan danışın"}
              </a>
            </Button>
            {!price && (
              <Button asChild size="lg" variant="outline">
                <a href={whatsappHref(settings, servicePriceMessage(greeting, service))}>
                  <MessageCircle aria-hidden="true" />
                  Fiyat için WhatsApp
                </a>
              </Button>
            )}
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            {service.isBookable
              ? "Randevu talebiniz WhatsApp'ta hizmet adıyla açılır; uygun günü birlikte seçeriz."
              : "Bu hizmet online randevuyla değil, WhatsApp üzerinden planlanır."}
          </p>

          <div className="mt-10 space-y-10 text-lg">
            {service.suitableFor && (
              <section aria-labelledby="kime-uygun">
                <h2 id="kime-uygun" className="text-2xl font-medium md:text-3xl">
                  Kime uygun
                </h2>
                <MarkdownContent>{service.suitableFor}</MarkdownContent>
              </section>
            )}
            {service.body && (
              <section aria-labelledby="nasil-uygulaniyor">
                <h2 id="nasil-uygulaniyor" className="text-2xl font-medium md:text-3xl">
                  Nasıl uygulanıyor
                </h2>
                <MarkdownContent>{service.body}</MarkdownContent>
              </section>
            )}
            {service.aftercare && (
              <section aria-labelledby="bakim">
                <h2 id="bakim" className="text-2xl font-medium md:text-3xl">
                  Bakım önerileri
                </h2>
                <MarkdownContent>{service.aftercare}</MarkdownContent>
              </section>
            )}
            {service.faqs.length > 0 && (
              <section aria-labelledby="hizmet-sss">
                <h2 id="hizmet-sss" className="text-2xl font-medium md:text-3xl">
                  Sık sorulanlar
                </h2>
                <div className="mt-4 divide-y border-y">
                  {service.faqs.map((faq) => (
                    <details key={faq.question} className="group">
                      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 py-3 text-lg font-semibold [&::-webkit-details-marker]:hidden">
                        <span>{faq.question}</span>
                        <ChevronDown
                          aria-hidden="true"
                          className="size-5 shrink-0 text-brand transition-transform duration-(--duration-base) group-open:rotate-180"
                        />
                      </summary>
                      <div className="max-w-prose pb-5 text-base text-muted-foreground">
                        <MarkdownContent>{faq.answer}</MarkdownContent>
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>

        {service.coverImagePath && (
          <div className="order-first lg:order-none">
            <div className="mx-auto max-w-sm rounded-t-[999px] rounded-b-[2rem] bg-surface p-2.5 shadow-glow lg:sticky lg:top-24">
              <Image
                src={service.coverImagePath}
                width={1064}
                height={1330}
                alt=""
                sizes="(min-width: 1024px) 24rem, 80vw"
                loading="eager"
                fetchPriority="high"
                className="h-auto w-full rounded-t-[999px] rounded-b-[1.5rem]"
              />
              {env.DEMO_MODE && (
                <p className="px-2 pt-2 pb-1 text-center text-xs text-muted-foreground">
                  Görsel temsilîdir.
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {related.length > 0 && (
        <section aria-labelledby="ayni-kategori" className="mt-16">
          <h2 id="ayni-kategori" className="text-3xl font-medium">
            {serviceCategoryLabels[service.category]}: diğer hizmetler
          </h2>
          <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <li key={item.id}>
                <ServiceCard service={item} priceDisplay={settings.pricing.display} />
              </li>
            ))}
          </ul>
          <Button asChild variant="outline" size="lg" className="mt-6">
            <Link href="/hizmetler">Tüm hizmetler</Link>
          </Button>
        </section>
      )}
    </article>
  );
}
