import Link from "next/link";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Search,
  ShieldCheck,
  TimerOff,
} from "lucide-react";
import { requireCanManageEmployees } from "@/features/auth/server/permission-guards";
import { AbsenceRollbackPanel } from "@/features/attendance/absences/rollback/components/absence-rollback-panel";
import {
  getAbsenceRollbackData,
  parseAbsenceRollbackSearchParams,
} from "@/features/attendance/absences/rollback/server/absence-rollback-queries";
import type {
  AbsenceRollbackFilters,
  AbsenceRollbackOption,
  AbsenceRollbackOptions,
  AbsenceRollbackResult,
} from "@/features/attendance/absences/rollback/types/absence-rollback-types";

type AbsenceRollbackPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function OptionList({ options }: { options: AbsenceRollbackOption[] }) {
  return (
    <>
      <option value="">All</option>
      {options.map((option) => (
        <option key={option.id} value={option.id}>
          {option.label}
        </option>
      ))}
    </>
  );
}

function buildPageHref(filters: AbsenceRollbackFilters, page: number): string {
  const params = new URLSearchParams();

  if (filters.q) {
    params.set("q", filters.q);
  }

  if (filters.branchId) {
    params.set("branchId", filters.branchId);
  }

  if (filters.departmentId) {
    params.set("departmentId", filters.departmentId);
  }

  if (filters.scheduleId) {
    params.set("scheduleId", filters.scheduleId);
  }

  if (filters.dateFrom) {
    params.set("dateFrom", filters.dateFrom);
  }

  if (filters.dateTo) {
    params.set("dateTo", filters.dateTo);
  }

  params.set("page", String(page));

  return `/dashboard/attendance/absences/rollback?${params.toString()}`;
}

function AbsenceRollbackFiltersForm({
  filters,
  options,
}: {
  filters: AbsenceRollbackFilters;
  options: AbsenceRollbackOptions;
}) {
  return (
    <section className="starland-card p-5">
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

        <div className="xl:col-span-2">
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
            placeholder="Employee number, name, branch, department, schedule"
            defaultValue={filters.q}
          />
        </div>

        <div>
          <label
            htmlFor="branchId"
            className="text-sm font-bold text-[var(--starland-dark-text)]"
          >
            Branch
          </label>

          <select
            id="branchId"
            name="branchId"
            className="starland-input mt-2"
            defaultValue={filters.branchId}
          >
            <OptionList options={options.branches} />
          </select>
        </div>

        <div>
          <label
            htmlFor="departmentId"
            className="text-sm font-bold text-[var(--starland-dark-text)]"
          >
            Department
          </label>

          <select
            id="departmentId"
            name="departmentId"
            className="starland-input mt-2"
            defaultValue={filters.departmentId}
          >
            <OptionList options={options.departments} />
          </select>
        </div>

        <div className="xl:col-span-2">
          <label
            htmlFor="scheduleId"
            className="text-sm font-bold text-[var(--starland-dark-text)]"
          >
            Schedule
          </label>

          <select
            id="scheduleId"
            name="scheduleId"
            className="starland-input mt-2"
            defaultValue={filters.scheduleId}
          >
            <OptionList options={options.schedules} />
          </select>
        </div>

        <div className="flex items-end gap-2 xl:col-span-4">
          <button type="submit" className="starland-btn starland-btn-primary">
            <Search className="h-4 w-4" aria-hidden="true" />
            Preview Rollback
          </button>

          <Link
            href="/dashboard/attendance/absences/rollback"
            className="starland-btn starland-btn-soft"
          >
            Reset
          </Link>
        </div>
      </form>
    </section>
  );
}

function AbsenceRollbackPreviewTable({
  result,
}: {
  result: AbsenceRollbackResult;
}) {
  return (
    <section className="starland-card overflow-hidden">
      <div className="border-b border-[var(--starland-border)] px-5 py-4">
        <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
          Rollback Preview
        </h2>

        <p className="mt-1 text-sm leading-6 text-[var(--starland-muted-text)]">
          These automatic ABSENT records are eligible for rollback.
        </p>
      </div>

      <div className="starland-scroll-x">
        <table className="starland-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Branch / Department</th>
              <th>Schedule</th>
              <th>Attendance Date</th>
              <th>Created At</th>
            </tr>
          </thead>

          <tbody>
            {result.records.length > 0 ? (
              result.records.map((record) => (
                <tr key={record.attendanceId}>
                  <td>
                    <p className="font-bold text-[var(--starland-dark-text)]">
                      {record.employeeName}
                    </p>

                    <p className="mt-1 text-xs font-semibold text-[var(--starland-muted-text)]">
                      {record.empNumber}
                    </p>

                    <p className="mt-1 text-xs text-[var(--starland-muted-text)]">
                      Status: {record.employeeStatus}
                    </p>
                  </td>

                  <td>
                    <p className="font-semibold text-[var(--starland-dark-text)]">
                      {record.branchName}
                    </p>

                    <p className="mt-1 text-xs text-[var(--starland-muted-text)]">
                      {record.departmentName}
                    </p>
                  </td>

                  <td>{record.scheduleName}</td>

                  <td>{record.attDate}</td>

                  <td>{record.createdAt}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5}>
                  <div className="rounded-2xl border border-dashed border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-6 text-center">
                    <p className="font-bold text-[var(--starland-dark-text)]">
                      No rollback eligible ABSENT records found
                    </p>

                    <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
                      Try changing the date range or filters.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-[var(--starland-border)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold text-[var(--starland-muted-text)]">
          Page {result.pagination.page} of {result.pagination.totalPages} ·{" "}
          {result.pagination.totalItems} eligible record(s)
        </p>

        <div className="flex gap-2">
          <Link
            href={buildPageHref(result.filters, result.pagination.page - 1)}
            aria-disabled={!result.pagination.hasPreviousPage}
            className={[
              "starland-btn starland-btn-soft starland-btn-sm",
              !result.pagination.hasPreviousPage
                ? "pointer-events-none opacity-50"
                : "",
            ].join(" ")}
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            Previous
          </Link>

          <Link
            href={buildPageHref(result.filters, result.pagination.page + 1)}
            aria-disabled={!result.pagination.hasNextPage}
            className={[
              "starland-btn starland-btn-soft starland-btn-sm",
              !result.pagination.hasNextPage
                ? "pointer-events-none opacity-50"
                : "",
            ].join(" ")}
          >
            Next
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default async function AbsenceRollbackPage({
  searchParams,
}: AbsenceRollbackPageProps) {
  await requireCanManageEmployees();

  const resolvedSearchParams = await searchParams;
  const filters = parseAbsenceRollbackSearchParams(resolvedSearchParams);
  const result = await getAbsenceRollbackData(filters);
  const rollbackLimit = 500;

  return (
    <section className="starland-page space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="starland-badge starland-badge-danger">
            ABSENT Rollback
          </span>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
            Rollback Generated ABSENT Records
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            Safely rollback automatic ABSENT records generated by mistake, such
            as during holidays, suspended classes, approved leave, or rest days.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/attendance/absences"
            className="starland-btn starland-btn-primary"
          >
            <TimerOff className="h-4 w-4" aria-hidden="true" />
            ABSENT Records
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

      <section className="starland-card overflow-hidden">
        <div className="bg-[var(--starland-deep-green)] p-5 text-white sm:p-6">
          <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
            Protected Rollback
          </span>

          <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
            Eligible Automatic ABSENT Records
          </h2>

          <p className="mt-2 max-w-4xl text-sm leading-6 text-white/70">
            Only automatic ABSENT records without time-in and time-out can be
            rolled back. Manual ABSENT records and punched records are protected.
          </p>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <RotateCcw className="h-7 w-7 text-[var(--starland-danger)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Eligible Rollback
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {result.summary.rollbackEligibleRecords}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <TimerOff className="h-7 w-7 text-[var(--starland-info)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Showing This Page
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {result.summary.currentPageRecords}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <ShieldCheck className="h-7 w-7 text-[var(--starland-warning)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Manual Protected
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {result.summary.protectedManualAbsences}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <ShieldCheck className="h-7 w-7 text-[var(--starland-success)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Punch Protected
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {result.summary.protectedAbsencesWithPunches}
            </p>
          </article>
        </div>
      </section>

      <AbsenceRollbackFiltersForm
        filters={result.filters}
        options={result.options}
      />

      <AbsenceRollbackPanel result={result} limit={rollbackLimit} />

      <AbsenceRollbackPreviewTable result={result} />
    </section>
  );
}