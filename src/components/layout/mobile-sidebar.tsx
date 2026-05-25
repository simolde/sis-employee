"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GraduationCap, X } from "lucide-react";
import { isActiveNavigationItem, navigationItems } from "./navigation";

type MobileSidebarProps = {
  open: boolean;
  onClose: () => void;
  user: {
    name: string;
    role: string;
  };
};

export function MobileSidebar({ open, onClose, user }: MobileSidebarProps) {
  const pathname = usePathname();

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/45"
        aria-label="Close mobile menu"
        onClick={onClose}
      />

      <aside className="starland-sidebar relative flex h-full w-[min(86vw,21rem)] flex-col overflow-y-auto px-4 py-5 shadow-2xl">
        <div className="mb-8 flex items-center justify-between gap-3 px-2">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
              <GraduationCap className="h-6 w-6 text-white" aria-hidden="true" />
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

          <button
            type="button"
            className="rounded-xl bg-white/10 p-2 text-white transition hover:bg-white/20"
            aria-label="Close mobile menu"
            onClick={onClose}
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
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
                onClick={onClose}
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
    </div>
  );
}