import { describe, expect, it } from "vitest";

import { toCsv } from "./csv";

describe("toCsv (REQ-019)", () => {
  it("writes a BOM, semicolons and CRLF line ends", () => {
    expect(toCsv(["Tarih", "Kaynak"], [["22 Ekim 2026 14:30", "İletişim formu"]])).toBe(
      "\uFEFFTarih;Kaynak\r\n22 Ekim 2026 14:30;İletişim formu\r\n",
    );
  });

  it("quotes separators and quotes, and defuses spreadsheet formulas", () => {
    const csv = toCsv(["a"], [["x;y"], ['"alıntı"'], ["=HYPERLINK(1)"], ["-1+1"]]);
    expect(csv.split("\r\n").slice(1, 5)).toEqual([
      '"x;y"',
      '"""alıntı"""',
      "'=HYPERLINK(1)",
      "'-1+1",
    ]);
  });
});
