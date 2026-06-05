import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  FileClock,
  PencilLine,
  Search,
} from "lucide-react";
import { requireCanManageEmployees } from "@/features/auth/server/permission-guards";
import { AttendanceExceptionAuditActions } from "@/features/attendance/exceptions/audit/components/attendance-exception-audit-actions";
import { AttendanceExceptionAuditTable } from "@/features/attendance/exceptions/audit/components/attendance-exception-audit-table";
import {
  getAttendanceExceptionAuditData,
  parseAttendanceExceptionAuditSearchParams,
} from "@/features/attendance/exceptions/audit/server/attendance-exception-audit-queries";
import type { AttendanceExceptionAuditFilters } from "@/features/attendance/exceptions/audit/types/attendance-exception-audit-types";

type AttendanceExceptionAuditPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const actionOptions = [
  {
    label: "All Actions",
    value: "",
  },
  {
    label: "Created",
    value: "ATTENDANCE_EXCEPTION_CREATED",
  },
  {
    label: "Updated",
    value: "ATTENDANCE_EXCEPTION_UPDATED",
  },
  {
    label: "Archived",
    value: "ATTENDANCE_EXCEPTION_ARCHIVED",
  },
];

function AttendanceExceptionAuditFiltersForm({
  filters,
}: {
  filters: AttendanceExceptionAuditFilters;
}) {
  return (
    <section className="starland-card p-5 print:hidden">
      <form className="grid gap-4 xl:grid-cols-4">
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

        <div>
          <label
            htmlFor="action"
            className="text-sm font-bold text-[var(--starland-dark-text)]"
          >
            Action
          </label>

          <select
            id="action"
            name="action"
            className="starland-input mt-2"
            defaultValue={filters.action}
          >
            {actionOptions.map((option) => (
              <option key={option.value || "ALL"} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="q"
            className="text-sm font-bold text-[var(--starland-dark-text)]"
          >
            Search
          </label>

          <input
            id="q"
            name="q"
            className="starland-input mt-2"
            placeholder="Action, entity ID, entity type"
            defaultValue={filters.q}
          />
        </div>

        <div className="flex items-end gap-2 xl:col-span-4">
          <button type="submit" className="starland-btn starland-btn-primary">
            <Search className="h-4 w-4" aria-hidden="true" />
            Apply Filters
          </button>

          <Link
            href="/dashboard/attendance/exceptions/audit"
            className="starland-btn starland-btn-soft"
          >
            Reset
          </Link>
        </div>
      </form>
    </section>
  );
}

export default async function AttendanceExceptionAuditPage({
  searchParams,
}: AttendanceExceptionAuditPageProps) {
  await requireCanManageEmployees();

  const resolvedSearchParams = await searchParams;
  const filters =
    parseAttendanceExceptionAuditSearchParams(resolvedSearchParams);
  const result = await getAttendanceExceptionAuditData(filters);

  return (
    <section className="starland-page space-y-5">
      <div className="flex flex-col gap-4 print:hidden sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="starland-badge starland-badge-info">
            Exception Audit
          </span>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
            Exception Calendar Audit
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            Review create, update, and archive activity logs for attendance
            exception dates.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:items-end">
          <AttendanceExceptionAuditActions result={result} />

          <div className="flex flex-wrap gap-2">
            <Link
              href="/dashboard/attendance/exceptions"
              className="starland-btn starland-btn-primary"
            >
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
              Exception Calendar
            </Link>

            <Link
              href="/dashboard/attendance/actions"
              className="starland-btn starland-btn-soft"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Attendance Actions
            </Link>
          </div>
        </div>
      </div>

      <section className="starland-card overflow-hidden print:shadow-none">
        <div className="bg-[var(--starland-deep-green)] p-5 text-white sm:p-6">
          <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
            Audit Trail
          </span>

          <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
            Exception Calendar Change History
          </h2>

          <p className="mt-2 max-w-4xl text-sm leading-6 text-white/70">
            These logs help verify when holidays, class suspensions, no-work
            days, rest days, and branch-specific exceptions were created,
            changed, or archived.
          </p>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <FileClock className="h-7 w-7 text-[var(--starland-info)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Total Logs
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {result.summary.totalLogs}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <Search className="h-7 w-7 text-[var(--starland-main-green)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Matching Logs
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {result.summary.matchingLogs}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <CalendarDays className="h-7 w-7 text-[var(--starland-success)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Created Logs
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {result.summary.createdLogs}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <PencilLine className="h-7 w-7 text-[var(--starland-warning)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Updated / Archived
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {result.summary.updatedLogs + result.summary.archivedLogs}
            </p>

            <p className="mt-1 text-xs font-semibold text-[var(--starland-muted-text)]">
              Updated: {result.summary.updatedLogs} · Archived:{" "}
              {result.summary.archivedLogs}
            </p>
          </article>
        </div>
      </section>

      <AttendanceExceptionAuditFiltersForm filters={result.filters} />

      <AttendanceExceptionAuditTable result={result} />
    </section>
  );
}