"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarCheck,
  FileClock,
  RefreshCw,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";

type ExcusedNavigationItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  exact: boolean;
};

const navigationItems: ExcusedNavigationItem[] = [
  {
    label: "EXCUSED Records",
    href: "/dashboard/attendance/excused",
    icon: CalendarCheck,
    exact: true,
  },
  {
    label: "Approved Leave Sync",
    href: "/dashboard/attendance/excused/sync",
    icon: RefreshCw,
    exact: false,
  },
  {
    label: "Reconciliation",
    href: "/dashboard/attendance/excused/reconciliation",
    icon: ShieldAlert,
    exact: false,
  },
  {
    label: "Automation Audit",
    href: "/dashboard/attendance/excused/audit",
    icon: FileClock,
    exact: false,
  },
];

function isNavigationItemActive(input: {
  pathname: string;
  item: ExcusedNavigationItem;
}): boolean {
  if (input.item.exact) {
    return input.pathname === input.item.href;
  }

  return input.pathname.startsWith(
    input.item.href,
  );
}

export function ExcusedSubnav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="EXCUSED attendance navigation"
      className="starland-card p-3 print:hidden"
    >
      <div className="flex flex-wrap gap-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;

          const isActive =
            isNavigationItemActive({
              pathname,
              item,
            });

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={
                isActive ? "page" : undefined
              }
              className={[
                "starland-btn starland-btn-sm",
                isActive
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