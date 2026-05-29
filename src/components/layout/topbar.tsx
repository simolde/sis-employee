"use client";

import Link from "next/link";
import { Menu, Search } from "lucide-react";
import { TopbarNoticeBell } from "@/features/notices/components/topbar-notice-bell";

type UserLike = {
  name?: string | null;
  username?: string | null;
  email?: string | null;
  role?: string | null;
};

type SessionLike = UserLike & {
  user?: UserLike | null;
};

type TopbarProps = {
  userName?: string | null;
  userRole?: string | null;
  user?: UserLike | null;
  session?: SessionLike | null;
  onMobileMenuClick?: () => void;
  onMenuClick?: () => void;
  [key: string]: unknown;
};

function getDisplayName(props: TopbarProps): string {
  return (
    props.userName ??
    props.user?.name ??
    props.user?.username ??
    props.session?.name ??
    props.session?.username ??
    props.session?.user?.name ??
    props.session?.user?.username ??
    props.user?.email ??
    props.session?.email ??
    props.session?.user?.email ??
    "Starland User"
  );
}

function getDisplayRole(props: TopbarProps): string {
  return (
    props.userRole ??
    props.user?.role ??
    props.session?.role ??
    props.session?.user?.role ??
    "Authorized User"
  );
}

export function Topbar(props: TopbarProps) {
  const displayName = getDisplayName(props);
  const displayRole = getDisplayRole(props);
  const handleMenuClick = props.onMobileMenuClick ?? props.onMenuClick;

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--starland-border)] bg-[rgba(244,248,238,0.92)] px-4 py-3 backdrop-blur-xl sm:px-6">
      <div className="mx-auto flex max-w-screen-2xl items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--starland-border)] bg-white text-[var(--starland-dark-text)] shadow-sm lg:hidden"
            aria-label="Open sidebar"
            onClick={handleMenuClick}
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>

          <div className="hidden min-w-[260px] items-center gap-2 rounded-2xl border border-[var(--starland-border)] bg-white px-3 py-2 text-[var(--starland-muted-text)] shadow-sm md:flex">
            <Search className="h-4 w-4" aria-hidden="true" />
            <span className="text-sm">Search attendance, employees...</span>
          </div>

          <div className="min-w-0 md:hidden">
            <p className="truncate text-sm font-extrabold text-[var(--starland-dark-text)]">
              Starland Attendance
            </p>
            <p className="truncate text-xs font-semibold text-[var(--starland-muted-text)]">
              Employee System
            </p>
          </div>
        </div>

        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <TopbarNoticeBell />

          <div className="hidden min-w-0 text-right sm:block">
            <p className="truncate text-sm font-extrabold text-[var(--starland-dark-text)]">
              {displayName}
            </p>
            <p className="truncate text-xs font-semibold text-[var(--starland-muted-text)]">
              {displayRole}
            </p>
          </div>

          <Link
            href="/dashboard/settings"
            className="hidden h-10 w-10 items-center justify-center rounded-2xl bg-[var(--starland-main-green)] text-sm font-extrabold uppercase text-white shadow-sm sm:inline-flex"
            aria-label="Open settings"
          >
            {displayName.slice(0, 1).toUpperCase()}
          </Link>

          <form action="/api/auth/logout" method="post">
            <button
              type="submit"
              className="starland-btn starland-btn-secondary starland-btn-sm"
            >
              Logout
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}