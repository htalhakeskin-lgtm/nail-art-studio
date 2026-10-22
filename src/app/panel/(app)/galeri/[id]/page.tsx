import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { z } from "zod";

import { Breadcrumbs } from "@/components/common/panel-breadcrumbs";
import { GalleryItemForm, getGalleryItemForPanel } from "@/features/gallery";

export const metadata: Metadata = { title: "İşi düzenle" };

/** SCR-106: edit a work's photos, labels, consent and visibility. */
export default async function EditGalleryItemPage({ params }: PageProps<"/panel/galeri/[id]">) {
  const { id } = await params;
  // Unknown or malformed ids look the same: not found (11-guvenlik: no existence leaks).
  const item = z.uuid().safeParse(id).success ? await getGalleryItemForPanel(id) : null;
  if (!item) notFound();

  return (
    <>
      <Breadcrumbs items={[{ label: "Galeri", href: "/panel/galeri" }]} current={item.title} />
      <h1 className="mt-4 text-3xl font-medium break-words">{item.title}</h1>
      <div className="mt-8">
        <GalleryItemForm
          initial={{
            id: item.id,
            isRepresentative: item.isRepresentative,
            imagePath: item.imagePath,
            beforeImagePath: item.beforeImagePath,
            title: item.title,
            slug: item.slug,
            description: item.description ?? "",
            style: item.style,
            colors: item.colors,
            length: item.length,
            technique: item.technique,
            durationMinutes: item.durationMinutes === null ? "" : String(item.durationMinutes),
            instagramUrl: item.instagramUrl ?? "",
            imageAlt: item.imageAlt,
            beforeImageAlt: item.beforeImageAlt ?? "",
            removeBefore: false,
            consent: item.consentObtainedAt !== null,
            isPublished: item.isPublished,
            isFeatured: item.isFeatured,
          }}
        />
      </div>
    </>
  );
}
