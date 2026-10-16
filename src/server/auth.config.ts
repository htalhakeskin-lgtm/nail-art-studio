import { betterAuth, type BetterAuthOptions } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { haveIBeenPwned, twoFactor } from "better-auth/plugins";

import { newId } from "@/server/db/columns";

/**
 * Better Auth options shared by the app (src/server/auth.ts) and the schema generator.
 * No env, database or "server-only" imports here: the CLI must be able to load this file.
 * After changing plugins or fields: pnpm auth:generate && pnpm db:generate
 */
export const authOptions = {
  appName: "Nail Art Studios",
  emailAndPassword: {
    enabled: true,
    disableSignUp: true, // panel users are invited; enable for account models C/D
    minPasswordLength: 15, // single-factor minimum (GV-02)
    maxPasswordLength: 128,
    revokeSessionsOnPasswordReset: true,
  },
  // Plural table names like every other table (03-kod KD-03; "user" is reserved in PostgreSQL).
  user: {
    modelName: "users",
    additionalFields: {
      role: { type: "string", required: false, defaultValue: "staff", input: false },
    },
  },
  session: {
    modelName: "sessions",
    expiresIn: 60 * 60 * 24 * 7, // absolute lifetime: 7 days (11-guvenlik §4)
    updateAge: 60 * 60 * 12, // refreshed at most every 12 hours of activity
  },
  account: { modelName: "accounts" },
  verification: { modelName: "verifications" },
  rateLimit: { enabled: true, storage: "database", modelName: "authRateLimits" },
  advanced: {
    database: { generateId: () => newId() },
    cookiePrefix: "app",
  },
  plugins: [
    haveIBeenPwned(),
    twoFactor({ schema: { twoFactor: { modelName: "twoFactors" } } }),
    nextCookies(),
  ],
} satisfies BetterAuthOptions;

/** Entry point for the CLI only. The app uses `auth` from src/server/auth.ts. */
export const auth = betterAuth(authOptions);
