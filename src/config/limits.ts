import type { RateLimitRule } from "@/server/rate-limit";

/**
 * Business parameters with plan numbers (plan §9, P-…) so a rule can be found by search
 * (02-mimari §4). Values that the owner edits (booking buffer, horizon…) live in
 * site_settings instead; only technical limits stay here.
 */
export const rateLimits = {
  /** P-10 Contact form: 5 per IP per hour */
  publicForm: { key: "public-form", limit: 5, windowSeconds: 3600 },
  /** P-10 Appointment creation: 5 per IP per hour */
  appointmentCreate: { key: "appointment-create", limit: 5, windowSeconds: 3600 },
  /** P-10 Appointments per phone number: 3 per day */
  appointmentPerPhone: { key: "appointment-phone", limit: 3, windowSeconds: 86400 },
  /** P-14 Panel uploads */
  upload: { key: "upload", limit: 30, windowSeconds: 600 },
  /** P-15 Failed panel sign-ins: 10 per IP per 15 minutes (on top of Better Auth's own limiter) */
  panelSignIn: { key: "panel-sign-in", limit: 10, windowSeconds: 900 },
} as const satisfies Record<string, RateLimitRule>;

/** P-13 A form filled faster than this is treated as a bot (honeypot timing check). */
export const MIN_FORM_FILL_MS = 1500;

/** P-11 Upload limits */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
export const MAX_IMAGE_EDGE_PX = 2560;
