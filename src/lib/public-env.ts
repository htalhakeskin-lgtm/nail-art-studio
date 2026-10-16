import { z } from "zod";

/**
 * Configuration that is safe to expose to the browser. Only NEXT_PUBLIC_* variables are
 * inlined by Next.js, and only when referenced literally — hence the explicit object below.
 */
const schema = z.object({
  NEXT_PUBLIC_SITE_URL: z.url(),
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().min(1).optional(),
});

// DEMO_MODE is deliberately not public: the demo banner and noindex are rendered on the server.
const orUndefined = (value: string | undefined) => (value === "" ? undefined : value);

export const publicEnv = schema.parse({
  // eslint-disable-next-line no-restricted-properties -- literal references are required for inlining
  NEXT_PUBLIC_SITE_URL: orUndefined(process.env.NEXT_PUBLIC_SITE_URL),
  // eslint-disable-next-line no-restricted-properties -- literal references are required for inlining
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: orUndefined(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY),
});
