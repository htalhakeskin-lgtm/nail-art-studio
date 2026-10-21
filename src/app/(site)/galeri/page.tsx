import type { Metadata } from "next";
import { Suspense } from "react";

import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { PastelBlobs } from "@/components/common/pastel-blobs";
import {
  GalleryBrowser,
  GalleryGrid,
  listPublishedGalleryItems,
  toCardData,
} from "@/features/gallery";
import { env } from "@/lib/env";
import { pageMetadata } from "@/lib/seo";

// Filtered views (?stil=…) share this canonical URL, so they never compete in search (09-seo §3).
export const metadata: Metadata = pageMetadata({
  title: "Galeri: nail art işleri",
  description:
    "Sade, french, simli, ombre, desenli ve rengârenk nail art işleri. Stile, renge ve uzunluğa göre süzün, beğendiğiniz tasarımı WhatsApp'tan isteyin.",
  path: "/galeri",
});

/**
 * SCR-004 (REQ-006, K-29): every published work with style chips and colour / length filters.
 * The grid is prerendered; the filters read the URL in the browser, so the unfiltered grid is
 * the fallback while they load.
 */
export default async function GalleryPage() {
  const items = (await listPublishedGalleryItems()).map(toCardData);

  return (
    <>
      <section className="relative isolate overflow-hidden">
        <PastelBlobs className="opacity-70" />
        <div className="container-page pt-8 pb-10 md:pt-12">
          <Breadcrumbs items={[{ label: "Galeri", href: "/galeri" }]} />
          <h1 className="mt-8 text-4xl font-medium tracking-tight md:text-6xl">Galeri</h1>
          <p className="mt-4 max-w-prose text-lg text-muted-foreground">
            Sadeden rengârenge, uygulanan işlerden bir seçki. Stile, renge ya da uzunluğa göre
            süzün; beğendiğiniz eserin sayfasından tasarımı doğrudan isteyebilirsiniz.
          </p>
          {env.DEMO_MODE && (
            <p className="mt-3 text-sm text-muted-foreground">
              Görseller temsilîdir; kaynakları her eserin sayfasında yazar.
            </p>
          )}
        </div>
      </section>

      <div className="container-page pb-(--section-y)">
        {items.length === 0 ? (
          <p className="rounded-[1.5rem] border border-dashed bg-surface p-8 text-center">
            Galeri şu an yüklenemedi. İşleri Instagram hesabımızdan da görebilirsiniz.
          </p>
        ) : (
          <Suspense
            fallback={
              <>
                {/* Same height as the chip row, so nothing shifts when the filters arrive. */}
                <div aria-hidden="true" className="h-[3.25rem]" />
                <h2 className="sr-only">Eserler</h2>
                <GalleryGrid items={items} className="mt-14" />
              </>
            }
          >
            <GalleryBrowser items={items} />
          </Suspense>
        )}
      </div>
    </>
  );
}
