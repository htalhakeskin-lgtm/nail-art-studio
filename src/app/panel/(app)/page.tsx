import type { Metadata } from "next";
import Link from "next/link";

import { getPanelOverview } from "@/features/panel";
import { formatNumber } from "@/lib/format";

export const metadata: Metadata = { title: "Özet" };

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
    </>
  );
}
