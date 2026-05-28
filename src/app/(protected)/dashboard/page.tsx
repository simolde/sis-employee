import Link from "next/link";
import {
  CalendarCheck,
  Clock3,
  IdCard,
  Megaphone,
  UserRound,
} from "lucide-react";
import { DashboardNoticeList } from "@/features/notices/components/dashboard-notice-list";

export default function DashboardPage() {
  return (
    <section className="starland-page space-y-5">
      <div>
        <span className="starland-badge starland-badge-success">
          Starland Attendance
        </span>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
          Dashboard
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
          Monitor attendance activity, employee records, RFID assignment,
          leave requests, and school announcements.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="starland-card p-5">
          <UserRound className="h-6 w-6 text-[var(--starland-info)]" />
          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Employees
          </p>
          <h2 className="mt-1 text-2xl font-extrabold text-[var(--starland-dark-text)]">
            Employee Records
          </h2>
          <Link
            href="/dashboard/employees"
            className="starland-btn starland-btn-soft starland-btn-sm mt-4"
          >
            View Employees
          </Link>
        </article>

        <article className="starland-card p-5">
          <CalendarCheck className="h-6 w-6 text-[var(--starland-success)]" />
          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Attendance
          </p>
          <h2 className="mt-1 text-2xl font-extrabold text-[var(--starland-dark-text)]">
            Time Records
          </h2>
          <Link
            href="/dashboard/attendance"
            className="starland-btn starland-btn-soft starland-btn-sm mt-4"
          >
            View Attendance
          </Link>
        </article>

        <article className="starland-card p-5">
          <IdCard className="h-6 w-6 text-[var(--starland-warning)]" />
          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            RFID
          </p>
          <h2 className="mt-1 text-2xl font-extrabold text-[var(--starland-dark-text)]">
            RFID Cards
          </h2>
          <Link
            href="/dashboard/rfid"
            className="starland-btn starland-btn-soft starland-btn-sm mt-4"
          >
            Manage RFID
          </Link>
        </article>

        <article className="starland-card p-5">
          <Clock3 className="h-6 w-6 text-[var(--starland-danger)]" />
          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Leaves
          </p>
          <h2 className="mt-1 text-2xl font-extrabold text-[var(--starland-dark-text)]">
            Leave Requests
          </h2>
          <Link
            href="/dashboard/leaves"
            className="starland-btn starland-btn-soft starland-btn-sm mt-4"
          >
            View Leaves
          </Link>
        </article>
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <DashboardNoticeList />

        <section className="starland-card overflow-hidden">
          <div className="border-b border-[var(--starland-border)] px-5 py-4">
            <div className="flex items-center gap-2">
              <Megaphone
                className="h-5 w-5 text-[var(--starland-main-green)]"
                aria-hidden="true"
              />
              <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
                Quick Actions
              </h2>
            </div>
            <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
              Common attendance system shortcuts.
            </p>
          </div>

          <div className="space-y-3 p-5">
            <Link
              href="/dashboard/attendance/odl"
              className="starland-btn starland-btn-primary w-full"
            >
              ODL Time In / Time Out
            </Link>

            <Link
              href="/dashboard/leaves"
              className="starland-btn starland-btn-secondary w-full"
            >
              File Leave Request
            </Link>

            <Link
              href="/dashboard/notices"
              className="starland-btn starland-btn-soft w-full"
            >
              View Notices
            </Link>
          </div>
        </section>
      </div>
    </section>
  );
}