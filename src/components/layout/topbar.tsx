"use client";

import { Menu, LogOut } from "lucide-react";
import type { SystemRole } from "@/lib/security/roles";

type TopbarProps = {
  userName: string;
  role: SystemRole;
  onOpenMobileSidebar: () => void;
};

export function Topbar({
  userName,
  role,
  onOpenMobileSidebar,
}: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--starland-border)] bg-white/85 backdrop-blur-xl">
      <div className="flex min-h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="starland-btn starland-btn-secondary starland-btn-sm lg:hidden"
            onClick={onOpenMobileSidebar}
            aria-label="Open mobile sidebar"
          >
            <Menu className="h-4 w-4" aria-hidden="true" />
          </button>

          <div>
            <p className="text-sm font-extrabold text-[var(--starland-dark-text)]">
              Starland Employee Attendance
            </p>
            <p className="text-xs font-semibold text-[var(--starland-muted-text)]">
              Secure HR and attendance management
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-extrabold text-[var(--starland-dark-text)]">
              {userName}
            </p>
            <p className="text-xs font-semibold text-[var(--starland-muted-text)]">
              {role}
            </p>
          </div>

          <form action="/api/auth/logout" method="post">
            <button
              type="submit"
              className="starland-btn starland-btn-soft starland-btn-sm"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}