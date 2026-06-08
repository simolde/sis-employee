"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BarChart3,
  BellRing,
  CalendarCheck,
  CalendarClock,
  ClipboardCheck,
  DatabaseZap,
  Gauge,
  History,
  ListChecks,
  Settings2,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import type { AttendanceAutomationAlertOverallStatus } from "../alerts/types/attendance-automation-alert-types";

type AttendanceAutomationSubnavProps = {
  alertCount?: number;

  alertStatus?:
    AttendanceAutomationAlertOverallStatus;
};

type AttendanceAutomationNavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  exact: boolean;
  showAlertBadge?: boolean;
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
      label: "Alerts",
      href: "/dashboard/attendance/automation/alerts",
      icon: BellRing,
      exact: true,
      showAlertBadge: true,
    },
    {
      label: "Acknowledgements",
      href: "/dashboard/attendance/automation/alerts/acknowledgements",
      icon: ShieldCheck,
      exact: true,
    },
    {
      label: "Automation Health",
      href: "/dashboard/attendance/automation/health",
      icon: Activity,
      exact: true,
    },
    {
      label: "Readiness",
      href: "/dashboard/attendance/automation/readiness",
      icon: ClipboardCheck,
      exact: true,
    },
    {
      label: "Scheduler",
      href: "/dashboard/attendance/automation/scheduler",
      icon: CalendarClock,
      exact: true,
    },
    {
      label: "Diagnostics",
      href: "/dashboard/attendance/automation/diagnostics",
      icon: DatabaseZap,
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

function alertBadgeClass(
  status:
    | AttendanceAutomationAlertOverallStatus
    | undefined,
): string {
  switch (status) {
    case "CRITICAL":
      return "bg-red-600 text-white";

    case "ATTENTION":
      return "bg-amber-500 text-white";

    case "HEALTHY":
    default:
      return "bg-[var(--starland-pale-green)] text-[var(--starland-dark-text)]";
  }
}

export function AttendanceAutomationSubnav({
  alertCount = 0,
  alertStatus = "HEALTHY",
}: AttendanceAutomationSubnavProps) {
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

          const showAlertBadge =
            item.showAlertBadge &&
            alertCount > 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={
                active
                  ? "page"
                  : undefined
              }
              aria-label={
                item.showAlertBadge
                  ? `${item.label}, ${alertCount} unacknowledged alert${alertCount === 1 ? "" : "s"}`
                  : item.label
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

              <span>{item.label}</span>

              {showAlertBadge ? (
                <span
                  className={[
                    "inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-extrabold leading-none",
                    alertBadgeClass(
                      alertStatus,
                    ),
                  ].join(" ")}
                >
                  {alertCount > 99
                    ? "99+"
                    : alertCount}
                </span>
              ) : null}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}