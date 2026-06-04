import Link from "next/link";
import {
  ArrowLeft,
  CalendarClock,
  Search,
  TimerOff,
  UsersRound,
} from "lucide-react";
import { requireCanManageEmployees } from "@/features/auth/server/permission-guards";
import { AbsenceRecordActions } from "@/features/attendance/absences/records/components/absence-records-actions";
import { AbsenceRecordsTable } from "@/features/attendance/absences/records/components/absence-records-table";
import {
  getAbsenceRecordData,
  parseAbsenceRecordSearchParams,
} from "@/features/attendance/absences/records/server/absence-record-queries";
import type {
  AbsenceRecordFilters,
  AbsenceRecordOption,
  AbsenceRecordOptions,
} from "@/features/attendance/absences/records/types/absence-record-types";

type AbsenceRecordsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function OptionList({ options }: { options: AbsenceRecordOption[] }) {
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

function AbsenceRecordFiltersForm({
  filters,
  options,
}: {
  filters: AbsenceRecordFilters;
  options: AbsenceRecordOptions;
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
            Apply Filters
          </button>

          <Link
            href="/dashboard/attendance/absences"
            className="starland-btn starland-btn-soft"
          >
            Reset
          </Link>
        </div>
      </form>
    </section>
  );
}

export default async function AbsenceRecordsPage({
  searchParams,
}: AbsenceRecordsPageProps) {
  await requireCanManageEmployees();

  const resolvedSearchParams = await searchParams;
  const filters = parseAbsenceRecordSearchParams(resolvedSearchParams);
  const result = await getAbsenceRecordData(filters);

  return (
    <section className="starland-page space-y-5">
      <div className="flex flex-col gap-4 print:hidden sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="starland-badge starland-badge-danger">
            ABSENT Records
          </span>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
            Generated ABSENT Attendance
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            Review generated and manual ABSENT attendance records. Use this page
            after generating absences from absence candidates.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:items-end">
          <AbsenceRecordActions result={result} />

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
            ABSENT Attendance Tracking
          </span>

          <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
            ABSENT Records Summary
          </h2>

          <p className="mt-2 max-w-4xl text-sm leading-6 text-white/70">
            Generated ABSENT records are treated as automatic attendance
            records. Manual ABSENT corrections remain separated for HR review.
          </p>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <TimerOff className="h-7 w-7 text-[var(--starland-danger)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Total ABSENT
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {result.summary.totalAbsences}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <CalendarClock className="h-7 w-7 text-[var(--starland-info)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Automatic ABSENT
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {result.summary.automaticAbsences}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <UsersRound className="h-7 w-7 text-[var(--starland-warning)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Manual ABSENT
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {result.summary.manualAbsences}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <TimerOff className="h-7 w-7 text-[var(--starland-main-green)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Showing This Page
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {result.summary.currentPageRecords}
            </p>
          </article>
        </div>
      </section>

      <AbsenceRecordFiltersForm
        filters={result.filters}
        options={result.options}
      />

      <AbsenceRecordsTable result={result} />
    </section>
  );
}