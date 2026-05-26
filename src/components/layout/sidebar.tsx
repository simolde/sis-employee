"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap } from "lucide-react";
import type { SystemRole } from "@/lib/security/roles";
import { getSidebarNavigation } from "./navigation";

type SidebarProps = {
  role: SystemRole;
};

function isActiveRoute(pathname: string, href: string): boolean {
  if (href === "/dashboard") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const navigation = getSidebarNavigation(role);

  return (
    <aside className="starland-sidebar hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-72 lg:flex-col">
      <div className="flex min-h-0 flex-1 flex-col px-4 py-5">
        <Link href="/dashboard" className="mb-7 flex items-center gap-3 px-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/12 text-white shadow-sm">
            <GraduationCap className="h-6 w-6" aria-hidden="true" />
          </div>

          <div>
            <p className="text-sm font-extrabold leading-5 text-white">
              Starland
            </p>
            <p className="text-xs font-semibold text-white/65">
              Employee Attendance
            </p>
          </div>
        </Link>

        <nav className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActiveRoute(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={[
                  "starland-sidebar-link",
                  active ? "starland-sidebar-link-active" : "",
                ].join(" ")}
              >
                <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-3xl border border-white/10 bg-white/8 p-4 text-white/75">
          <p className="text-xs font-bold uppercase tracking-wide text-white/45">
            Signed in as
          </p>
          <p className="mt-1 text-sm font-extrabold text-white">{role}</p>
          <p className="mt-2 text-xs leading-5 text-white/60">
            Navigation is filtered by your role and permissions.
          </p>
        </div>
      </div>
    </aside>
  );
}