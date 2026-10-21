import type { Route } from "next";
import Link from "next/link";

import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

import type { LeadListItem } from "../queries";
import { type LeadStatus, leadStatusLabels, preferredChannelLabel } from "../schemas";

export const statusTone: Record<LeadStatus, string> = {
  new: "bg-accent text-foreground",
  contacted: "bg-info-muted text-info",
  closed: "bg-success-muted text-success",
  lost: "bg-surface-muted text-muted-foreground",
  spam: "bg-danger-muted text-danger",
};

/**
 * Panel request list (plan §12 "Talepler"): cards on every width, newest first. Unread requests
 * carry a dot and bold name; the whole card opens the detail.
 */
export function LeadPanelList({ items }: { items: LeadListItem[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl border border-dashed bg-surface p-8 text-center">
        <p className="font-semibold">Bu görünümde talep yok</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Sitedeki iletişim formundan gelen mesajlar burada listelenir.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((lead) => {
        const unread = !lead.readAt;
        return (
          <li key={lead.id}>
            <Link
              href={`/panel/talepler/${lead.id}` as Route}
              className="block rounded-xl border bg-surface p-4 hover:bg-surface-muted"
            >
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                {unread && (
                  <span className="inline-flex items-center gap-1.5 font-semibold text-brand">
                    <span aria-hidden="true" className="size-2 rounded-full bg-brand" />
                    Okunmadı
                  </span>
                )}
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                    statusTone[lead.status],
                  )}
                >
                  {leadStatusLabels[lead.status]}
                </span>
                <span className="text-muted-foreground tabular-nums">{lead.code}</span>
                <time
                  dateTime={lead.createdAt.toISOString()}
                  className="text-muted-foreground tabular-nums"
                >
                  {formatDateTime(lead.createdAt)}
                </time>
              </div>
              <p className={cn("mt-2 break-words", unread && "font-bold")}>{lead.name}</p>
              {lead.message && (
                <p className="mt-1 line-clamp-2 text-sm break-words text-muted-foreground">
                  {lead.message}
                </p>
              )}
              {lead.preferredChannel && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Dönüş: {preferredChannelLabel(lead.preferredChannel)}
                </p>
              )}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
