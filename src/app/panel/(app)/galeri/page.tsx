import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ruleMessages } from "@/config/rules";
import { GalleryPanelList, listGalleryItemsForPanel } from "@/features/gallery";

export const metadata: Metadata = { title: "Galeri" };

/** SCR-106 (UC-06): add, edit, publish and feature works; new works go to the top. */
export default async function PanelGalleryPage({ searchParams }: PageProps<"/panel/galeri">) {
  const [{ hata, kaydedildi }, items] = await Promise.all([
    searchParams,
    listGalleryItemsForPanel(),
  ]);
  const error =
    typeof hata === "string" && hata in ruleMessages
      ? ruleMessages[hata as keyof typeof ruleMessages]
      : undefined;
  const published = items.filter((item) => item.isPublished).length;
  const featured = items.filter((item) => item.isFeatured).length;
  const pairs = items.filter((item) => item.beforeImagePath).length;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-medium">Galeri</h1>
        <Button asChild size="sm">
          <Link href="/panel/galeri/yeni">
            <Plus aria-hidden="true" />
            Yeni iş
          </Link>
        </Button>
      </div>
      <p className="mt-2 text-muted-foreground">
        {items.length} eser · {published} yayında · {featured} ana sayfa seçkisinde · {pairs} öncesi
        / sonrası
      </p>
      {kaydedildi === "eser" && (
        <p
          role="status"
          className="mt-4 rounded-lg bg-success-muted px-4 py-3 font-semibold text-success"
        >
          Eser kaydedildi. Galeri güncellendi.
        </p>
      )}
      {error && (
        <p
          role="alert"
          className="mt-4 rounded-lg bg-danger-muted px-4 py-3 font-semibold text-danger"
        >
          {error}
        </p>
      )}
      <div className="mt-6">
        <GalleryPanelList items={items} />
      </div>
    </>
  );
}
