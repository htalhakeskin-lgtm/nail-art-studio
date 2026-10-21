import { Mail, MessageCircle, Phone } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Breadcrumbs } from "@/components/common/panel-breadcrumbs";
import { PhoneLink } from "@/components/common/phone-link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ruleMessages } from "@/config/rules";
import {
  getLeadForPanel,
  leadStatuses,
  leadStatusLabels,
  markLeadRead,
  preferredChannelLabel,
  saveLeadNoteForm,
  updateLeadStatusForm,
} from "@/features/leads";
import { getSiteSettings } from "@/features/site";
import { formatDateTime } from "@/lib/format";
import { whatsappLink } from "@/lib/phone";

export const metadata: Metadata = { title: "Talep" };

const savedMessages: Record<string, string> = {
  durum: "Durum güncellendi.",
  not: "Not kaydedildi.",
};

const channelLabels: Record<string, string> = {
  email: "E-posta",
  sms: "SMS",
  whatsapp: "WhatsApp",
};

/** One request: message, contact actions (WhatsApp reply with greeting), status, note, history. */
export default async function LeadDetailPage({
  params,
  searchParams,
}: PageProps<"/panel/talepler/[id]">) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const uuid = /^[0-9a-f-]{36}$/i.test(id) ? id : null;
  const found = uuid ? await getLeadForPanel(uuid) : null;
  if (!found) notFound();
  const { lead, consents, messages } = found;
  if (!lead.readAt) await markLeadRead(lead.id, new Date());

  const settings = await getSiteSettings();
  const saved = typeof query.kaydedildi === "string" ? savedMessages[query.kaydedildi] : undefined;
  const error =
    typeof query.hata === "string"
      ? query.hata in ruleMessages
        ? ruleMessages[query.hata as keyof typeof ruleMessages]
        : "İşlem tamamlanamadı."
      : undefined;
  const reply = `Merhaba, ${settings.company.name} olarak ${lead.code} numaralı mesajınız için yazıyoruz.`;

  return (
    <>
      <Breadcrumbs items={[{ label: "Talepler", href: "/panel/talepler" }]} current={lead.code} />
      <h1 className="mt-4 text-3xl font-medium break-words">{lead.name}</h1>
      <p className="mt-1 text-sm text-muted-foreground tabular-nums">
        {lead.code} · {formatDateTime(lead.createdAt)}
        {lead.sourcePath && ` · Sayfa: ${lead.sourcePath}`}
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

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section aria-labelledby="mesaj" className="rounded-xl border bg-surface p-5">
          <h2 id="mesaj" className="font-sans text-sm font-bold">
            Mesaj
          </h2>
          <p className="mt-2 break-words whitespace-pre-line">{lead.message}</p>
          {lead.preferredChannel && (
            <p className="mt-4 text-sm">
              Tercih ettiği dönüş: <strong>{preferredChannelLabel(lead.preferredChannel)}</strong>
            </p>
          )}
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            {lead.phone && (
              <Button asChild>
                <a href={whatsappLink(lead.phone, reply)}>
                  <MessageCircle aria-hidden="true" />
                  WhatsApp ile yanıtla
                </a>
              </Button>
            )}
            {lead.phone && (
              <Button asChild variant="outline">
                <a href={`tel:${lead.phone}`}>
                  <Phone aria-hidden="true" />
                  Ara
                </a>
              </Button>
            )}
            {lead.email && (
              <Button asChild variant="outline">
                <a
                  href={`mailto:${lead.email}?subject=${encodeURIComponent(`Talebiniz: ${lead.code}`)}`}
                >
                  <Mail aria-hidden="true" />
                  E-posta gönder
                </a>
              </Button>
            )}
          </div>
          <dl className="mt-4 space-y-1 text-sm">
            {lead.phone && (
              <div className="flex gap-2">
                <dt className="text-muted-foreground">Telefon:</dt>
                <dd>
                  <PhoneLink e164={lead.phone} className="underline-offset-4 hover:underline" />
                </dd>
              </div>
            )}
            {lead.email && (
              <div className="flex gap-2">
                <dt className="text-muted-foreground">E-posta:</dt>
                <dd className="break-all">{lead.email}</dd>
              </div>
            )}
          </dl>
        </section>

        <div className="space-y-6">
          <section aria-labelledby="durum" className="rounded-xl border bg-surface p-5">
            <h2 id="durum" className="font-sans text-sm font-bold">
              Durum
            </h2>
            <form action={updateLeadStatusForm} className="mt-3 flex flex-wrap gap-2">
              <input type="hidden" name="id" value={lead.id} />
              {leadStatuses.map((status) => (
                <Button
                  key={status}
                  type="submit"
                  name="status"
                  value={status}
                  size="sm"
                  variant={lead.status === status ? "default" : "outline"}
                  aria-pressed={lead.status === status}
                >
                  {leadStatusLabels[status]}
                </Button>
              ))}
            </form>
          </section>

          <section aria-labelledby="not" className="rounded-xl border bg-surface p-5">
            <h2 id="not" className="font-sans text-sm font-bold">
              <label htmlFor="alan-note">İç not</label>
            </h2>
            <form action={saveLeadNoteForm} className="mt-3 space-y-3">
              <input type="hidden" name="id" value={lead.id} />
              <Textarea
                id="alan-note"
                name="note"
                rows={4}
                maxLength={2000}
                defaultValue={lead.note ?? ""}
              />
              <Button type="submit" size="sm" variant="outline">
                Notu kaydet
              </Button>
            </form>
          </section>

          <section aria-labelledby="gecmis" className="rounded-xl border bg-surface p-5 text-sm">
            <h2 id="gecmis" className="font-sans text-sm font-bold">
              Kayıtlar
            </h2>
            <ul className="mt-2 space-y-1">
              {consents.map((consent) => (
                <li key={consent.createdAt.toISOString()}>
                  Aydınlatma metni gösterildi ({consent.textVersion}) ·{" "}
                  {formatDateTime(consent.createdAt)}
                </li>
              ))}
              {messages.map((message) => (
                <li key={`${message.to}-${message.createdAt.toISOString()}`} className="break-all">
                  Bildirim ({channelLabels[message.channel] ?? message.channel}, demo kutusu):{" "}
                  {message.to}
                </li>
              ))}
              {consents.length === 0 && messages.length === 0 && (
                <li className="text-muted-foreground">Kayıt yok.</li>
              )}
            </ul>
          </section>
        </div>
      </div>
      <p className="mt-6 text-xs text-muted-foreground">
        Kişisel veriler saklama süresi sonunda silinir (KVKK Aydınlatma Metni).
      </p>
    </>
  );
}
