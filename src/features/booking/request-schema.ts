import { z } from "zod";

import { toE164TR } from "@/lib/phone";

export const BOOKING_CHANNELS = ["whatsapp", "telefon"] as const;
export const bookingChannelLabels: Record<(typeof BOOKING_CHANNELS)[number], string> = {
  whatsapp: "WhatsApp",
  telefon: "Telefon",
};

/**
 * UC-01 visitor details (REQ-001). Same schema in the browser and in the action. The time comes
 * from the chosen slot; the server re-checks it against live availability (BR-RND-001…005).
 */
export const appointmentRequestSchema = z.object({
  serviceId: z.uuid("Bir hizmet seçin."),
  startsAt: z.iso.datetime({ offset: true, error: "Bir saat seçin." }),
  referenceWork: z
    .string()
    .regex(/^[a-z0-9-]{1,80}$/)
    .optional(),
  name: z
    .string()
    .trim()
    .min(2, "Lütfen adınızı yazın.")
    .max(80, "Ad en fazla 80 karakter olabilir."),
  phone: z
    .string()
    .trim()
    .transform((value, ctx) => {
      const e164 = toE164TR(value);
      if (!e164) {
        ctx.addIssue({ code: "custom", message: "Telefonu 0532 123 45 67 biçiminde yazın." });
        return z.NEVER;
      }
      return e164;
    }),
  email: z
    .string()
    .trim()
    .transform((value) => value || undefined)
    .pipe(z.email("Geçerli bir e-posta adresi yazın.").optional()),
  note: z.string().trim().max(500, "Not en fazla 500 karakter olabilir."),
  preferredChannel: z.enum(BOOKING_CHANNELS, "Size nasıl ulaşalım? Bir seçenek işaretleyin."),
});

export type AppointmentRequestValues = z.input<typeof appointmentRequestSchema>;

export function appointmentRequestValues(formData: FormData): AppointmentRequestValues {
  const text = (name: string) => {
    const value = formData.get(name);
    return typeof value === "string" ? value : "";
  };
  const referenceWork = text("referenceWork");
  return {
    serviceId: text("serviceId"),
    startsAt: text("startsAt"),
    ...(referenceWork ? { referenceWork } : {}),
    name: text("name"),
    phone: text("phone"),
    email: text("email"),
    note: text("note"),
    preferredChannel: text("preferredChannel") as AppointmentRequestValues["preferredChannel"],
  };
}
