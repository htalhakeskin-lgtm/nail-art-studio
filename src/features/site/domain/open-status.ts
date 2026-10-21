import type { SiteSettings } from "../schemas";

/**
 * "Şu an açık · 20:00'a kadar" (REQ-016, V-17). Opening hours are wall-clock times in
 * Europe/Istanbul, so `now` is converted to Istanbul's date and time first; the server's own
 * time zone never matters. Holidays close the whole day.
 */
export type OpenStatus =
  | { open: true; closesAt: string }
  | { open: false; holiday?: string; next: { day: string; opensAt: string } | null };

const TIME_ZONE = "Europe/Istanbul";
const DAY_NAMES = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];

type LocalMoment = { date: string; weekday: number; minutes: number };

/** Istanbul calendar date (YYYY-MM-DD), ISO weekday (1 = Monday) and minutes after midnight. */
export function istanbulMoment(now: Date): LocalMoment {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: TIME_ZONE,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      weekday: "short",
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(now)
      .map((part) => [part.type, part.value]),
  );
  const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return {
    date: `${parts.year ?? ""}-${parts.month ?? ""}-${parts.day ?? ""}`,
    weekday: weekdays.indexOf(parts.weekday ?? "") + 1,
    minutes: Number(parts.hour) * 60 + Number(parts.minute),
  };
}

const toMinutes = (clock: string) => {
  const [hours = "0", minutes = "0"] = clock.split(":");
  return Number(hours) * 60 + Number(minutes);
};

/** The calendar date `days` after an ISO date, without time zone arithmetic. */
function addDays(date: string, days: number): string {
  const next = new Date(`${date}T12:00:00Z`);
  next.setUTCDate(next.getUTCDate() + days);
  return next.toISOString().slice(0, 10);
}

export function openStatus(hours: SiteSettings["openingHours"], now: Date): OpenStatus {
  const local = istanbulMoment(now);
  const holidays = new Map(hours.holidays.map((holiday) => [holiday.date, holiday.label]));
  const rangesOn = (weekday: number) => hours.weekly[String(weekday) as keyof typeof hours.weekly];

  const holiday = holidays.get(local.date);
  if (!holiday) {
    for (const [from, to] of rangesOn(local.weekday)) {
      if (local.minutes >= toMinutes(from) && local.minutes < toMinutes(to)) {
        return { open: true, closesAt: to };
      }
    }
  }

  // Next opening: later today, then the following seven days.
  for (let offset = 0; offset <= 7; offset += 1) {
    const date = addDays(local.date, offset);
    if (holidays.has(date)) continue;
    const weekday = ((local.weekday - 1 + offset) % 7) + 1;
    const start = rangesOn(weekday)
      .map(([from]) => from)
      .find((from) => offset > 0 || toMinutes(from) > local.minutes);
    if (start) {
      const day = offset === 0 ? "Bugün" : offset === 1 ? "Yarın" : (DAY_NAMES[weekday - 1] ?? "");
      return { open: false, ...(holiday ? { holiday } : {}), next: { day, opensAt: start } };
    }
  }
  return { open: false, ...(holiday ? { holiday } : {}), next: null };
}

/** One line for badges: "Şu an açık · 20:00'e kadar" is avoided (suffix on a value). */
export function describeOpenStatus(status: OpenStatus): string {
  if (status.open) return `Şu an açık · Kapanış ${status.closesAt}`;
  const prefix = status.holiday ? `Bugün kapalı (${status.holiday})` : "Şu an kapalı";
  return status.next ? `${prefix} · Açılış: ${status.next.day} ${status.next.opensAt}` : prefix;
}
