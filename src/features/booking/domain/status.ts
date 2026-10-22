import type { APPOINTMENT_STATUSES } from "@/config/booking";

export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

/**
 * BR-RND-008: allowed status changes. Completed, no-show and cancelled are final. Updates are
 * written with `WHERE status = <from>` so two clicks can never apply the same change twice.
 */
const transitions: Record<AppointmentStatus, readonly AppointmentStatus[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["completed", "no_show", "cancelled"],
  completed: [],
  no_show: [],
  cancelled: [],
};

export function canTransition(from: AppointmentStatus, to: AppointmentStatus): boolean {
  return transitions[from].includes(to);
}

export function nextStatuses(from: AppointmentStatus): readonly AppointmentStatus[] {
  return transitions[from];
}

export const appointmentStatusLabels: Record<AppointmentStatus, string> = {
  pending: "Onay bekliyor",
  confirmed: "Onaylandı",
  completed: "Tamamlandı",
  no_show: "Gelmedi",
  cancelled: "İptal edildi",
};
