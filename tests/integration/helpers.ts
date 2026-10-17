import type { Session } from "@/server/auth";

/** A signed-in panel user for adminAction (the session read itself is Better Auth's job). */
export function sessionFor(role: "owner" | "admin" | "staff", id = `user-${role}`): Session {
  return {
    user: { id, name: "Test", email: `${role}@example.com`, role },
    session: { id: `session-${id}`, userId: id },
  } as unknown as Session;
}
