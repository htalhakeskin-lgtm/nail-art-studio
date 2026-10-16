"use server";

import { APIError } from "better-auth/api";
import type { Route } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { rateLimits } from "@/config/limits";
import { auth } from "@/server/auth";
import { db } from "@/server/db/client";
import { auditLogs } from "@/server/db/schema";
import { logger } from "@/server/logger";
import { consumeRateLimit, peekRateLimit } from "@/server/rate-limit";
import { clientIp, hashIp } from "@/server/request";

import { signInSchema, type SignInState } from "./schemas";
import { LOGIN_PATH } from "./session";

const WRONG_CREDENTIALS = "E-posta adresi ya da şifre hatalı.";

/** Z-28: panel sign-in. Same message for unknown e-mail and wrong password (no user probing). */
export async function signIn(_previous: SignInState, formData: FormData): Promise<SignInState> {
  const parsed = signInSchema.safeParse(Object.fromEntries(formData));
  const rawEmail = formData.get("email");
  const email = typeof rawEmail === "string" ? rawEmail : "";
  if (!parsed.success) {
    const { fieldErrors } = z.flattenError(parsed.error);
    return { fieldErrors: { email: fieldErrors.email, password: fieldErrors.password }, email };
  }

  // P-15 counts failed attempts only: a successful sign-in never locks the owner out.
  const ip = await clientIp();
  const limit = await peekRateLimit(rateLimits.panelSignIn, ip);
  if (!limit.allowed) {
    const minutes = Math.max(1, Math.ceil(limit.retryAfterSeconds / 60));
    return { message: `Çok fazla deneme yapıldı. ${minutes} dakika sonra tekrar deneyin.`, email };
  }

  try {
    await auth.api.signInEmail({
      body: { email: parsed.data.email, password: parsed.data.password },
      headers: await headers(),
    });
  } catch (error) {
    if (error instanceof APIError) {
      await consumeRateLimit(rateLimits.panelSignIn, ip);
      await db.insert(auditLogs).values({ action: "auth.login.failed", ipHash: hashIp(ip) });
      return { message: WRONG_CREDENTIALS, email };
    }
    logger.error("panel.sign_in_failed", { error: String(error) });
    return { message: "Giriş şu an yapılamıyor. Lütfen biraz sonra tekrar deneyin.", email };
  }

  // donus is validated against /panel paths by signInSchema, so the cast is safe.
  redirect((parsed.data.donus ?? "/panel") as Route);
}

export async function signOut(): Promise<void> {
  await auth.api.signOut({ headers: await headers() });
  redirect(LOGIN_PATH);
}
