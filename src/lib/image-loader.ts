/**
 * next/image loader (next.config.ts images.loaderFile, plan §10 / U-21). Demo and uploaded
 * images are pre-encoded at fixed widths ("<path>-480.webp" …), so Vercel's image
 * optimisation quota is never used. Any other src is returned unchanged.
 */
export const IMAGE_WIDTHS = [480, 960, 1600] as const;

type LoaderProps = { src: string; width: number; quality?: number };

/** Base paths with pre-encoded variants: demo files, uploads in the database, Vercel Blob (K-39). */
function hasVariants(src: string): boolean {
  return (
    src.startsWith("/demo/") ||
    src.startsWith("/media/") ||
    /^https:\/\/[a-z0-9]+\.public\.blob\.vercel-storage\.com\/gallery\//.test(src)
  );
}

export default function imageLoader({ src, width }: LoaderProps): string {
  if (!hasVariants(src)) return src;
  const variant = IMAGE_WIDTHS.find((candidate) => candidate >= width) ?? 1600;
  return `${src}-${String(variant)}.webp`;
}
