export const systemRoles = [
  "SUPER_ADMIN",
  "HR",
  "ADMIN",
  "HEAD",
  "STAFF",
  "FACULTY",
  "MAINTENANCE",
] as const;

export type SystemRole = (typeof systemRoles)[number];

export function isSystemRole(role: string): role is SystemRole {
  return systemRoles.includes(role as SystemRole);
}

export function canAccessProtectedApp(role: SystemRole): boolean {
  return systemRoles.includes(role);
}

export function canManageEmployees(role: SystemRole): boolean {
  return ["SUPER_ADMIN", "HR", "ADMIN"].includes(role);
}

export function canManageRfid(role: SystemRole): boolean {
  return ["SUPER_ADMIN", "HR", "ADMIN"].includes(role);
}

export function canManageAttendance(role: SystemRole): boolean {
  return ["SUPER_ADMIN", "HR", "ADMIN"].includes(role);
}

export function canViewAllAttendance(role: SystemRole): boolean {
  return ["SUPER_ADMIN", "HR", "ADMIN", "HEAD"].includes(role);
}

export function canUseOdlWebAttendance(role: SystemRole): boolean {
  return [
    "SUPER_ADMIN",
    "HR",
    "ADMIN",
    "HEAD",
    "STAFF",
    "FACULTY",
    "MAINTENANCE",
  ].includes(role);
}

export function canManageLeaves(role: SystemRole): boolean {
  return ["SUPER_ADMIN", "HR", "ADMIN", "HEAD"].includes(role);
}

export function canManageNotices(role: SystemRole): boolean {
  return ["SUPER_ADMIN", "HR", "ADMIN"].includes(role);
}

export function canViewAuditLogs(role: SystemRole): boolean {
  return ["SUPER_ADMIN", "HR", "ADMIN"].includes(role);
}

export function canManageSettings(role: SystemRole): boolean {
  return ["SUPER_ADMIN"].includes(role);
}