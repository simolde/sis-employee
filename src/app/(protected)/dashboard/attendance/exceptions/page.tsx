import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Search,
  ShieldCheck,
  TimerOff,
} from "lucide-react";
import { requireCanManageEmployees } from "@/features/auth/server/permission-guards";
import { AttendanceExceptionActions } from "@/features/attendance/exceptions/components/attendance-exception-actions";
import { AttendanceExceptionForm } from "@/features/attendance/exceptions/components/attendance-exception-form";
import { AttendanceExceptionTable } from "@/features/attendance/exceptions/components/attendance-exception-table";
import {
  getAttendanceExceptionData,
  parseAttendanceExceptionSearchParams,
} from "@/features/attendance/exceptions/server/attendance-exception-queries";
import type {
  AttendanceExceptionFilters,
  AttendanceExceptionOption,
  AttendanceExceptionOptions,
} from "@/features/attendance/exceptions/types/attendance-exception-types";

type AttendanceExceptionsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const exceptionTypes = [
  {
    label: "All Types",
    value: "",
  },
  {
    label: "Holiday",
    value: "HOLIDAY",
  },
  {
    label: "Class Suspension",
    value: "CLASS_SUSPENSION",
  },
  {
    label: "No Work",
    value: "NO_WORK",
  },
  {
    label: "School Event",
    value: "SCHOOL_EVENT",
  },
  {
    label: "Rest Day",
    value: "REST_DAY",
  },
  {
    label: "Other",
    value: "OTHER",
  },
];

function BranchOptions({ options }: { options: AttendanceExceptionOption[] }) {
  return (
    <>
      <option value="">All branches</option>
      {options.map((option) => (
        <option key={option.id} value={option.id}>
          {option.label}
        </option>
      ))}
    </>
  );
}

function AttendanceExceptionFiltersForm({
  filters,
  options,
}: {
  filters: AttendanceExceptionFilters;
  options: AttendanceExceptionOptions;
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
            <BranchOptions options={options.branches} />
          </select>
        </div>

        <div>
          <label
            htmlFor="type"
            className="text-sm font-bold text-[var(--starland-dark-text)]"
          >
            Type
          </label>

          <select
            id="type"
            name="type"
            className="starland-input mt-2"
            defaultValue={filters.type}
          >
            {exceptionTypes.map((type) => (
              <option key={type.value || "ALL"} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
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
            placeholder="Title or description"
            defaultValue={filters.q}
          />
        </div>

        <div>
          <label
            htmlFor="activeOnly"
            className="text-sm font-bold text-[var(--starland-dark-text)]"
          >
            Status
          </label>

          <select
            id="activeOnly"
            name="activeOnly"
            className="starland-input mt-2"
            defaultValue={filters.activeOnly ? "true" : "false"}
          >
            <option value="true">Active only</option>
            <option value="false">All statuses</option>
          </select>
        </div>

        <div className="flex items-end gap-2">
          <button type="submit" className="starland-btn starland-btn-primary">
            <Search className="h-4 w-4" aria-hidden="true" />
            Apply
          </button>

          <Link
            href="/dashboard/attendance/exceptions"
            className="starland-btn starland-btn-soft"
          >
            Reset
          </Link>
        </div>
      </form>
    </section>
  );
}

export default async function AttendanceExceptionsPage({
  searchParams,
}: AttendanceExceptionsPageProps) {
  await requireCanManageEmployees();

  const resolvedSearchParams = await searchParams;
  const filters = parseAttendanceExceptionSearchParams(resolvedSearchParams);
  const result = await getAttendanceExceptionData(filters);

  return (
    <section className="starland-page space-y-5">
      <div className="flex flex-col gap-4 print:hidden sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="starland-badge starland-badge-info">
            Attendance Exceptions
          </span>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
            Exception Calendar
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            Manage holidays, class suspensions, no-work dates, rest days, and
            other dates that should affect ABSENT generation.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:items-end">
          <AttendanceExceptionActions result={result} />

          <div className="flex flex-wrap gap-2">
            <Link
              href="/dashboard/attendance/absences/candidates"
              className="starland-btn starland-btn-primary"
            >
              <TimerOff className="h-4 w-4" aria-hidden="true" />
              Absence Candidates
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
            Exception Rules
          </span>

          <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
            Holiday and Suspension Control
          </h2>

          <p className="mt-2 max-w-4xl text-sm leading-6 text-white/70">
            Dates marked as affecting absence generation will be used to prevent
            wrong ABSENT records from holidays, suspended classes, no-work days,
            and branch-specific events.
          </p>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <CalendarDays className="h-7 w-7 text-[var(--starland-info)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Active Exceptions
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {result.summary.totalActiveExceptions}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <Search className="h-7 w-7 text-[var(--starland-main-green)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Matching Filters
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {result.summary.totalMatchingExceptions}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <ShieldCheck className="h-7 w-7 text-[var(--starland-danger)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Exclude ABSENT
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {result.summary.affectsAbsenceGeneration}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <CalendarDays className="h-7 w-7 text-[var(--starland-warning)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Showing This Page
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {result.summary.currentPageRecords}
            </p>
          </article>
        </div>
      </section>

      <div className="print:hidden">
        <AttendanceExceptionForm options={result.options} />
      </div>

      <AttendanceExceptionFiltersForm
        filters={result.filters}
        options={result.options}
      />

      <AttendanceExceptionTable result={result} />
    </section>
  );
}