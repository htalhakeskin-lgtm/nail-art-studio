import Image from "next/image";

import type { DemoImage } from "@/content/demo-images";
import { cn } from "@/lib/utils";

type FramedImageProps = {
  image: DemoImage;
  /** Rendered width hint for the srcset (06-arayuz §10, 12-performans). */
  sizes: string;
  className?: string;
  /** "arch": rounded top like a nail tip (hero, gallery); "soft": evenly rounded corners. */
  shape?: "soft" | "arch";
  /** Above the fold: load immediately; `lcp` also raises fetch priority (Next 16: no `priority`). */
  eager?: boolean;
  lcp?: boolean;
};

const shapes = {
  soft: { frame: "rounded-[1.75rem]", image: "rounded-[1.25rem]" },
  arch: {
    frame: "rounded-t-[999px] rounded-b-[1.75rem]",
    image: "rounded-t-[999px] rounded-b-[1.25rem]",
  },
} as const;

/**
 * Works are shown like polaroids on a pastel wall (plan §11, K-28): white rim, rounded or
 * nail-tip corners, a soft pink shadow, and the image's own aspect ratio from width / height
 * so nothing shifts while it loads.
 */
export function FramedImage({
  image,
  sizes,
  className,
  shape = "soft",
  eager = false,
  lcp = false,
}: FramedImageProps) {
  return (
    <div className={cn("bg-surface p-2 shadow-glow", shapes[shape].frame, className)}>
      <Image
        src={image.src}
        width={image.width}
        height={image.height}
        alt={image.alt}
        sizes={sizes}
        loading={eager || lcp ? "eager" : "lazy"}
        fetchPriority={lcp ? "high" : undefined}
        className={cn("h-auto w-full", shapes[shape].image)}
      />
    </div>
  );
}
