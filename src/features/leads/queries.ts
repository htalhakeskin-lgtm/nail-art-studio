import "server-only";

import { and, asc, count, desc, eq, isNull } from "drizzle-orm";

import { db } from "@/server/db/client";
import { consentRecords, demoOutbox, leads } from "@/server/db/schema";

import type { LeadStatus } from "./schemas";

/** Panel reads are never cached: the owner must see what just arrived. */

export type Lead = typeof leads.$inferSelect;
export type LeadListItem = Pick<
  Lead,
  "id" | "code" | "status" | "name" | "message" | "preferredChannel" | "readAt" | "createdAt"
>;

export async function listLeadsForPanel(status?: LeadStatus): Promise<LeadListItem[]> {
  return db
    .select({
      id: leads.id,
      code: leads.code,
      status: leads.status,
      name: leads.name,
      message: leads.message,
      preferredChannel: leads.preferredChannel,
      readAt: leads.readAt,
      createdAt: leads.createdAt,
    })
    .from(leads)
    .where(status ? eq(leads.status, status) : undefined)
    .orderBy(desc(leads.createdAt))
    .limit(200);
}

export async function countLeadsByStatus(): Promise<Record<LeadStatus, number>> {
  const rows = await db
    .select({ status: leads.status, value: count() })
    .from(leads)
    .groupBy(leads.status);
  const counts: Record<LeadStatus, number> = { new: 0, contacted: 0, closed: 0, lost: 0, spam: 0 };
  for (const row of rows) counts[row.status] = row.value;
  return counts;
}

/** Detail with its consent record and the notifications it produced (demo outbox). */
export async function getLeadForPanel(id: string) {
  const [lead] = await db.select().from(leads).where(eq(leads.id, id)).limit(1);
  if (!lead) return null;
  const [consents, messages] = await Promise.all([
    db
      .select({ textVersion: consentRecords.textVersion, createdAt: consentRecords.createdAt })
      .from(consentRecords)
      .where(eq(consentRecords.subjectRef, id))
      .orderBy(asc(consentRecords.createdAt)),
    db
      .select({ channel: demoOutbox.channel, to: demoOutbox.to, createdAt: demoOutbox.createdAt })
      .from(demoOutbox)
      .where(eq(demoOutbox.relatedId, id))
      .orderBy(asc(demoOutbox.createdAt)),
  ]);
  return { lead, consents, messages };
}

/** Opening a request marks it read (only the first time). */
export async function markLeadRead(id: string, now: Date): Promise<void> {
  await db
    .update(leads)
    .set({ readAt: now })
    .where(and(eq(leads.id, id), isNull(leads.readAt)));
}
