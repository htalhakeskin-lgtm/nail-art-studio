/**
 * Lead statuses (plan §9 `leads.status`): shared by the table's check constraint and the panel
 * forms, so this file has no dependencies.
 */
export const LEAD_STATUSES = ["new", "contacted", "closed", "lost", "spam"] as const;
