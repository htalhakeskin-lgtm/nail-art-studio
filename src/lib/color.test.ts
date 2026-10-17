import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { contrastRatio, parseOklch, readOklchTokens } from "./color";

const css = readFileSync(path.join(process.cwd(), "src/app/globals.css"), "utf8");
const tokens = readOklchTokens(css);

/** WCAG 2.2 AA: text 4.5:1 (1.4.3), UI components and focus indicators 3:1 (1.4.11). */
const TEXT = 4.5;
const UI = 3;

const pairs: [foreground: string, background: string, minimum: number][] = [
  ["foreground", "background", TEXT],
  ["foreground", "surface", TEXT],
  ["foreground", "surface-muted", TEXT],
  ["muted-foreground", "background", TEXT],
  ["muted-foreground", "surface", TEXT],
  ["muted-foreground", "surface-muted", TEXT],
  ["primary", "background", TEXT], // links and accent text
  ["primary", "surface-muted", TEXT],
  ["primary-foreground", "primary", TEXT],
  ["accent-foreground", "accent", TEXT],
  ["foreground", "lila", TEXT],
  ["foreground", "nane", TEXT],
  ["foreground", "seftali", TEXT],
  ["foreground", "gok", TEXT],
  ["success", "success-muted", TEXT],
  ["warning", "warning-muted", TEXT],
  ["danger", "danger-muted", TEXT],
  ["danger", "background", TEXT], // field errors
  ["info", "info-muted", TEXT],
  ["input", "background", UI], // form field borders
  ["input", "surface", UI],
  ["ring", "background", UI], // focus outline
  ["ring", "surface-muted", UI],
];

describe("design tokens", () => {
  it("parses OKLCH values", () => {
    expect(parseOklch("oklch(0.45 0.13 5)")).toEqual({ l: 0.45, c: 0.13, h: 5 });
    expect(parseOklch("#fff")).toBeNull();
  });

  it("matches known WCAG ratios", () => {
    const white = { l: 1, c: 0, h: 0 };
    const black = { l: 0, c: 0, h: 0 };
    expect(contrastRatio(black, white)).toBeCloseTo(21, 1);
    expect(contrastRatio(white, white)).toBeCloseTo(1, 5);
  });

  it.each(pairs)("%s on %s meets %s:1", (foreground, background, minimum) => {
    const fg = tokens[foreground];
    const bg = tokens[background];
    expect(fg, `--${foreground} is defined as oklch()`).toBeDefined();
    expect(bg, `--${background} is defined as oklch()`).toBeDefined();
    if (!fg || !bg) return;
    expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(minimum);
  });
});
