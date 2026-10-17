/**
 * next/image loader (next.config.ts images.loaderFile, plan §10 / U-21). Demo and uploaded
 * images are pre-encoded at fixed widths ("<path>-480.webp" …), so Vercel's image
 * optimisation quota is never used. Any other src is returned unchanged.
 */
export const IMAGE_WIDTHS = [480, 960, 1600] as const;

type LoaderProps = { src: string; width: number; quality?: number };

export default function imageLoader({ src, width }: LoaderProps): string {
  if (!src.startsWith("/demo/")) return src;
  const variant = IMAGE_WIDTHS.find((candidate) => candidate >= width) ?? 1600;
  return `${src}-${String(variant)}.webp`;
}
