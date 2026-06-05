import Link from "next/link";
import {
  ArrowLeft,
  CalendarCheck,
  CalendarClock,
  CalendarDays,
  RefreshCw,
  Search,
  ShieldCheck,
  TimerOff,
  UsersRound,
} from "lucide-react";
import { requireCanManageEmployees } from "@/features/auth/server/permission-guards";
import { AbsenceCandidatesActions } from "@/features/attendance/absences/components/absence-candidates-actions";
import { AbsenceCandidatesTable } from "@/features/attendance/absences/components/absence-candidates-table";
import { AbsenceGenerationPanel } from "@/features/attendance/absences/components/absence-generation-panel";
import {
  getAbsenceCandidateData,
  parseAbsenceCandidateSearchParams,
} from "@/features/attendance/absences/server/absence-candidate-queries";
import type {
  AbsenceCandidateFilters,
  AbsenceCandidateOption,
  AbsenceCandidateOptions,
  AbsenceCandidateResult,
} from "@/features/attendance/absences/types/absence-candidate-types";

type AbsenceCandidatePageProps = {
  searchParams: Promise<
    Record<string, string | string[] | undefined>
  >;
};

function OptionList({
  options,
}: {
  options: AbsenceCandidateOption[];
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
            defaultValue={
              filters.activeOnly
                ? "true"
                : "false"
            }
          >
            <option value="true">
              Active only
            </option>

            <option value="false">
              All statuses
            </option>
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

function ExceptionWarningPanel({
  result,
}: {
  result: AbsenceCandidateResult;
}) {
  if (result.blockingExceptions.length === 0) {
    return (
      <section className="starland-card p-5 print:hidden">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-1 h-5 w-5 text-[var(--starland-success)]" />

          <div>
            <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
              No Blocking Exception for This Date
            </h2>

            <p className="mt-2 text-sm leading-6 text-[var(--starland-muted-text)]">
              The exception calendar did not find an
              active rule that blocks ABSENT
              generation for the selected date.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="starland-card border-red-200 bg-red-50 p-5 print:hidden">
      <div className="flex items-start gap-3">
        <CalendarDays className="mt-1 h-5 w-5 text-red-600" />

        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-extrabold text-red-800">
            Exception Calendar Exclusions
          </h2>

          <p className="mt-2 text-sm font-semibold leading-6 text-red-700">
            {result.summary.excludedByException}{" "}
            employee(s) were excluded because the
            selected date has active exception
            rules.
          </p>

          <div className="mt-3 grid gap-2 md:grid-cols-2">
            {result.blockingExceptions.map(
              (exception) => (
                <div
                  key={exception.exceptionId}
                  className="rounded-2xl border border-red-200 bg-white p-3"
                >
                  <p className="text-sm font-bold text-red-800">
                    {exception.title}
                  </p>

                  <p className="mt-1 text-xs font-semibold text-red-600">
                    {exception.exceptionType.replaceAll(
                      "_",
                      " ",
                    )}{" "}
                    · {exception.branchName}
                  </p>
                </div>
              ),
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function ApprovedLeaveExclusionPanel({
  result,
}: {
  result: AbsenceCandidateResult;
}) {
  if (
    result.approvedLeaveExclusions.length === 0
  ) {
    return (
      <section className="starland-card p-5 print:hidden">
        <div className="flex items-start gap-3">
          <CalendarCheck className="mt-1 h-5 w-5 text-[var(--starland-success)]" />

          <div>
            <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
              No Approved Leave Exclusions
            </h2>

            <p className="mt-2 text-sm leading-6 text-[var(--starland-muted-text)]">
              No scheduled employee in the current
              result has approved leave covering the
              selected attendance date.
            </p>
          </div>
        </div>
      </section>
    );
  }

  const visibleLeaves =
    result.approvedLeaveExclusions.slice(0, 12);

  const hiddenLeaveCount =
    result.approvedLeaveExclusions.length -
    visibleLeaves.length;

  return (
    <section className="starland-card border-amber-200 bg-amber-50 p-5 print:hidden">
      <div className="flex items-start gap-3">
        <CalendarCheck className="mt-1 h-5 w-5 text-amber-700" />

        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-extrabold text-amber-900">
            Approved Leave Exclusions
          </h2>

          <p className="mt-2 text-sm font-semibold leading-6 text-amber-800">
            {
              result.summary
                .excludedByApprovedLeave
            }{" "}
            employee(s) were automatically excluded
            because they have approved leave
            covering the selected date.
          </p>

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {visibleLeaves.map((leave) => (
              <article
                key={`${leave.leaveId}-${leave.empId}`}
                className="rounded-2xl border border-amber-200 bg-white p-4"
              >
                <p className="font-bold text-[var(--starland-dark-text)]">
                  {leave.employeeName}
                </p>

                <p className="mt-1 text-xs font-semibold text-[var(--starland-muted-text)]">
                  {leave.empNumber}
                </p>

                <p className="mt-3 text-sm font-bold text-amber-800">
                  {leave.leaveTypeName}
                </p>

                <p className="mt-1 text-xs font-semibold text-amber-700">
                  {leave.dateFrom} – {leave.dateTo}
                </p>
              </article>
            ))}
          </div>

          {hiddenLeaveCount > 0 ? (
            <p className="mt-3 text-sm font-semibold text-amber-800">
              Plus {hiddenLeaveCount} additional
              approved leave record(s).
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

export default async function AbsenceCandidatePage({
  searchParams,
}: AbsenceCandidatePageProps) {
  await requireCanManageEmployees();

  const resolvedSearchParams =
    await searchParams;

  const filters =
    parseAbsenceCandidateSearchParams(
      resolvedSearchParams,
    );

  const result =
    await getAbsenceCandidateData(filters);

  const generationLimit = 500;

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
            Preview scheduled employees without
            attendance. Active exception dates and
            approved leave are automatically
            excluded before ABSENT generation.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:items-end">
          <AbsenceCandidatesActions
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
              href="/dashboard/attendance/absences"
              className="starland-btn starland-btn-soft"
            >
              <TimerOff
                className="h-4 w-4"
                aria-hidden="true"
              />
              ABSENT Records
            </Link>

            <Link
              href="/dashboard/attendance/schedule-assignment"
              className="starland-btn starland-btn-soft"
            >
              <CalendarClock
                className="h-4 w-4"
                aria-hidden="true"
              />
              Assign Schedules
            </Link>

            <Link
              href="/dashboard/attendance/status-recalculation"
              className="starland-btn starland-btn-soft"
            >
              <RefreshCw
                className="h-4 w-4"
                aria-hidden="true"
              />
              Status Recalculation
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
            Selected Date:{" "}
            {result.summary.selectedDate}
          </span>

          <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
            Possible Absent Employees
          </h2>

          <p className="mt-2 max-w-4xl text-sm leading-6 text-white/70">
            Candidates are calculated from employee
            schedules, schedule days, missing
            attendance records, exception calendar
            rules, and approved leave applications.
          </p>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-5">
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
              {
                result.summary
                  .employeesWithoutAttendance
              }
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <CalendarDays className="h-7 w-7 text-[var(--starland-info)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Exception Excluded
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {
                result.summary
                  .excludedByException
              }
            </p>

            <p className="mt-1 text-xs font-semibold text-[var(--starland-muted-text)]">
              Active rules:{" "}
              {
                result.summary
                  .activeBlockingExceptions
              }
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <CalendarCheck className="h-7 w-7 text-[var(--starland-warning)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Approved Leave
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {
                result.summary
                  .excludedByApprovedLeave
              }
            </p>

            <p className="mt-1 text-xs font-semibold text-[var(--starland-muted-text)]">
              Leave records:{" "}
              {
                result.summary
                  .activeApprovedLeaves
              }
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <TimerOff className="h-7 w-7 text-[var(--starland-danger)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Candidate Absences
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {
                result.summary
                  .candidateAbsences
              }
            </p>
          </article>
        </div>
      </section>

      <AbsenceCandidateFiltersForm
        filters={result.filters}
        options={result.options}
      />

      <ExceptionWarningPanel result={result} />

      <ApprovedLeaveExclusionPanel
        result={result}
      />

      <AbsenceGenerationPanel
        result={result}
        limit={generationLimit}
      />

      <section className="starland-card p-5 print:hidden">
        <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
          Safe Absence Workflow
        </h2>

        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <p className="font-bold text-[var(--starland-dark-text)]">
              1. Assign Schedules
            </p>

            <p className="mt-2 text-sm leading-6 text-[var(--starland-muted-text)]">
              Employees need the correct active
              schedule before absence calculation.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <p className="font-bold text-[var(--starland-dark-text)]">
              2. Approve Leaves
            </p>

            <p className="mt-2 text-sm leading-6 text-[var(--starland-muted-text)]">
              Approved leave automatically excludes
              the employee from ABSENT generation.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <p className="font-bold text-[var(--starland-dark-text)]">
              3. Encode Exceptions
            </p>

            <p className="mt-2 text-sm leading-6 text-[var(--starland-muted-text)]">
              Add holidays, suspensions, no-work
              dates, and branch exceptions.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <p className="font-bold text-[var(--starland-dark-text)]">
              4. Generate ABSENT
            </p>

            <p className="mt-2 text-sm leading-6 text-[var(--starland-muted-text)]">
              Generate only the remaining verified
              absence candidates.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <p className="font-bold text-[var(--starland-dark-text)]">
              5. Rollback if Needed
            </p>

            <p className="mt-2 text-sm leading-6 text-[var(--starland-muted-text)]">
              Rollback only wrongly generated
              automatic ABSENT records.
            </p>
          </div>
        </div>
      </section>

      <AbsenceCandidatesTable result={result} />
    </section>
  );
}