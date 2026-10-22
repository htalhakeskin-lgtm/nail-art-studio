import { ArrowLeft, ArrowRight, CalendarHeart, MessageCircle } from "lucide-react";
import type { Metadata, Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { Sparkle } from "@/components/common/pastel-blobs";
import { JsonLd } from "@/components/common/safe-html";
import { Button } from "@/components/ui/button";
import {
  designRequestMessage,
  formatWorkNumber,
  galleryColorLabels,
  GalleryGrid,
  galleryLengthLabels,
  galleryQuery,
  galleryStyleLabels,
  galleryTechniqueLabels,
  listPublishedGalleryItems,
  neighbours,
  similarItems,
  Swatch,
  toCardData,
  workImageData,
} from "@/features/gallery";
import { BeforeAfter } from "@/features/gallery/client";
import { getSiteSettings, whatsappHref } from "@/features/site";
import { env } from "@/lib/env";
import { formatDuration } from "@/lib/format";
import { absoluteUrl, jsonLd, pageMetadata } from "@/lib/seo";
import { truncateWords } from "@/lib/text";

/**
 * Every published work is prerendered from generateStaticParams; one published later renders
 * on its first visit. The page reads params outside a Suspense boundary (the whole page depends
 * on the work), so it opts out of the instant-shell check. An unknown or draft slug shows the
 * not-found page with noindex; once streaming has started its status stays 200 (Next.js docs,
 * notFound "after streaming has started").
 */
export const instant = false;

/** Placeholder when the database has no published work at build time (Cache Components). */
const NO_WORK = "eser-yok";

export async function generateStaticParams() {
  const items = await listPublishedGalleryItems();
  return items.length > 0 ? items.map(({ slug }) => ({ slug })) : [{ slug: NO_WORK }];
}

async function findWork(slug: string) {
  const items = await listPublishedGalleryItems();
  const item = items.find((candidate) => candidate.slug === slug);
  return item ? { item, items } : null;
}

export async function generateMetadata({ params }: PageProps<"/galeri/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const [found, settings] = await Promise.all([findWork(slug), getSiteSettings()]);
  if (!found) return { title: "Eser bulunamadı", robots: { index: false } };
  const { item } = found;
  return pageMetadata({
    title: `${item.title} · ${formatWorkNumber(item.number)}`,
    titleTemplate: settings.seo.titleTemplate,
    description: truncateWords(
      item.description ??
        `${galleryStyleLabels[item.style]} nail art, ${galleryTechniqueLabels[item.technique]}.`,
      160,
    ),
    path: `/galeri/${item.slug}`,
    image: absoluteUrl(`${item.imagePath}-960.webp`),
  });
}

/**
 * SCR-005 (REQ-006, REQ-011, PRJ-02, K-29): one work with its museum-style label, "Bu tasarımı
 * istiyorum" (online booking with the work as reference; WhatsApp as the second way), previous /
 * next and similar works.
 */
export default async function GalleryWorkPage({ params }: PageProps<"/galeri/[slug]">) {
  const { slug } = await params;
  const [found, settings] = await Promise.all([findWork(slug), getSiteSettings()]);
  if (!found) notFound();
  const { item, items } = found;
  const around = neighbours(items, item.slug);
  const similar = similarItems(items, item).map(toCardData);
  const request = designRequestMessage(
    settings.contact.whatsappMessage,
    item,
    absoluteUrl(`/galeri/${item.slug}`),
  );

  return (
    <article className="container-page section-y">
      <JsonLd
        json={jsonLd(
          workImageData(item, {
            pageUrl: absoluteUrl(`/galeri/${item.slug}`),
            imageUrl: absoluteUrl(`${item.imagePath}-1600.webp`),
            owner: settings.company.owner,
            businessId: `${absoluteUrl("/")}#isletme`,
          }),
        )}
      />
      <Breadcrumbs
        items={[
          { label: "Galeri", href: "/galeri" },
          { label: item.title, href: `/galeri/${item.slug}` as Route },
        ]}
      />

      <div className="mt-8 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
        <div className="mx-auto w-full max-w-md rounded-[2rem] bg-surface p-2.5 shadow-glow lg:max-w-none">
          <Image
            src={item.imagePath}
            width={item.imageWidth}
            height={item.imageHeight}
            alt={item.imageAlt}
            sizes="(min-width: 1024px) 36rem, (min-width: 480px) 28rem, 100vw"
            loading="eager"
            fetchPriority="high"
            className="h-auto w-full rounded-[1.5rem]"
          />
        </div>

        <div className="lg:pt-6">
          <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
            <span className="inline-flex items-center gap-1.5 text-brand tabular-nums">
              <Sparkle className="size-3.5" />
              {formatWorkNumber(item.number)}
            </span>
            <Link
              href={`/galeri${galleryQuery({ style: item.style })}` as Route}
              className="inline-flex min-h-11 items-center rounded-full bg-accent px-3 hover:bg-surface-muted lg:min-h-8"
            >
              {galleryStyleLabels[item.style]}
            </Link>
          </p>
          <h1 className="mt-3 text-4xl font-medium tracking-tight break-words md:text-5xl">
            {item.title}
          </h1>
          {item.description && (
            <p className="mt-4 max-w-prose text-lg text-muted-foreground">{item.description}</p>
          )}

          <dl className="mt-8 grid grid-cols-2 gap-4 rounded-[1.5rem] bg-surface-muted p-5 sm:grid-cols-3">
            <div>
              <dt className="text-xs font-bold text-muted-foreground">Teknik</dt>
              <dd className="mt-1 font-semibold">{galleryTechniqueLabels[item.technique]}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold text-muted-foreground">Uzunluk</dt>
              <dd className="mt-1 font-semibold">{galleryLengthLabels[item.length]}</dd>
            </div>
            {item.durationMinutes && (
              <div>
                <dt className="text-xs font-bold text-muted-foreground">Yaklaşık süre</dt>
                <dd className="mt-1 font-semibold">{formatDuration(item.durationMinutes)}</dd>
              </div>
            )}
            <div className="col-span-2 sm:col-span-3">
              <dt className="text-xs font-bold text-muted-foreground">Renkler</dt>
              <dd className="mt-2">
                <ul className="flex flex-wrap gap-x-4 gap-y-2">
                  {item.colors.map((color) => (
                    <li key={color} className="inline-flex items-center gap-2 font-semibold">
                      <Swatch color={color} className="size-5" />
                      {galleryColorLabels[color]}
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          </dl>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button asChild size="lg">
              <Link href={`/randevu?tasarim=${item.slug}#adim-gun` as Route}>
                <CalendarHeart aria-hidden="true" />
                Bu tasarımı istiyorum
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href={whatsappHref(settings, request)}>
                <MessageCircle aria-hidden="true" />
                WhatsApp&apos;tan sorun
              </a>
            </Button>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Randevu bu eser referans olarak eklenmiş açılır; tasarımı tırnak yapınıza göre birlikte
            uyarlarız. WhatsApp mesajına da eser numarası eklenir.
          </p>
          <Link
            href={`/galeri${galleryQuery({ style: item.style })}` as Route}
            className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-brand underline-offset-4 hover:underline"
          >
            Benzer stilde diğer işler
          </Link>

          {env.DEMO_MODE && item.isRepresentative && item.creditName && (
            <p className="mt-6 text-xs text-muted-foreground">
              Temsilî görsel, stüdyonun kendi işi değildir. Fotoğraf:{" "}
              {item.creditUrl ? (
                <a
                  href={item.creditUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2"
                >
                  {item.creditName}, Pexels
                  <span className="sr-only"> (yeni sekmede açılır)</span>
                </a>
              ) : (
                item.creditName
              )}
            </p>
          )}
        </div>
      </div>

      {item.beforeImagePath && item.beforeImageAlt && (
        <section aria-labelledby="oncesi-sonrasi" className="mt-14 max-w-md">
          <h2 id="oncesi-sonrasi" className="text-3xl font-medium">
            Öncesi / sonrası
          </h2>
          <div className="mt-5">
            <BeforeAfter
              before={{ src: item.beforeImagePath, alt: item.beforeImageAlt }}
              after={{ src: item.imagePath, alt: item.imageAlt }}
              title={item.title}
              sizes="(min-width: 480px) 28rem, 100vw"
            />
          </div>
        </section>
      )}

      {around && (
        <nav aria-label="Diğer eserler" className="mt-14 grid grid-cols-2 gap-3 border-t pt-6">
          <Link
            href={`/galeri/${around.previous.slug}` as Route}
            className="group flex min-h-11 flex-col rounded-xl p-2 hover:bg-surface-muted"
          >
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground">
              <ArrowLeft aria-hidden="true" className="size-4" />
              Önceki eser
            </span>
            <span className="mt-1 font-display text-lg break-words">{around.previous.title}</span>
          </Link>
          <Link
            href={`/galeri/${around.next.slug}` as Route}
            className="group flex min-h-11 flex-col items-end rounded-xl p-2 text-right hover:bg-surface-muted"
          >
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground">
              Sonraki eser
              <ArrowRight aria-hidden="true" className="size-4" />
            </span>
            <span className="mt-1 font-display text-lg break-words">{around.next.title}</span>
          </Link>
        </nav>
      )}

      {similar.length > 0 && (
        <section aria-labelledby="benzer-isler" className="mt-14">
          <h2 id="benzer-isler" className="text-3xl font-medium">
            Benzer işler
          </h2>
          <GalleryGrid items={similar} className="mt-6" eagerCount={0} />
        </section>
      )}
    </article>
  );
}
