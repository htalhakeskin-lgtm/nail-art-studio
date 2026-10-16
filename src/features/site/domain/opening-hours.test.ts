import { describe, expect, it } from "vitest";

import { siteDefaults } from "@/config/site-defaults";

import { siteSettingsSchema } from "../schemas";
import { summarizeWeeklyHours } from "./opening-hours";

const weekly = siteSettingsSchema.parse(siteDefaults).openingHours.weekly;

describe("summarizeWeeklyHours", () => {
  it("groups consecutive days with the same hours (plan P-12)", () => {
    expect(summarizeWeeklyHours(weekly)).toEqual([
      { days: "Pazartesi", hours: "Kapalı" },
      { days: "Salı – Cumartesi", hours: "10:00 – 20:00" },
      { days: "Pazar", hours: "11:00 – 18:00" },
    ]);
  });

  it("does not merge equal hours that are not consecutive", () => {
    const split = { ...weekly, "3": [] as [string, string][] };
    expect(summarizeWeeklyHours(split)).toEqual([
      { days: "Pazartesi", hours: "Kapalı" },
      { days: "Salı", hours: "10:00 – 20:00" },
      { days: "Çarşamba", hours: "Kapalı" },
      { days: "Perşembe – Cumartesi", hours: "10:00 – 20:00" },
      { days: "Pazar", hours: "11:00 – 18:00" },
    ]);
  });

  it("lists split shifts on one line", () => {
    const shifts = {
      ...weekly,
      "2": [
        ["10:00", "13:00"],
        ["14:00", "20:00"],
      ] as [string, string][],
    };
    expect(summarizeWeeklyHours(shifts)[1]).toEqual({
      days: "Salı",
      hours: "10:00 – 13:00, 14:00 – 20:00",
    });
  });
});
