import Link from "next/link";
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  History,
  Search,
  XCircle,
} from "lucide-react";
import { requireCanManageEmployees } from "@/features/auth/server/permission-guards";
import { ScheduleAssignmentHistoryTable } from "@/features/attendance/schedule-assignment/history/components/schedule-assignment-history-table";
import {
  getScheduleAssignmentHistoryData,
  parseScheduleAssignmentHistorySearchParams,
} from "@/features/attendance/schedule-assignment/history/server/schedule-assignment-history-queries";
import type {
  ScheduleAssignmentHistoryFilters,
  ScheduleAssignmentHistoryStateFilter,
} from "@/features/attendance/schedule-assignment/history/types/schedule-assignment-history-types";

type ScheduleAssignmentHistoryPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const stateOptions: Array<{
  label: string;
  value: ScheduleAssignmentHistoryStateFilter;
}> = [
  {
    label: "All Assignments",
    value: "ALL",
  },
  {
    label: "Current Only",
    value: "ACTIVE",
  },
  {
    label: "Closed Only",
    value: "INACTIVE",
  },
];

function ScheduleAssignmentHistoryFiltersForm({
  filters,
}: {
  filters: ScheduleAssignmentHistoryFilters;
}) {
  return (
    <section className="starland-card p-5">
      <form className="grid gap-4 lg:grid-cols-[1.4fr_0.8fr_0.8fr_0.8fr_auto_auto] lg:items-end">
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
            placeholder="Employee, schedule, branch, assigned by, remarks"
            defaultValue={filters.q}
          />
        </div>

        <div>
          <label
            htmlFor="state"
            className="text-sm font-bold text-[var(--starland-dark-text)]"
          >
            State
          </label>

          <select
            id="state"
            name="state"
            className="starland-input mt-2"
            defaultValue={filters.state}
          >
            {stateOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="dateFrom"
            className="text-sm font-bold text-[var(--starland-dark-text)]"
          >
            Created From
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
            Created To
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
          href="/dashboard/attendance/schedule-assignment/history"
          className="starland-btn starland-btn-soft"
        >
          Reset
        </Link>
      </form>
    </section>
  );
}

export default async function ScheduleAssignmentHistoryPage({
  searchParams,
}: ScheduleAssignmentHistoryPageProps) {
  await requireCanManageEmployees();

  const resolvedSearchParams = await searchParams;
  const filters =
    parseScheduleAssignmentHistorySearchParams(resolvedSearchParams);
  const result = await getScheduleAssignmentHistoryData(filters);

  return (
    <section className="starland-page space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="starland-badge starland-badge-info">
            Schedule History
          </span>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
            Employee Schedule Assignment History
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            Review current and previous employee schedule assignments, effective
            dates, assigning user, and assignment remarks.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/attendance/schedule-assignment"
            className="starland-btn starland-btn-primary"
          >
            <CalendarClock className="h-4 w-4" aria-hidden="true" />
            Assign Schedules
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
            Schedule Tracking
          </span>

          <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
            Assignment History Summary
          </h2>

          <p className="mt-2 max-w-4xl text-sm leading-6 text-white/70">
            This history helps HR verify which schedule was assigned, who
            assigned it, and when it became effective.
          </p>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <History className="h-7 w-7 text-[var(--starland-info)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Matching Assignments
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {result.summary.totalMatchingAssignments}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <CheckCircle2 className="h-7 w-7 text-[var(--starland-success)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Current Assignments
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {result.summary.activeAssignments}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <XCircle className="h-7 w-7 text-[var(--starland-warning)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Closed Assignments
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {result.summary.inactiveAssignments}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <CalendarClock className="h-7 w-7 text-[var(--starland-main-green)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Showing This Page
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {result.summary.currentPageRecords}
            </p>
          </article>
        </div>
      </section>

      <ScheduleAssignmentHistoryFiltersForm filters={result.filters} />

      <ScheduleAssignmentHistoryTable result={result} />
    </section>
  );
}