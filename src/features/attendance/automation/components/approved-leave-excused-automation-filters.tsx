import Link from "next/link";
import { Search } from "lucide-react";
import type {
  ApprovedLeaveExcusedSyncFilters,
  ApprovedLeaveExcusedSyncOption,
  ApprovedLeaveExcusedSyncOptions,
} from "@/features/attendance/excused/sync/types/approved-leave-excused-sync-types";

type ApprovedLeaveExcusedAutomationFiltersProps = {
  filters: ApprovedLeaveExcusedSyncFilters;
  options: ApprovedLeaveExcusedSyncOptions;
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

export function ApprovedLeaveExcusedAutomationFilters({
  filters,
  options,
}: ApprovedLeaveExcusedAutomationFiltersProps) {
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
            Employee Search
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

            Refresh Preview
          </button>

          <Link
            href="/dashboard/attendance/automation/approved-leave-excused"
            className="starland-btn starland-btn-soft"
          >
            Reset
          </Link>
        </div>
      </form>
    </section>
  );
}