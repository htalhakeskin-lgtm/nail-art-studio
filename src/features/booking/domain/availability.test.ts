import { describe, expect, it } from "vitest";

import { siteDefaults } from "@/config/site-defaults";

import {
  type AvailabilityContext,
  checkSlot,
  daysWithAvailability,
  type Interval,
  nextSlots,
  slotsForDay,
  type WeeklyHours,
} from "./availability";
import { istanbulClock, istanbulDateTime } from "./time";

// P-12: Tue–Sat 10:00–20:00, Sun 11:00–18:00, Mon closed. 2026-10-27 is a Tuesday.
const weekly = siteDefaults.openingHours.weekly as unknown as WeeklyHours;
const rules = { bufferMinutes: 15, slotStepMinutes: 15, minLeadHours: 3, horizonDays: 45 };
const at = (date: string, clock: string) => istanbulDateTime(date, clock);
const interval = (date: string, from: string, to: string): Interval => ({
  start: at(date, from),
  end: at(date, to),
});

function context(overrides: Partial<AvailabilityContext> = {}): AvailabilityContext {
  return {
    weekly,
    rules,
    now: at("2026-10-26", "09:00"), // Monday morning: Tuesday is fully ahead
    busy: [],
    closures: [],
    ...overrides,
  };
}

const clocks = (slots: Date[]) => slots.map(istanbulClock);

describe("istanbul time (BR-RND-015)", () => {
  it("stores Istanbul wall-clock as UTC", () => {
    expect(at("2026-10-27", "10:00").toISOString()).toBe("2026-10-27T07:00:00.000Z");
    // Midnight in Istanbul is still the previous day in UTC.
    expect(at("2026-11-01", "00:30").toISOString()).toBe("2026-10-31T21:30:00.000Z");
  });

  it("BR-RND-015: the day boundary is Istanbul's, also at the end of a month", () => {
    const now = at("2026-10-31", "23:30"); // 20:30 UTC
    const slots = slotsForDay(
      context({ now, rules: { ...rules, minLeadHours: 0 } }),
      "2026-11-01",
      60,
    );
    expect(clocks(slots)[0]).toBe("11:00"); // Sunday hours, not Saturday's
  });
});

describe("slotsForDay (BR-RND-004)", () => {
  it.each([
    { duration: 60, first: "10:00", last: "19:00", count: 37 },
    { duration: 150, first: "10:00", last: "17:30", count: 31 },
    { duration: 600, first: "10:00", last: "10:00", count: 1 },
  ])(
    "a $duration-minute service has $count starts from $first to $last",
    ({ duration, first, last, count }) => {
      const slots = clocks(slotsForDay(context(), "2026-10-27", duration));
      expect(slots[0]).toBe(first);
      expect(slots.at(-1)).toBe(last);
      expect(slots).toHaveLength(count);
    },
  );

  it("BR-RND-001: nothing on a closed weekday and nothing that would end after closing", () => {
    expect(slotsForDay(context(), "2026-10-26", 60)).toEqual([]); // Monday
    expect(slotsForDay(context(), "2026-10-27", 601)).toEqual([]);
  });

  it("uses the step from each opening time (P-02)", () => {
    const slots = clocks(
      slotsForDay(context({ rules: { ...rules, slotStepMinutes: 30 } }), "2026-11-01", 60),
    );
    expect(slots.slice(0, 3)).toEqual(["11:00", "11:30", "12:00"]);
  });
});

describe("checkSlot", () => {
  it("BR-RND-003: an appointment plus its cleaning buffer blocks overlapping starts", () => {
    // Existing 12:00–13:00 appointment holds 12:00–13:15 (P-01).
    const busy = [interval("2026-10-27", "12:00", "13:15")];
    const ctx = context({ busy });
    expect(checkSlot(ctx, at("2026-10-27", "13:15"), 60)).toEqual({ ok: true }); // back-to-back
    expect(checkSlot(ctx, at("2026-10-27", "13:00"), 60)).toEqual({
      ok: false,
      rule: "BR-RND-003",
    });
    // A new 11:00 service ends 12:00 but its buffer runs to 12:15: taken.
    expect(checkSlot(ctx, at("2026-10-27", "11:00"), 60)).toEqual({
      ok: false,
      rule: "BR-RND-003",
    });
    expect(checkSlot(ctx, at("2026-10-27", "10:45"), 60)).toEqual({ ok: true });
  });

  it("BR-RND-002: leave, holidays and blocks close the time they cover", () => {
    const closures = [interval("2026-10-27", "14:00", "17:00")];
    const ctx = context({ closures });
    expect(checkSlot(ctx, at("2026-10-27", "13:30"), 60)).toEqual({
      ok: false,
      rule: "BR-RND-002",
    });
    expect(checkSlot(ctx, at("2026-10-27", "13:00"), 60)).toEqual({ ok: true }); // ends at 14:00
    expect(checkSlot(ctx, at("2026-10-27", "17:00"), 60)).toEqual({ ok: true });
    const allDay = context({ closures: [interval("2026-10-29", "00:00", "23:59")] });
    expect(slotsForDay(allDay, "2026-10-29", 60)).toEqual([]);
  });

  it("BR-RND-005: not sooner than the lead time, not beyond the horizon", () => {
    const now = at("2026-10-27", "10:00");
    expect(checkSlot(context({ now }), at("2026-10-27", "12:45"), 60)).toEqual({
      ok: false,
      rule: "BR-RND-005",
    });
    expect(checkSlot(context({ now }), at("2026-10-27", "13:00"), 60)).toEqual({ ok: true });
    expect(checkSlot(context({ now }), at("2026-12-11", "10:00"), 60)).toEqual({ ok: true }); // day 45
    expect(checkSlot(context({ now }), at("2026-12-12", "10:00"), 60)).toEqual({
      ok: false,
      rule: "BR-RND-005",
    });
  });

  it("BR-RND-001: outside opening hours", () => {
    expect(checkSlot(context(), at("2026-10-27", "09:30"), 60)).toEqual({
      ok: false,
      rule: "BR-RND-001",
    });
    expect(checkSlot(context(), at("2026-10-27", "19:15"), 60)).toEqual({
      ok: false,
      rule: "BR-RND-001",
    });
    expect(checkSlot(context(), at("2026-10-26", "12:00"), 60)).toEqual({
      ok: false,
      rule: "BR-RND-001",
    });
  });
});

describe("day strip and nearest slots", () => {
  it("lists every day of the window with its free slot count", () => {
    const days = daysWithAvailability(context(), 60);
    expect(days[0]).toEqual({ date: "2026-10-26", slots: 0 }); // Monday, closed
    expect(days[1]).toEqual({ date: "2026-10-27", slots: 37 });
    expect(days).toHaveLength(46); // today + 45 days (P-04)
  });

  it("finds the nearest free starts, skipping taken and closed time", () => {
    const now = at("2026-10-27", "15:30");
    const busy = [interval("2026-10-27", "18:30", "20:00")];
    const slots = nextSlots(context({ now, busy }), 60, 3);
    // Earliest start is 18:30 (P-03), which the evening appointment already holds.
    expect(slots).toEqual([
      at("2026-10-28", "10:00"),
      at("2026-10-28", "10:15"),
      at("2026-10-28", "10:30"),
    ]);
  });
});
