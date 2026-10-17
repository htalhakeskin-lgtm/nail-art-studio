import type { Metadata } from "next";

import { listDemoMessages } from "@/features/panel";
import { formatDateTime } from "@/lib/format";

export const metadata: Metadata = { title: "Demo kutusu" };

const channelLabels: Record<string, string> = {
  email: "E-posta",
  sms: "SMS",
  whatsapp: "WhatsApp",
};

/** Z-06: what the site would have sent. Cards on every width: messages are long text. */
export default async function DemoOutboxPage() {
  const messages = await listDemoMessages();

  return (
    <>
      <h1 className="text-3xl font-medium">Demo kutusu</h1>
      <p className="mt-2 max-w-prose text-muted-foreground">
        Demo modunda site hiçbir e-posta ya da WhatsApp mesajı göndermez; gönderilecek olan mesajlar
        burada görünür ve 30 gün sonra silinir.
      </p>

      {messages.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed border-border bg-surface p-8 text-center">
          <p className="font-semibold">Henüz mesaj yok</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Siteden bir talep ya da randevu geldiğinde, giden bildirimler burada listelenir.
          </p>
        </div>
      ) : (
        <ul className="mt-8 space-y-4">
          {messages.map((message) => (
            <li key={message.id} className="rounded-xl border border-border bg-surface p-5">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                <span className="rounded-full bg-info-muted px-2.5 py-0.5 font-semibold text-info">
                  {channelLabels[message.channel] ?? message.channel}
                </span>
                <span className="break-all">{message.to}</span>
                <time
                  dateTime={message.createdAt.toISOString()}
                  className="text-muted-foreground tabular-nums"
                >
                  {formatDateTime(message.createdAt)}
                </time>
              </div>
              {message.subject && <p className="mt-3 font-semibold">{message.subject}</p>}
              <p className="mt-2 whitespace-pre-line">{message.text}</p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
