"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BarChart3,
  CalendarCheck,
  Gauge,
  History,
  ListChecks,
  Settings2,
  type LucideIcon,
} from "lucide-react";

type AttendanceAutomationNavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  exact: boolean;
};

const navigationItems: AttendanceAutomationNavigationItem[] =
  [
    {
      label: "Automation Overview",
      href: "/dashboard/attendance/automation",
      icon: Gauge,
      exact: true,
    },
    {
      label: "Automation Health",
      href: "/dashboard/attendance/automation/health",
      icon: Activity,
      exact: true,
    },
    {
      label: "Reports",
      href: "/dashboard/attendance/automation/reports",
      icon: BarChart3,
      exact: true,
    },
    {
      label: "Configuration",
      href: "/dashboard/attendance/automation/configuration",
      icon: Settings2,
      exact: true,
    },
    {
      label: "Approved Leave EXCUSED",
      href: "/dashboard/attendance/automation/approved-leave-excused",
      icon: CalendarCheck,
      exact: true,
    },
    {
      label: "Run History",
      href: "/dashboard/attendance/automation/approved-leave-excused/history",
      icon: ListChecks,
      exact: false,
    },
    {
      label: "Attendance Audit",
      href: "/dashboard/attendance/audit",
      icon: History,
      exact: false,
    },
  ];

function isItemActive(input: {
  pathname: string;
  item: AttendanceAutomationNavigationItem;
}): boolean {
  if (input.item.exact) {
    return (
      input.pathname ===
      input.item.href
    );
  }

  return input.pathname.startsWith(
    input.item.href,
  );
}

export function AttendanceAutomationSubnav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Attendance automation navigation"
      className="starland-card p-3 print:hidden"
    >
      <div className="flex flex-wrap gap-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;

          const active = isItemActive({
            pathname,
            item,
          });

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={
                active
                  ? "page"
                  : undefined
              }
              className={[
                "starland-btn starland-btn-sm",
                active
                  ? "starland-btn-primary"
                  : "starland-btn-soft",
              ].join(" ")}
            >
              <Icon
                className="h-4 w-4"
                aria-hidden="true"
              />

              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}