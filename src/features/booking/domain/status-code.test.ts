import { describe, expect, it } from "vitest";

import { CODE_ALPHABET, generateAppointmentCode, isAppointmentCode } from "./code";
import { canTransition, nextStatuses } from "./status";

describe("BR-RND-008: status transitions", () => {
  it.each([
    ["pending", "confirmed", true],
    ["pending", "cancelled", true],
    ["pending", "completed", false],
    ["confirmed", "completed", true],
    ["confirmed", "no_show", true],
    ["confirmed", "cancelled", true],
    ["confirmed", "pending", false],
    ["cancelled", "confirmed", false],
    ["completed", "no_show", false],
  ] as const)("%s → %s is %s", (from, to, allowed) => {
    expect(canTransition(from, to)).toBe(allowed);
  });

  it("final statuses have no next step", () => {
    expect(nextStatuses("no_show")).toEqual([]);
  });
});

describe("BR-RND-010: appointment code", () => {
  it("uses NAS- and four unambiguous characters", () => {
    const code = generateAppointmentCode(() => Uint8Array.from([0, 1, 22, 23]));
    expect(code).toBe(`NAS-${CODE_ALPHABET[0] ?? ""}${CODE_ALPHABET[1] ?? ""}9A`);
    expect(isAppointmentCode(code)).toBe(true);
    expect(CODE_ALPHABET).not.toMatch(/[0O1IL2Z5S8B]/);
  });

  it("rejects anything else", () => {
    expect(isAppointmentCode("NAS-0OIL")).toBe(false);
    expect(isAppointmentCode("nas-acde")).toBe(false);
    expect(isAppointmentCode("NAS-ACDE; drop")).toBe(false);
  });
});
