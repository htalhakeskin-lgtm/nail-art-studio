import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

import { formatWorkNumber } from "../domain/neighbours";
import { galleryLengthLabels, galleryStyleLabels, galleryTechniqueLabels } from "../labels";
import type { GalleryCardData } from "../types";

/**
 * Gallery card (plan §11 "eser etiketi"): the work in a polaroid frame and a museum-style label
 * underneath. The whole card is one link to the work's page.
 */
export function GalleryCard({
  item,
  sizes,
  eager = false,
  className,
}: {
  item: GalleryCardData;
  sizes: string;
  eager?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={`/galeri/${item.slug}` as Route}
      className={cn(
        "group block rounded-[1.5rem] bg-surface p-2 shadow-glow transition-transform duration-(--duration-base) ease-(--ease-out) hover:-translate-y-1",
        className,
      )}
    >
      <div className="overflow-hidden rounded-[1.1rem]">
        <Image
          src={item.imagePath}
          width={item.imageWidth}
          height={item.imageHeight}
          alt={item.imageAlt}
          sizes={sizes}
          loading={eager ? "eager" : "lazy"}
          className="h-auto w-full transition-transform duration-(--duration-slow) ease-(--ease-out) group-hover:scale-105"
        />
      </div>
      <div className="px-1.5 pt-3 pb-1.5">
        <p className="flex flex-wrap items-center gap-x-2 text-xs font-semibold">
          <span className="text-brand tabular-nums">{formatWorkNumber(item.number)}</span>
          <span className="text-muted-foreground">{galleryStyleLabels[item.style]}</span>
        </p>
        <h3 className="mt-1 line-clamp-2 text-base leading-snug font-medium break-words sm:text-lg">
          {item.title}
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {galleryTechniqueLabels[item.technique]} · {galleryLengthLabels[item.length]}
        </p>
      </div>
    </Link>
  );
}
