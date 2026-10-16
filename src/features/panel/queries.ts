import "server-only";

import { count, desc, eq } from "drizzle-orm";

import { renderTemplate, type TemplateName } from "@/server/channels/templates";
import { db } from "@/server/db/client";
import { demoOutbox, leads } from "@/server/db/schema";

/** Panel reads are never cached: the owner must see what just happened. */

export async function getPanelOverview() {
  const [[newLeads], [allLeads], [outbox]] = await Promise.all([
    db.select({ value: count() }).from(leads).where(eq(leads.status, "new")),
    db.select({ value: count() }).from(leads),
    db.select({ value: count() }).from(demoOutbox),
  ]);
  return {
    newLeads: newLeads?.value ?? 0,
    allLeads: allLeads?.value ?? 0,
    outbox: outbox?.value ?? 0,
  };
}

export type DemoMessage = {
  id: string;
  channel: string;
  to: string;
  template: string;
  createdAt: Date;
  subject: string | null;
  text: string;
};

function render(template: string, data: Record<string, unknown>) {
  try {
    return renderTemplate(template as TemplateName, data as never);
  } catch {
    // Template renamed or data shape changed since the message was stored.
    return { subject: null, text: JSON.stringify(data, null, 2) };
  }
}

/** Z-06: messages that would have been sent while DEMO_MODE=true, newest first. */
export async function listDemoMessages(limit = 50): Promise<DemoMessage[]> {
  const rows = await db.select().from(demoOutbox).orderBy(desc(demoOutbox.createdAt)).limit(limit);
  return rows.map((row) => ({
    id: row.id,
    channel: row.channel,
    to: row.to,
    template: row.template,
    createdAt: row.createdAt,
    ...render(row.template, row.data),
  }));
}
