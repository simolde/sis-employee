import Link from "next/link";
import {
  ArrowLeft,
  CalendarCheck,
  CalendarDays,
  RefreshCw,
  Search,
  ShieldCheck,
  UserRoundCheck,
} from "lucide-react";
import { requireCanManageEmployees } from "@/features/auth/server/permission-guards";
import { ApprovedLeaveExcusedSyncPanel } from "@/features/attendance/excused/sync/components/approved-leave-excused-sync-panel";
import { ApprovedLeaveExcusedSyncTable } from "@/features/attendance/excused/sync/components/approved-leave-excused-sync-table";
import {
  getApprovedLeaveExcusedSyncData,
  parseApprovedLeaveExcusedSyncSearchParams,
} from "@/features/attendance/excused/sync/server/approved-leave-excused-sync-queries";
import type {
  ApprovedLeaveExcusedSyncFilters,
  ApprovedLeaveExcusedSyncOption,
  ApprovedLeaveExcusedSyncOptions,
} from "@/features/attendance/excused/sync/types/approved-leave-excused-sync-types";

type ApprovedLeaveExcusedSyncPageProps = {
  searchParams: Promise<
    Record<
      string,
      string | string[] | undefined
    >
  >;
};

function OptionList({
  options,
}: {
  options: ApprovedLeaveExcusedSyncOption[];
}) {
  return (
    <>
      <option value="">All</option>

      {options.map((option) => (
        <option
          key={option.id}
          value={option.id}
        >
          {option.label}
        </option>
      ))}
    </>
  );
}

function ApprovedLeaveSyncFiltersForm({
  filters,
  options,
}: {
  filters: ApprovedLeaveExcusedSyncFilters;
  options: ApprovedLeaveExcusedSyncOptions;
}) {
  return (
    <section className="starland-card p-5 print:hidden">
      <form className="grid gap-4 xl:grid-cols-4">
        <div>
          <label
            htmlFor="dateFrom"
            className="text-sm font-bold text-[var(--starland-dark-text)]"
          >
            Attendance Date From
          </label>

          <input
            id="dateFrom"
            name="dateFrom"
            type="date"
            className="starland-input mt-2"
            defaultValue={filters.dateFrom}
            required
          />
        </div>

        <div>
          <label
            htmlFor="dateTo"
            className="text-sm font-bold text-[var(--starland-dark-text)]"
          >
            Attendance Date To
          </label>

          <input
            id="dateTo"
            name="dateTo"
            type="date"
            className="starland-input mt-2"
            defaultValue={filters.dateTo}
            required
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
            placeholder="Employee number, name, branch, or department"
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
            <OptionList
              options={options.branches}
            />
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
            defaultValue={
              filters.departmentId
            }
          >
            <OptionList
              options={options.departments}
            />
          </select>
        </div>

        <div className="flex items-end gap-2 xl:col-span-2">
          <button
            type="submit"
            className="starland-btn starland-btn-primary"
          >
            <Search
              className="h-4 w-4"
              aria-hidden="true"
            />
            Scan Approved Leave
          </button>

          <Link
            href="/dashboard/attendance/excused/sync"
            className="starland-btn starland-btn-soft"
          >
            Reset
          </Link>
        </div>
      </form>
    </section>
  );
}

export default async function ApprovedLeaveExcusedSyncPage({
  searchParams,
}: ApprovedLeaveExcusedSyncPageProps) {
  await requireCanManageEmployees();

  const resolvedSearchParams =
    await searchParams;

  const filters =
    parseApprovedLeaveExcusedSyncSearchParams(
      resolvedSearchParams,
    );

  const result =
    await getApprovedLeaveExcusedSyncData(
      filters,
    );

  const syncLimit = 500;

  return (
    <section className="starland-page space-y-5">
      <div className="flex flex-col gap-4 print:hidden sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="starland-badge starland-badge-success">
            Approved-Leave Sync
          </span>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
            Synchronize Missing EXCUSED
            Attendance
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            Find approved-leave workdays without
            attendance and safely generate the
            missing automatic EXCUSED records.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/leaves"
            className="starland-btn starland-btn-primary"
          >
            <CalendarCheck
              className="h-4 w-4"
              aria-hidden="true"
            />
            Leave Management
          </Link>

          <Link
            href="/dashboard/attendance/exceptions"
            className="starland-btn starland-btn-soft"
          >
            <CalendarDays
              className="h-4 w-4"
              aria-hidden="true"
            />
            Exception Calendar
          </Link>

          <Link
            href="/dashboard/attendance/actions"
            className="starland-btn starland-btn-soft"
          >
            <ArrowLeft
              className="h-4 w-4"
              aria-hidden="true"
            />
            Attendance Actions
          </Link>
        </div>
      </div>

      <section className="starland-card overflow-hidden print:shadow-none">
        <div className="bg-[var(--starland-deep-green)] p-5 text-white sm:p-6">
          <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
            Missing Attendance Detection
          </span>

          <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
            Approved Leave to EXCUSED
            Synchronization
          </h2>

          <p className="mt-2 max-w-4xl text-sm leading-6 text-white/70">
            The preview expands approved leave into
            individual attendance dates, applies
            employee schedule days, excludes
            holidays and attendance exceptions, and
            protects every existing attendance
            record.
          </p>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <CalendarCheck className="h-7 w-7 text-[var(--starland-success)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Approved Leaves
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {
                result.summary
                  .matchingApprovedLeaves
              }
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <UserRoundCheck className="h-7 w-7 text-[var(--starland-info)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Evaluated Leave Dates
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {
                result.summary
                  .evaluatedLeaveDates
              }
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <RefreshCw className="h-7 w-7 text-[var(--starland-warning)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Missing EXCUSED
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {
                result.summary
                  .missingExcusedCandidates
              }
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <ShieldCheck className="h-7 w-7 text-[var(--starland-main-green)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Existing Attendance
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {
                result.summary
                  .alreadyHasAttendance
              }
            </p>
          </article>
        </div>

        <div className="grid gap-4 px-5 pb-5 sm:grid-cols-2">
          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <CalendarDays className="h-6 w-6 text-[var(--starland-info)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Exception Protected
            </p>

            <p className="mt-1 text-2xl font-extrabold text-[var(--starland-dark-text)]">
              {
                result.summary
                  .exceptionProtected
              }
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <CalendarDays className="h-6 w-6 text-[var(--starland-warning)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Not Scheduled
            </p>

            <p className="mt-1 text-2xl font-extrabold text-[var(--starland-dark-text)]">
              {result.summary.notScheduled}
            </p>
          </article>
        </div>
      </section>

      <ApprovedLeaveSyncFiltersForm
        filters={result.filters}
        options={result.options}
      />

      <ApprovedLeaveExcusedSyncPanel
        result={result}
        limit={syncLimit}
      />

      <ApprovedLeaveExcusedSyncTable
        result={result}
      />
    </section>
  );
}