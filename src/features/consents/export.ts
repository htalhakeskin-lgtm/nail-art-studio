import "server-only";

import { formatDateTime } from "@/lib/format";

import { toCsv } from "./domain/csv";
import { consentKindLabels, type ConsentRow, consentSourceLabels } from "./queries";

const HEADER = [
  "Tarih",
  "Kaynak",
  "Tür",
  "Verildi",
  "Metin sürümü",
  "Kayıt no",
  "Kayıt kimliği",
  "IP özeti",
] as const;

/** One CSV line per record, in the same words as the panel list. */
export function consentsCsv(rows: readonly ConsentRow[]): string {
  return toCsv(
    HEADER,
    rows.map((row) => [
      formatDateTime(row.createdAt),
      consentSourceLabels[row.source] ?? row.source,
      consentKindLabels[row.kind] ?? row.kind,
      row.granted ? "Evet" : "Hayır",
      row.textVersion,
      row.subject?.code ?? "",
      row.subjectRef,
      row.ipHash ?? "",
    ]),
  );
}
