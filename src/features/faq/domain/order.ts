/** Ordering rules for FAQs: order is kept per category (the public page groups by category). */
export type Orderable = { id: string; category: string; sortOrder: number };

/** Sort order for a new item: after the last one in its category. */
export function nextSortOrder(items: readonly Orderable[], category: string): number {
  const orders = items.filter((item) => item.category === category).map((item) => item.sortOrder);
  return orders.length === 0 ? 10 : Math.max(...orders) + 10;
}

/**
 * Moving an item swaps its sort order with the neighbour in the same category. Returns the two
 * updates, or null at the edge (first item up, last item down) or for an unknown id.
 */
export function planMove(
  items: readonly Orderable[],
  id: string,
  direction: "up" | "down",
): { id: string; sortOrder: number }[] | null {
  const current = items.find((item) => item.id === id);
  if (!current) return null;
  const siblings = items
    .filter((item) => item.category === current.category)
    .toSorted((a, b) => a.sortOrder - b.sortOrder || a.id.localeCompare(b.id, "en"));
  const index = siblings.findIndex((item) => item.id === id);
  const neighbour = siblings[direction === "up" ? index - 1 : index + 1];
  if (!neighbour) return null;
  // Equal orders (legacy data) would swap to the same values: spread them first.
  if (neighbour.sortOrder === current.sortOrder) {
    const base = direction === "up" ? neighbour.sortOrder : current.sortOrder;
    return direction === "up"
      ? [
          { id: current.id, sortOrder: base },
          { id: neighbour.id, sortOrder: base + 1 },
        ]
      : [
          { id: neighbour.id, sortOrder: base },
          { id: current.id, sortOrder: base + 1 },
        ];
  }
  return [
    { id: current.id, sortOrder: neighbour.sortOrder },
    { id: neighbour.id, sortOrder: current.sortOrder },
  ];
}
