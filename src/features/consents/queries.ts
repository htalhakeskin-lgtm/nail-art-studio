import "server-only";

import { count, desc, eq, sql } from "drizzle-orm";

import { db } from "@/server/db/client";
import { appointments, consentRecords, leads } from "@/server/db/schema";

/** What the form recorded: the notice was shown with the form (K-32), not a marketing opt-in. */
export const consentKindLabels: Record<string, string> = {
  information_notice: "Aydınlatma metni bildirildi",
};

export const consentSourceLabels: Record<string, string> = {
  contactForm: "İletişim formu",
  appointmentForm: "Randevu formu",
};

export const CONSENTS_PAGE_SIZE = 50;

export type ConsentRow = {
  id: string;
  createdAt: Date;
  kind: string;
  granted: boolean;
  textVersion: string;
  source: string;
  subjectRef: string;
  ipHash: string | null;
  /** The request or appointment the record belongs to, when it still exists. */
  subject: { type: "lead" | "appointment"; id: string; code: string } | null;
};

const columns = {
  id: consentRecords.id,
  createdAt: consentRecords.createdAt,
  kind: consentRecords.kind,
  granted: consentRecords.granted,
  textVersion: consentRecords.textVersion,
  source: consentRecords.source,
  subjectRef: consentRecords.subjectRef,
  ipHash: consentRecords.ipHash,
  leadId: leads.id,
  leadCode: leads.code,
  appointmentId: appointments.id,
  appointmentCode: appointments.code,
};

function query() {
  // subject_ref is text so any table can be referenced; the join casts the uuid side.
  return db
    .select(columns)
    .from(consentRecords)
    .leftJoin(leads, eq(sql`${leads.id}::text`, consentRecords.subjectRef))
    .leftJoin(appointments, eq(sql`${appointments.id}::text`, consentRecords.subjectRef))
    .orderBy(desc(consentRecords.createdAt), desc(consentRecords.id));
}

function toRow(row: Awaited<ReturnType<typeof query>>[number]): ConsentRow {
  const { leadId, leadCode, appointmentId, appointmentCode, ...record } = row;
  const subject =
    leadId && leadCode
      ? ({ type: "lead", id: leadId, code: leadCode } as const)
      : appointmentId && appointmentCode
        ? ({ type: "appointment", id: appointmentId, code: appointmentCode } as const)
        : null;
  return { ...record, subject };
}

/** SCR-111 (REQ-019, A-31): newest first, one page at a time. Never cached. */
export async function listConsentRecords(
  page: number,
): Promise<{ items: ConsentRow[]; total: number }> {
  const [rows, [total]] = await Promise.all([
    query()
      .limit(CONSENTS_PAGE_SIZE)
      .offset((page - 1) * CONSENTS_PAGE_SIZE),
    db.select({ value: count() }).from(consentRecords),
  ]);
  return { items: rows.map(toRow), total: total?.value ?? 0 };
}

/** CSV export: every record, capped so one request stays small. */
export async function listConsentRecordsForExport(limit = 10_000): Promise<ConsentRow[]> {
  return (await query().limit(limit)).map(toRow);
}
