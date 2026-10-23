"use client";

import { ChevronDown, SlidersHorizontal, X } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Drawer, type DrawerHandle, drawerTrigger, openDrawer } from "@/components/ui/drawer";
import {
  GALLERY_COLORS,
  GALLERY_LENGTHS,
  GALLERY_PAGE_SIZE,
  GALLERY_STYLES,
} from "@/config/gallery";
import { cn } from "@/lib/utils";

import {
  activeFilterCount,
  clearFilter,
  filterGalleryItems,
  type GalleryFilterKey,
  type GalleryFilters,
  galleryQuery,
  parseGalleryFilters,
  toggleFilter,
} from "../domain/filters";
import { galleryColorLabels, galleryLengthLabels, galleryStyleLabels } from "../labels";
import type { GalleryCardData } from "../types";
import { GalleryGrid } from "./gallery-grid";
import { Swatch } from "./swatch";

const chip =
  "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border px-4 text-sm font-semibold transition-colors duration-(--duration-fast)";
const chipIdle = "border-border bg-surface hover:bg-surface-muted";
const chipActive = "border-transparent bg-primary text-primary-foreground shadow-glow";

/**
 * Gallery filters and grid (SCR-004, K-29). Filters live in the URL (`?stil=&renk=&uzunluk=`)
 * so a view can be shared; filtering itself runs in the browser over the published works the
 * server already sent. Phone: style chips scroll sideways, colour and length open in a bottom
 * sheet (07-mobil). Desktop: everything inline.
 */
export function GalleryBrowser({ items }: { items: GalleryCardData[] }) {
  const pathname = usePathname();
  const filters = parseGalleryFilters(useSearchParams());
  const visible = filterGalleryItems(items, filters);
  // Any filter change, even back to an earlier one, starts again from the first page; the state
  // is reset during render (React's "adjusting state on a prop change", no effect).
  const query = galleryQuery(filters);
  const [page, setPage] = useState({ query, count: GALLERY_PAGE_SIZE });
  if (page.query !== query) setPage({ query, count: GALLERY_PAGE_SIZE });
  const limit = page.query === query ? page.count : GALLERY_PAGE_SIZE;
  const shown = visible.slice(0, limit);
  const grid = useRef<HTMLDivElement>(null);
  const filterDrawer = useRef<DrawerHandle>(null);
  const filterTrigger = useRef<HTMLButtonElement>(null);
  const showMore = () => {
    setPage({ query, count: limit + GALLERY_PAGE_SIZE });
    // Keyboard and screen reader users continue from the first newly shown work.
    requestAnimationFrame(() => {
      grid.current?.querySelectorAll<HTMLAnchorElement>("li a")[limit]?.focus();
    });
  };
  const secondaryCount = Number(Boolean(filters.color)) + Number(Boolean(filters.length));

  // The native History API updates useSearchParams without a server round trip (the grid is
  // already here) and keeps the scroll position.
  const apply = (next: GalleryFilters) => {
    window.history.replaceState(null, "", `${pathname}${galleryQuery(next)}`);
  };
  const toggle = <K extends GalleryFilterKey>(key: K, value: NonNullable<GalleryFilters[K]>) => {
    apply(toggleFilter(filters, key, value));
  };

  const colourAndLength = (
    <div className="space-y-5">
      <fieldset>
        <legend className="text-sm font-bold">Renk</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {GALLERY_COLORS.map((color) => {
            const active = filters.color === color;
            return (
              <button
                key={color}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  toggle("color", color);
                }}
                className={cn(chip, "px-3", active ? chipActive : chipIdle)}
              >
                <Swatch color={color} />
                {galleryColorLabels[color]}
              </button>
            );
          })}
        </div>
      </fieldset>
      <fieldset>
        <legend className="text-sm font-bold">Uzunluk</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {GALLERY_LENGTHS.map((length) => {
            const active = filters.length === length;
            return (
              <button
                key={length}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  toggle("length", length);
                }}
                className={cn(chip, active ? chipActive : chipIdle)}
              >
                {galleryLengthLabels[length]}
              </button>
            );
          })}
        </div>
      </fieldset>
    </div>
  );

  return (
    <div>
      <div
        role="group"
        aria-label="Stil"
        className="-mx-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0"
      >
        <div className="flex gap-2 sm:flex-wrap">
          <button
            type="button"
            aria-pressed={!filters.style}
            onClick={() => {
              apply(clearFilter(filters, "style"));
            }}
            className={cn(chip, filters.style ? chipIdle : chipActive)}
          >
            Tümü
          </button>
          {GALLERY_STYLES.map((style) => {
            const active = filters.style === style;
            return (
              <button
                key={style}
                type="button"
                aria-pressed={active}
                onClick={() => {
                  toggle("style", style);
                }}
                className={cn(chip, active ? chipActive : chipIdle)}
              >
                {galleryStyleLabels[style]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 hidden rounded-[1.5rem] bg-surface-muted p-5 lg:block">
        {colourAndLength}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p aria-live="polite" className="text-sm font-semibold text-muted-foreground">
          {shown.length < visible.length
            ? `${String(shown.length)} / ${String(visible.length)} eser gösteriliyor`
            : `${String(visible.length)} eser gösteriliyor`}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          {activeFilterCount(filters) > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                apply({});
              }}
            >
              <X aria-hidden="true" />
              Filtreleri temizle
            </Button>
          )}
          <Button
            ref={filterTrigger}
            variant="outline"
            size="sm"
            className="lg:hidden"
            {...drawerTrigger("galeri-filtre")}
            onClick={() => {
              openDrawer(filterDrawer);
            }}
          >
            <SlidersHorizontal aria-hidden="true" />
            Renk ve uzunluk
            {secondaryCount > 0 && (
              <span className="ml-1 inline-flex size-6 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                {secondaryCount}
                <span className="sr-only"> seçili</span>
              </span>
            )}
          </Button>
          <Drawer
            ref={filterDrawer}
            id="galeri-filtre"
            side="bottom"
            labelledBy="filtre-baslik"
            returnFocus={filterTrigger}
          >
            <div className="flex max-h-[85dvh] flex-col">
              <div className="flex items-center justify-between border-b px-5 py-3">
                <h2 id="filtre-baslik" className="text-xl">
                  Renk ve uzunluk
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Kapat"
                  onClick={() => filterDrawer.current?.close()}
                >
                  <X aria-hidden="true" className="size-5" />
                </Button>
              </div>
              <div className="overflow-y-auto px-5 py-5">{colourAndLength}</div>
              <div className="border-t px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
                <Button size="lg" className="w-full" onClick={() => filterDrawer.current?.close()}>
                  {visible.length} eseri göster
                </Button>
              </div>
            </div>
          </Drawer>
        </div>
      </div>

      <h2 className="sr-only">Eserler</h2>
      {visible.length > 0 ? (
        <div ref={grid}>
          <GalleryGrid items={shown} className="mt-6" />
          {visible.length > shown.length && (
            <div className="mt-8 flex justify-center">
              <Button variant="outline" size="lg" onClick={showMore}>
                <ChevronDown aria-hidden="true" />
                Daha fazla iş göster
                <span className="text-muted-foreground">
                  ({visible.length - shown.length} kaldı)
                </span>
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="mt-6 rounded-[1.5rem] border border-dashed bg-surface p-8 text-center">
          <p className="font-semibold">Bu seçime uyan eser yok</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Bir filtreyi kaldırın ya da aklınızdaki tasarımı WhatsApp&apos;tan gönderin.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => {
              apply({});
            }}
          >
            Filtreleri temizle
          </Button>
        </div>
      )}
    </div>
  );
}
