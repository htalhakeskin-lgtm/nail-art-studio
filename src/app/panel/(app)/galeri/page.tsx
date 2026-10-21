import type { Metadata } from "next";

import { ruleMessages } from "@/config/rules";
import { GalleryPanelList, listGalleryItemsForPanel } from "@/features/gallery";

export const metadata: Metadata = { title: "Galeri" };

/** SCR-106 (D-08 part): publish / feature works. Upload, editing and ordering join with D-09. */
export default async function PanelGalleryPage({ searchParams }: PageProps<"/panel/galeri">) {
  const [{ hata }, items] = await Promise.all([searchParams, listGalleryItemsForPanel()]);
  const error =
    typeof hata === "string" && hata in ruleMessages
      ? ruleMessages[hata as keyof typeof ruleMessages]
      : undefined;
  const published = items.filter((item) => item.isPublished).length;
  const featured = items.filter((item) => item.isFeatured).length;

  return (
    <>
      <h1 className="text-3xl font-medium">Galeri</h1>
      <p className="mt-2 text-muted-foreground">
        {items.length} eser · {published} yayında · {featured} ana sayfa seçkisinde
      </p>
      {error && (
        <p
          role="alert"
          className="mt-4 rounded-lg bg-danger-muted px-4 py-3 font-semibold text-danger"
        >
          {error}
        </p>
      )}
      <p className="mt-4 rounded-lg border border-warning/30 bg-warning-muted px-4 py-3 text-sm">
        Fotoğraf yükleme, düzenleme ve sıralama bir sonraki sürümde eklenecek. Şimdilik eserleri
        yayımlayabilir, gizleyebilir ve ana sayfa seçkisini belirleyebilirsiniz.
      </p>
      <div className="mt-6">
        <GalleryPanelList items={items} />
      </div>
    </>
  );
}
