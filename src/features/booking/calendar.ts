import "server-only";

import type { SiteSettings } from "@/features/site";
import { absoluteUrl } from "@/lib/seo";

import type { CalendarEvent } from "./domain/manage";
import { refillDate } from "./domain/manage";
import { istanbulDateTime } from "./domain/time";
import type { ManagedAppointment } from "./queries";

/** The appointment as a calendar event (E-08, E-09). Only time, place and code — no price. */
export function appointmentEvent(
  appointment: ManagedAppointment,
  settings: SiteSettings,
  token: string,
): CalendarEvent {
  return {
    uid: `${appointment.code}@nail-art-studios`,
    start: appointment.startsAt,
    end: appointment.endsAt,
    summary: `${settings.company.name}: ${appointment.serviceName}`,
    description: `Randevu kodu: ${appointment.code}\nDeğişiklik ya da iptal: ${absoluteUrl(`/randevu/yonet/${token}`)}`,
    location: settings.company.address,
    url: absoluteUrl(`/randevu/yonet/${token}`),
  };
}

/**
 * PRJ-03 / REQ-012: a reminder in the visitor's own calendar on the refill day (BR-RND-013),
 * linking to a new booking of the same service. Null when the service has no interval.
 */
export function refillEvent(
  appointment: ManagedAppointment,
  settings: SiteSettings,
): CalendarEvent | null {
  const day = refillDate(appointment.startsAt, appointment.refillIntervalDays);
  if (!day) return null;
  const bookingUrl = absoluteUrl(`/randevu?hizmet=${appointment.serviceSlug}`);
  return {
    uid: `${appointment.code}-yenileme@nail-art-studios`,
    start: istanbulDateTime(day, "10:00"),
    end: istanbulDateTime(day, "10:15"),
    summary: `Yenileme zamanı: ${appointment.serviceName}`,
    description: `Aynı hizmetten yeni randevu: ${bookingUrl}`,
    location: settings.company.address,
    url: bookingUrl,
  };
}
