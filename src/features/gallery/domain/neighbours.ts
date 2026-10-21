/** Work number on labels: "No. 007" (plan §11 "eser etiketi"). */
export function formatWorkNumber(number: number): string {
  return `No. ${String(number).padStart(3, "0")}`;
}

/** Previous / next work in gallery order, wrapping around so the walk never dead-ends. */
export function neighbours<T extends { slug: string }>(
  items: readonly T[],
  slug: string,
): { previous: T; next: T } | null {
  const index = items.findIndex((item) => item.slug === slug);
  if (index === -1 || items.length < 2) return null;
  return {
    previous: items[(index - 1 + items.length) % items.length] as T,
    next: items[(index + 1) % items.length] as T,
  };
}

type Comparable = { slug: string; style: string; colors: readonly string[] };

/**
 * "Benzer işler": same style first, then shared colours; ties keep gallery order. The current
 * work is never included, and works with nothing in common are left out.
 */
export function similarItems<T extends Comparable>(
  items: readonly T[],
  current: T,
  limit = 4,
): T[] {
  const score = (item: T) =>
    (item.style === current.style ? 10 : 0) +
    item.colors.filter((color) => current.colors.includes(color)).length;
  return items
    .filter((item) => item.slug !== current.slug)
    .map((item, index) => ({ item, index, score: score(item) }))
    .filter((entry) => entry.score > 0)
    .toSorted((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .map(({ item }) => item);
}

/**
 * "Bu tasarımı istiyorum" WhatsApp text (PRJ-02, REQ-005): the site's greeting, then the work
 * number, title and link. No suffix is ever attached to the title (KURALLAR C).
 */
export function designRequestMessage(
  greeting: string,
  work: { number: number; title: string },
  url: string,
): string {
  const line = `${greeting} Galerideki şu tasarımı istiyorum: ${formatWorkNumber(work.number)} · ${work.title}`;
  return `${line}\n${url}`;
}
