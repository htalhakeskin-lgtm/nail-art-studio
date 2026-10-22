import { ArrowRight, Clock, Sparkles } from "lucide-react";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";

import { formatDuration } from "@/lib/format";

import { CONTACT_FOR_PRICE, type PriceDisplay, visiblePrice } from "../domain/price";
import type { Service } from "../queries";

/** Service card (SCR-002): photo, what it is, how long, how long it lasts, price line (K-05). */
export function ServiceCard({
  service,
  priceDisplay,
}: {
  service: Service;
  priceDisplay: PriceDisplay;
}) {
  const price = visiblePrice(service, priceDisplay);
  return (
    <Link
      href={`/hizmetler/${service.slug}` as Route}
      className="group flex h-full gap-4 rounded-[1.5rem] bg-surface p-3 shadow-glow transition-transform duration-(--duration-base) ease-(--ease-out) hover:-translate-y-0.5 sm:flex-col sm:p-4"
    >
      {service.coverImagePath && (
        <Image
          src={service.coverImagePath}
          width={1064}
          height={1330}
          alt=""
          sizes="(min-width: 640px) 18rem, 6rem"
          className="h-28 w-24 shrink-0 rounded-[1.1rem] object-cover sm:h-44 sm:w-full"
        />
      )}
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="font-display text-lg leading-snug font-medium break-words sm:text-xl">
          {service.name}
        </span>
        <span className="mt-1 line-clamp-3 text-sm text-muted-foreground">{service.summary}</span>
        <span className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs font-semibold">
          <span className="inline-flex items-center gap-1">
            <Clock aria-hidden="true" className="size-3.5 text-brand" />
            {formatDuration(service.durationMinutes)}
          </span>
          {service.durabilityText && (
            <span className="inline-flex items-center gap-1">
              <Sparkles aria-hidden="true" className="size-3.5 text-brand" />
              {service.durabilityText}
            </span>
          )}
        </span>
        <span className="mt-auto flex items-center justify-between gap-2 pt-3 text-sm">
          <span className={price ? "font-semibold" : "text-muted-foreground"}>
            {price ?? CONTACT_FOR_PRICE}
          </span>
          <ArrowRight
            aria-hidden="true"
            className="size-4 shrink-0 text-brand transition-transform group-hover:translate-x-0.5"
          />
        </span>
      </span>
    </Link>
  );
}
