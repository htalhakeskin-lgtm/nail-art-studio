import { describe, expect, it } from "vitest";

import { buildIcs, canSelfManage, googleCalendarUrl, refillDate } from "./manage";

const startsAt = new Date("2026-10-27T07:00:00Z"); // Tuesday 10:00 Istanbul

describe("BR-RND-007: self-service window", () => {
  it.each([
    ["pending", "2026-10-26T07:00:00Z", true], // exactly 24 hours before
    ["confirmed", "2026-10-25T12:00:00Z", true],
    ["confirmed", "2026-10-26T07:01:00Z", false], // inside the last 24 hours
    ["cancelled", "2026-10-20T07:00:00Z", false],
    ["completed", "2026-10-20T07:00:00Z", false],
  ] as const)("%s at %s → %s", (status, now, allowed) => {
    expect(canSelfManage({ status, startsAt }, new Date(now), 24)).toBe(allowed);
  });
});

describe("BR-RND-013: refill suggestion", () => {
  it("adds the service's interval to the Istanbul day, or nothing without one", () => {
    expect(refillDate(startsAt, 21)).toBe("2026-11-17");
    // 23:30 UTC is already the next day in Istanbul.
    expect(refillDate(new Date("2026-10-27T22:30:00Z"), 1)).toBe("2026-10-29");
    expect(refillDate(startsAt, null)).toBeNull();
  });
});

describe("calendar files (E-08, E-09)", () => {
  const event = {
    uid: "NAS-7K2Q@nail-art-studios",
    start: startsAt,
    end: new Date("2026-10-27T08:00:00Z"),
    summary: "Nail Art Studios: Kalıcı oje",
    description: "Kod: NAS-7K2Q, değişiklik için bağlantı",
    location: "Caferağa Mah. Moda Cad. No: 00, Kadıköy / İstanbul",
  };

  it("writes a valid single event in UTC with escaped text and CRLF lines", () => {
    const ics = buildIcs(event, new Date("2026-10-22T12:00:00Z"));
    expect(ics.startsWith("BEGIN:VCALENDAR\r\nVERSION:2.0\r\n")).toBe(true);
    expect(ics).toContain("DTSTART:20261027T070000Z\r\n");
    expect(ics).toContain("DTEND:20261027T080000Z\r\n");
    expect(ics).toContain("DESCRIPTION:Kod: NAS-7K2Q\\, değişiklik için bağlantı");
    expect(ics).toContain("LOCATION:Caferağa Mah. Moda Cad. No: 00\\, Kadıköy / İstanbul");
    expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
    for (const line of ics.split("\r\n")) {
      expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75);
    }
  });

  it("builds a Google Calendar link with the same times", () => {
    const url = new URL(googleCalendarUrl(event));
    expect(url.hostname).toBe("calendar.google.com");
    expect(url.searchParams.get("dates")).toBe("20261027T070000Z/20261027T080000Z");
    expect(url.searchParams.get("text")).toBe("Nail Art Studios: Kalıcı oje");
  });
});
