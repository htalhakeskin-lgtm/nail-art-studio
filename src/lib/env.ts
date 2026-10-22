import "server-only";

import { z } from "zod";

/**
 * Server configuration, validated once at start-up (11-guvenlik §10, 16-ortamlar-ve-yayin §3).
 * The app refuses to start with a missing or malformed variable. Never read process.env elsewhere.
 * Values exposed to the browser live in public-env.ts.
 */
const schema = z
  .object({
    NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
    DATABASE_URL: z.url(),
    DATABASE_URL_UNPOOLED: z.url().optional(),
    DEMO_MODE: z.stringbool().default(true),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.url(),
    IP_HASH_SALT: z.string().min(16),
    CRON_SECRET: z.string().min(16),
    DEMO_ADMIN_EMAIL: z.email().optional(),
    DEMO_ADMIN_PASSWORD: z.string().min(15).optional(),
    RESEND_API_KEY: z.string().min(1).optional(),
    EMAIL_FROM: z.string().min(3).optional(),
    BLOB_READ_WRITE_TOKEN: z.string().min(1).optional(),
    TURNSTILE_SECRET_KEY: z.string().min(1).optional(),
    SENTRY_DSN: z.url().optional(),
    VERCEL: z.stringbool().default(false), // set to "1" by Vercel: analytics script exists there only
  })
  .superRefine((value, ctx) => {
    if (value.DEMO_MODE) return;
    // Live mode: real channels must be configured, demo credentials must be gone.
    for (const key of ["RESEND_API_KEY", "EMAIL_FROM"] as const) {
      if (!value[key]) {
        ctx.addIssue({ code: "custom", path: [key], message: "DEMO_MODE=false iken zorunlu" });
      }
    }
    if (value.DEMO_ADMIN_PASSWORD) {
      ctx.addIssue({
        code: "custom",
        path: ["DEMO_ADMIN_PASSWORD"],
        message: "Canlı ortamda demo yönetici parolası tanımlanmamalı",
      });
    }
  });

function load() {
  // Empty values ("KEY=" copied from .env.example) count as unset.
  const raw = Object.fromEntries(
    // eslint-disable-next-line no-restricted-properties -- the single place that reads the environment
    Object.entries(process.env).map(([key, value]) => [key, value === "" ? undefined : value]),
  );
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    const details = z.prettifyError(parsed.error);
    throw new Error(`Invalid environment configuration:\n${details}`);
  }
  return parsed.data;
}

export const env = load();
export type Env = typeof env;
