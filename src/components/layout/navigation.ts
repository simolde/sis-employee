import type { LucideIcon } from "lucide-react";
import {
  Bell,
  CalendarCheck,
  ClipboardList,
  FileClock,
  Home,
  IdCard,
  Settings,
  Users,
} from "lucide-react";

export type NavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const navigationItems: NavigationItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    label: "Employees",
    href: "/dashboard/employees",
    icon: Users,
  },
  {
    label: "Attendance",
    href: "/dashboard/attendance",
    icon: CalendarCheck,
  },
  {
    href: "/dashboard/attendance/odl",
    label: "ODL Attendance",
    icon: CalendarCheck,
  },
  {
    label: "RFID Cards",
    href: "/dashboard/rfid",
    icon: IdCard,
  },
  {
    label: "Leaves",
    href: "/dashboard/leaves",
    icon: FileClock,
  },
  {
    label: "Notices",
    href: "/dashboard/notices",
    icon: Bell,
  },
  {
    label: "Audit Logs",
    href: "/dashboard/audit-logs",
    icon: ClipboardList,
  },
  {
    label: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
];

export function isActiveNavigationItem(pathname: string, href: string): boolean {
  if (href === "/dashboard") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}