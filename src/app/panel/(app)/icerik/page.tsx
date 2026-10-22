import { Pencil, Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { FaqPanelList, listFaqsForPanel } from "@/features/faq";

export const metadata: Metadata = { title: "İçerik" };

const savedMessages: Record<string, string> = {
  sss: "Soru kaydedildi. Sitedeki SSS sayfası güncellendi.",
  hakkinda: "Hakkında metni kaydedildi. Site güncellendi.",
  surec: "Süreç adımları kaydedildi. Ana sayfa güncellendi.",
  hijyen: "Hijyen kartı kaydedildi. Ana sayfa güncellendi.",
};

const pageBlocks = [
  {
    title: "Hakkında",
    description: "Giriş metni, “Nasıl çalışıyoruz” bölümleri ve kapanış",
    href: "/panel/icerik/hakkinda",
  },
  {
    title: "Süreç adımları",
    description: "Ana sayfadaki “Nasıl ilerliyoruz” adımları",
    href: "/panel/icerik/surec",
  },
  {
    title: "Hijyen kartı",
    description: "Ana sayfadaki hijyen ve güven maddeleri, belge notu",
    href: "/panel/icerik/hijyen",
  },
] as const;

/** SCR-108: page copy and FAQs. Opened from the panel menu ("İçerik"). */
export default async function ContentPage({ searchParams }: PageProps<"/panel/icerik">) {
  const [{ kaydedildi }, faqs] = await Promise.all([searchParams, listFaqsForPanel()]);
  const saved = typeof kaydedildi === "string" ? savedMessages[kaydedildi] : undefined;

  return (
    <>
      <h1 className="text-3xl font-medium">İçerik</h1>
      {saved && (
        <p
          role="status"
          className="mt-4 rounded-lg bg-success-muted px-4 py-3 font-semibold text-success"
        >
          {saved}
        </p>
      )}

      <section aria-labelledby="sayfa-metinleri" className="mt-8">
        <h2 id="sayfa-metinleri" className="text-xl font-medium">
          Sayfa metinleri
        </h2>
        <ul className="mt-3 space-y-3">
          {pageBlocks.map((block) => (
            <li
              key={block.href}
              className="flex flex-col gap-3 rounded-xl border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-semibold">{block.title}</p>
                <p className="text-sm text-muted-foreground">{block.description}</p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href={block.href} aria-label={`${block.title}: düzenle`}>
                  <Pencil aria-hidden="true" />
                  Düzenle
                </Link>
              </Button>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="sss-baslik" className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="sss-baslik" className="text-xl font-medium">
            Sık sorulan sorular
          </h2>
          <Button asChild size="sm">
            <Link href="/panel/icerik/sss/yeni">
              <Plus aria-hidden="true" />
              Yeni soru
            </Link>
          </Button>
        </div>
        <div className="mt-4">
          <FaqPanelList items={faqs} />
        </div>
      </section>
    </>
  );
}
