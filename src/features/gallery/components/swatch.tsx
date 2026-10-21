import { cn } from "@/lib/utils";

import type { GalleryColor } from "../schemas";

/** Static class names so Tailwind sees them (tokens: --swatch-* in globals.css). */
const swatchClasses: Record<GalleryColor, string> = {
  pembe: "bg-swatch-pembe",
  nude: "bg-swatch-nude",
  beyaz: "bg-swatch-beyaz",
  kirmizi: "bg-swatch-kirmizi",
  mor: "bg-swatch-mor",
  mavi: "bg-swatch-mavi",
  yesil: "bg-swatch-yesil",
  sari: "bg-swatch-sari",
  turuncu: "bg-swatch-turuncu",
  siyah: "bg-swatch-siyah",
  altin: "bg-linear-to-br from-swatch-altin to-swatch-sari",
};

/** A polish drop. Decorative: the colour name is always written next to it. */
export function Swatch({ color, className }: { color: GalleryColor; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block size-4 shrink-0 rounded-full ring-1 ring-foreground/15",
        swatchClasses[color],
        className,
      )}
    />
  );
}
