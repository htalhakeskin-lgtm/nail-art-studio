import type { Route } from "next";
import Link from "next/link";

import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

import type { DayAvailability } from "../domain/availability";
import { groupByDayPart } from "../domain/messages";

const weekdayShort = new Intl.DateTimeFormat("tr-TR", { weekday: "short", timeZone: "UTC" });
const monthShort = new Intl.DateTimeFormat("tr-TR", { month: "short", timeZone: "UTC" });
const noon = (date: string) => new Date(`${date}T12:00:00Z`);

/**
 * Day strip (K-35): every day of the booking window; days without a free slot are shown but
 * cannot be chosen (dashed, struck through — readable, never faded below AA). Each free day is
 * a plain link, so choosing works without JavaScript.
 */
export function DayStrip({
  days,
  today,
  chosen,
  hrefFor,
}: {
  days: readonly DayAvailability[];
  today: string;
  chosen: string | undefined;
  hrefFor: (date: string) => Route;
}) {
  const box =
    "flex h-20 w-16 shrink-0 snap-start flex-col items-center justify-center gap-0.5 rounded-[1.1rem] border";
  return (
    <ul
      aria-label="Günler"
      className="-mx-4 mt-4 flex snap-x gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:flex-wrap sm:px-0"
    >
      {days.map((day) => {
        const date = noon(day.date);
        const label = `${formatDate(date, "withWeekday")}${day.slots === 0 ? ", dolu ya da kapalı" : ""}`;
        const content = (
          <>
            <span className="text-xs font-semibold">
              {day.date === today ? "Bugün" : weekdayShort.format(date)}
            </span>
            <span className="font-display text-2xl leading-none tabular-nums">
              {date.getUTCDate()}
            </span>
            <span className="text-xs">{monthShort.format(date)}</span>
          </>
        );
        return (
          <li key={day.date}>
            {day.slots === 0 ? (
              <span
                aria-label={label}
                role="img"
                className={cn(
                  box,
                  "border-dashed bg-surface-muted text-muted-foreground line-through decoration-1",
                )}
              >
                {content}
              </span>
            ) : (
              <Link
                href={hrefFor(day.date)}
                aria-label={label}
                aria-current={day.date === chosen ? "date" : undefined}
                className={cn(
                  box,
                  day.date === chosen
                    ? "border-transparent bg-primary text-primary-foreground shadow-glow"
                    : "bg-surface hover:bg-surface-muted",
                )}
              >
                {content}
              </Link>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** Free times of one day as buttons (≥ 44 px), grouped into morning / afternoon / evening. */
export function TimeGrid({
  slots,
  chosen,
  hrefFor,
}: {
  slots: readonly { clock: string }[];
  chosen: string | undefined;
  hrefFor: (clock: string) => Route;
}) {
  return (
    <div className="mt-4 space-y-4">
      {groupByDayPart(slots).map((group) => (
        <div key={group.label}>
          <h3 className="font-sans text-sm font-bold">{group.label}</h3>
          <ul className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
            {group.slots.map((slot) => (
              <li key={slot.clock}>
                <Link
                  href={hrefFor(slot.clock)}
                  aria-current={slot.clock === chosen ? "time" : undefined}
                  className={cn(
                    "flex min-h-11 items-center justify-center rounded-full border text-sm font-semibold tabular-nums",
                    slot.clock === chosen
                      ? "border-transparent bg-primary text-primary-foreground shadow-glow"
                      : "bg-surface hover:bg-surface-muted",
                  )}
                >
                  {slot.clock}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
