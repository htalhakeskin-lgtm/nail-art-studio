import { Check, MessageCircle } from "lucide-react";
import type { Metadata, Route } from "next";
import Image from "next/image";
import Link from "next/link";

import { Breadcrumbs } from "@/components/common/breadcrumbs";
import { PastelBlobs } from "@/components/common/pastel-blobs";
import { Button } from "@/components/ui/button";
import {
  addDays,
  DayStrip,
  daysWithAvailability,
  getAvailabilityContext,
  getBookableStaff,
  istanbulClock,
  istanbulDate,
  istanbulDateTime,
  serviceSlugForWork,
  slotsForDay,
  TimeGrid,
} from "@/features/booking";
import { AppointmentForm } from "@/features/booking/forms";
import { formatWorkNumber, listPublishedGalleryItems } from "@/features/gallery";
import {
  listActiveServices,
  serviceBookingMessage,
  serviceCategories,
  serviceCategoryLabels,
} from "@/features/services";
import { getSiteSettings, whatsappHref } from "@/features/site";
import { formatDate, formatDuration } from "@/lib/format";
import { pageMetadata } from "@/lib/seo";

/** Live availability on every request; the whole page depends on the chosen service and day. */
export const instant = false;

export const metadata: Metadata = pageMetadata({
  title: "Online randevu",
  description:
    "Hizmeti seçin, boş günü ve saati görün, randevu talebinizi bir dakikada gönderin. Kadıköy Moda, Nail Art Studios.",
  path: "/randevu",
});

type Params = { hizmet?: string; tasarim?: string; tarih?: string; saat?: string };

function href(params: Params, anchor?: string): Route {
  const query = new URLSearchParams(
    Object.entries(params).filter((entry): entry is [string, string] => Boolean(entry[1])),
  ).toString();
  return `/randevu${query ? `?${query}` : ""}${anchor ? `#${anchor}` : ""}` as Route;
}

const one = (value: string | string[] | undefined) =>
  typeof value === "string" ? value : undefined;

/**
 * SCR-006 (UC-01, UC-02, REQ-001, REQ-011): service → day → time → details, each step a plain
 * link that keeps the earlier choices in the URL, so the flow works without JavaScript and
 * every step is computed from live availability. Only free times are ever offered (K-35).
 */
export default async function BookingPage({ searchParams }: PageProps<"/randevu">) {
  const query = await searchParams;
  const [settings, allServices, works, expert] = await Promise.all([
    getSiteSettings(),
    listActiveServices(),
    listPublishedGalleryItems(),
    getBookableStaff(),
  ]);
  const bookable = allServices.filter((service) => service.isBookable);
  const work = works.find((item) => item.slug === one(query.tasarim));
  const serviceSlug = one(query.hizmet) ?? (work ? serviceSlugForWork(work) : undefined);
  const service = bookable.find((item) => item.slug === serviceSlug);
  const base: Params = { hizmet: service?.slug, tasarim: work?.slug };

  const now = new Date();
  const today = istanbulDate(now);
  const context =
    service && expert
      ? await getAvailabilityContext(
          expert.id,
          now,
          istanbulDateTime(addDays(today, settings.booking.horizonDays + 1), "00:00"),
          now,
        )
      : null;
  const days = context && service ? daysWithAvailability(context, service.durationMinutes) : [];
  const chosenDate = days.find((day) => day.date === one(query.tarih) && day.slots > 0)?.date;
  const slots =
    context && service && chosenDate
      ? slotsForDay(context, chosenDate, service.durationMinutes).map((start) => ({
          start,
          clock: istanbulClock(start),
        }))
      : [];
  const chosenSlot = slots.find((slot) => slot.clock === one(query.saat));
  const asked = one(query.saat);

  return (
    <>
      <section className="relative isolate overflow-hidden">
        <PastelBlobs className="opacity-70" />
        <div className="container-page pt-8 pb-8 md:pt-12">
          <Breadcrumbs items={[{ label: "Randevu", href: "/randevu" }]} />
          <h1 className="mt-8 text-4xl font-medium tracking-tight md:text-6xl">Online randevu</h1>
          <p className="mt-4 max-w-prose text-lg text-muted-foreground">
            {settings.booking.mode === "request"
              ? "Hizmeti, günü ve saati seçin; talebinizi aldığımızda onaylayıp WhatsApp'tan haber veririz."
              : "Hizmeti, günü ve saati seçin; boş saat seçtiğinizde randevunuz hemen kesinleşir."}
          </p>
        </div>
      </section>

      <div className="container-page max-w-4xl space-y-10 pb-(--section-y)">
        {work && (
          <aside
            aria-label="Referans tasarım"
            className="flex items-center gap-4 rounded-[1.5rem] bg-surface p-3 shadow-glow"
          >
            <Image
              src={work.imagePath}
              width={work.imageWidth}
              height={work.imageHeight}
              alt=""
              sizes="5rem"
              className="h-24 w-20 shrink-0 rounded-[1rem] object-cover"
            />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-brand tabular-nums">
                Referans tasarım · {formatWorkNumber(work.number)}
              </p>
              <p className="font-display text-lg break-words">{work.title}</p>
              <Link
                href={href({ ...base, tasarim: undefined })}
                className="inline-flex min-h-11 items-center text-sm font-semibold underline-offset-4 hover:underline"
              >
                Referansı kaldır
              </Link>
            </div>
          </aside>
        )}

        {/* 1 · Service */}
        <section aria-labelledby="adim-hizmet">
          <h2 id="adim-hizmet" className="text-2xl font-medium md:text-3xl">
            1. Hizmet
          </h2>
          {service ? (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-[1.25rem] bg-surface-muted p-4">
              <p>
                <span className="inline-flex items-center gap-2 font-semibold">
                  <Check aria-hidden="true" className="size-4 text-success" />
                  {service.name}
                </span>
                <span className="block text-sm text-muted-foreground">
                  Yaklaşık {formatDuration(service.durationMinutes)}
                </span>
              </p>
              <Button asChild variant="outline" size="sm">
                {/* "sec" matches no service, so the list opens even when a reference work implies one. */}
                <Link href={href({ tasarim: work?.slug, hizmet: "sec" })}>Değiştir</Link>
              </Button>
            </div>
          ) : (
            <div className="mt-4 space-y-6">
              {bookable.length === 0 && (
                <p className="rounded-[1.5rem] border border-dashed bg-surface p-6 text-center">
                  Online randevu şu an kapalı. WhatsApp&apos;tan yazabilirsiniz.
                </p>
              )}
              {serviceCategories.map((category) => {
                const group = bookable.filter((item) => item.category === category);
                if (group.length === 0) return null;
                return (
                  <div key={category}>
                    <h3 className="font-sans text-sm font-bold">
                      {serviceCategoryLabels[category]}
                    </h3>
                    <ul className="mt-2 grid gap-2 sm:grid-cols-2">
                      {group.map((item) => (
                        <li key={item.id}>
                          <Link
                            href={href({ ...base, hizmet: item.slug }, "adim-gun")}
                            className="flex min-h-14 items-center justify-between gap-3 rounded-[1.25rem] border bg-surface px-4 py-3 hover:bg-surface-muted"
                          >
                            <span className="font-semibold break-words">{item.name}</span>
                            <span className="shrink-0 text-sm text-muted-foreground">
                              {formatDuration(item.durationMinutes)}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
              <p className="text-sm text-muted-foreground">
                Özel tasarım danışmanlığı gibi bazı hizmetler online randevuya kapalıdır;{" "}
                <a
                  href={whatsappHref(settings)}
                  className="font-semibold text-brand underline underline-offset-2"
                >
                  WhatsApp&apos;tan yazın
                </a>
                .
              </p>
            </div>
          )}
        </section>

        {/* 2 · Day */}
        {service && (
          <section aria-labelledby="adim-gun" className="scroll-mt-24">
            <h2 id="adim-gun" className="text-2xl font-medium md:text-3xl">
              2. Gün
            </h2>
            {days.every((day) => day.slots === 0) ? (
              <div className="mt-4 rounded-[1.5rem] border border-dashed bg-surface p-6 text-center">
                <p className="font-semibold">Önümüzdeki günlerde bu hizmet için boş saat yok.</p>
                <Button asChild className="mt-4">
                  <a
                    href={whatsappHref(
                      settings,
                      serviceBookingMessage(settings.contact.whatsappMessage, service),
                    )}
                  >
                    <MessageCircle aria-hidden="true" />
                    WhatsApp&apos;tan sorun
                  </a>
                </Button>
              </div>
            ) : (
              <DayStrip
                days={days}
                today={today}
                chosen={chosenDate}
                hrefFor={(date) => href({ ...base, tarih: date }, "adim-saat")}
              />
            )}
          </section>
        )}

        {/* 3 · Time */}
        {service && chosenDate && (
          <section aria-labelledby="adim-saat" className="scroll-mt-24">
            <h2 id="adim-saat" className="text-2xl font-medium md:text-3xl">
              3. Saat
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatDate(new Date(`${chosenDate}T12:00:00Z`), "withWeekday")} · yalnızca boş
              saatler
            </p>
            {asked && !chosenSlot && (
              <p
                role="alert"
                className="mt-3 rounded-lg bg-warning-muted px-4 py-3 text-sm font-semibold text-warning"
              >
                Seçtiğiniz saat artık boş değil. Lütfen başka bir saat seçin.
              </p>
            )}
            <TimeGrid
              slots={slots}
              chosen={chosenSlot?.clock}
              hrefFor={(clock) => href({ ...base, tarih: chosenDate, saat: clock }, "adim-bilgi")}
            />
          </section>
        )}

        {/* 4 · Details */}
        {service && chosenSlot && (
          <section
            aria-labelledby="adim-bilgi"
            className="scroll-mt-24 rounded-[1.75rem] bg-surface p-5 shadow-glow md:p-8"
          >
            <h2 id="adim-bilgi" className="text-2xl font-medium md:text-3xl">
              4. Bilgileriniz
            </h2>
            <div className="mt-5">
              <AppointmentForm
                serviceId={service.id}
                serviceName={service.name}
                startsAt={chosenSlot.start.toISOString()}
                {...(work ? { referenceWork: work.slug } : {})}
                instant={settings.booking.mode === "instant"}
              />
            </div>
          </section>
        )}
      </div>
    </>
  );
}
