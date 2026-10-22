import { Eye, EyeOff, Pencil, Star, StarOff } from "lucide-react";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

import { toggleGalleryFeaturedForm, toggleGalleryPublishedForm } from "../actions";
import { formatWorkNumber } from "../domain/neighbours";
import type { GalleryRow } from "../queries";
import { galleryLengthLabels, galleryStyleLabels, galleryTechniqueLabels } from "../schemas";

/**
 * Panel gallery (SCR-106): cards on every width (13-yonetim-paneli §5). Publish and feature
 * toggles are plain forms bound to server actions, so they work before hydration; "Düzenle"
 * opens the work form (photos, labels, consent).
 */
export function GalleryPanelList({ items }: { items: GalleryRow[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-surface p-8 text-center">
        <p className="font-semibold">Galeride henüz eser yok</p>
        <p className="mt-1 text-sm text-muted-foreground">“Yeni iş” ile ilk çalışmanızı ekleyin.</p>
      </div>
    );
  }

  return (
    <ul className="grid gap-3 md:grid-cols-2">
      {items.map((item) => (
        <li key={item.id} className="flex gap-3 rounded-xl border bg-surface p-3">
          <Image
            src={item.imagePath}
            width={item.imageWidth}
            height={item.imageHeight}
            alt=""
            sizes="5rem"
            className="h-auto w-20 shrink-0 self-start rounded-lg"
          />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-brand tabular-nums">
              {formatWorkNumber(item.number)}
            </p>
            <p className="font-semibold break-words">{item.title}</p>
            <p className="text-sm text-muted-foreground">
              {galleryStyleLabels[item.style]} · {galleryTechniqueLabels[item.technique]} ·{" "}
              {galleryLengthLabels[item.length]}
            </p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {!item.isPublished && (
                <span className="inline-flex rounded-full bg-warning-muted px-2.5 py-0.5 text-xs font-semibold text-warning">
                  Taslak: sitede görünmüyor
                </span>
              )}
              {item.isFeatured && (
                <span className="inline-flex rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold">
                  Ana sayfada
                </span>
              )}
              {item.isRepresentative && (
                <span className="inline-flex rounded-full bg-surface-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
                  Temsilî görsel
                </span>
              )}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-1">
              <form action={toggleGalleryPublishedForm}>
                <input type="hidden" name="id" value={item.id} />
                {/* aria-label starts with the visible word (WCAG 2.5.3 label in name). */}
                <Button
                  type="submit"
                  variant="ghost"
                  size="sm"
                  aria-label={`${item.isPublished ? "Gizle" : "Yayımla"}: ${item.title}`}
                >
                  {item.isPublished ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
                  {item.isPublished ? "Gizle" : "Yayımla"}
                </Button>
              </form>
              <form action={toggleGalleryFeaturedForm}>
                <input type="hidden" name="id" value={item.id} />
                <Button
                  type="submit"
                  variant="ghost"
                  size="sm"
                  aria-label={`${item.isFeatured ? "Seçkiden çıkar" : "Seçkiye ekle"}: ${item.title}`}
                >
                  {item.isFeatured ? <StarOff aria-hidden="true" /> : <Star aria-hidden="true" />}
                  {item.isFeatured ? "Seçkiden çıkar" : "Seçkiye ekle"}
                </Button>
              </form>
              <Button asChild variant="outline" size="sm">
                <Link
                  href={`/panel/galeri/${item.id}` as Route}
                  aria-label={`Düzenle: ${item.title}`}
                >
                  <Pencil aria-hidden="true" />
                  Düzenle
                </Link>
              </Button>
              {item.isPublished && (
                <Button asChild variant="link" size="sm">
                  <Link
                    href={`/galeri/${item.slug}` as Route}
                    aria-label={`Sitede gör: ${item.title}`}
                  >
                    Sitede gör
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
