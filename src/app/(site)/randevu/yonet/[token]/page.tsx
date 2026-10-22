import {
  CalendarClock,
  CalendarHeart,
  CalendarPlus,
  CheckCircle2,
  Clock,
  MessageCircle,
  Phone,
  RefreshCw,
  XCircle,
} from "lucide-react";
import type { Metadata, Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";

import { Sparkle } from "@/components/common/pastel-blobs";
import { TrackEvent } from "@/components/common/site-analytics";
import { Button } from "@/components/ui/button";
import {
  addDays,
  appointmentEvent,
  appointmentShareMessage,
  appointmentStatusLabels,
  canSelfManage,
  DayStrip,
  daysWithAvailability,
  describeAppointmentTime,
  getAppointmentByTokenHash,
  getAvailabilityContext,
  getBookableStaff,
  googleCalendarUrl,
  hashManageToken,
  isManageToken,
  istanbulClock,
  istanbulDate,
  istanbulDateTime,
  refillDate,
  slotsForDay,
  TimeGrid,
} from "@/features/booking";
import { CancelForm, RescheduleForm } from "@/features/booking/forms";
import { formatWorkNumber } from "@/features/gallery";
import { getSiteSettings, phoneHref, whatsappHref } from "@/features/site";
import { formatDate, formatDuration } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Personal page: rendered per request, never indexed. */
export const instant = false;

export const metadata: Metadata = {
  title: "Randevunuz",
  robots: { index: false, follow: false },
};

const statusTone = {
  pending: "bg-warning-muted text-warning",
  confirmed: "bg-success-muted text-success",
  completed: "bg-surface-muted text-muted-foreground",
  no_show: "bg-surface-muted text-muted-foreground",
  cancelled: "bg-danger-muted text-danger",
} as const;

const one = (value: string | string[] | undefined) =>
  typeof value === "string" ? value : undefined;

/**
 * SCR-007 / SCR-008 (UC-01 step 6, UC-03, BR-RND-007, 009, 012, 013): the confirmation screen
 * and the visitor's own appointment page behind the secret link — details, calendar files,
 * reschedule and cancel until P-05 hours before, refill reminder. Unknown, malformed and
 * expired links all look the same: not found.
 */
export default async function ManageAppointmentPage({
  params,
  searchParams,
}: PageProps<"/randevu/yonet/[token]">) {
  const [{ token }, query] = await Promise.all([params, searchParams]);
  await connection(); // "now" is the request time, never a prefetch or build time
  const now = new Date();
  const appointment = isManageToken(token)
    ? await getAppointmentByTokenHash(hashManageToken(token), now)
    : null;
  if (!appointment) notFound();
  const settings = await getSiteSettings();
  const base = `/randevu/yonet/${token}`;
  const isNew = one(query.yeni) === "1";
  const result = one(query.sonuc);
  const action = one(query.islem);
  const manageable = canSelfManage(appointment, now, settings.booking.manageCutoffHours);
  const active = appointment.status === "pending" || appointment.status === "confirmed";
  const share = appointmentShareMessage(settings.contact.whatsappMessage, appointment);
  const duration = Math.round(
    (appointment.endsAt.getTime() - appointment.startsAt.getTime()) / 60_000,
  );
  const event = appointmentEvent(appointment, settings, token);
  const refill = refillDate(appointment.startsAt, appointment.refillIntervalDays);

  // Reschedule (UC-03): the same day strip and time grid as booking, own slot freed.
  let reschedule: {
    days: ReturnType<typeof daysWithAvailability>;
    date?: string;
    slots: { start: Date; clock: string }[];
    chosen?: { start: Date; clock: string };
  } | null = null;
  if (manageable && action === "ertele") {
    const expert = await getBookableStaff();
    if (expert) {
      const until = istanbulDateTime(
        addDays(istanbulDate(now), settings.booking.horizonDays + 1),
        "00:00",
      );
      const context = await getAvailabilityContext(expert.id, now, until, now, appointment.id);
      const days = daysWithAvailability(context, duration);
      const date = days.find((day) => day.date === one(query.tarih) && day.slots > 0)?.date;
      const slots = date
        ? slotsForDay(context, date, duration).map((start) => ({
            start,
            clock: istanbulClock(start),
          }))
        : [];
      reschedule = {
        days,
        ...(date ? { date } : {}),
        slots,
        ...(slots.find((slot) => slot.clock === one(query.saat))
          ? { chosen: slots.find((slot) => slot.clock === one(query.saat)) }
          : {}),
      };
    }
  }

  return (
    <section className="container-page section-y">
      <div className="mx-auto max-w-xl">
        {isNew && (
          <div className="text-center">
            <TrackEvent name="booking_completed" />
            <CheckCircle2 aria-hidden="true" className="mx-auto size-12 text-success" />
            <h1 className="mt-4 text-4xl font-medium tracking-tight md:text-5xl">
              {appointment.status === "confirmed" ? "Randevunuz alındı" : "Talebiniz alındı"}
              <Sparkle className="ml-2 inline size-6 text-primary" />
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              {appointment.status === "confirmed"
                ? "Sizi bekliyoruz. Bu sayfanın bağlantısını saklayın; randevunuzu buradan yönetebilirsiniz."
                : "Onayladığımızda WhatsApp'tan haber vereceğiz. Bu sayfanın bağlantısını saklayın."}
            </p>
          </div>
        )}
        {!isNew && <h1 className="text-4xl font-medium tracking-tight md:text-5xl">Randevunuz</h1>}

        {result === "iptal" && (
          <p
            role="status"
            className="mt-6 rounded-lg bg-success-muted px-4 py-3 font-semibold text-success"
          >
            Randevunuz iptal edildi. Yeni bir randevu için randevu sayfasını kullanabilirsiniz.
          </p>
        )}
        {result === "erteleme" && (
          <p
            role="status"
            className="mt-6 rounded-lg bg-success-muted px-4 py-3 font-semibold text-success"
          >
            Randevunuz yeni saate taşındı.
            {appointment.status === "pending" && " Onayladığımızda WhatsApp'tan haber vereceğiz."}
          </p>
        )}

        <div className="mt-8 rounded-[1.75rem] bg-surface p-5 shadow-glow md:p-7">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-display text-2xl tabular-nums">{appointment.code}</p>
            <span
              className={cn(
                "rounded-full px-3 py-1 text-sm font-semibold",
                statusTone[appointment.status],
              )}
            >
              {appointmentStatusLabels[appointment.status]}
            </span>
          </div>
          <dl className="mt-5 space-y-3">
            <div>
              <dt className="text-xs font-bold text-muted-foreground">Hizmet</dt>
              <dd className="font-semibold">
                <Link
                  href={`/hizmetler/${appointment.serviceSlug}` as Route}
                  className="underline-offset-4 hover:underline"
                >
                  {appointment.serviceName}
                </Link>
              </dd>
            </div>
            <div>
              <dt className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground">
                <CalendarHeart aria-hidden="true" className="size-3.5" />
                Tarih ve saat
              </dt>
              <dd
                className={cn(
                  "font-semibold tabular-nums",
                  appointment.status === "cancelled" && "line-through",
                )}
              >
                {describeAppointmentTime(appointment.startsAt)}
              </dd>
            </div>
            <div>
              <dt className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground">
                <Clock aria-hidden="true" className="size-3.5" />
                Süre
              </dt>
              <dd className="font-semibold">Yaklaşık {formatDuration(duration)}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold text-muted-foreground">Adres</dt>
              <dd>{settings.company.address}</dd>
            </div>
          </dl>

          {appointment.reference && (
            <div className="mt-5 flex items-center gap-3 rounded-[1.25rem] bg-surface-muted p-3">
              <Image
                src={appointment.reference.imagePath}
                width={1064}
                height={1330}
                alt=""
                sizes="4rem"
                className="h-20 w-16 shrink-0 rounded-[0.9rem] object-cover"
              />
              <p className="min-w-0 text-sm">
                <span className="block font-semibold text-brand tabular-nums">
                  Referans tasarım · {formatWorkNumber(appointment.reference.number)}
                </span>
                <span className="block break-words">{appointment.reference.title}</span>
              </p>
            </div>
          )}
        </div>

        {active && (
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Button asChild size="lg">
              <a href={whatsappHref(settings, share)}>
                <MessageCircle aria-hidden="true" />
                WhatsApp&apos;tan ilet
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href={`${base}/takvim.ics`}>
                <CalendarPlus aria-hidden="true" />
                Takvime ekle
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href={googleCalendarUrl(event)} target="_blank" rel="noopener noreferrer">
                <CalendarPlus aria-hidden="true" />
                Google Takvim
                <span className="sr-only"> (yeni sekmede açılır)</span>
              </a>
            </Button>
          </div>
        )}

        {/* Reschedule / cancel (UC-03, BR-RND-007) */}
        {active && (
          <section aria-labelledby="degisiklik" className="mt-10">
            <h2 id="degisiklik" className="text-2xl font-medium">
              Değişiklik
            </h2>
            {manageable ? (
              <>
                <p className="mt-1 text-sm text-muted-foreground">
                  Randevunuzu başlangıcından {settings.booking.manageCutoffHours} saat öncesine
                  kadar buradan erteleyebilir ya da iptal edebilirsiniz.
                </p>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <Button asChild variant={action === "ertele" ? "default" : "outline"}>
                    <Link href={`${base}?islem=ertele#ertele` as Route}>
                      <CalendarClock aria-hidden="true" />
                      Ertele
                    </Link>
                  </Button>
                  <Button asChild variant={action === "iptal" ? "default" : "outline"}>
                    <Link href={`${base}?islem=iptal#iptal` as Route}>
                      <XCircle aria-hidden="true" />
                      İptal et
                    </Link>
                  </Button>
                </div>

                {action === "ertele" && reschedule && (
                  <div id="ertele" className="mt-6 scroll-mt-24">
                    <h3 className="text-xl font-medium">Yeni gün</h3>
                    <DayStrip
                      days={reschedule.days}
                      today={istanbulDate(now)}
                      chosen={reschedule.date}
                      hrefFor={(date) => `${base}?islem=ertele&tarih=${date}#yeni-saat` as Route}
                    />
                    {reschedule.date && (
                      <div id="yeni-saat" className="mt-6 scroll-mt-24">
                        <h3 className="text-xl font-medium">Yeni saat</h3>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(new Date(`${reschedule.date}T12:00:00Z`), "withWeekday")}
                        </p>
                        <TimeGrid
                          slots={reschedule.slots}
                          chosen={reschedule.chosen?.clock}
                          hrefFor={(clock) =>
                            `${base}?islem=ertele&tarih=${reschedule.date ?? ""}&saat=${clock}#onay` as Route
                          }
                        />
                      </div>
                    )}
                    {reschedule.chosen && (
                      <div
                        id="onay"
                        className="mt-6 scroll-mt-24 rounded-[1.25rem] bg-surface-muted p-4"
                      >
                        <p className="font-semibold">
                          Yeni saat: {describeAppointmentTime(reschedule.chosen.start)}
                        </p>
                        {settings.booking.mode === "request" && (
                          <p className="mt-1 text-sm text-muted-foreground">
                            Yeni saat de onayımızdan sonra kesinleşir.
                          </p>
                        )}
                        <div className="mt-3">
                          <RescheduleForm
                            token={token}
                            startsAt={reschedule.chosen.start.toISOString()}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {action === "iptal" && (
                  <div id="iptal" className="mt-6 scroll-mt-24 rounded-[1.25rem] border p-4">
                    <CancelForm token={token} />
                  </div>
                )}
              </>
            ) : (
              <div role="note" className="mt-3 rounded-[1.25rem] bg-warning-muted p-4 text-sm">
                <p className="font-semibold">
                  Randevunuza {settings.booking.manageCutoffHours} saatten az kaldığı için
                  değişiklik buradan yapılamıyor.
                </p>
                <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                  <Button asChild size="sm">
                    <a href={whatsappHref(settings, share)}>
                      <MessageCircle aria-hidden="true" />
                      WhatsApp&apos;tan yazın
                    </a>
                  </Button>
                  <Button asChild size="sm" variant="outline">
                    <a href={phoneHref(settings)}>
                      <Phone aria-hidden="true" />
                      Arayın
                    </a>
                  </Button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Refill reminder (PRJ-03, REQ-012, BR-RND-013) */}
        {refill && appointment.status !== "cancelled" && (
          <section
            aria-labelledby="yenileme"
            className="mt-10 rounded-[1.5rem] bg-linear-to-br from-accent via-surface-muted to-nane p-5"
          >
            <h2 id="yenileme" className="inline-flex items-center gap-2 text-xl font-medium">
              <RefreshCw aria-hidden="true" className="size-5 text-brand" />
              Yenileme zamanı
            </h2>
            <p className="mt-2 text-sm">
              Bu hizmet için önerilen yenileme tarihi:{" "}
              <strong>{formatDate(new Date(`${refill}T12:00:00Z`), "withWeekday")}</strong>
            </p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <Button asChild size="sm" variant="outline">
                <a href={`${base}/yenileme.ics`}>
                  <CalendarPlus aria-hidden="true" />
                  Yenileme tarihini takvimime ekle
                </a>
              </Button>
              <Button asChild size="sm" variant="outline">
                <Link href={`/randevu?hizmet=${appointment.serviceSlug}#adim-gun` as Route}>
                  Aynı hizmetten tekrar randevu al
                </Link>
              </Button>
            </div>
          </section>
        )}

        <p className="mt-8 text-sm text-muted-foreground">
          Koşullar:{" "}
          <Link
            href="/randevu-kosullari"
            className="font-semibold text-brand underline underline-offset-2"
          >
            Randevu ve İptal Koşulları
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
