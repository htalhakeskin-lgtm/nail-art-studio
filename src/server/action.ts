import "server-only";

import { randomUUID } from "node:crypto";

import { z } from "zod";

import { MIN_FORM_FILL_MS } from "@/config/limits";
import { hasPermission, type Permission } from "@/config/permissions";
import { fail, type Result } from "@/lib/result";
import { getSession, type Session } from "@/server/auth";
import { logger } from "@/server/logger";
import { consumeRateLimit, type RateLimitRule } from "@/server/rate-limit";
import { clientIp } from "@/server/request";

/**
 * Server action wrappers (05-sunucu-ve-api §3). Order: honeypot → validate → session and
 * permission → rate limit → handler → catch. Handlers return Result and never throw to the client.
 *
 * Usage:
 *   export const sendContact = publicAction({ schema: contactSchema, rateLimit: rateLimits.publicForm,
 *     handler: async (input, ctx) => { …; return ok({ code }) } });
 */

export type BaseContext = { requestId: string; ip: string; now: Date };
export type UserContext = BaseContext & { session: Session };

type Handler<S extends z.ZodType, T, C> = (input: z.output<S>, ctx: C) => Promise<Result<T>>;

type CommonOptions<S extends z.ZodType, T, C> = {
  schema: S;
  rateLimit?: RateLimitRule;
  handler: Handler<S, T, C>;
};

/** Hidden fields every public form sends (components/common/spam-guard.tsx). */
const spamGuardSchema = z.object({
  website: z.string().optional(), // honeypot: must stay empty
  formStartedAt: z.coerce.number().optional(), // ms timestamp when the form was rendered
});

async function execute<S extends z.ZodType, T, C extends BaseContext>(
  raw: unknown,
  options: CommonOptions<S, T, C>,
  buildContext: (base: BaseContext) => Promise<C | Result<never>>,
): Promise<Result<T>> {
  const requestId = randomUUID();
  try {
    const parsed = options.schema.safeParse(raw);
    if (!parsed.success) {
      const { fieldErrors } = z.flattenError(parsed.error);
      return fail("validation", { fieldErrors });
    }

    const base: BaseContext = { requestId, ip: await clientIp(), now: new Date() };
    const ctx = await buildContext(base);
    if ("ok" in ctx) return ctx; // the context builder rejected the call

    if (options.rateLimit) {
      const subject = "session" in ctx ? (ctx as UserContext).session.user.id : base.ip;
      const limit = await consumeRateLimit(options.rateLimit, subject, base.now);
      if (!limit.allowed) {
        const minutes = Math.max(1, Math.ceil(limit.retryAfterSeconds / 60));
        return fail("rateLimited", {
          message: `Çok fazla deneme yapıldı. ${minutes} dakika sonra tekrar deneyin.`,
        });
      }
    }

    return await options.handler(parsed.data, ctx);
  } catch (error) {
    logger.error("action.unexpected", { requestId, error: String(error) });
    return fail("unexpected", {
      errorId: requestId.slice(0, 8),
      message: `Bir sorun oluştu. Lütfen tekrar deneyin. Destek kodu: ${requestId.slice(0, 8)}`,
    });
  }
}

/** Anyone can call it: contact, quote, appointment request, newsletter. Honeypot is mandatory. */
export function publicAction<S extends z.ZodType, T>(options: CommonOptions<S, T, BaseContext>) {
  return async (raw: z.input<S> & z.input<typeof spamGuardSchema>): Promise<Result<T>> => {
    const guard = spamGuardSchema.safeParse(raw);
    const tooFast =
      guard.success &&
      guard.data.formStartedAt !== undefined &&
      Date.now() - guard.data.formStartedAt < MIN_FORM_FILL_MS;
    if (!guard.success || Boolean(guard.data.website) || tooFast) {
      logger.warn("action.spam_blocked", { reason: tooFast ? "too_fast" : "honeypot" });
      return fail("spam");
    }
    return execute(raw, options, (base) => Promise.resolve(base));
  };
}

/** Signed-in member ([C/D] account models). Ownership is checked in the handler's query. */
export function userAction<S extends z.ZodType, T>(options: CommonOptions<S, T, UserContext>) {
  return async (raw: z.input<S>): Promise<Result<T>> =>
    execute(raw, options, async (base) => {
      const session = await getSession();
      if (!session) return fail("unauthorized");
      return { ...base, session };
    });
}

/** Panel user with an explicit permission. S3+: write audit_logs inside the handler. */
export function adminAction<S extends z.ZodType, T>(
  options: CommonOptions<S, T, UserContext> & { permission: Permission },
) {
  return async (raw: z.input<S>): Promise<Result<T>> =>
    execute(raw, options, async (base) => {
      const session = await getSession();
      if (!session) return fail("unauthorized");
      const role = (session.user as { role?: string | null }).role;
      if (!hasPermission(role, options.permission)) {
        logger.warn("action.forbidden", {
          userId: session.user.id,
          permission: options.permission,
        });
        return fail("forbidden");
      }
      return { ...base, session };
    });
}
