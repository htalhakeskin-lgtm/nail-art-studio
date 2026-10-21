/**
 * Visitor-facing request number (plan §9: `TLP-2026-0042`). Sequential per year so it is easy to
 * read out on the phone; the database's unique index settles a race between two submissions.
 */
const PATTERN = /^TLP-(\d{4})-(\d{4,})$/;

export function formatLeadCode(year: number, sequence: number): string {
  return `TLP-${String(year)}-${String(sequence).padStart(4, "0")}`;
}

/** Next code for the year after the highest existing one (codes of other years are ignored). */
export function nextLeadCode(existing: readonly string[], year: number): string {
  const highest = existing.reduce((max, code) => {
    const match = PATTERN.exec(code);
    if (!match || Number(match[1]) !== year) return max;
    return Math.max(max, Number(match[2]));
  }, 0);
  return formatLeadCode(year, highest + 1);
}

export function isLeadCode(value: string): boolean {
  return PATTERN.test(value);
}
