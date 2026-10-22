import { CalendarHeart } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { formatWorkNumber, type GalleryItem } from "@/features/gallery";
import { BeforeAfter } from "@/features/gallery/client";

/**
 * Home §4 (plan §6, REQ-007, V-07): one large before / after slider. Shown only when a real
 * published pair exists (K-39): demo photos are never paired across different hands.
 */
export function HomeBeforeAfter({ items }: { items: GalleryItem[] }) {
  const work = items.find((item) => item.beforeImagePath && item.beforeImageAlt);
  if (!work?.beforeImagePath || !work.beforeImageAlt) return null;

  return (
    <section aria-labelledby="oncesi-sonrasi" className="reveal container-page section-y">
      <div className="grid items-center gap-8 md:grid-cols-[1fr_1.1fr] md:gap-16">
        <div className="mx-auto w-full max-w-md">
          <BeforeAfter
            before={{ src: work.beforeImagePath, alt: work.beforeImageAlt }}
            after={{ src: work.imagePath, alt: work.imageAlt }}
            title={work.title}
            sizes="(min-width: 768px) 28rem, 100vw"
          />
        </div>
        <div>
          <h2 id="oncesi-sonrasi" className="text-3xl font-medium md:text-5xl">
            Öncesi / sonrası
          </h2>
          <p className="mt-4 max-w-prose text-lg text-muted-foreground">
            {formatWorkNumber(work.number)} · {work.title}. Kaydırıcıyı sürükleyin ya da ok
            tuşlarıyla aynı elin uygulamadan önceki hâlini görün.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href={`/randevu?tasarim=${work.slug}` as Route}>
                <CalendarHeart aria-hidden="true" />
                Bu tasarımı istiyorum
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href={`/galeri/${work.slug}` as Route}>Eseri inceleyin</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
