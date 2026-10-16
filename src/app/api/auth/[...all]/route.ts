import { toNextJsHandler } from "better-auth/next-js";

import { auth } from "@/server/auth";

/** Better Auth HTTP endpoints (sign-out, session, 2FA). Sign-in goes through the panel action. */
export const { GET, POST } = toNextJsHandler(auth);
