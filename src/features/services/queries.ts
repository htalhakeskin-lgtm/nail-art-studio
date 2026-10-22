import "server-only";

import { asc, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

import { db } from "@/server/db/client";
import { services } from "@/server/db/schema";
import { logger } from "@/server/logger";

import { serviceCategories } from "./schemas";

/** Every service mutation calls updateTag(SERVICES_TAG). */
export const SERVICES_TAG = "services";

export type Service = typeof services.$inferSelect;

const byCategoryThenOrder = (a: Service, b: Service) =>
  serviceCategories.indexOf(a.category) - serviceCategories.indexOf(b.category) ||
  a.sortOrder - b.sortOrder;

/** Public pages (SCR-002 / 003, home §5): active services in menu order, cached. */
export async function listActiveServices(): Promise<Service[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(SERVICES_TAG);

  try {
    const rows = await db.select().from(services).where(eq(services.isActive, true));
    return rows.toSorted(byCategoryThenOrder);
  } catch (error) {
    // Pages still render (empty state) if the database is unreachable at build time.
    logger.error("services.read_failed", { error: String(error) });
    return [];
  }
}

/** Panel list (SCR-105): every service including hidden ones, never cached. */
export async function listServicesForPanel(): Promise<Service[]> {
  const rows = await db.select().from(services).orderBy(asc(services.sortOrder));
  return rows.toSorted(byCategoryThenOrder);
}

export async function getServiceForPanel(id: string): Promise<Service | null> {
  const [row] = await db.select().from(services).where(eq(services.id, id)).limit(1);
  return row ?? null;
}
