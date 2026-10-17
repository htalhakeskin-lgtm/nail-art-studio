import "server-only";

import { db } from "@/server/db/client";
import { auditLogs } from "@/server/db/schema";
import { hashIp } from "@/server/request";

type AuditEntry = {
  actorId: string;
  action: string; // "faq.update", "content_block.update" …
  entity: string;
  entityId: string;
  /** Only fields that changed; values must not contain personal data (11-guvenlik §11). */
  changes?: Record<string, { from: unknown; to: unknown }>;
  ip?: string;
};

/** Who changed what (A-02). Append-only; the panel shows it on the record later. */
export async function recordAudit(entry: AuditEntry): Promise<void> {
  await db.insert(auditLogs).values({
    actorId: entry.actorId,
    action: entry.action,
    entity: entry.entity,
    entityId: entry.entityId,
    changes: entry.changes,
    ipHash: entry.ip ? hashIp(entry.ip) : null,
  });
}

/** Field-level diff for audit records: only keys whose value changed. */
export function diffFields<T extends Record<string, unknown>>(
  before: T,
  after: T,
): Record<string, { from: unknown; to: unknown }> {
  const changes: Record<string, { from: unknown; to: unknown }> = {};
  for (const key of Object.keys(after)) {
    if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
      changes[key] = { from: before[key], to: after[key] };
    }
  }
  return changes;
}
