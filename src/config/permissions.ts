/**
 * Role → permission matrix (11-guvenlik §5, plan §8). Permission codes are `resource.action`.
 * The panel hides what a role cannot do, but the server is the authority: every adminAction
 * declares the permission it needs.
 */
export const PERMISSIONS = [
  "leads.view",
  "leads.edit",
  "content.edit",
  "settings.edit",
  "users.manage",
  "audit.view",
  "gallery.edit",
  // Feature permissions, e.g. "appointments.view", "appointments.confirm"
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export const ROLES = ["owner", "admin", "staff"] as const;
export type Role = (typeof ROLES)[number];

const matrix: Record<Role, readonly Permission[]> = {
  owner: PERMISSIONS,
  admin: [
    "leads.view",
    "leads.edit",
    "content.edit",
    "gallery.edit",
    "settings.edit",
    "audit.view",
  ],
  staff: ["leads.view", "leads.edit"],
};

export function hasPermission(role: string | null | undefined, permission: Permission): boolean {
  if (!role || !(ROLES as readonly string[]).includes(role)) return false;
  return matrix[role as Role].includes(permission);
}
