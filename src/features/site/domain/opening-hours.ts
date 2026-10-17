import type { WeeklyHours } from "../schemas";

/** ISO weekday 1 = Monday … 7 = Sunday. */
const DAY_NAMES = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
const WEEKDAYS = ["1", "2", "3", "4", "5", "6", "7"] as const;

export type HoursRow = { days: string; hours: string };

function describe(ranges: WeeklyHours[keyof WeeklyHours]): string {
  if (ranges.length === 0) return "Kapalı";
  return ranges.map(([from, to]) => `${from} – ${to}`).join(", ");
}

/**
 * Groups consecutive days with the same hours for the footer and contact page:
 * [{ days: "Pazartesi", hours: "Kapalı" }, { days: "Salı – Cumartesi", hours: "10:00 – 20:00" }, …]
 */
export function summarizeWeeklyHours(weekly: WeeklyHours): HoursRow[] {
  const rows: { first: number; last: number; hours: string }[] = [];
  WEEKDAYS.forEach((day, index) => {
    const hours = describe(weekly[day]);
    const previous = rows.at(-1);
    if (previous?.hours === hours && previous.last === index - 1) previous.last = index;
    else rows.push({ first: index, last: index, hours });
  });
  return rows.map(({ first, last, hours }) => ({
    days:
      first === last
        ? (DAY_NAMES[first] ?? "")
        : `${DAY_NAMES[first] ?? ""} – ${DAY_NAMES[last] ?? ""}`,
    hours,
  }));
}
