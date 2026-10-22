import { CalendarPlus, ChevronLeft, ChevronRight } from "lucide-react";
import type { Metadata, Route } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { APPOINTMENT_STATUSES } from "@/config/booking";
import {
  addDays,
  type AppointmentStatus,
  appointmentStatusLabels,
  istanbulDate,
  istanbulDateTime,
  listAppointmentsForPanel,
  PanelAppointmentList,
} from "@/features/booking";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Randevular" };

const one = (value: string | string[] | undefined) =>
  typeof value === "string" ? value : undefined;
const isDate = (value: string | undefined): value is string =>
  value !== undefined && /^\d{4}-\d{2}-\d{2}$/.test(value);

type View = "gun" | "hafta";

/**
 * SCR-102 (A-16, REQ-003b): day or week agenda, a status filter and "Elle randevu" (UC-05).
 * Everything lives in the URL, so the back button and shared links keep the view.
 */
export default async function AppointmentsPage({ searchParams }: PageProps<"/panel/randevular">) {
  const query = await searchParams;
  const today = istanbulDate(new Date());
  const date = isDate(one(query.tarih)) ? (one(query.tarih) as string) : today;
  const view: View = one(query.gorunum) === "hafta" ? "hafta" : "gun";
  const status = APPOINTMENT_STATUSES.find((value) => value === one(query.durum));
  const span = view === "hafta" ? 7 : 1;
  const items = await listAppointmentsForPanel(
    istanbulDateTime(date, "00:00"),
    istanbulDateTime(addDays(date, span), "00:00"),
    status,
  );

  const href = (overrides: {
    tarih?: string;
    gorunum?: View;
    durum?: AppointmentStatus | null;
  }) => {
    const params = new URLSearchParams();
    const nextDate = overrides.tarih ?? date;
    const nextView = overrides.gorunum ?? view;
    const nextStatus = overrides.durum === null ? undefined : (overrides.durum ?? status);
    if (nextDate !== today) params.set("tarih", nextDate);
    if (nextView === "hafta") params.set("gorunum", "hafta");
    if (nextStatus) params.set("durum", nextStatus);
    const queryString = params.toString();
    return `/panel/randevular${queryString ? `?${queryString}` : ""}` as Route;
  };
  const chip = (active: boolean) =>
    cn(
      "inline-flex min-h-11 items-center rounded-full border px-4 text-sm font-semibold lg:min-h-9",
      active
        ? "border-transparent bg-primary text-primary-foreground"
        : "bg-surface hover:bg-surface-muted",
    );
  const title =
    view === "hafta"
      ? `${formatDate(new Date(`${date}T12:00:00Z`))} – ${formatDate(new Date(`${addDays(date, 6)}T12:00:00Z`))}`
      : formatDate(new Date(`${date}T12:00:00Z`), "withWeekday");

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-medium">Randevular</h1>
        <Button asChild size="sm">
          <Link href="/panel/randevular/yeni">
            <CalendarPlus aria-hidden="true" />
            Elle randevu
          </Link>
        </Button>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <Button asChild variant="outline" size="icon-sm">
          <Link
            href={href({ tarih: addDays(date, -span) })}
            aria-label={view === "hafta" ? "Önceki hafta" : "Önceki gün"}
          >
            <ChevronLeft aria-hidden="true" />
          </Link>
        </Button>
        <p className="min-w-0 flex-1 text-center font-semibold sm:flex-none">{title}</p>
        <Button asChild variant="outline" size="icon-sm">
          <Link
            href={href({ tarih: addDays(date, span) })}
            aria-label={view === "hafta" ? "Sonraki hafta" : "Sonraki gün"}
          >
            <ChevronRight aria-hidden="true" />
          </Link>
        </Button>
        {date !== today && (
          <Link href={href({ tarih: today })} className={chip(false)}>
            Bugün
          </Link>
        )}
      </div>

      <nav aria-label="Görünüm" className="mt-3 flex gap-2">
        <Link
          href={href({ gorunum: "gun" })}
          aria-current={view === "gun" ? "page" : undefined}
          className={chip(view === "gun")}
        >
          Gün
        </Link>
        <Link
          href={href({ gorunum: "hafta" })}
          aria-current={view === "hafta" ? "page" : undefined}
          className={chip(view === "hafta")}
        >
          Hafta
        </Link>
      </nav>

      <nav aria-label="Durum" className="-mx-4 mt-3 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <ul className="flex gap-2 sm:flex-wrap">
          <li className="shrink-0">
            <Link
              href={href({ durum: null })}
              aria-current={!status ? "page" : undefined}
              className={chip(!status)}
            >
              Tümü
            </Link>
          </li>
          {APPOINTMENT_STATUSES.map((value) => (
            <li key={value} className="shrink-0">
              <Link
                href={href({ durum: value })}
                aria-current={status === value ? "page" : undefined}
                className={chip(status === value)}
              >
                {appointmentStatusLabels[value]}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-6">
        <PanelAppointmentList
          items={items}
          showDate={view === "hafta"}
          empty={view === "hafta" ? "Bu hafta randevu yok." : "Bu gün randevu yok."}
        />
      </div>
    </>
  );
}
