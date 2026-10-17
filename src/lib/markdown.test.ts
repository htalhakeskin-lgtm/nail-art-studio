import { describe, expect, it } from "vitest";

import { markdownToPlainText } from "./markdown";

describe("markdownToPlainText", () => {
  it.each([
    ["Ayrıntılar: [Randevu koşulları](/randevu-kosullari).", "Ayrıntılar: Randevu koşulları."],
    ["**Kalıcı oje** _yaklaşık_ 3 hafta", "Kalıcı oje yaklaşık 3 hafta"],
    ["# Başlık\n\n- birinci\n- ikinci", "Başlık birinci ikinci"],
    ["> Not\n1. adım", "Not adım"],
    ["`kod` ve ![alt metin](/a.png)", "kod ve alt metin"],
  ])("%j → %j", (input, expected) => {
    expect(markdownToPlainText(input)).toBe(expected);
  });
});
