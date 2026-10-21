import { describe, expect, it } from "vitest";

import {
  activeFilterCount,
  clearFilter,
  filterGalleryItems,
  galleryQuery,
  parseGalleryFilters,
  toggleFilter,
} from "./filters";

const items = [
  { slug: "a", style: "sade", colors: ["pembe"], length: "kisa" },
  { slug: "b", style: "french", colors: ["beyaz", "nude"], length: "uzun" },
  { slug: "c", style: "sade", colors: ["mavi"], length: "uzun" },
];

const slugs = (list: { slug: string }[]) => list.map((item) => item.slug);

describe("gallery filters", () => {
  it("reads known values from the URL and ignores unknown ones", () => {
    const params = new URLSearchParams("stil=sade&renk=gri&uzunluk=uzun&x=1");
    expect(parseGalleryFilters(params)).toEqual({ style: "sade", length: "uzun" });
    expect(parseGalleryFilters(new URLSearchParams(""))).toEqual({});
  });

  it("writes a stable query string and nothing when empty", () => {
    expect(galleryQuery({ length: "kisa", style: "french", color: "beyaz" })).toBe(
      "?stil=french&renk=beyaz&uzunluk=kisa",
    );
    expect(galleryQuery({})).toBe("");
  });

  it("toggles a facet off when the active value is chosen again", () => {
    expect(toggleFilter({ style: "sade" }, "style", "sade")).toEqual({});
    expect(toggleFilter({ style: "sade" }, "style", "french")).toEqual({ style: "french" });
    expect(toggleFilter({}, "color", "pembe")).toEqual({ color: "pembe" });
    expect(activeFilterCount({ style: "sade", color: "pembe" })).toBe(2);
    expect(clearFilter({ style: "sade", color: "pembe" }, "style")).toEqual({ color: "pembe" });
  });

  it("combines facets; the colour only has to be one of the work's colours", () => {
    expect(slugs(filterGalleryItems(items, {}))).toEqual(["a", "b", "c"]);
    expect(slugs(filterGalleryItems(items, { style: "sade" }))).toEqual(["a", "c"]);
    expect(slugs(filterGalleryItems(items, { color: "nude" }))).toEqual(["b"]);
    expect(slugs(filterGalleryItems(items, { style: "sade", length: "uzun" }))).toEqual(["c"]);
    expect(filterGalleryItems(items, { style: "french", color: "pembe" })).toEqual([]);
  });
});
