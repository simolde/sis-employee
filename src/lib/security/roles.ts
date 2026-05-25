export const SYSTEM_ROLES = [
  "SUPER_ADMIN",
  "HR",
  "ADMIN",
  "HEAD",
  "STAFF",
  "FACULTY",
  "MAINTENANCE",
] as const;

export type SystemRole = (typeof SYSTEM_ROLES)[number];

export const ROLE_LABELS: Record<SystemRole, string> = {
  SUPER_ADMIN: "Super Admin",
  HR: "Human Resource",
  ADMIN: "Admin",
  HEAD: "Department Head",
  STAFF: "Staff",
  FACULTY: "Faculty",
  MAINTENANCE: "Maintenance",
};

export const PROTECTED_DASHBOARD_PATH = "/dashboard";
export const LOGIN_PATH = "/login";

export function isSystemRole(value: string): value is SystemRole {
  return SYSTEM_ROLES.includes(value as SystemRole);
}

export function canAccessAdminArea(role: SystemRole): boolean {
  return ["SUPER_ADMIN", "HR", "ADMIN"].includes(role);
}

export function canManageEmployees(role: SystemRole): boolean {
  return ["SUPER_ADMIN", "HR", "ADMIN"].includes(role);
}

export function canManageAttendance(role: SystemRole): boolean {
  return ["SUPER_ADMIN", "HR", "ADMIN"].includes(role);
}

export function canViewAuditLogs(role: SystemRole): boolean {
  return role === "SUPER_ADMIN";
}

export function canManageRfid(role: SystemRole): boolean {
  return ["SUPER_ADMIN", "HR", "ADMIN"].includes(role);
}