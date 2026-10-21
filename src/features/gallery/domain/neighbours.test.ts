import { describe, expect, it } from "vitest";

import { designRequestMessage, formatWorkNumber, neighbours, similarItems } from "./neighbours";

const first = { slug: "a", style: "sade", colors: ["pembe"] };
const last = { slug: "d", style: "desenli", colors: ["siyah"] };
const items = [
  first,
  { slug: "b", style: "french", colors: ["beyaz", "pembe"] },
  { slug: "c", style: "sade", colors: ["mavi"] },
  last,
];

describe("gallery neighbours", () => {
  it("formats work numbers with three digits", () => {
    expect(formatWorkNumber(7)).toBe("No. 007");
    expect(formatWorkNumber(1234)).toBe("No. 1234");
  });

  it("wraps around at both ends", () => {
    expect(neighbours(items, "a")).toMatchObject({ previous: { slug: "d" }, next: { slug: "b" } });
    expect(neighbours(items, "d")).toMatchObject({ previous: { slug: "c" }, next: { slug: "a" } });
    expect(neighbours(items, "x")).toBeNull();
    expect(neighbours([first], "a")).toBeNull();
  });

  it("ranks the same style first, then shared colours, never the work itself", () => {
    expect(similarItems(items, first).map((item) => item.slug)).toEqual(["c", "b"]);
    expect(similarItems(items, last)).toEqual([]);
    expect(similarItems(items, first, 1).map((item) => item.slug)).toEqual(["c"]);
  });

  it("PRJ-02: builds the design request message with the work number, title and link", () => {
    const work = { number: 3, title: "Gökkuşağı stiletto" };
    expect(designRequestMessage("Merhaba.", work, "https://x.test/galeri/a")).toBe(
      "Merhaba. Galerideki şu tasarımı istiyorum: No. 003 · Gökkuşağı stiletto\nhttps://x.test/galeri/a",
    );
  });
});
