import { Images, Phone } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

import { formatDate, formatTime } from "@/lib/format";
import { cn } from "@/lib/utils";

import { type AppointmentStatus, appointmentStatusLabels } from "../domain/status";
import type { PanelAppointment } from "../panel-queries";

export const appointmentStatusTone: Record<AppointmentStatus, string> = {
  pending: "bg-warning-muted text-warning",
  confirmed: "bg-success-muted text-success",
  completed: "bg-surface-muted text-muted-foreground",
  no_show: "bg-danger-muted text-danger",
  cancelled: "bg-surface-muted text-muted-foreground line-through",
};

/**
 * Agenda cards (13-yonetim-paneli §5: cards on every width). Time first, big and tabular, so the
 * owner reads the day at a glance on the phone; the whole card opens the detail.
 */
export function PanelAppointmentList({
  items,
  showDate = false,
  empty,
}: {
  items: PanelAppointment[];
  showDate?: boolean;
  empty: string;
}) {
  if (items.length === 0) {
    return (
      <p className="rounded-xl border border-dashed bg-surface p-6 text-center text-sm text-muted-foreground">
        {empty}
      </p>
    );
  }
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item.id}>
          <Link
            href={`/panel/randevular/${item.id}` as Route}
            className="flex gap-4 rounded-xl border bg-surface p-3 hover:bg-surface-muted"
          >
            <span className="w-16 shrink-0 text-center">
              <span className="block font-display text-xl tabular-nums">
                {formatTime(item.startsAt)}
              </span>
              <span className="block text-xs text-muted-foreground tabular-nums">
                {formatTime(item.endsAt)}
              </span>
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "rounded-full px-2.5 py-0.5 text-xs font-semibold",
                    appointmentStatusTone[item.status],
                  )}
                >
                  {appointmentStatusLabels[item.status]}
                </span>
                {showDate && (
                  <span className="text-xs text-muted-foreground">
                    {formatDate(item.startsAt, "withWeekday")}
                  </span>
                )}
                {item.source === "admin" && (
                  <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <Phone aria-hidden="true" className="size-3" />
                    elle
                  </span>
                )}
                {item.hasReference && (
                  <span className="inline-flex items-center gap-1 text-xs text-brand">
                    <Images aria-hidden="true" className="size-3" />
                    referans
                  </span>
                )}
              </span>
              <span className="mt-1 block font-semibold break-words">{item.customerName}</span>
              <span className="block text-sm text-muted-foreground">
                {item.serviceName} · {item.code}
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
