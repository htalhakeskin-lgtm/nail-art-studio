import { Trash2 } from "lucide-react";
import type { Metadata } from "next";

import { Button } from "@/components/ui/button";
import { ruleMessages } from "@/config/rules";
import {
  addDays,
  deleteTimeOffForm,
  getAvailabilityContext,
  getBookableStaff,
  istanbulClock,
  istanbulDate,
  istanbulDateTime,
  listUpcomingTimeOff,
  nextSlots,
  timeOffKindLabels,
  WEEKDAYS,
} from "@/features/booking";
import { BookingRulesForm, TimeOffForm, WeeklyHoursForm } from "@/features/booking/forms";
import { getSiteSettings } from "@/features/site";
import { formatDate, formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Müsaitlik" };

/** Whole days read as "3 Kasım 2026 · tüm gün"; partial closures keep their times. */
function describeClosure(start: Date, end: Date): string {
  const wholeDays = istanbulClock(start) === "00:00" && istanbulClock(end) === "00:00";
  if (!wholeDays) return `${formatDateTime(start)} – ${formatDateTime(end)}`;
  const lastDay = istanbulDateTime(addDays(istanbulDate(end), -1), "12:00");
  return istanbulDate(start) === istanbulDate(lastDay)
    ? `${formatDate(start)} · tüm gün`
    : `${formatDate(start)} – ${formatDate(lastDay)} · tüm gün`;
}

const savedMessages: Record<string, string> = {
  saatler: "Çalışma saatleri kaydedildi. Site ve randevu takvimi güncellendi.",
  kapali: "Kapalı zaman eklendi. Bu aralık randevuya kapandı.",
  silindi: "Kapalı zaman silindi.",
  kurallar: "Randevu kuralları kaydedildi.",
};

/** SCR-104 (A-16, BR-RND-001…005): weekly hours, closures, booking rules and a live preview. */
export default async function AvailabilityPage({ searchParams }: PageProps<"/panel/musaitlik">) {
  const [{ kaydedildi, hata }, settings, expert] = await Promise.all([
    searchParams,
    getSiteSettings(),
    getBookableStaff(),
  ]);
  const now = new Date();
  const today = istanbulDate(now);
  const saved = typeof kaydedildi === "string" ? savedMessages[kaydedildi] : undefined;
  const error =
    typeof hata === "string"
      ? hata in ruleMessages
        ? ruleMessages[hata as keyof typeof ruleMessages]
        : "İşlem tamamlanamadı. Sayfayı yenileyip tekrar deneyin."
      : undefined;

  const [closures, preview] = expert
    ? await Promise.all([
        listUpcomingTimeOff(expert.id, now),
        getAvailabilityContext(
          expert.id,
          now,
          istanbulDateTime(addDays(today, settings.booking.horizonDays + 1), "00:00"),
          now,
        ).then((context) => nextSlots(context, 60, 5)),
      ])
    : [[], []];

  const weekly = settings.openingHours.weekly;
  const hours = {
    days: WEEKDAYS.map((day) => {
      const [range] = weekly[day];
      return {
        day,
        open: Boolean(range),
        opens: range?.[0] ?? "10:00",
        closes: range?.[1] ?? "20:00",
      };
    }),
  };
  const rules = {
    ...settings.booking,
    bufferMinutes: String(settings.booking.bufferMinutes),
    slotStepMinutes: String(settings.booking.slotStepMinutes),
    minLeadHours: String(settings.booking.minLeadHours),
    horizonDays: String(settings.booking.horizonDays),
    manageCutoffHours: String(settings.booking.manageCutoffHours),
    maxFuturePerPhone: String(settings.booking.maxFuturePerPhone),
  };

  return (
    <>
      <h1 className="text-3xl font-medium">Müsaitlik</h1>
      <p className="mt-2 max-w-prose text-muted-foreground">
        Çalışma saatleri, izin ve tatiller ile randevu kuralları. Site yalnızca bu kurallara uyan
        boş saatleri gösterir.
      </p>
      {saved && (
        <p
          role="status"
          className="mt-4 rounded-lg bg-success-muted px-4 py-3 font-semibold text-success"
        >
          {saved}
        </p>
      )}
      {error && (
        <p
          role="alert"
          className="mt-4 rounded-lg bg-danger-muted px-4 py-3 font-semibold text-danger"
        >
          {error}
        </p>
      )}

      <section aria-labelledby="onizleme" className="mt-6 rounded-xl bg-surface-muted p-4">
        <h2 id="onizleme" className="font-sans text-sm font-bold">
          Sitede görünen en yakın boş saatler (1 saatlik hizmet)
        </h2>
        {preview.length === 0 ? (
          <p className="mt-2 text-sm text-muted-foreground">
            Önümüzdeki günlerde boş saat yok. Çalışma saatlerini ve kapalı zamanları kontrol edin.
          </p>
        ) : (
          <ul className="mt-2 flex flex-wrap gap-2 text-sm">
            {preview.map((slot) => (
              <li
                key={slot.toISOString()}
                className="rounded-full bg-surface px-3 py-1 font-semibold tabular-nums"
              >
                {formatDateTime(slot)}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="calisma-saatleri" className="mt-10">
        <h2 id="calisma-saatleri" className="text-xl font-medium">
          Çalışma saatleri
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Sitenin alt bilgisinde, iletişim sayfasında ve randevu takviminde aynı saatler kullanılır.
        </p>
        <div className="mt-4">
          <WeeklyHoursForm initial={hours} />
        </div>
      </section>

      <section aria-labelledby="kapali-zamanlar" className="mt-10">
        <h2 id="kapali-zamanlar" className="text-xl font-medium">
          İzin, tatil ve bloklar
        </h2>
        {closures.length === 0 ? (
          <p className="mt-3 rounded-xl border border-dashed bg-surface p-6 text-center text-sm text-muted-foreground">
            Yaklaşan kapalı zaman yok.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {closures.map((closure) => (
              <li
                key={closure.id}
                className="flex flex-col gap-2 rounded-xl border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="font-semibold">
                    {timeOffKindLabels[closure.kind]}
                    {closure.note && <span className="font-normal"> · {closure.note}</span>}
                  </p>
                  <p className="text-sm text-muted-foreground tabular-nums">
                    {describeClosure(closure.startsAt, closure.endsAt)}
                  </p>
                </div>
                <form action={deleteTimeOffForm}>
                  <input type="hidden" name="id" value={closure.id} />
                  <Button
                    type="submit"
                    variant="ghost"
                    size="sm"
                    aria-label={`Sil: ${timeOffKindLabels[closure.kind]} ${formatDateTime(closure.startsAt)}`}
                  >
                    <Trash2 aria-hidden="true" />
                    Sil
                  </Button>
                </form>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4 rounded-xl border bg-surface p-4">
          <h3 className="font-sans text-sm font-bold">Yeni kapalı zaman</h3>
          <div className="mt-3">
            <TimeOffForm today={today} />
          </div>
        </div>
      </section>

      <section aria-labelledby="randevu-kurallari" className="mt-10">
        <h2 id="randevu-kurallari" className="text-xl font-medium">
          Randevu kuralları
        </h2>
        <div className="mt-4 rounded-xl border bg-surface p-4">
          <BookingRulesForm initial={rules} />
        </div>
      </section>
    </>
  );
}
