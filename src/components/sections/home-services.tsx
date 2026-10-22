import { ArrowRight, MessageCircle } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  durationRange,
  type Service,
  serviceCategories,
  serviceCategoryHints,
  serviceCategoryLabels,
} from "@/features/services";
import { type SiteSettings, whatsappHref } from "@/features/site";
import { cn } from "@/lib/utils";

const tileColours = [
  "bg-lila",
  "bg-seftali",
  "bg-nane",
  "bg-gok",
  "bg-limon",
  "bg-accent",
] as const;

/**
 * Home §5 (plan §6): one card per service category with its duration range, linking to the
 * category on /hizmetler; prices are asked on WhatsApp (K-05).
 */
export function HomeServices({ items, settings }: { items: Service[]; settings: SiteSettings }) {
  const groups = serviceCategories
    .map((category) => ({ category, items: items.filter((item) => item.category === category) }))
    .filter((group) => group.items.length > 0);
  if (groups.length === 0) return null;

  return (
    <section aria-labelledby="hizmetler-ozet" className="container-page section-y">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 id="hizmetler-ozet" className="text-3xl font-medium md:text-5xl">
          Hizmetler
        </h2>
        <Button asChild variant="outline" size="lg" className="hidden sm:inline-flex">
          <Link href="/hizmetler">
            Tüm hizmetler
            <ArrowRight aria-hidden="true" />
          </Link>
        </Button>
      </div>
      <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map(({ category, items: group }, index) => (
          <li key={category}>
            <Link
              href={`/hizmetler#${category}` as Route}
              className={cn(
                "flex h-full min-h-28 flex-col justify-between gap-3 rounded-[1.5rem] p-5 transition-transform duration-(--duration-base) ease-(--ease-out) hover:-translate-y-0.5",
                tileColours[index % tileColours.length],
              )}
            >
              <span>
                <span className="block font-display text-2xl font-medium">
                  {serviceCategoryLabels[category]}
                </span>
                <span className="mt-1 block text-sm">{serviceCategoryHints[category]}</span>
              </span>
              <span className="flex items-center justify-between text-sm font-semibold">
                <span>{durationRange(group)}</span>
                <ArrowRight aria-hidden="true" className="size-4" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Button asChild size="lg">
          <a href={whatsappHref(settings)}>
            <MessageCircle aria-hidden="true" />
            Fiyat için WhatsApp
          </a>
        </Button>
        <Button asChild variant="outline" size="lg" className="sm:hidden">
          <Link href="/hizmetler">Tüm hizmetler</Link>
        </Button>
      </div>
    </section>
  );
}
