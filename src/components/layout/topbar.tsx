"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut, Menu, UserRound } from "lucide-react";

type TopbarProps = {
  onOpenMobileSidebar: () => void;
  user: {
    name: string;
    role: string;
  };
};

export function Topbar({ onOpenMobileSidebar, user }: TopbarProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await fetch("/api/auth/logout", {
        method: "POST",
      });
    } finally {
      router.replace("/login");
      router.refresh();
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--starland-border)] bg-white/82 backdrop-blur-xl">
      <div className="flex min-h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="starland-btn starland-btn-secondary starland-btn-sm lg:hidden"
            aria-label="Open mobile menu"
            onClick={onOpenMobileSidebar}
          >
            <Menu className="h-4 w-4" aria-hidden="true" />
          </button>

          <div>
            <p className="text-sm font-extrabold text-[var(--starland-dark-text)]">
              Starland Employee Attendance System
            </p>
            <p className="hidden text-xs font-medium text-[var(--starland-muted-text)] sm:block">
              Secure attendance, HR records, RFID, leaves, and notices
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 rounded-2xl border border-[var(--starland-border)] bg-white px-3 py-2 shadow-sm sm:flex">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--starland-light-bg)] text-[var(--starland-main-green)]">
              <UserRound className="h-4 w-4" aria-hidden="true" />
            </div>

            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-[var(--starland-dark-text)]">
                {user.name}
              </p>
              <p className="truncate text-[0.7rem] font-medium text-[var(--starland-muted-text)]">
                {user.role}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="starland-btn starland-btn-soft"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            <LogOut className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">
              {isLoggingOut ? "Logging out..." : "Logout"}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}