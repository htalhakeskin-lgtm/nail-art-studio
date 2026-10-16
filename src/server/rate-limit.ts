import "server-only";

import { eq, lt, sql } from "drizzle-orm";

import { db } from "@/server/db/client";
import { actionRateLimits } from "@/server/db/schema";

export type RateLimitRule = { key: string; limit: number; windowSeconds: number };
export type RateLimitResult = { allowed: boolean; retryAfterSeconds: number };

/**
 * Fixed-window counter in PostgreSQL: one upsert per call, no extra service
 * (01-teknoloji-yigini). Move to Redis only if traffic requires it.
 */
export async function consumeRateLimit(
  rule: RateLimitRule,
  subject: string,
  now: Date = new Date(),
): Promise<RateLimitResult> {
  const windowMs = rule.windowSeconds * 1000;
  const windowStart = Math.floor(now.getTime() / windowMs) * windowMs;
  const expiresAt = new Date(windowStart + windowMs);
  const key = `${rule.key}:${subject}:${windowStart}`;

  const [row] = await db
    .insert(actionRateLimits)
    .values({ key, count: 1, expiresAt })
    .onConflictDoUpdate({
      target: actionRateLimits.key,
      set: { count: sql`${actionRateLimits.count} + 1` },
    })
    .returning({ count: actionRateLimits.count });

  const allowed = (row?.count ?? 1) <= rule.limit;
  const retryAfterSeconds = allowed ? 0 : Math.ceil((expiresAt.getTime() - now.getTime()) / 1000);
  return { allowed, retryAfterSeconds };
}

/**
 * Reads the current window without counting. For limits that only count failures (panel
 * sign-in): peek before the attempt, consumeRateLimit() after a failed one.
 */
export async function peekRateLimit(
  rule: RateLimitRule,
  subject: string,
  now: Date = new Date(),
): Promise<RateLimitResult> {
  const windowMs = rule.windowSeconds * 1000;
  const windowStart = Math.floor(now.getTime() / windowMs) * windowMs;
  const expiresAt = new Date(windowStart + windowMs);
  const [row] = await db
    .select({ count: actionRateLimits.count })
    .from(actionRateLimits)
    .where(eq(actionRateLimits.key, `${rule.key}:${subject}:${windowStart}`))
    .limit(1);
  const allowed = (row?.count ?? 0) < rule.limit;
  const retryAfterSeconds = allowed ? 0 : Math.ceil((expiresAt.getTime() - now.getTime()) / 1000);
  return { allowed, retryAfterSeconds };
}

/** Called by the daily cleanup cron. */
export async function purgeExpiredRateLimits(now: Date = new Date()): Promise<void> {
  await db.delete(actionRateLimits).where(lt(actionRateLimits.expiresAt, now));
}
