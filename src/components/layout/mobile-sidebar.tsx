"use client";

import Link from "next/link";
import { X, GraduationCap } from "lucide-react";
import { usePathname } from "next/navigation";
import type { SystemRole } from "@/lib/security/roles";
import { getSidebarNavigation } from "./navigation";

type MobileSidebarProps = {
  role: SystemRole;
  open: boolean;
  onClose: () => void;
};

function isActiveRoute(pathname: string, href: string): boolean {
  if (href === "/dashboard") {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileSidebar({ role, open, onClose }: MobileSidebarProps) {
  const pathname = usePathname();
  const navigation = getSidebarNavigation(role);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        aria-label="Close sidebar overlay"
        className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
        onClick={onClose}
      />

      <aside className="starland-sidebar relative z-10 flex h-full w-[min(86vw,320px)] flex-col px-4 py-5 shadow-2xl">
        <div className="mb-7 flex items-center justify-between gap-3 px-2">
          <Link href="/dashboard" className="flex items-center gap-3" onClick={onClose}>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/12 text-white shadow-sm">
              <GraduationCap className="h-6 w-6" aria-hidden="true" />
            </div>

            <div>
              <p className="text-sm font-extrabold leading-5 text-white">
                Starland
              </p>
              <p className="text-xs font-semibold text-white/65">
                Attendance
              </p>
            </div>
          </Link>

          <button
            type="button"
            className="starland-btn starland-btn-soft starland-btn-sm border-white/15 bg-white/10 text-white hover:bg-white/15"
            onClick={onClose}
            aria-label="Close mobile sidebar"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <nav className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActiveRoute(pathname, item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
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
            Role
          </p>
          <p className="mt-1 text-sm font-extrabold text-white">{role}</p>
        </div>
      </aside>
    </div>
  );
}