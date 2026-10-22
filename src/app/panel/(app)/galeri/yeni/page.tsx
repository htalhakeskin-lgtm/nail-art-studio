import type { Metadata } from "next";

import { Breadcrumbs } from "@/components/common/panel-breadcrumbs";
import { GalleryItemForm } from "@/features/gallery";

export const metadata: Metadata = { title: "Yeni iş" };

/** UC-06: add a work from the studio, optionally with its before photo. */
export default function NewGalleryItemPage() {
  return (
    <>
      <Breadcrumbs items={[{ label: "Galeri", href: "/panel/galeri" }]} current="Yeni iş" />
      <h1 className="mt-4 text-3xl font-medium">Yeni iş</h1>
      <p className="mt-2 max-w-prose text-muted-foreground">
        Telefonunuzdaki fotoğrafı doğrudan seçebilirsiniz; boyutu küçültülür, konum bilgisi silinir.
        Müşteri izni olmadan iş yayımlanmaz.
      </p>
      <div className="mt-8">
        <GalleryItemForm />
      </div>
    </>
  );
}
