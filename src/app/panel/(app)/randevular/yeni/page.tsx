import type { Metadata, Route } from "next";
import Link from "next/link";

import { Breadcrumbs } from "@/components/common/panel-breadcrumbs";
import {
  addDays,
  DayStrip,
  daysWithAvailability,
  describeAppointmentTime,
  getAvailabilityContext,
  getBookableStaff,
  istanbulClock,
  istanbulDate,
  istanbulDateTime,
  slotsForDay,
  TimeGrid,
} from "@/features/booking";
import { ManualAppointmentForm } from "@/features/booking/forms";
import {
  listServicesForPanel,
  serviceCategories,
  serviceCategoryLabels,
} from "@/features/services";
import { getSiteSettings } from "@/features/site";
import { formatDuration } from "@/lib/format";

export const metadata: Metadata = { title: "Elle randevu" };

const one = (value: string | string[] | undefined) =>
  typeof value === "string" ? value : undefined;

/**
 * UC-05 (SCR-103 form): a booking taken by phone or DM — service, day, free time, customer.
 * The same engine as the site, except the lead time (P-03): today's free slots count too.
 * Hidden or non-bookable services may still be booked here (the owner decides).
 */
export default async function NewAppointmentPage({
  searchParams,
}: PageProps<"/panel/randevular/yeni">) {
  const query = await searchParams;
  const [settings, services, expert] = await Promise.all([
    getSiteSettings(),
    listServicesForPanel(),
    getBookableStaff(),
  ]);
  const service = services.find((item) => item.id === one(query.hizmet));
  const now = new Date();
  const today = istanbulDate(now);
  const context =
    service && expert
      ? await getAvailabilityContext(
          expert.id,
          now,
          istanbulDateTime(addDays(today, settings.booking.horizonDays + 1), "00:00"),
          now,
        ).then((value) => ({ ...value, rules: { ...value.rules, minLeadHours: 0 } }))
      : null;
  const days = context && service ? daysWithAvailability(context, service.durationMinutes) : [];
  const date = days.find((day) => day.date === one(query.tarih) && day.slots > 0)?.date;
  const slots =
    context && service && date
      ? slotsForDay(context, date, service.durationMinutes).map((start) => ({
          start,
          clock: istanbulClock(start),
        }))
      : [];
  const chosen = slots.find((slot) => slot.clock === one(query.saat));
  const href = (params: Record<string, string>) =>
    `/panel/randevular/yeni?${new URLSearchParams(params).toString()}` as Route;

  return (
    <>
      <Breadcrumbs
        items={[{ label: "Randevular", href: "/panel/randevular" }]}
        current="Elle randevu"
      />
      <h1 className="mt-4 text-3xl font-medium">Elle randevu</h1>
      <p className="mt-2 max-w-prose text-muted-foreground">
        Telefonla ya da mesajla gelen randevular için. Sitedeki takvimle aynı saatler geçerlidir;
        kaydedilen randevu onaylı başlar ve sitede o saat kapanır.
      </p>

      <section aria-labelledby="elle-hizmet" className="mt-6">
        <h2 id="elle-hizmet" className="text-xl font-medium">
          1. Hizmet
        </h2>
        <div className="mt-3 space-y-4">
          {serviceCategories.map((category) => {
            const group = services.filter((item) => item.category === category);
            if (group.length === 0) return null;
            return (
              <div key={category}>
                <h3 className="font-sans text-sm font-bold">{serviceCategoryLabels[category]}</h3>
                <ul className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {group.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={href({ hizmet: item.id })}
                        aria-current={item.id === service?.id ? "true" : undefined}
                        className={
                          item.id === service?.id
                            ? "flex min-h-11 items-center justify-between gap-2 rounded-xl border border-transparent bg-primary px-3 py-2 text-primary-foreground"
                            : "flex min-h-11 items-center justify-between gap-2 rounded-xl border bg-surface px-3 py-2 hover:bg-surface-muted"
                        }
                      >
                        <span className="font-semibold break-words">{item.name}</span>
                        <span className="shrink-0 text-xs">
                          {formatDuration(item.durationMinutes)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      {service && (
        <section aria-labelledby="elle-gun" className="mt-8">
          <h2 id="elle-gun" className="text-xl font-medium">
            2. Gün ve saat
          </h2>
          <DayStrip
            days={days}
            today={today}
            chosen={date}
            hrefFor={(day) => href({ hizmet: service.id, tarih: day })}
          />
          {date && (
            <TimeGrid
              slots={slots}
              chosen={chosen?.clock}
              hrefFor={(clock) => href({ hizmet: service.id, tarih: date, saat: clock })}
            />
          )}
        </section>
      )}

      {service && chosen && (
        <section
          aria-labelledby="elle-musteri"
          className="mt-8 max-w-2xl rounded-xl border bg-surface p-5"
        >
          <h2 id="elle-musteri" className="text-xl font-medium">
            3. Müşteri
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {service.name} · {describeAppointmentTime(chosen.start)}
          </p>
          <div className="mt-4">
            <ManualAppointmentForm serviceId={service.id} startsAt={chosen.start.toISOString()} />
          </div>
        </section>
      )}
    </>
  );
}
