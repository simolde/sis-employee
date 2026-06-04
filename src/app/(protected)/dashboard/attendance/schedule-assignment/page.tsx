import Link from "next/link";
import {
  ArrowLeft,
  CalendarClock,
  Search,
  UsersRound,
} from "lucide-react";
import { requireCanManageEmployees } from "@/features/auth/server/permission-guards";
import { ScheduleAssignmentActionPanel } from "@/features/attendance/schedule-assignment/components/schedule-assignment-action-panel";
import {
  getScheduleAssignmentOptions,
  getScheduleAssignmentPreview,
  parseScheduleAssignmentFilters,
} from "@/features/attendance/schedule-assignment/server/schedule-assignment-queries";
import type {
  ScheduleAssignmentFilters,
  ScheduleAssignmentOption,
  ScheduleAssignmentOptions,
} from "@/features/attendance/schedule-assignment/types/schedule-assignment-types";

type ScheduleAssignmentPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function OptionList({ options }: { options: ScheduleAssignmentOption[] }) {
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

function ScheduleAssignmentFiltersForm({
  filters,
  options,
}: {
  filters: ScheduleAssignmentFilters;
  options: ScheduleAssignmentOptions;
}) {
  return (
    <section className="starland-card p-5">
      <form className="grid gap-4 xl:grid-cols-4">
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
            placeholder="Employee number, name, department, designation, schedule"
            defaultValue={filters.q}
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

        <div>
          <label
            htmlFor="designationId"
            className="text-sm font-bold text-[var(--starland-dark-text)]"
          >
            Designation
          </label>

          <select
            id="designationId"
            name="designationId"
            className="starland-input mt-2"
            defaultValue={filters.designationId}
          >
            <OptionList options={options.designations} />
          </select>
        </div>

        <div>
          <label
            htmlFor="empTypeId"
            className="text-sm font-bold text-[var(--starland-dark-text)]"
          >
            Employee Type
          </label>

          <select
            id="empTypeId"
            name="empTypeId"
            className="starland-input mt-2"
            defaultValue={filters.empTypeId}
          >
            <OptionList options={options.employeeTypes} />
          </select>
        </div>

        <div className="xl:col-span-2">
          <label
            htmlFor="currentScheduleId"
            className="text-sm font-bold text-[var(--starland-dark-text)]"
          >
            Current Schedule
          </label>

          <select
            id="currentScheduleId"
            name="currentScheduleId"
            className="starland-input mt-2"
            defaultValue={filters.currentScheduleId}
          >
            <option value="">All current schedules</option>
            <option value="NONE">No schedule assigned</option>
            {options.schedules.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="xl:col-span-2">
          <label
            htmlFor="targetScheduleId"
            className="text-sm font-bold text-[var(--starland-dark-text)]"
          >
            Target Schedule
          </label>

          <select
            id="targetScheduleId"
            name="targetScheduleId"
            className="starland-input mt-2"
            defaultValue={filters.targetScheduleId}
            required
          >
            <option value="">Select target schedule</option>
            {options.schedules.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="validFrom"
            className="text-sm font-bold text-[var(--starland-dark-text)]"
          >
            Effective From
          </label>

          <input
            id="validFrom"
            name="validFrom"
            type="date"
            className="starland-input mt-2"
            defaultValue={filters.validFrom}
            required
          />
        </div>

        <div className="xl:col-span-3">
          <label
            htmlFor="remarks"
            className="text-sm font-bold text-[var(--starland-dark-text)]"
          >
            Remarks
          </label>

          <input
            id="remarks"
            name="remarks"
            className="starland-input mt-2"
            placeholder="Optional assignment remarks"
            defaultValue={filters.remarks}
          />
        </div>

        <div className="flex items-end gap-2 xl:col-span-4">
          <button type="submit" className="starland-btn starland-btn-primary">
            <Search className="h-4 w-4" aria-hidden="true" />
            Preview Assignment
          </button>

          <Link
            href="/dashboard/attendance/schedule-assignment"
            className="starland-btn starland-btn-soft"
          >
            Reset
          </Link>
        </div>
      </form>
    </section>
  );
}

export default async function ScheduleAssignmentPage({
  searchParams,
}: ScheduleAssignmentPageProps) {
  await requireCanManageEmployees();

  const resolvedSearchParams = await searchParams;
  const filters = parseScheduleAssignmentFilters(resolvedSearchParams);

  const [options, preview] = await Promise.all([
    getScheduleAssignmentOptions(),
    getScheduleAssignmentPreview(filters),
  ]);

  const limit = 500;

  return (
    <section className="starland-page space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="starland-badge starland-badge-info">
            Bulk Schedule Assignment
          </span>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
            Employee Schedule Assignment
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            Assign schedules to employees in bulk. Automatic attendance status
            calculation uses each employee&apos;s assigned schedule and shift.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/attendance/status-recalculation"
            className="starland-btn starland-btn-primary"
          >
            <CalendarClock className="h-4 w-4" aria-hidden="true" />
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

      <section className="starland-card overflow-hidden">
        <div className="bg-[var(--starland-deep-green)] p-5 text-white sm:p-6">
          <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
            Preview Before Applying
          </span>

          <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
            Matching Employees Summary
          </h2>

          <p className="mt-2 max-w-4xl text-sm leading-6 text-white/70">
            Review the counts first, then assign the target schedule. Every
            changed employee gets schedule history and an activity log.
          </p>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-5">
          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <UsersRound className="h-7 w-7 text-[var(--starland-info)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Matching Employees
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {preview.matchingEmployees}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <UsersRound className="h-7 w-7 text-[var(--starland-success)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Active Matching
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {preview.activeMatchingEmployees}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <CalendarClock className="h-7 w-7 text-[var(--starland-warning)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              No Schedule
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {preview.employeesWithoutSchedule}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <CalendarClock className="h-7 w-7 text-[var(--starland-info)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Already Target
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {preview.alreadyTargetSchedule}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <CalendarClock className="h-7 w-7 text-[var(--starland-main-green)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Will Assign
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {preview.wouldAssignCount}
            </p>
          </article>
        </div>
      </section>

      <ScheduleAssignmentFiltersForm filters={filters} options={options} />

      <ScheduleAssignmentActionPanel
        filters={filters}
        preview={preview}
        limit={limit}
      />
    </section>
  );
}