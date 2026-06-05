import Link from "next/link";
import {
  ArrowLeft,
  CalendarCheck,
  ClipboardEdit,
  Search,
  ShieldCheck,
  TimerOff,
} from "lucide-react";
import { requireCanManageEmployees } from "@/features/auth/server/permission-guards";
import { ExcusedRecordActions } from "@/features/attendance/excused/components/excused-record-actions";
import { ExcusedRecordsTable } from "@/features/attendance/excused/components/excused-records-table";
import {
  getExcusedRecordData,
  parseExcusedRecordSearchParams,
} from "@/features/attendance/excused/server/excused-record-queries";
import type {
  ExcusedRecordFilters,
  ExcusedRecordOption,
  ExcusedRecordOptions,
} from "@/features/attendance/excused/types/excused-record-types";

type ExcusedRecordsPageProps = {
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
  options: ExcusedRecordOption[];
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

function ExcusedRecordFiltersForm({
  filters,
  options,
}: {
  filters: ExcusedRecordFilters;
  options: ExcusedRecordOptions;
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
            htmlFor="source"
            className="text-sm font-bold text-[var(--starland-dark-text)]"
          >
            Source
          </label>

          <select
            id="source"
            name="source"
            className="starland-input mt-2"
            defaultValue={filters.source}
          >
            <option value="">All sources</option>
            <option value="AUTOMATIC">
              Automatic
            </option>
            <option value="MANUAL">
              Manual
            </option>
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
            placeholder="Employee, branch, department, schedule"
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
            <OptionList
              options={options.schedules}
            />
          </select>
        </div>

        <div className="flex items-end gap-2 xl:col-span-4">
          <button
            type="submit"
            className="starland-btn starland-btn-primary"
          >
            <Search
              className="h-4 w-4"
              aria-hidden="true"
            />
            Apply Filters
          </button>

          <Link
            href="/dashboard/attendance/excused"
            className="starland-btn starland-btn-soft"
          >
            Reset
          </Link>
        </div>
      </form>
    </section>
  );
}

export default async function ExcusedRecordsPage({
  searchParams,
}: ExcusedRecordsPageProps) {
  await requireCanManageEmployees();

  const resolvedSearchParams =
    await searchParams;

  const filters =
    parseExcusedRecordSearchParams(
      resolvedSearchParams,
    );

  const result =
    await getExcusedRecordData(filters);

  return (
    <section className="starland-page space-y-5">
      <div className="flex flex-col gap-4 print:hidden sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="starland-badge starland-badge-success">
            EXCUSED Records
          </span>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
            EXCUSED Attendance
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            Review automatic EXCUSED records
            generated from approved leave and
            manual EXCUSED attendance corrections.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:items-end">
          <ExcusedRecordActions
            result={result}
          />

          <div className="flex flex-wrap gap-2">
            <Link
              href="/dashboard/leaves"
              className="starland-btn starland-btn-primary"
            >
              <CalendarCheck
                className="h-4 w-4"
                aria-hidden="true"
              />
              Approved Leaves
            </Link>

            <Link
              href="/dashboard/attendance/absences/candidates"
              className="starland-btn starland-btn-soft"
            >
              <TimerOff
                className="h-4 w-4"
                aria-hidden="true"
              />
              Attendance Generation
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
      </div>

      <section className="starland-card overflow-hidden print:shadow-none">
        <div className="bg-[var(--starland-deep-green)] p-5 text-white sm:p-6">
          <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
            Approved Leave Attendance
          </span>

          <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
            EXCUSED Records Summary
          </h2>

          <p className="mt-2 max-w-4xl text-sm leading-6 text-white/70">
            Automatic EXCUSED records are created
            from approved leave. Manual EXCUSED
            corrections remain marked as manual and
            follow the attendance review policy.
          </p>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-5">
          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <CalendarCheck className="h-7 w-7 text-[var(--starland-success)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Total EXCUSED
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {result.summary.totalExcused}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <Search className="h-7 w-7 text-[var(--starland-info)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Matching Filters
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {
                result.summary
                  .matchingExcused
              }
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <ShieldCheck className="h-7 w-7 text-[var(--starland-success)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Automatic
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {
                result.summary
                  .automaticExcused
              }
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <ClipboardEdit className="h-7 w-7 text-[var(--starland-warning)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Manual
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {result.summary.manualExcused}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <CalendarCheck className="h-7 w-7 text-[var(--starland-main-green)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Linked Leave
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {
                result.summary
                  .linkedApprovedLeave
              }
            </p>

            <p className="mt-1 text-xs font-semibold text-[var(--starland-muted-text)]">
              On this page
            </p>
          </article>
        </div>
      </section>

      <ExcusedRecordFiltersForm
        filters={result.filters}
        options={result.options}
      />

      <ExcusedRecordsTable
        result={result}
      />
    </section>
  );
}