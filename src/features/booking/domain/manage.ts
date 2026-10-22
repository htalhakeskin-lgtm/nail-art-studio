import type { AppointmentStatus } from "./status";
import { addDays, istanbulDate } from "./time";

/**
 * BR-RND-007: the visitor may reschedule or cancel an upcoming pending / confirmed appointment
 * until P-05 hours before it starts; after that, the page points to WhatsApp or a call.
 */
export function canSelfManage(
  appointment: { status: AppointmentStatus; startsAt: Date },
  now: Date,
  cutoffHours: number,
): boolean {
  if (appointment.status !== "pending" && appointment.status !== "confirmed") return false;
  return appointment.startsAt.getTime() - now.getTime() >= cutoffHours * 3_600_000;
}

/** BR-RND-013: suggested refill day = appointment day + the service's interval; none without one. */
export function refillDate(startsAt: Date, intervalDays: number | null): string | null {
  return intervalDays ? addDays(istanbulDate(startsAt), intervalDays) : null;
}

// ── Calendar files (E-08, E-09) ────────────────────────────────────────────────────────────

export type CalendarEvent = {
  uid: string;
  start: Date;
  end: Date;
  summary: string;
  description: string;
  location: string;
  url?: string;
};

const icsStamp = (at: Date) =>
  at
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");

/** RFC 5545 text: backslash, semicolon, comma and newlines escaped. */
const icsText = (value: string) =>
  value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

/** Lines longer than 75 octets are folded with CRLF + space (RFC 5545 §3.1). */
function fold(line: string): string {
  const bytes = new TextEncoder().encode(line);
  if (bytes.length <= 75) return line;
  const parts: string[] = [];
  let current = "";
  for (const char of line) {
    if (new TextEncoder().encode(current + char).length > (parts.length === 0 ? 75 : 74)) {
      parts.push(current);
      current = char;
    } else {
      current += char;
    }
  }
  parts.push(current);
  return parts.join("\r\n ");
}

/** A single-event .ics file in UTC, so every calendar shows the Istanbul time correctly. */
export function buildIcs(event: CalendarEvent, now: Date): string {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Nail Art Studios//Randevu//TR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.uid}`,
    `DTSTAMP:${icsStamp(now)}`,
    `DTSTART:${icsStamp(event.start)}`,
    `DTEND:${icsStamp(event.end)}`,
    `SUMMARY:${icsText(event.summary)}`,
    `DESCRIPTION:${icsText(event.description)}`,
    `LOCATION:${icsText(event.location)}`,
    ...(event.url ? [`URL:${event.url}`] : []),
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return `${lines.map(fold).join("\r\n")}\r\n`;
}

/** "Google Takvim'e ekle" link (E-09). */
export function googleCalendarUrl(event: CalendarEvent): string {
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: event.summary,
    dates: `${icsStamp(event.start)}/${icsStamp(event.end)}`,
    details: event.description,
    location: event.location,
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
