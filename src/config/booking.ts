/**
 * Booking sets and defaults (plan §9 `appointments`, P-01…P-07): shared by the table's check
 * constraints, the domain and the forms, so this file has no dependencies.
 */
export const APPOINTMENT_STATUSES = [
  "pending",
  "confirmed",
  "completed",
  "no_show",
  "cancelled",
] as const;

/** Statuses that hold the time slot (the exclusion constraint's WHERE clause). */
export const SLOT_HOLDING_STATUSES = ["pending", "confirmed", "completed"] as const;

export const APPOINTMENT_SOURCES = ["online", "admin"] as const;

export const TIME_OFF_KINDS = ["leave", "holiday", "block"] as const;

/** P-07: "request" waits for the owner's approval, "instant" confirms at once. */
export const BOOKING_MODES = ["request", "instant"] as const;

/** Defaults for site_settings.booking (the panel edits the stored copy). */
export const BOOKING_DEFAULTS = {
  bufferMinutes: 15, // P-01 cleaning and sterilisation after each appointment
  slotStepMinutes: 15, // P-02
  minLeadHours: 3, // P-03
  horizonDays: 45, // P-04
  manageCutoffHours: 24, // P-05
  maxFuturePerPhone: 2, // P-06
  mode: "request", // P-07
} as const;

/** P-09: the manage link stays valid until this long after the appointment ends. */
export const MANAGE_LINK_DAYS_AFTER = 30;
