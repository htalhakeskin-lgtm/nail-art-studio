import { Download } from "lucide-react";
import type { Metadata, Route } from "next";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  consentKindLabels,
  CONSENTS_PAGE_SIZE,
  consentSourceLabels,
  listConsentRecords,
} from "@/features/consents";
import { requirePanelUser } from "@/features/panel";
import { formatDateTime, formatNumber } from "@/lib/format";

export const metadata: Metadata = { title: "Onay kayıtları" };

/**
 * SCR-111 (REQ-019, A-31, 10-yasal §4): proof that each form showed the privacy notice, with
 * the text version in force. Read-only; owner and admin only (audit.view). Cards on every
 * width: the rows are short and the phone is the owner's main screen.
 */
export default async function ConsentsPage({ searchParams }: PageProps<"/panel/onaylar">) {
  await requirePanelUser("audit.view");
  const { sayfa } = await searchParams;
  const page = Math.max(1, Number.parseInt(typeof sayfa === "string" ? sayfa : "1", 10) || 1);
  const { items, total } = await listConsentRecords(page);
  const pages = Math.max(1, Math.ceil(total / CONSENTS_PAGE_SIZE));

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-medium">Onay kayıtları</h1>
        {total > 0 && (
          <Button asChild variant="outline" size="sm">
            {/* A file download, not a page: a plain link, never prefetched. */}
            <a href="/panel/onaylar/csv" download>
              <Download aria-hidden="true" />
              CSV indir
            </a>
          </Button>
        )}
      </div>
      <p className="mt-2 max-w-prose text-muted-foreground">
        İletişim ve randevu formları gönderilirken aydınlatma metninin hangi sürümünün
        gösterildiğinin kaydı. Kayıtlar silinmez; talep ya da randevu silinse de kanıt olarak kalır.
      </p>

      {items.length === 0 ? (
        <div className="mt-8 rounded-xl border border-dashed bg-surface p-8 text-center">
          <p className="font-semibold">Henüz kayıt yok</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Sitedeki bir form gönderildiğinde burada görünür.
          </p>
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {items.map((item) => (
            <li key={item.id} className="rounded-xl border bg-surface p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-semibold">{consentSourceLabels[item.source] ?? item.source}</p>
                <p className="text-sm text-muted-foreground">
                  <time dateTime={item.createdAt.toISOString()}>
                    {formatDateTime(item.createdAt)}
                  </time>
                </p>
              </div>
              <p className="mt-1 text-sm">
                {consentKindLabels[item.kind] ?? item.kind} · Sürüm: {item.textVersion}
              </p>
              <p className="mt-2 text-sm">
                {item.subject ? (
                  <Link
                    href={
                      (item.subject.type === "lead"
                        ? `/panel/talepler/${item.subject.id}`
                        : `/panel/randevular/${item.subject.id}`) as Route
                    }
                    className="inline-flex min-h-11 items-center font-semibold text-brand underline-offset-4 hover:underline"
                  >
                    Kayıt: {item.subject.code}
                  </Link>
                ) : (
                  <span className="text-muted-foreground">Kayıt silinmiş</span>
                )}
              </p>
            </li>
          ))}
        </ul>
      )}

      {pages > 1 && (
        <nav aria-label="Sayfalar" className="mt-6 flex items-center justify-between gap-3">
          {page > 1 ? (
            <Button asChild variant="outline" size="sm">
              <Link href={`/panel/onaylar?sayfa=${String(page - 1)}` as Route}>Daha yeni</Link>
            </Button>
          ) : (
            <span />
          )}
          <p className="text-sm text-muted-foreground">
            Sayfa {formatNumber(page)} / {formatNumber(pages)} · {formatNumber(total)} kayıt
          </p>
          {page < pages ? (
            <Button asChild variant="outline" size="sm">
              <Link href={`/panel/onaylar?sayfa=${String(page + 1)}` as Route}>Daha eski</Link>
            </Button>
          ) : (
            <span />
          )}
        </nav>
      )}
    </>
  );
}
