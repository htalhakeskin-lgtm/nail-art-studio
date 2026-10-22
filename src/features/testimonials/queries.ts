import "server-only";

import { asc, eq } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

import { db } from "@/server/db/client";
import { services, testimonials } from "@/server/db/schema";
import { logger } from "@/server/logger";

/** Every testimonial mutation calls updateTag(TESTIMONIALS_TAG). */
export const TESTIMONIALS_TAG = "testimonials";

export type Testimonial = typeof testimonials.$inferSelect;
export type PublicTestimonial = Pick<Testimonial, "id" | "displayName" | "body" | "isSample"> & {
  serviceName: string | null;
};

/** Home page (SCR-001 §9): visible reviews in panel order, cached for every visitor. */
export async function getVisibleTestimonials(): Promise<PublicTestimonial[]> {
  "use cache";
  cacheLife("hours");
  cacheTag(TESTIMONIALS_TAG);

  try {
    return await db
      .select({
        id: testimonials.id,
        displayName: testimonials.displayName,
        body: testimonials.body,
        isSample: testimonials.isSample,
        serviceName: services.name,
      })
      .from(testimonials)
      .leftJoin(services, eq(testimonials.serviceId, services.id))
      .where(eq(testimonials.isVisible, true))
      .orderBy(asc(testimonials.sortOrder));
  } catch (error) {
    // The section is left out if the database is unreachable at build time.
    logger.error("testimonials.read_failed", { error: String(error) });
    return [];
  }
}

/** Panel list (SCR-107): every review including hidden ones, never cached. */
export async function listTestimonialsForPanel(): Promise<Testimonial[]> {
  return db.select().from(testimonials).orderBy(asc(testimonials.sortOrder));
}

export async function getTestimonialForPanel(id: string): Promise<Testimonial | null> {
  const [row] = await db.select().from(testimonials).where(eq(testimonials.id, id)).limit(1);
  return row ?? null;
}
