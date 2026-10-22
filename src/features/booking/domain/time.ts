/**
 * Istanbul wall-clock ↔ UTC instants (BR-RND-015). Opening hours and day boundaries are
 * Istanbul times; instants are stored in UTC. The offset is read from the time zone database
 * for each date, so a future rule change needs no code change.
 */
export const BOOKING_TIME_ZONE = "Europe/Istanbul";

function offsetMinutes(at: Date): number {
  const name =
    new Intl.DateTimeFormat("en-US", { timeZone: BOOKING_TIME_ZONE, timeZoneName: "longOffset" })
      .formatToParts(at)
      .find((part) => part.type === "timeZoneName")?.value ?? "GMT";
  const match = /GMT([+-])(\d{2}):(\d{2})/.exec(name);
  if (!match) return 0;
  const minutes = Number(match[2]) * 60 + Number(match[3]);
  return match[1] === "-" ? -minutes : minutes;
}

/** "2026-10-27" + "10:30" in Istanbul → the UTC instant. */
export function istanbulDateTime(date: string, clock: string): Date {
  const [year = 0, month = 1, day = 1] = date.split("-").map(Number);
  const [hours = 0, minutes = 0] = clock.split(":").map(Number);
  const asIfUtc = Date.UTC(year, month - 1, day, hours, minutes);
  return new Date(asIfUtc - offsetMinutes(new Date(asIfUtc)) * 60_000);
}

/** Istanbul calendar date (YYYY-MM-DD) of an instant. */
export function istanbulDate(at: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: BOOKING_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(at);
}

/** Istanbul wall-clock "HH:MM" of an instant. */
export function istanbulClock(at: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: BOOKING_TIME_ZONE,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(at);
}

/** ISO weekday (1 = Monday … 7 = Sunday) of a calendar date. */
export function isoWeekday(date: string): number {
  const day = new Date(`${date}T12:00:00Z`).getUTCDay();
  return day === 0 ? 7 : day;
}

/** The calendar date `days` after `date`. */
export function addDays(date: string, days: number): string {
  const next = new Date(`${date}T12:00:00Z`);
  next.setUTCDate(next.getUTCDate() + days);
  return next.toISOString().slice(0, 10);
}

export function addMinutes(at: Date, minutes: number): Date {
  return new Date(at.getTime() + minutes * 60_000);
}

export function toMinutes(clock: string): number {
  const [hours = 0, minutes = 0] = clock.split(":").map(Number);
  return hours * 60 + minutes;
}
