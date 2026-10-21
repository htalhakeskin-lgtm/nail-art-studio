import { ArrowRight } from "lucide-react";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";

import { Sparkle } from "@/components/common/pastel-blobs";
import { Button } from "@/components/ui/button";
import { GALLERY_STYLES } from "@/config/gallery";
import {
  GalleryGrid,
  type GalleryItem,
  galleryQuery,
  galleryStyleHints,
  galleryStyleLabels,
  toCardData,
} from "@/features/gallery";
import { cn } from "@/lib/utils";

const tileColours = [
  "bg-lila",
  "bg-nane",
  "bg-seftali",
  "bg-gok",
  "bg-limon",
  "bg-accent",
  "bg-primary/40",
] as const;

/**
 * Home §3 "Seçki" (plan §6): featured works, then one tile per style that opens the gallery
 * already filtered (K-29). Styles without a published work are left out.
 */
export function HomeGallery({ items }: { items: GalleryItem[] }) {
  if (items.length === 0) return null;
  const featured = items
    .filter((item) => item.isFeatured)
    .slice(0, 6)
    .map(toCardData);
  const styles = GALLERY_STYLES.flatMap((style) => {
    const cover = items.find((item) => item.style === style);
    return cover ? [{ style, cover }] : [];
  });

  return (
    <section aria-labelledby="secki-baslik" className="container-page section-y">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-2 text-sm font-semibold text-brand">
            <Sparkle className="size-4" />
            Seçki
          </p>
          <h2 id="secki-baslik" className="mt-2 text-3xl font-medium md:text-5xl">
            Son işlerden seçtiklerimiz
          </h2>
        </div>
        <Button asChild variant="outline" size="lg" className="hidden sm:inline-flex">
          <Link href="/galeri">
            Tüm galeri
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </div>

      {featured.length > 0 && (
        <GalleryGrid items={featured} className="mt-8 lg:grid-cols-3" eagerCount={0} />
      )}

      <h3 className="mt-14 text-2xl font-medium md:text-3xl">Stile göre keşfedin</h3>
      <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {styles.map(({ style, cover }, index) => (
          <li key={style}>
            <Link
              href={`/galeri${galleryQuery({ style })}` as Route}
              className={cn(
                "group flex min-h-20 items-center gap-3 rounded-[1.5rem] p-3 transition-transform duration-(--duration-base) ease-(--ease-out) hover:-translate-y-0.5",
                tileColours[index % tileColours.length],
              )}
            >
              <Image
                src={cover.imagePath}
                width={cover.imageWidth}
                height={cover.imageHeight}
                alt=""
                sizes="4rem"
                className="size-16 shrink-0 rounded-full object-cover ring-4 ring-surface"
              />
              <span className="min-w-0">
                <span className="block font-display text-lg font-medium">
                  {galleryStyleLabels[style]}
                </span>
                <span className="block text-sm">{galleryStyleHints[style]}</span>
              </span>
            </Link>
          </li>
        ))}
        <li>
          <Link
            href="/galeri"
            className="flex min-h-20 items-center justify-center gap-2 rounded-[1.5rem] border-2 border-dashed border-primary p-3 font-semibold transition-transform duration-(--duration-base) ease-(--ease-out) hover:-translate-y-0.5"
          >
            Tüm galeri
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </li>
      </ul>
    </section>
  );
}
