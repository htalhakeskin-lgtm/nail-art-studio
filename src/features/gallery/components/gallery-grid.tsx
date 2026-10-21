import { cn } from "@/lib/utils";

import type { GalleryCardData } from "../types";
import { GalleryCard } from "./gallery-card";

const gridSizes =
  "(min-width: 1280px) 18rem, (min-width: 1024px) 24vw, (min-width: 768px) 32vw, 48vw";

/** Two columns on phones, up to four on desktop. The first row loads eagerly (above the fold). */
export function GalleryGrid({
  items,
  className,
  eagerCount = 2,
}: {
  items: GalleryCardData[];
  className?: string;
  eagerCount?: number;
}) {
  return (
    <ul className={cn("grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4", className)}>
      {items.map((item, index) => (
        <li key={item.slug}>
          <GalleryCard item={item} sizes={gridSizes} eager={index < eagerCount} />
        </li>
      ))}
    </ul>
  );
}
