import "server-only";

import { redirect } from "next/navigation";

import { hasPermission, type Permission } from "@/config/permissions";
import { getSession, type Session } from "@/server/auth";

export const LOGIN_PATH = "/panel/giris";

/**
 * Real panel guard (src/proxy.ts only checks that a cookie exists). Call it at the top of
 * every panel layout; server actions use adminAction() with their own permission.
 */
export async function requirePanelUser(permission: Permission = "leads.view"): Promise<Session> {
  const session = await getSession();
  if (!session) redirect(LOGIN_PATH);
  const role = (session.user as { role?: string | null }).role;
  if (!hasPermission(role, permission)) redirect(`${LOGIN_PATH}?hata=yetki`);
  return session;
}
