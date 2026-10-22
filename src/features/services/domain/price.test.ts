import { describe, expect, it } from "vitest";

import {
  durationRange,
  effectivePriceDisplay,
  serviceBookingMessage,
  servicePriceMessage,
  visiblePrice,
} from "./price";

const NBSP = " ";
const priced = { priceMinor: 65000, priceDisplayOverride: null };

describe("price display (K-05)", () => {
  it("BR-HZM-001: shows no amount while P-08 is contact", () => {
    expect(visiblePrice(priced, "contact")).toBeNull();
  });

  it("BR-HZM-001: a service override hides or shows regardless of P-08", () => {
    expect(visiblePrice({ ...priced, priceDisplayOverride: "contact" }, "show")).toBeNull();
    expect(visiblePrice({ ...priced, priceDisplayOverride: "show" }, "contact")).toBe(
      `650${NBSP}₺`,
    );
    expect(effectivePriceDisplay({ ...priced, priceDisplayOverride: "show" }, "contact")).toBe(
      "show",
    );
  });

  it("shows a stored price when P-08 is show, and nothing for an empty or zero price", () => {
    expect(visiblePrice({ ...priced, priceMinor: 123456 }, "show")).toBe(`1.234,56${NBSP}₺`);
    expect(visiblePrice({ ...priced, priceMinor: null }, "show")).toBeNull();
    expect(visiblePrice({ ...priced, priceMinor: 0 }, "show")).toBeNull();
  });

  it("BR-HZM-001: WhatsApp messages never contain a price", () => {
    const service = { name: "Kalıcı oje", priceMinor: 65000 };
    for (const message of [
      serviceBookingMessage("Merhaba.", service),
      servicePriceMessage("Merhaba.", service),
    ]) {
      expect(message).toContain("Kalıcı oje");
      expect(message).not.toMatch(/₺|650|\d+,\d{2}/);
    }
  });
});

describe("durationRange", () => {
  it("writes a range, a single value or nothing", () => {
    expect(durationRange([{ durationMinutes: 45 }, { durationMinutes: 90 }])).toBe(
      "45 dk – 1 sa 30 dk",
    );
    expect(durationRange([{ durationMinutes: 60 }, { durationMinutes: 60 }])).toBe("1 sa");
    expect(durationRange([])).toBeNull();
  });
});
