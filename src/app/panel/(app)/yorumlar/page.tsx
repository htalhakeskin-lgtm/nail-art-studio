import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { listTestimonialsForPanel, TestimonialPanelList } from "@/features/testimonials";

export const metadata: Metadata = { title: "Yorumlar" };

/** SCR-107: reviews on the home page (REQ-014). Hidden instead of deleted; order = site order. */
export default async function TestimonialsPage({ searchParams }: PageProps<"/panel/yorumlar">) {
  const [{ kaydedildi }, items] = await Promise.all([searchParams, listTestimonialsForPanel()]);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-medium">Yorumlar</h1>
        <Button asChild size="sm">
          <Link href="/panel/yorumlar/yeni">
            <Plus aria-hidden="true" />
            Yeni yorum
          </Link>
        </Button>
      </div>
      <p className="mt-2 max-w-prose text-muted-foreground">
        Ana sayfada bu sırayla görünür. Örnek yorumlar “örnek yorum” etiketi taşır; arama
        motorlarına yorum ya da puan bilgisi gönderilmez.
      </p>
      {kaydedildi === "1" && (
        <p
          role="status"
          className="mt-4 rounded-lg bg-success-muted px-4 py-3 font-semibold text-success"
        >
          Yorum kaydedildi. Ana sayfa güncellendi.
        </p>
      )}
      <div className="mt-8">
        <TestimonialPanelList items={items} />
      </div>
    </>
  );
}
