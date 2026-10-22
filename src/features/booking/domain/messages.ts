import { formatDate, formatTime } from "@/lib/format";

/**
 * Texts about one appointment (REQ-005, K-35): the code, the service and the time — nothing
 * promotional, and never a price (BR-HZM-001). No suffix is attached to a variable value.
 */
export type AppointmentSummary = { code: string; serviceName: string; startsAt: Date };

export function describeAppointmentTime(startsAt: Date): string {
  return `${formatDate(startsAt, "withWeekday")} ${formatTime(startsAt)}`;
}

/** "WhatsApp'tan ilet" on the confirmation screen (PRJ-01). */
export function appointmentShareMessage(greeting: string, appointment: AppointmentSummary): string {
  return [
    `${greeting} Online randevu talebim:`,
    `Kod: ${appointment.code}`,
    `Hizmet: ${appointment.serviceName}`,
    `Tarih: ${describeAppointmentTime(appointment.startsAt)}`,
  ].join("\n");
}

/** Gallery technique → the service a "Bu tasarımı istiyorum" booking starts with (REQ-011). */
const serviceForTechnique: Record<string, string> = {
  "kalici-oje": "kalici-oje",
  jel: "jel-guclendirme",
  protez: "protez-tirnak",
};

export function serviceSlugForWork(work: { technique: string; style: string }): string {
  if (["desenli", "cicekli", "rengarenk"].includes(work.style) && work.technique === "kalici-oje") {
    return "el-boyamasi-nail-art";
  }
  return serviceForTechnique[work.technique] ?? "kalici-oje";
}

/** Morning / afternoon / evening groups for the time buttons (K-35). */
export function groupByDayPart<T extends { clock: string }>(
  slots: readonly T[],
): { label: string; slots: T[] }[] {
  const groups = [
    { label: "Sabah", slots: slots.filter((slot) => slot.clock < "12:00") },
    {
      label: "Öğleden sonra",
      slots: slots.filter((slot) => slot.clock >= "12:00" && slot.clock < "17:00"),
    },
    { label: "Akşam", slots: slots.filter((slot) => slot.clock >= "17:00") },
  ];
  return groups.filter((group) => group.slots.length > 0);
}
