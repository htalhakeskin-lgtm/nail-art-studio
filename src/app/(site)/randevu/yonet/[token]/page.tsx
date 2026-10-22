import { CalendarHeart, CheckCircle2, Clock, MessageCircle } from "lucide-react";
import type { Metadata, Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Sparkle } from "@/components/common/pastel-blobs";
import { Button } from "@/components/ui/button";
import {
  appointmentShareMessage,
  appointmentStatusLabels,
  describeAppointmentTime,
  getAppointmentByTokenHash,
  hashManageToken,
  isManageToken,
} from "@/features/booking";
import { formatWorkNumber } from "@/features/gallery";
import { getSiteSettings, whatsappHref } from "@/features/site";
import { formatDuration } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Personal page: rendered per request, never indexed, never cached by search engines. */
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

/**
 * SCR-007 / SCR-008 (UC-01 step 6, BR-RND-009): the confirmation screen and the visitor's own
 * appointment page behind the secret link. Unknown, malformed and expired links all look the
 * same: not found. Rescheduling and cancelling join in D-06.
 */
export default async function ManageAppointmentPage({
  params,
  searchParams,
}: PageProps<"/randevu/yonet/[token]">) {
  const [{ token }, { yeni }] = await Promise.all([params, searchParams]);
  const appointment = isManageToken(token)
    ? await getAppointmentByTokenHash(hashManageToken(token), new Date())
    : null;
  if (!appointment) notFound();
  const settings = await getSiteSettings();
  const isNew = yeni === "1";
  const share = appointmentShareMessage(settings.contact.whatsappMessage, appointment);
  const duration = Math.round(
    (appointment.endsAt.getTime() - appointment.startsAt.getTime()) / 60_000,
  );

  return (
    <section className="container-page section-y">
      <div className="mx-auto max-w-xl">
        {isNew && (
          <div className="text-center">
            <CheckCircle2 aria-hidden="true" className="mx-auto size-12 text-success" />
            <h1 className="mt-4 text-4xl font-medium tracking-tight md:text-5xl">
              {appointment.status === "confirmed" ? "Randevunuz alındı" : "Talebiniz alındı"}
              <Sparkle className="ml-2 inline size-6 text-primary" />
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              {appointment.status === "confirmed"
                ? "Sizi bekliyoruz. Bu sayfanın bağlantısını saklayın; randevunuzu buradan görebilirsiniz."
                : "Onayladığımızda WhatsApp'tan haber vereceğiz. Bu sayfanın bağlantısını saklayın."}
            </p>
          </div>
        )}
        {!isNew && <h1 className="text-4xl font-medium tracking-tight md:text-5xl">Randevunuz</h1>}

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
              <dd className="font-semibold tabular-nums">
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

        <div className="mt-6 flex flex-col gap-3">
          <Button asChild size="lg">
            <a href={whatsappHref(settings, share)}>
              <MessageCircle aria-hidden="true" />
              WhatsApp&apos;tan ilet
            </a>
          </Button>
          <p className="text-sm text-muted-foreground">
            Değişiklik ya da iptal için WhatsApp&apos;tan yazabilirsiniz. Ayrıntılar:{" "}
            <Link
              href="/randevu-kosullari"
              className="font-semibold text-brand underline underline-offset-2"
            >
              Randevu ve İptal Koşulları
            </Link>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
