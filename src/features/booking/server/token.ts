import "server-only";

import { createHash, randomBytes } from "node:crypto";

/**
 * BR-RND-009: the manage link carries 32 random bytes; only their SHA-256 is stored, so a
 * leaked database never reveals working links.
 */
export function createManageToken(): { token: string; hash: string } {
  const token = randomBytes(32).toString("base64url");
  return { token, hash: hashManageToken(token) };
}

export function hashManageToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** A well-formed token is 43 base64url characters; anything else is rejected before a query. */
export function isManageToken(value: string): boolean {
  return /^[A-Za-z0-9_-]{43}$/.test(value);
}
