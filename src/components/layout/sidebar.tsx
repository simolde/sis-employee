"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap } from "lucide-react";
import { isActiveNavigationItem, navigationItems } from "./navigation";

type SidebarProps = {
  user: {
    name: string;
    role: string;
  };
};

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="starland-sidebar fixed inset-y-0 left-0 z-40 hidden w-72 flex-col overflow-y-auto px-4 py-5 lg:flex">
      <div className="mb-8 flex items-center gap-3 px-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
          <GraduationCap className="h-7 w-7 text-white" aria-hidden="true" />
        </div>

        <div>
          <p className="text-sm font-extrabold leading-tight text-white">
            Starland
          </p>
          <p className="text-xs font-medium text-white/65">
            Employee Attendance
          </p>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const active = isActiveNavigationItem(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={[
                "starland-sidebar-link",
                active ? "starland-sidebar-link-active" : "",
              ].join(" ")}
              aria-current={active ? "page" : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span className="text-sm font-semibold">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/10 p-4">
        <p className="text-sm font-bold text-white">{user.name}</p>
        <p className="mt-1 text-xs font-medium text-white/65">{user.role}</p>
      </div>
    </aside>
  );
}