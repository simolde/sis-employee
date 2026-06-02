import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  History,
  Search,
  TimerOff,
} from "lucide-react";
import { getCurrentSession } from "@/features/auth/server/session";
import { OdlAttendanceHistoryTable } from "@/features/attendance/odl-history/components/odl-attendance-history-table";
import {
  getOdlAttendanceHistoryData,
  parseOdlAttendanceHistorySearchParams,
} from "@/features/attendance/odl-history/server/odl-attendance-history-queries";
import type { OdlAttendanceHistoryFilters } from "@/features/attendance/odl-history/types/odl-attendance-history-types";

type OdlAttendanceHistoryPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function OdlAttendanceHistoryFiltersForm({
  filters,
}: {
  filters: OdlAttendanceHistoryFilters;
}) {
  return (
    <section className="starland-card p-5">
      <form className="grid gap-4 sm:grid-cols-[1fr_1fr_auto_auto] sm:items-end">
        <div>
          <label
            htmlFor="dateFrom"
            className="text-sm font-bold text-[var(--starland-dark-text)]"
          >
            Date From
          </label>

          <input
            id="dateFrom"
            name="dateFrom"
            type="date"
            className="starland-input mt-2"
            defaultValue={filters.dateFrom}
          />
        </div>

        <div>
          <label
            htmlFor="dateTo"
            className="text-sm font-bold text-[var(--starland-dark-text)]"
          >
            Date To
          </label>

          <input
            id="dateTo"
            name="dateTo"
            type="date"
            className="starland-input mt-2"
            defaultValue={filters.dateTo}
          />
        </div>

        <button type="submit" className="starland-btn starland-btn-primary">
          <Search className="h-4 w-4" aria-hidden="true" />
          Apply
        </button>

        <Link
          href="/dashboard/attendance/odl/history"
          className="starland-btn starland-btn-soft"
        >
          Reset
        </Link>
      </form>
    </section>
  );
}

export default async function OdlAttendanceHistoryPage({
  searchParams,
}: OdlAttendanceHistoryPageProps) {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  const resolvedSearchParams = await searchParams;
  const filters = parseOdlAttendanceHistorySearchParams(resolvedSearchParams);

  const result = await getOdlAttendanceHistoryData({
    userId: session.userId,
    filters,
  });

  return (
    <section className="starland-page space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="starland-badge starland-badge-success">
            ODL Attendance
          </span>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
            My ODL Attendance History
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            View your own WEB / ODL attendance records, including time-in,
            time-out, status, and total hours.
          </p>
        </div>

        <Link
          href="/dashboard/attendance/odl"
          className="starland-btn starland-btn-soft"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to ODL Time In / Out
        </Link>
      </div>

      <section className="starland-card overflow-hidden">
        <div className="bg-[var(--starland-deep-green)] p-5 text-white sm:p-6">
          <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
            Logged-in Employee
          </span>

          <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
            {result.employee?.fullName ?? "No employee profile linked"}
          </h2>

          <p className="mt-2 max-w-4xl text-sm leading-6 text-white/70">
            {result.employee
              ? `${result.employee.empNumber} · ${result.employee.departmentName} · ${result.employee.designationName} · ${result.employee.branchName}`
              : "Your user account has no linked employee profile, so attendance history cannot be displayed."}
          </p>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <History className="h-7 w-7 text-[var(--starland-info)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Total ODL Records
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {result.summary.totalRecords}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <CheckCircle2 className="h-7 w-7 text-[var(--starland-success)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Completed
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {result.summary.completedRecords}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <Clock3 className="h-7 w-7 text-[var(--starland-warning)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Late
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {result.summary.lateRecords}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <TimerOff className="h-7 w-7 text-[var(--starland-danger)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Missing Timeout
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {result.summary.missingTimeoutRecords}
            </p>
          </article>
        </div>
      </section>

      <OdlAttendanceHistoryFiltersForm filters={result.filters} />

      <OdlAttendanceHistoryTable result={result} />
    </section>
  );
}