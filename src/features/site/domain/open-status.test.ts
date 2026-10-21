import { describe, expect, it } from "vitest";

import { siteDefaults } from "@/config/site-defaults";

import type { SiteSettings } from "../schemas";
import { describeOpenStatus, istanbulMoment, openStatus } from "./open-status";

// P-12: Tue–Sat 10:00–20:00, Sun 11:00–18:00, Mon closed. Times below are UTC; Istanbul is UTC+3.
const hours = siteDefaults.openingHours as unknown as SiteSettings["openingHours"];
const at = (iso: string) => new Date(iso);

describe("istanbulMoment", () => {
  it("uses Istanbul's calendar day, not the server's", () => {
    // 22:30 UTC on Monday is already Tuesday 01:30 in Istanbul.
    expect(istanbulMoment(at("2026-10-19T22:30:00Z"))).toEqual({
      date: "2026-10-20",
      weekday: 2,
      minutes: 90,
    });
  });
});

describe("openStatus (REQ-016)", () => {
  it("is open inside the day's hours and names the closing time", () => {
    const status = openStatus(hours, at("2026-10-21T09:00:00Z")); // Wed 12:00
    expect(status).toEqual({ open: true, closesAt: "20:00" });
    expect(describeOpenStatus(status)).toBe("Şu an açık · Kapanış 20:00");
  });

  it("closes exactly at the closing minute", () => {
    expect(openStatus(hours, at("2026-10-21T17:00:00Z"))).toMatchObject({
      open: false,
      next: { day: "Yarın", opensAt: "10:00" },
    }); // Wed 20:00
  });

  it("before opening says it opens today", () => {
    expect(openStatus(hours, at("2026-10-25T06:00:00Z"))).toMatchObject({
      open: false,
      next: { day: "Bugün", opensAt: "11:00" },
    }); // Sun 09:00
  });

  it("skips the closed Monday and names the weekday when it is further away", () => {
    // Sun 19:00 → Monday closed → Tuesday 10:00
    const status = openStatus(hours, at("2026-10-25T16:00:00Z"));
    expect(status).toMatchObject({ open: false, next: { day: "Salı", opensAt: "10:00" } });
    expect(describeOpenStatus(status)).toBe("Şu an kapalı · Açılış: Salı 10:00");
  });

  it("treats a holiday as closed all day and says why", () => {
    const withHoliday = {
      ...hours,
      holidays: [{ date: "2026-10-29", label: "Cumhuriyet Bayramı" }],
    };
    const status = openStatus(withHoliday, at("2026-10-29T09:00:00Z")); // Thu 12:00
    expect(status).toMatchObject({
      open: false,
      holiday: "Cumhuriyet Bayramı",
      next: { day: "Yarın", opensAt: "10:00" },
    });
    expect(describeOpenStatus(status)).toBe(
      "Bugün kapalı (Cumhuriyet Bayramı) · Açılış: Yarın 10:00",
    );
  });

  it("has no next opening when every day is closed", () => {
    const closed = { weekly: { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] }, holidays: [] };
    expect(openStatus(closed, at("2026-10-21T09:00:00Z"))).toEqual({ open: false, next: null });
  });
});
