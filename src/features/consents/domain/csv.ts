/**
 * CSV for spreadsheet programs set to Turkish: ";" separates columns (Excel's list separator
 * under tr-TR) and a UTF-8 BOM keeps "ş, ğ, ı" intact. Cells that a spreadsheet would run as a
 * formula (=, +, -, @, tab, CR) are prefixed with an apostrophe (CSV injection, 11-guvenlik).
 */
const FORMULA_START = /^[=+\-@\t\r]/;

function cell(value: string): string {
  const safe = FORMULA_START.test(value) ? `'${value}` : value;
  return /[";\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

export function toCsv(header: readonly string[], rows: readonly (readonly string[])[]): string {
  const lines = [header, ...rows].map((row) => row.map(cell).join(";"));
  return `\uFEFF${lines.join("\r\n")}\r\n`;
}
