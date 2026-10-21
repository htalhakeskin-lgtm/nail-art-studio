import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";

import { cacheLife } from "next/cache";

import { type LegalDocumentKey, legalDocuments } from "./documents";
import { type ParsedLegalDocument, parseLegalDocument } from "./domain/parse";

/** Read once at build time; the text changes only with a deploy (versioned file). */
export async function getLegalDocument(key: LegalDocumentKey): Promise<ParsedLegalDocument> {
  "use cache";
  cacheLife("max");
  const file = path.join(process.cwd(), "content", "yasal", legalDocuments[key].file);
  return parseLegalDocument(await readFile(file, "utf8"));
}

/** Form texts (content/yasal/form-metinleri.md): not a page, but its version goes into consent records. */
export async function getFormTexts(): Promise<ParsedLegalDocument> {
  "use cache";
  cacheLife("max");
  const file = path.join(process.cwd(), "content", "yasal", "form-metinleri.md");
  return parseLegalDocument(await readFile(file, "utf8"));
}
