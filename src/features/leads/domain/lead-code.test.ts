import { describe, expect, it } from "vitest";

import { formatLeadCode, isLeadCode, nextLeadCode } from "./lead-code";

describe("lead codes", () => {
  it("pads the yearly sequence to four digits", () => {
    expect(formatLeadCode(2026, 7)).toBe("TLP-2026-0007");
    expect(formatLeadCode(2026, 12345)).toBe("TLP-2026-12345");
  });

  it("continues after the highest code of the same year only", () => {
    expect(nextLeadCode([], 2026)).toBe("TLP-2026-0001");
    expect(nextLeadCode(["TLP-2026-0009", "TLP-2026-0024", "TLP-2025-0300"], 2026)).toBe(
      "TLP-2026-0025",
    );
    expect(nextLeadCode(["TLP-2025-0300", "bozuk"], 2026)).toBe("TLP-2026-0001");
  });

  it("recognises a code in a URL parameter", () => {
    expect(isLeadCode("TLP-2026-0001")).toBe(true);
    expect(isLeadCode("TLP-2026-1; drop")).toBe(false);
  });
});
