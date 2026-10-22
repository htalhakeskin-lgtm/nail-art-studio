import type { Metadata } from "next";
import Link from "next/link";

import { getPanelOverview } from "@/features/panel";
import { formatNumber } from "@/lib/format";

export const metadata: Metadata = { title: "Özet" };

/** Every module, also on phones where the bottom bar has room for five. */
const sections = [
  { href: "/panel/talepler", label: "Talepler", hint: "İletişim formundan gelen mesajlar" },
  { href: "/panel/hizmetler", label: "Hizmetler", hint: "Menü, süreler, fiyat gösterimi" },
  { href: "/panel/galeri", label: "Galeri", hint: "Yayımla, ana sayfa seçkisi" },
  { href: "/panel/icerik", label: "İçerik", hint: "Hakkında metni, SSS" },
  { href: "/panel/demo-kutusu", label: "Demo kutusu", hint: "Gönderilecek bildirimler" },
] as const;

/**
 * Panel home. Becomes the "Bugün" screen (agenda + 3 KPIs) in D-07; until then it shows the
 * records that already exist.
 */
export default async function PanelHomePage() {
  const overview = await getPanelOverview();
  const cards = [
    { label: "Yeni talep", value: overview.newLeads },
    { label: "Toplam talep", value: overview.allLeads },
    { label: "Demo kutusundaki mesaj", value: overview.outbox, href: "/panel/demo-kutusu" },
  ] as const;

  return (
    <>
      <h1 className="text-3xl font-medium">Özet</h1>
      <ul className="mt-6 grid gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <li key={card.label} className="rounded-xl border border-border bg-surface p-5">
            <p className="text-sm font-semibold text-muted-foreground">{card.label}</p>
            <p className="mt-2 font-display text-4xl tabular-nums">{formatNumber(card.value)}</p>
            {"href" in card && (
              <Link
                href={card.href}
                className="mt-2 inline-flex min-h-11 items-center text-sm font-semibold text-brand underline-offset-4 hover:underline"
              >
                Mesajları gör
              </Link>
            )}
          </li>
        ))}
      </ul>

      <nav aria-labelledby="bolumler" className="mt-10">
        <h2 id="bolumler" className="text-xl font-medium">
          Bölümler
        </h2>
        <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => (
            <li key={section.href}>
              <Link
                href={section.href}
                className="flex min-h-14 flex-col justify-center rounded-xl border bg-surface px-4 py-2 hover:bg-surface-muted"
              >
                <span className="font-semibold">{section.label}</span>
                <span className="text-sm text-muted-foreground">{section.hint}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
