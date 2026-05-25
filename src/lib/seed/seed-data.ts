export const seedRoles = [
  {
    code: "SUPER_ADMIN",
    name: "Super Admin",
    description: "Full system access.",
  },
  {
    code: "HR",
    name: "Human Resource",
    description: "Manage employees, attendance, leaves, and notices.",
  },
  {
    code: "ADMIN",
    name: "Admin",
    description: "Manage operational attendance system records.",
  },
  {
    code: "HEAD",
    name: "Department Head",
    description: "View and review department attendance records.",
  },
  {
    code: "STAFF",
    name: "Staff",
    description: "View own dashboard, attendance, leaves, and notices.",
  },
  {
    code: "FACULTY",
    name: "Faculty",
    description: "View own dashboard, attendance, leaves, and notices.",
  },
  {
    code: "MAINTENANCE",
    name: "Maintenance",
    description: "View own dashboard, attendance, leaves, and notices.",
  },
] as const;

export const seedPermissions = [
  {
    code: "dashboard.view",
    name: "View Dashboard",
    module: "dashboard",
  },
  {
    code: "employees.view",
    name: "View Employees",
    module: "employees",
  },
  {
    code: "employees.manage",
    name: "Manage Employees",
    module: "employees",
  },
  {
    code: "attendance.view",
    name: "View Attendance",
    module: "attendance",
  },
  {
    code: "attendance.manage",
    name: "Manage Attendance",
    module: "attendance",
  },
  {
    code: "attendance.self",
    name: "Use Own Attendance",
    module: "attendance",
  },
  {
    code: "rfid.manage",
    name: "Manage RFID Cards",
    module: "rfid",
  },
  {
    code: "leaves.view",
    name: "View Leaves",
    module: "leaves",
  },
  {
    code: "leaves.manage",
    name: "Manage Leaves",
    module: "leaves",
  },
  {
    code: "leaves.self",
    name: "Use Own Leaves",
    module: "leaves",
  },
  {
    code: "notices.view",
    name: "View Notices",
    module: "notices",
  },
  {
    code: "notices.manage",
    name: "Manage Notices",
    module: "notices",
  },
  {
    code: "audit.view",
    name: "View Audit Logs",
    module: "audit",
  },
  {
    code: "settings.manage",
    name: "Manage Settings",
    module: "settings",
  },
] as const;

export const rolePermissionMap: Record<string, string[]> = {
  SUPER_ADMIN: seedPermissions.map((permission) => permission.code),
  HR: [
    "dashboard.view",
    "employees.view",
    "employees.manage",
    "attendance.view",
    "attendance.manage",
    "rfid.manage",
    "leaves.view",
    "leaves.manage",
    "notices.view",
    "notices.manage",
  ],
  ADMIN: [
    "dashboard.view",
    "employees.view",
    "employees.manage",
    "attendance.view",
    "attendance.manage",
    "rfid.manage",
    "leaves.view",
    "leaves.manage",
    "notices.view",
    "notices.manage",
  ],
  HEAD: [
    "dashboard.view",
    "employees.view",
    "attendance.view",
    "leaves.view",
    "notices.view",
  ],
  STAFF: [
    "dashboard.view",
    "attendance.self",
    "leaves.self",
    "notices.view",
  ],
  FACULTY: [
    "dashboard.view",
    "attendance.self",
    "leaves.self",
    "notices.view",
  ],
  MAINTENANCE: [
    "dashboard.view",
    "attendance.self",
    "leaves.self",
    "notices.view",
  ],
};