import { describe, expect, it } from "vitest";

import { nextSortOrder, planMove } from "./order";

const items = [
  { id: "a", category: "randevu", sortOrder: 10 },
  { id: "b", category: "randevu", sortOrder: 20 },
  { id: "c", category: "randevu", sortOrder: 30 },
  { id: "x", category: "bakim", sortOrder: 10 },
];

describe("planMove", () => {
  it("swaps with the neighbour above", () => {
    expect(planMove(items, "b", "up")).toEqual([
      { id: "b", sortOrder: 10 },
      { id: "a", sortOrder: 20 },
    ]);
  });

  it("swaps with the neighbour below", () => {
    expect(planMove(items, "b", "down")).toEqual([
      { id: "b", sortOrder: 30 },
      { id: "c", sortOrder: 20 },
    ]);
  });

  it.each([
    ["a", "up"],
    ["c", "down"],
    ["x", "up"], // only item in its category
    ["missing", "up"],
  ] as const)("returns null at the edge (%s %s)", (id, direction) => {
    expect(planMove(items, id, direction)).toBeNull();
  });

  it("never crosses into another category", () => {
    const moved = planMove(items, "x", "down");
    expect(moved).toBeNull();
  });

  it("separates equal sort orders instead of swapping identical values", () => {
    const tied = [
      { id: "a", category: "uygulama", sortOrder: 5 },
      { id: "b", category: "uygulama", sortOrder: 5 },
    ];
    expect(planMove(tied, "b", "up")).toEqual([
      { id: "b", sortOrder: 5 },
      { id: "a", sortOrder: 6 },
    ]);
  });
});

describe("nextSortOrder", () => {
  it("places a new item after the last one in its category", () => {
    expect(nextSortOrder(items, "randevu")).toBe(40);
  });

  it("starts at 10 in an empty category", () => {
    expect(nextSortOrder(items, "hijyen")).toBe(10);
  });
});
