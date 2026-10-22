import { CalendarHeart, Clock } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { connection } from "next/server";

import { Button } from "@/components/ui/button";
import {
  addDays,
  getAvailabilityContext,
  getBookableStaff,
  istanbulClock,
  istanbulDate,
  istanbulDateTime,
  nextSlots,
} from "@/features/booking";
import type { Service } from "@/features/services";
import type { SiteSettings } from "@/features/site";
import { formatDate, formatDuration } from "@/lib/format";

const SLOT_COUNT = 3;

function dayLabel(date: string, today: string, start: Date): string {
  if (date === today) return "Bugün";
  if (date === addDays(today, 1)) return "Yarın";
  return formatDate(start, "withWeekday");
}

/**
 * Home §2 (plan §6, REQ-001): the first free start times from the availability engine for the
 * first bookable service; each opens the booking flow with the time already chosen. Rendered
 * per request inside Suspense, so the rest of the home page stays a static shell.
 */
export async function NearestSlots({
  service,
  settings,
}: {
  service: Service | undefined;
  settings: SiteSettings;
}) {
  await connection(); // "now" is the request time, never the build time
  const expert = await getBookableStaff();
  if (!service || !expert) return null;

  const now = new Date();
  const today = istanbulDate(now);
  const context = await getAvailabilityContext(
    expert.id,
    now,
    istanbulDateTime(addDays(today, settings.booking.horizonDays + 1), "00:00"),
    now,
  );
  const slots = nextSlots(context, service.durationMinutes, SLOT_COUNT).map((start) => ({
    start,
    date: istanbulDate(start),
    clock: istanbulClock(start),
  }));

  return (
    <NearestSlotsFrame service={service}>
      {slots.length === 0 ? (
        <p className="mt-6 rounded-xl border border-dashed bg-surface p-5">
          Önümüzdeki günlerde boş saat görünmüyor. Başka bir hizmet için randevu sayfasına bakın ya
          da WhatsApp&apos;tan yazın.
        </p>
      ) : (
        <ul className="mt-6 grid gap-3 sm:grid-cols-3">
          {slots.map((slot) => (
            <li key={slot.start.toISOString()}>
              <Link
                href={
                  `/randevu?hizmet=${service.slug}&tarih=${slot.date}&saat=${slot.clock}#adim-bilgi` as Route
                }
                className="flex min-h-16 items-center justify-between gap-3 rounded-2xl border bg-surface px-5 py-4 shadow-sm transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring motion-reduce:transition-none"
              >
                <span>
                  <span className="block text-sm text-muted-foreground">
                    {dayLabel(slot.date, today, slot.start)}
                  </span>
                  <span className="font-display text-2xl">{slot.clock}</span>
                </span>
                <CalendarHeart aria-hidden="true" className="size-5 text-brand" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </NearestSlotsFrame>
  );
}

function NearestSlotsFrame({
  service,
  children,
}: {
  service: Pick<Service, "name" | "durationMinutes">;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby="en-yakin-saatler" className="container-page pb-4">
      <div className="rounded-[1.75rem] bg-surface-muted p-5 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="en-yakin-saatler" className="text-2xl font-medium md:text-3xl">
              En yakın boş saatler
            </h2>
            <p className="mt-1 flex items-center gap-2 text-muted-foreground">
              <Clock aria-hidden="true" className="size-4" />
              {service.name} · {formatDuration(service.durationMinutes)}
            </p>
          </div>
          <Button asChild variant="outline" size="lg">
            <Link href="/randevu">Başka hizmet ya da gün seçin</Link>
          </Button>
        </div>
        {children}
      </div>
    </section>
  );
}

/** Suspense fallback: the same frame with three quiet placeholders (no layout shift). */
export function NearestSlotsSkeleton({
  service,
}: {
  service: Pick<Service, "name" | "durationMinutes"> | undefined;
}) {
  if (!service) return null;
  return (
    <NearestSlotsFrame service={service}>
      <ul aria-hidden="true" className="mt-6 grid gap-3 sm:grid-cols-3">
        {Array.from({ length: SLOT_COUNT }, (_, index) => (
          <li key={index} className="h-[4.75rem] rounded-2xl bg-surface/70" />
        ))}
      </ul>
      <p className="sr-only">Boş saatler yükleniyor…</p>
    </NearestSlotsFrame>
  );
}
