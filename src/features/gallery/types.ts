import type { GalleryColor, GalleryLength, GalleryStyle, GalleryTechnique } from "./schemas";

/** What a card and the client-side filter need; plain data, safe to pass to the browser. */
export type GalleryCardData = {
  slug: string;
  number: number;
  title: string;
  style: GalleryStyle;
  colors: GalleryColor[];
  length: GalleryLength;
  technique: GalleryTechnique;
  imagePath: string;
  imageWidth: number;
  imageHeight: number;
  imageAlt: string;
};

export function toCardData(item: GalleryCardData): GalleryCardData {
  return {
    slug: item.slug,
    number: item.number,
    title: item.title,
    style: item.style,
    colors: item.colors,
    length: item.length,
    technique: item.technique,
    imagePath: item.imagePath,
    imageWidth: item.imageWidth,
    imageHeight: item.imageHeight,
    imageAlt: item.imageAlt,
  };
}
