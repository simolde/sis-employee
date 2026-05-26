import {
  ClipboardList,
  FileText,
  Fingerprint,
  Gauge,
  Megaphone,
  Settings,
  ShieldCheck,
  UserRoundCog,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import {
  canManageEmployees,
  canManageRfid,
  canManageSettings,
  canViewAllAttendance,
  canViewAuditLogs,
  type SystemRole,
} from "@/lib/security/roles";

export type SidebarNavigationItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  description: string;
};

export function getSidebarNavigation(
  role: SystemRole,
): SidebarNavigationItem[] {
  const items: SidebarNavigationItem[] = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: Gauge,
      description: "Overview and quick actions",
    },
  ];

  if (canManageEmployees(role)) {
    items.push({
      href: "/dashboard/employees",
      label: "Employees",
      icon: UserRoundCog,
      description: "Employee records and accounts",
    });
  }

  if (canViewAllAttendance(role)) {
    items.push({
      href: "/dashboard/attendance",
      label: "Attendance",
      icon: ClipboardList,
      description: "Attendance management",
    });
  } else {
    items.push({
      href: "/dashboard/attendance/odl",
      label: "ODL Attendance",
      icon: ClipboardList,
      description: "Self-service time-in/time-out",
    });
  }

  if (canManageRfid(role)) {
    items.push({
      href: "/dashboard/rfid",
      label: "RFID Cards",
      icon: Fingerprint,
      description: "RFID assignment and history",
    });
  }

  items.push(
    {
      href: "/dashboard/leaves",
      label: "Leaves",
      icon: FileText,
      description: "Leave requests and balances",
    },
    {
      href: "/dashboard/notices",
      label: "Notices",
      icon: Megaphone,
      description: "Announcements and advisories",
    },
  );

  if (canViewAuditLogs(role)) {
    items.push({
      href: "/dashboard/audit-logs",
      label: "Audit Logs",
      icon: ShieldCheck,
      description: "System activity history",
    });
  }

  if (canManageSettings(role)) {
    items.push({
      href: "/dashboard/settings",
      label: "Settings",
      icon: Settings,
      description: "System configuration",
    });
  }

  return items;
}