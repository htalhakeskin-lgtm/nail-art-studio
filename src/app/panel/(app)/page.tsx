import { CalendarPlus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";

import { Button } from "@/components/ui/button";
import {
  addDays,
  getTodayKpis,
  istanbulDate,
  istanbulDateTime,
  listAppointmentsForPanel,
  listPendingForPanel,
  PanelAppointmentList,
  setAppointmentStatusForm,
} from "@/features/booking";
import { getPanelOverview } from "@/features/panel";
import { formatDate, formatNumber, formatTime } from "@/lib/format";

export const metadata: Metadata = { title: "Bugün" };

/** Every module, also on phones where the bottom bar has room for five. */
const sections = [
  { href: "/panel/randevular", label: "Randevular", hint: "Ajanda, onay, elle randevu" },
  {
    href: "/panel/musaitlik",
    label: "Müsaitlik",
    hint: "Çalışma saatleri, izin, randevu kuralları",
  },
  { href: "/panel/talepler", label: "Talepler", hint: "İletişim formundan gelen mesajlar" },
  { href: "/panel/hizmetler", label: "Hizmetler", hint: "Menü, süreler, fiyat gösterimi" },
  { href: "/panel/galeri", label: "Galeri", hint: "Yayımla, ana sayfa seçkisi" },
  { href: "/panel/icerik", label: "İçerik", hint: "Hakkında, süreç, hijyen, SSS" },
  { href: "/panel/yorumlar", label: "Yorumlar", hint: "Ana sayfadaki yorumlar, sıra" },
  { href: "/panel/demo-kutusu", label: "Demo kutusu", hint: "Gönderilecek bildirimler" },
] as const;

/**
 * "Bugün" (A-16, REQ-003b, plan §12): three numbers, today's agenda and the requests waiting
 * for approval — each with a one-tap "Onayla" (UC-04). Phone first: this is the screen the
 * owner opens between appointments.
 */
export default async function PanelTodayPage() {
  await connection(); // "now" is the request time, never the build time
  const now = new Date();
  const today = istanbulDate(now);
  const [kpis, agenda, pending, overview] = await Promise.all([
    getTodayKpis(now),
    listAppointmentsForPanel(
      istanbulDateTime(today, "00:00"),
      istanbulDateTime(addDays(today, 1), "00:00"),
    ),
    listPendingForPanel(now),
    getPanelOverview(),
  ]);
  const cards = [
    { label: "Bugünkü randevu", value: kpis.today },
    { label: "Onay bekleyen", value: kpis.pending },
    { label: "Bu hafta", value: kpis.week },
  ];

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-medium">Bugün</h1>
          <p className="text-muted-foreground">{formatDate(now, "withWeekday")}</p>
        </div>
        <Button asChild size="sm">
          <Link href="/panel/randevular/yeni">
            <CalendarPlus aria-hidden="true" />
            Elle randevu
          </Link>
        </Button>
      </div>

      <ul className="mt-6 grid grid-cols-3 gap-2 sm:gap-4">
        {cards.map((card) => (
          <li key={card.label} className="rounded-xl border bg-surface p-3 sm:p-5">
            <p className="text-xs font-semibold text-muted-foreground sm:text-sm">{card.label}</p>
            <p className="mt-1 font-display text-3xl tabular-nums sm:text-4xl">
              {formatNumber(card.value)}
            </p>
          </li>
        ))}
      </ul>

      <section aria-labelledby="bugun-ajanda" className="mt-8">
        <h2 id="bugun-ajanda" className="text-xl font-medium">
          Günün ajandası
        </h2>
        <div className="mt-3">
          <PanelAppointmentList items={agenda} empty="Bugün randevu yok." />
        </div>
      </section>

      <section aria-labelledby="onay-bekleyen" className="mt-8">
        <h2 id="onay-bekleyen" className="text-xl font-medium">
          Onay bekleyenler
        </h2>
        {pending.length === 0 ? (
          <p className="mt-3 rounded-xl border border-dashed bg-surface p-6 text-center text-sm text-muted-foreground">
            Onay bekleyen randevu yok.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {pending.map((item) => (
              <li
                key={item.id}
                className="flex flex-col gap-3 rounded-xl border bg-surface p-3 sm:flex-row sm:items-center"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold tabular-nums">
                    {formatDate(item.startsAt, "withWeekday")} {formatTime(item.startsAt)}
                  </p>
                  <p className="break-words">{item.customerName}</p>
                  <p className="text-sm text-muted-foreground">
                    {item.serviceName} · {item.code}
                  </p>
                </div>
                <div className="flex gap-2">
                  <form action={setAppointmentStatusForm}>
                    <input type="hidden" name="id" value={item.id} />
                    <input type="hidden" name="to" value="confirmed" />
                    <Button
                      type="submit"
                      size="sm"
                      aria-label={`Onayla: ${item.customerName} ${item.code}`}
                    >
                      Onayla
                    </Button>
                  </form>
                  <Button asChild size="sm" variant="outline">
                    <Link
                      href={`/panel/randevular/${item.id}`}
                      aria-label={`Aç: ${item.customerName} ${item.code}`}
                    >
                      Aç
                    </Link>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="diger" className="mt-10">
        <h2 id="diger" className="text-xl font-medium">
          Diğer
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {overview.newLeads} yeni talep · {overview.outbox} demo kutusu mesajı
        </p>
        <nav aria-label="Bölümler" className="mt-3">
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
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
      </section>
    </>
  );
}
