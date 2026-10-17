/**
 * Colour maths for the contrast test (06-arayuz §3) and, later, theme presets.
 * OKLCH → linear sRGB (Björn Ottosson's matrices) → WCAG 2.x relative luminance.
 */
export type Oklch = { l: number; c: number; h: number };

export function parseOklch(value: string): Oklch | null {
  const match = /^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)$/.exec(value.trim());
  if (!match) return null;
  return { l: Number(match[1]), c: Number(match[2]), h: Number(match[3]) };
}

/** Linear-light sRGB channels, clamped to the displayable gamut. */
export function oklchToLinearSrgb({ l, c, h }: Oklch): [number, number, number] {
  const a = c * Math.cos((h * Math.PI) / 180);
  const b = c * Math.sin((h * Math.PI) / 180);
  const lp = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const mp = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const sp = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const clamp = (x: number) => Math.min(1, Math.max(0, x));
  return [
    clamp(4.0767416621 * lp - 3.3077115913 * mp + 0.2309699292 * sp),
    clamp(-1.2684380046 * lp + 2.6097574011 * mp - 0.3413193965 * sp),
    clamp(-0.0041960863 * lp - 0.7034186147 * mp + 1.707614701 * sp),
  ];
}

export function relativeLuminance(color: Oklch): number {
  const [r, g, b] = oklchToLinearSrgb(color);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** WCAG contrast ratio, 1 … 21. */
export function contrastRatio(foreground: Oklch, background: Oklch): number {
  const a = relativeLuminance(foreground);
  const b = relativeLuminance(background);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

/** `--name: oklch(…)` declarations of the first :root block; aliases (var(…)) are skipped. */
export function readOklchTokens(css: string): Record<string, Oklch> {
  const root = /:root\s*\{([\s\S]*?)\n\}/.exec(css)?.[1] ?? "";
  const tokens: Record<string, Oklch> = {};
  for (const [, name, value] of root.matchAll(/--([\w-]+):\s*(oklch\([^)]*\))/g)) {
    const parsed = value ? parseOklch(value) : null;
    if (name && parsed) tokens[name] = parsed;
  }
  return tokens;
}
