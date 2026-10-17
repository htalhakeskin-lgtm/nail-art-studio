import { z } from "zod";

/**
 * Legal texts live in content/yasal/*.md with a small front matter block (10-yasal §2):
 *   ---
 *   baslik: KVKK Aydınlatma Metni
 *   surum: 1.0
 *   yururluk: 2026-10-16
 *   ---
 * The version goes into consent_records.text_version. HTML comments are editor notes and
 * are removed before rendering.
 */
export const legalMetaSchema = z.object({
  baslik: z.string().min(1),
  surum: z.string().regex(/^\d+\.\d+$/),
  yururluk: z.iso.date(),
});

export type LegalMeta = z.infer<typeof legalMetaSchema>;
export type ParsedLegalDocument = { meta: LegalMeta; body: string };

const FRONT_MATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

export function parseLegalDocument(raw: string): ParsedLegalDocument {
  const match = FRONT_MATTER.exec(raw);
  if (!match) throw new Error("Legal document has no front matter");

  const fields = Object.fromEntries(
    (match[1] ?? "")
      .split(/\r?\n/)
      .map((line) => /^([a-z]+):\s*(.*)$/.exec(line.trim()))
      .filter((pair): pair is RegExpExecArray => pair !== null)
      .map((pair): [string, string] => [pair[1] ?? "", (pair[2] ?? "").trim()]),
  );

  const body = raw
    .slice(match[0].length)
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return { meta: legalMetaSchema.parse(fields), body };
}
