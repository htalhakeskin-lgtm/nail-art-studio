import { Link2, Mail, MessageCircle, Phone } from "lucide-react";
import type { Metadata, Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";

import { Breadcrumbs } from "@/components/common/panel-breadcrumbs";
import { PhoneLink } from "@/components/common/phone-link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ruleMessages } from "@/config/rules";
import {
  appointmentStatusLabels,
  appointmentStatusTone,
  describeAppointmentTime,
  getAppointmentForPanel,
  nextStatuses,
  setAppointmentStatusForm,
  shareManageLinkForm,
  type TemplateKey,
  templateLabels,
  whatsappTemplate,
} from "@/features/booking";
import { formatWorkNumber } from "@/features/gallery";
import { getSiteSettings } from "@/features/site";
import { formatDateTime, formatDuration } from "@/lib/format";
import { whatsappLink } from "@/lib/phone";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Randevu" };

const savedMessages: Record<string, string> = {
  confirmed: "Randevu onaylandı. WhatsApp'tan haber vermeyi unutmayın.",
  completed: "Randevu tamamlandı olarak işaretlendi.",
  no_show: "Randevu “Gelmedi” olarak işaretlendi.",
  cancelled: "Randevu iptal edildi; saat yeniden boş.",
  olusturuldu: "Randevu kaydedildi ve onaylandı.",
};

const actionLabels = {
  confirmed: "Onayla",
  completed: "Tamamlandı",
  no_show: "Gelmedi",
  cancelled: "İptal et",
  pending: "Bekliyor",
} as const;

const historyLabels: Record<string, string> = {
  "appointment.create": "Panelden oluşturuldu",
  "appointment.confirmed": "Onaylandı",
  "appointment.completed": "Tamamlandı",
  "appointment.no_show": "Gelmedi olarak işaretlendi",
  "appointment.cancelled": "Panelden iptal edildi",
  "appointment.cancel": "Müşteri iptal etti",
  "appointment.reschedule": "Müşteri erteledi",
  "appointment.link_shared": "Yönetim bağlantısı gönderildi",
};

/** SCR-103 (UC-04, REQ-003b, REQ-005c): one appointment, its actions and WhatsApp templates. */
export default async function AppointmentDetailPage({
  params,
  searchParams,
}: PageProps<"/panel/randevular/[id]">) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  // Unknown or malformed ids look the same: not found (11-guvenlik: no existence leaks).
  const appointment = z.uuid().safeParse(id).success ? await getAppointmentForPanel(id) : null;
  if (!appointment) notFound();
  const settings = await getSiteSettings();
  const saved = typeof query.kaydedildi === "string" ? savedMessages[query.kaydedildi] : undefined;
  const error =
    typeof query.hata === "string"
      ? query.hata in ruleMessages
        ? ruleMessages[query.hata as keyof typeof ruleMessages]
        : "İşlem tamamlanamadı. Sayfayı yenileyip tekrar deneyin."
      : undefined;
  const duration = Math.round(
    (appointment.endsAt.getTime() - appointment.startsAt.getTime()) / 60_000,
  );
  const active = appointment.status === "pending" || appointment.status === "confirmed";
  const template = (key: TemplateKey) =>
    whatsappLink(
      appointment.customerPhone,
      whatsappTemplate(key, {
        customerName: appointment.customerName,
        companyName: settings.company.name,
        serviceName: appointment.serviceName,
        code: appointment.code,
        startsAt: appointment.startsAt,
        address: settings.company.address,
        manageUrl: null,
      }),
    );
  const transitions = nextStatuses(appointment.status).filter((status) => status !== "cancelled");

  return (
    <>
      <Breadcrumbs
        items={[{ label: "Randevular", href: "/panel/randevular" }]}
        current={appointment.code}
      />
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-medium break-words">{appointment.customerName}</h1>
        <span
          className={cn(
            "rounded-full px-3 py-1 text-sm font-semibold",
            appointmentStatusTone[appointment.status],
          )}
        >
          {appointmentStatusLabels[appointment.status]}
        </span>
      </div>
      <p className="mt-1 text-sm text-muted-foreground tabular-nums">
        {appointment.code} · {appointment.source === "admin" ? "panelden" : "online"} · oluşturuldu{" "}
        {formatDateTime(appointment.createdAt)}
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

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <section aria-labelledby="randevu-bilgi" className="rounded-xl border bg-surface p-5">
          <h2 id="randevu-bilgi" className="font-sans text-sm font-bold">
            Randevu
          </h2>
          <dl className="mt-3 grid gap-3 sm:grid-cols-2">
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
              <dt className="text-xs font-bold text-muted-foreground">Tarih</dt>
              <dd className="font-semibold tabular-nums">
                {describeAppointmentTime(appointment.startsAt)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-bold text-muted-foreground">Süre</dt>
              <dd>{formatDuration(duration)}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold text-muted-foreground">Telefon</dt>
              <dd>
                <PhoneLink
                  e164={appointment.customerPhone}
                  className="inline-flex min-h-11 items-center underline-offset-4 hover:underline lg:min-h-0"
                />
              </dd>
            </div>
            {appointment.customerEmail && (
              <div className="sm:col-span-2">
                <dt className="text-xs font-bold text-muted-foreground">E-posta</dt>
                <dd className="break-all">{appointment.customerEmail}</dd>
              </div>
            )}
            {appointment.note && (
              <div className="sm:col-span-2">
                <dt className="text-xs font-bold text-muted-foreground">Not</dt>
                <dd className="break-words whitespace-pre-line">{appointment.note}</dd>
              </div>
            )}
            {appointment.cancelReason && (
              <div className="sm:col-span-2">
                <dt className="text-xs font-bold text-muted-foreground">İptal nedeni</dt>
                <dd className="break-words">{appointment.cancelReason}</dd>
              </div>
            )}
          </dl>
          {appointment.reference && (
            <div className="mt-4 flex items-center gap-3 rounded-xl bg-surface-muted p-3">
              <Image
                src={appointment.reference.imagePath}
                width={1064}
                height={1330}
                alt=""
                sizes="4rem"
                className="h-20 w-16 shrink-0 rounded-lg object-cover"
              />
              <p className="min-w-0 text-sm">
                <span className="block font-semibold text-brand">
                  Referans tasarım · {formatWorkNumber(appointment.reference.number)}
                </span>
                <Link
                  href={`/galeri/${appointment.reference.slug}` as Route}
                  className="break-words underline-offset-4 hover:underline"
                >
                  {appointment.reference.title}
                </Link>
              </p>
            </div>
          )}
        </section>

        <div className="space-y-6">
          {active && (
            <section aria-labelledby="islemler" className="rounded-xl border bg-surface p-5">
              <h2 id="islemler" className="font-sans text-sm font-bold">
                Durum
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {transitions.map((status) => (
                  <form key={status} action={setAppointmentStatusForm}>
                    <input type="hidden" name="id" value={appointment.id} />
                    <input type="hidden" name="to" value={status} />
                    <Button
                      type="submit"
                      size="sm"
                      variant={status === "confirmed" ? "default" : "outline"}
                    >
                      {actionLabels[status]}
                    </Button>
                  </form>
                ))}
              </div>
              <form action={setAppointmentStatusForm} className="mt-4 space-y-2 border-t pt-4">
                <input type="hidden" name="id" value={appointment.id} />
                <input type="hidden" name="to" value="cancelled" />
                <label htmlFor="iptal-nedeni" className="text-sm font-semibold">
                  İptal nedeni (isteğe bağlı)
                </label>
                <Textarea id="iptal-nedeni" name="reason" rows={2} maxLength={300} />
                <Button type="submit" size="sm" variant="destructive">
                  Randevuyu iptal et
                </Button>
              </form>
            </section>
          )}

          <section aria-labelledby="whatsapp" className="rounded-xl border bg-surface p-5">
            <h2 id="whatsapp" className="font-sans text-sm font-bold">
              WhatsApp
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Mesaj müşterinin numarasıyla hazır açılır; göndermeden önce düzenleyebilirsiniz.
            </p>
            <div className="mt-3 flex flex-col gap-2">
              {(["confirm", "reminder", "change"] as const).map((key) => (
                <Button
                  key={key}
                  asChild
                  size="sm"
                  variant={key === "confirm" ? "default" : "outline"}
                >
                  <a href={template(key)}>
                    <MessageCircle aria-hidden="true" />
                    {templateLabels[key]}
                  </a>
                </Button>
              ))}
              {active && (
                <form action={shareManageLinkForm}>
                  <input type="hidden" name="id" value={appointment.id} />
                  <Button type="submit" size="sm" variant="outline" className="w-full">
                    <Link2 aria-hidden="true" />
                    Yönetim bağlantısını gönder
                  </Button>
                </form>
              )}
              {active && (
                <p className="text-xs text-muted-foreground">
                  Bağlantı her gönderimde yenilenir; eski bağlantı çalışmaz.
                </p>
              )}
              <div className="flex gap-2">
                <Button asChild size="sm" variant="ghost">
                  <a href={`tel:${appointment.customerPhone}`}>
                    <Phone aria-hidden="true" />
                    Ara
                  </a>
                </Button>
                {appointment.customerEmail && (
                  <Button asChild size="sm" variant="ghost">
                    <a
                      href={`mailto:${appointment.customerEmail}?subject=${encodeURIComponent(`Randevunuz: ${appointment.code}`)}`}
                    >
                      <Mail aria-hidden="true" />
                      E-posta
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </section>

          <section aria-labelledby="gecmis" className="rounded-xl border bg-surface p-5 text-sm">
            <h2 id="gecmis" className="font-sans text-sm font-bold">
              Geçmiş
            </h2>
            <ul className="mt-2 space-y-1">
              {appointment.history.map((entry) => (
                <li key={`${entry.action}-${entry.createdAt.toISOString()}`}>
                  {historyLabels[entry.action] ?? entry.action} · {formatDateTime(entry.createdAt)}
                </li>
              ))}
              <li className="text-muted-foreground">
                Oluşturuldu · {formatDateTime(appointment.createdAt)}
              </li>
            </ul>
          </section>
        </div>
      </div>
    </>
  );
}
