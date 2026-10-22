import { addDays, addMinutes, isoWeekday, istanbulDate, istanbulDateTime, toMinutes } from "./time";

/**
 * Availability engine (V-30, BR-RND-001…005, 015). Pure: every input is passed in, so the same
 * rules run in the slot list, in the booking action (before the database's own overlap check)
 * and in tests with a fixed clock.
 */
export type Interval = { start: Date; end: Date };
export type WeeklyHours = Record<"1" | "2" | "3" | "4" | "5" | "6" | "7", [string, string][]>;

export type BookingRules = {
  bufferMinutes: number; // P-01
  slotStepMinutes: number; // P-02
  minLeadHours: number; // P-03
  horizonDays: number; // P-04
};

export type AvailabilityContext = {
  weekly: WeeklyHours;
  rules: BookingRules;
  now: Date;
  /** Slot-holding appointments as [starts_at, blocked_until). */
  busy: readonly Interval[];
  /** Leave, holidays and blocks as [starts_at, ends_at). */
  closures: readonly Interval[];
};

export type SlotCheck =
  { ok: true } | { ok: false; rule: "BR-RND-001" | "BR-RND-002" | "BR-RND-003" | "BR-RND-005" };

const overlaps = (a: Interval, b: Interval) => a.start < b.end && b.start < a.end;

function openingRanges(weekly: WeeklyHours, date: string): [string, string][] {
  return weekly[String(isoWeekday(date)) as keyof WeeklyHours];
}

/** First and last bookable calendar day (BR-RND-005), in Istanbul. */
export function bookingWindow(now: Date, rules: BookingRules): { first: string; last: string } {
  const first = istanbulDate(now);
  return { first, last: addDays(first, rules.horizonDays) };
}

/**
 * Can a service of `durationMinutes` start at `start`? Checked in rule order so the visitor
 * hears the most useful reason: too soon / too far, outside hours, closed, taken.
 */
export function checkSlot(
  context: AvailabilityContext,
  start: Date,
  durationMinutes: number,
): SlotCheck {
  const { rules, now } = context;
  const end = addMinutes(start, durationMinutes);
  const date = istanbulDate(start);

  // BR-RND-005: not before now + lead time, not after the booking horizon.
  if (start < addMinutes(now, rules.minLeadHours * 60) || date > bookingWindow(now, rules).last) {
    return { ok: false, rule: "BR-RND-005" };
  }

  // BR-RND-001: starts inside one opening range and ends by its closing time.
  const inside = openingRanges(context.weekly, date).some(([open, close]) => {
    const opensAt = istanbulDateTime(date, open);
    const closesAt = istanbulDateTime(date, close);
    return start >= opensAt && end <= closesAt;
  });
  if (!inside) return { ok: false, rule: "BR-RND-001" };

  // BR-RND-002: the service itself may not touch leave, holidays or blocks.
  if (context.closures.some((closure) => overlaps({ start, end }, closure))) {
    return { ok: false, rule: "BR-RND-002" };
  }

  // BR-RND-003: the service plus the cleaning buffer may not touch another appointment.
  const held = { start, end: addMinutes(end, rules.bufferMinutes) };
  if (context.busy.some((appointment) => overlaps(held, appointment))) {
    return { ok: false, rule: "BR-RND-003" };
  }
  return { ok: true };
}

/** BR-RND-004: free start times of one day, on the P-02 grid from each opening time. */
export function slotsForDay(
  context: AvailabilityContext,
  date: string,
  durationMinutes: number,
): Date[] {
  const slots: Date[] = [];
  for (const [open, close] of openingRanges(context.weekly, date)) {
    const last = toMinutes(close) - durationMinutes;
    for (let minute = toMinutes(open); minute <= last; minute += context.rules.slotStepMinutes) {
      const clock = `${String(Math.floor(minute / 60)).padStart(2, "0")}:${String(minute % 60).padStart(2, "0")}`;
      const start = istanbulDateTime(date, clock);
      if (checkSlot(context, start, durationMinutes).ok) slots.push(start);
    }
  }
  return slots;
}

export type DayAvailability = { date: string; slots: number };

/** Every day in the booking window with its number of free slots (the day strip). */
export function daysWithAvailability(
  context: AvailabilityContext,
  durationMinutes: number,
): DayAvailability[] {
  const { first, last } = bookingWindow(context.now, context.rules);
  const days: DayAvailability[] = [];
  for (let date = first; date <= last; date = addDays(date, 1)) {
    days.push({ date, slots: slotsForDay(context, date, durationMinutes).length });
  }
  return days;
}

/** The next `count` free start times from now (home "En yakın boş saatler", "Bu saat doldu"). */
export function nextSlots(
  context: AvailabilityContext,
  durationMinutes: number,
  count: number,
  from: Date = context.now,
): Date[] {
  const { last } = bookingWindow(context.now, context.rules);
  const found: Date[] = [];
  for (
    let date = istanbulDate(from);
    date <= last && found.length < count;
    date = addDays(date, 1)
  ) {
    for (const slot of slotsForDay(context, date, durationMinutes)) {
      if (slot >= from) found.push(slot);
      if (found.length === count) break;
    }
  }
  return found;
}
