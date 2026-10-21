import { GALLERY_COLORS, GALLERY_LENGTHS, GALLERY_STYLES } from "@/config/gallery";

import type { GalleryColor, GalleryLength, GalleryStyle } from "../schemas";

/**
 * Gallery filters (REQ-006, K-29): one value per facet, kept in the URL so a filtered view can
 * be shared (`/galeri?stil=french&renk=beyaz`). Unknown values are ignored, never an error.
 */
export type GalleryFilters = {
  style?: GalleryStyle;
  color?: GalleryColor;
  length?: GalleryLength;
};

export type GalleryFilterKey = keyof GalleryFilters;

/** URL parameter names (Turkish URLs, plan §6). */
export const filterParams: Record<GalleryFilterKey, string> = {
  style: "stil",
  color: "renk",
  length: "uzunluk",
};

type Params = { get(name: string): string | null };

function pick<T extends string>(values: readonly T[], value: string | null): T | undefined {
  return value !== null && (values as readonly string[]).includes(value) ? (value as T) : undefined;
}

export function parseGalleryFilters(params: Params): GalleryFilters {
  const filters: GalleryFilters = {};
  const style = pick(GALLERY_STYLES, params.get(filterParams.style));
  const color = pick(GALLERY_COLORS, params.get(filterParams.color));
  const length = pick(GALLERY_LENGTHS, params.get(filterParams.length));
  if (style) filters.style = style;
  if (color) filters.color = color;
  if (length) filters.length = length;
  return filters;
}

/** Query string for a set of filters, in a stable order; "" when nothing is selected. */
export function galleryQuery(filters: GalleryFilters): string {
  const params = new URLSearchParams();
  for (const key of ["style", "color", "length"] as const) {
    const value = filters[key];
    if (value) params.set(filterParams[key], value);
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

/** Selecting the active value again clears that facet (chips behave as toggles). */
export function toggleFilter<K extends GalleryFilterKey>(
  filters: GalleryFilters,
  key: K,
  value: NonNullable<GalleryFilters[K]>,
): GalleryFilters {
  if (filters[key] === value) return clearFilter(filters, key);
  return { ...filters, [key]: value };
}

export function clearFilter(filters: GalleryFilters, key: GalleryFilterKey): GalleryFilters {
  return Object.fromEntries(Object.entries(filters).filter(([name]) => name !== key));
}

export function activeFilterCount(filters: GalleryFilters): number {
  return Object.values(filters).filter(Boolean).length;
}

type Filterable = { style: string; colors: readonly string[]; length: string };

export function filterGalleryItems<T extends Filterable>(
  items: readonly T[],
  filters: GalleryFilters,
): T[] {
  return items.filter(
    (item) =>
      (!filters.style || item.style === filters.style) &&
      (!filters.color || item.colors.includes(filters.color)) &&
      (!filters.length || item.length === filters.length),
  );
}
