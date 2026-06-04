import Link from "next/link";
import {
  ArrowLeft,
  CalendarClock,
  RefreshCw,
  Search,
  TimerOff,
  UsersRound,
} from "lucide-react";
import { requireCanManageEmployees } from "@/features/auth/server/permission-guards";
import { AbsenceCandidatesActions } from "@/features/attendance/absences/components/absence-candidates-actions";
import { AbsenceCandidatesTable } from "@/features/attendance/absences/components/absence-candidates-table";
import {
  getAbsenceCandidateData,
  parseAbsenceCandidateSearchParams,
} from "@/features/attendance/absences/server/absence-candidate-queries";
import type {
  AbsenceCandidateFilters,
  AbsenceCandidateOption,
  AbsenceCandidateOptions,
} from "@/features/attendance/absences/types/absence-candidate-types";

type AbsenceCandidatePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function OptionList({ options }: { options: AbsenceCandidateOption[] }) {
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

function AbsenceCandidateFiltersForm({
  filters,
  options,
}: {
  filters: AbsenceCandidateFilters;
  options: AbsenceCandidateOptions;
}) {
  return (
    <section className="starland-card p-5 print:hidden">
      <form className="grid gap-4 xl:grid-cols-4">
        <div>
          <label
            htmlFor="date"
            className="text-sm font-bold text-[var(--starland-dark-text)]"
          >
            Attendance Date
          </label>

          <input
            id="date"
            name="date"
            type="date"
            className="starland-input mt-2"
            defaultValue={filters.date}
            required
          />
        </div>

        <div>
          <label
            htmlFor="activeOnly"
            className="text-sm font-bold text-[var(--starland-dark-text)]"
          >
            Employee Status
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
            Preview Absences
          </button>

          <Link
            href="/dashboard/attendance/absences/candidates"
            className="starland-btn starland-btn-soft"
          >
            Reset
          </Link>
        </div>
      </form>
    </section>
  );
}

export default async function AbsenceCandidatePage({
  searchParams,
}: AbsenceCandidatePageProps) {
  await requireCanManageEmployees();

  const resolvedSearchParams = await searchParams;
  const filters = parseAbsenceCandidateSearchParams(resolvedSearchParams);
  const result = await getAbsenceCandidateData(filters);

  return (
    <section className="starland-page space-y-5">
      <div className="flex flex-col gap-4 print:hidden sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="starland-badge starland-badge-danger">
            Absence Preview
          </span>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
            Absence Candidates
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            Preview employees who are scheduled on the selected date but have no
            attendance record. This is the safe first step before automatic
            ABSENT generation.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:items-end">
          <AbsenceCandidatesActions result={result} />

          <div className="flex flex-wrap gap-2">
            <Link
              href="/dashboard/attendance/schedule-assignment"
              className="starland-btn starland-btn-primary"
            >
              <CalendarClock className="h-4 w-4" aria-hidden="true" />
              Assign Schedules
            </Link>

            <Link
              href="/dashboard/attendance/status-recalculation"
              className="starland-btn starland-btn-soft"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Status Recalculation
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
            Selected Date: {result.summary.selectedDate}
          </span>

          <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
            Possible Absent Employees
          </h2>

          <p className="mt-2 max-w-4xl text-sm leading-6 text-white/70">
            Candidates are based on active employee profiles, assigned
            schedules, schedule days, and missing attendance records for the
            selected date.
          </p>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <UsersRound className="h-7 w-7 text-[var(--starland-info)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Scheduled Employees
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {result.summary.scheduledEmployees}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <TimerOff className="h-7 w-7 text-[var(--starland-warning)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Without Attendance
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {result.summary.employeesWithoutAttendance}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <CalendarClock className="h-7 w-7 text-[var(--starland-info)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Matching Employees
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {result.summary.matchingEmployees}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <TimerOff className="h-7 w-7 text-[var(--starland-danger)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Candidate Absences
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {result.summary.candidateAbsences}
            </p>
          </article>
        </div>
      </section>

      <AbsenceCandidateFiltersForm
        filters={result.filters}
        options={result.options}
      />

      <section className="starland-card p-5 print:hidden">
        <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
          Safe Absence Workflow
        </h2>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <p className="font-bold text-[var(--starland-dark-text)]">
              1. Preview Candidates
            </p>

            <p className="mt-2 text-sm leading-6 text-[var(--starland-muted-text)]">
              Check who has no attendance record for the selected scheduled
              date.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <p className="font-bold text-[var(--starland-dark-text)]">
              2. Exclude Exceptions
            </p>

            <p className="mt-2 text-sm leading-6 text-[var(--starland-muted-text)]">
              Next step should exclude approved leave, holidays, suspended
              classes, and rest days.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <p className="font-bold text-[var(--starland-dark-text)]">
              3. Generate ABSENT
            </p>

            <p className="mt-2 text-sm leading-6 text-[var(--starland-muted-text)]">
              After policy checks are ready, the system can safely create ABSENT
              records automatically.
            </p>
          </div>
        </div>
      </section>

      <AbsenceCandidatesTable result={result} />
    </section>
  );
}