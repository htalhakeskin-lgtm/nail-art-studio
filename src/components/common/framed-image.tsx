import Image from "next/image";

import type { DemoImage } from "@/content/demo-images";
import { cn } from "@/lib/utils";

type FramedImageProps = {
  image: DemoImage;
  /** Rendered width hint for the srcset (06-arayuz §10, 12-performans). */
  sizes: string;
  className?: string;
  /** Above the fold: load immediately; `lcp` also raises fetch priority (Next 16: no `priority`). */
  eager?: boolean;
  lcp?: boolean;
};

/**
 * Works are shown like pictures on a wall (plan §11): thin frame, square corners, the image's
 * own aspect ratio from width / height so nothing shifts while it loads.
 */
export function FramedImage({
  image,
  sizes,
  className,
  eager = false,
  lcp = false,
}: FramedImageProps) {
  return (
    <div className={cn("border border-foreground/10 bg-surface p-1.5 shadow-sm", className)}>
      <Image
        src={image.src}
        width={image.width}
        height={image.height}
        alt={image.alt}
        sizes={sizes}
        loading={eager || lcp ? "eager" : "lazy"}
        fetchPriority={lcp ? "high" : undefined}
        className="h-auto w-full"
      />
    </div>
  );
}
