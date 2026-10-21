import type { Metadata } from "next";
import Link from "next/link";

import {
  countLeadsByStatus,
  LeadPanelList,
  type LeadStatus,
  leadStatuses,
  leadStatusLabels,
  listLeadsForPanel,
} from "@/features/leads";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Talepler" };

/** Plan §12 "Talepler": contact form requests, newest first, filtered by status. */
export default async function LeadsPage({ searchParams }: PageProps<"/panel/talepler">) {
  const { durum } = await searchParams;
  const status = leadStatuses.find((value) => value === durum);
  const [items, counts] = await Promise.all([listLeadsForPanel(status), countLeadsByStatus()]);
  const total = Object.values(counts).reduce((sum, value) => sum + value, 0);
  const tabs: { key: LeadStatus | undefined; label: string; value: number }[] = [
    { key: undefined, label: "Tümü", value: total },
    ...leadStatuses.map((key) => ({ key, label: leadStatusLabels[key], value: counts[key] })),
  ];

  return (
    <>
      <h1 className="text-3xl font-medium">Talepler</h1>
      <p className="mt-2 text-muted-foreground">
        Sitedeki iletişim formundan gelen mesajlar. Yanıtladığınız talebi “Yanıtlandı” olarak
        işaretleyin.
      </p>
      <nav aria-label="Durum" className="-mx-4 mt-6 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <ul className="flex gap-2 sm:flex-wrap">
          {tabs.map((tab) => {
            const current = tab.key === status;
            return (
              <li key={tab.label} className="shrink-0">
                <Link
                  href={tab.key ? `/panel/talepler?durum=${tab.key}` : "/panel/talepler"}
                  aria-current={current ? "page" : undefined}
                  className={cn(
                    "inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold",
                    current
                      ? "border-transparent bg-primary text-primary-foreground"
                      : "bg-surface hover:bg-surface-muted",
                  )}
                >
                  {tab.label}
                  <span className="tabular-nums">{tab.value}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="mt-6">
        <LeadPanelList items={items} />
      </div>
    </>
  );
}
