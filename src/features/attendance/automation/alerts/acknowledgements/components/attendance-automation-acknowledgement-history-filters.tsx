import Link from "next/link";
import {
  Filter,
  Search,
  X,
} from "lucide-react";
import type { AttendanceAutomationAcknowledgementHistoryFilters } from "../types/attendance-automation-alert-acknowledgement-history-types";

type AttendanceAutomationAcknowledgementHistoryFiltersProps = {
  filters:
    AttendanceAutomationAcknowledgementHistoryFilters;
};

export function AttendanceAutomationAcknowledgementHistoryFilters({
  filters,
}: AttendanceAutomationAcknowledgementHistoryFiltersProps) {
  return (
    <section className="starland-card p-5 print:hidden">
      <div className="mb-4 flex items-start gap-2">
        <Filter
          className="mt-0.5 h-5 w-5 text-[var(--starland-info)]"
          aria-hidden="true"
        />

        <div>
          <h2 className="font-extrabold text-[var(--starland-dark-text)]">
            Filter Acknowledgement History
          </h2>

          <p className="mt-1 text-sm leading-6 text-[var(--starland-muted-text)]">
            Search acknowledgement events by alert,
            administrator, note, action, state, or
            date range.
          </p>
        </div>
      </div>

      <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <div className="md:col-span-2 xl:col-span-2">
          <label
            htmlFor="q"
            className="text-sm font-bold text-[var(--starland-dark-text)]"
          >
            Search
          </label>

          <input
            id="q"
            name="q"
            type="search"
            className="starland-input mt-2"
            defaultValue={filters.q}
            placeholder="Alert code, note, actor ID, or title"
          />
        </div>

        <div>
          <label
            htmlFor="action"
            className="text-sm font-bold text-[var(--starland-dark-text)]"
          >
            Action
          </label>

          <select
            id="action"
            name="action"
            className="starland-input mt-2"
            defaultValue={filters.action}
          >
            <option value="">
              All actions
            </option>

            <option value="ACKNOWLEDGED">
              Acknowledged
            </option>

            <option value="CLEARED">
              Cleared
            </option>
          </select>
        </div>

        <div>
          <label
            htmlFor="status"
            className="text-sm font-bold text-[var(--starland-dark-text)]"
          >
            Current State
          </label>

          <select
            id="status"
            name="status"
            className="starland-input mt-2"
            defaultValue={filters.status}
          >
            <option value="">
              All states
            </option>

            <option value="ACTIVE">
              Active
            </option>

            <option value="EXPIRED">
              Expired
            </option>

            <option value="CLEARED">
              Cleared
            </option>

            <option value="SUPERSEDED">
              Superseded
            </option>
          </select>
        </div>

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
            defaultValue={
              filters.dateFrom
            }
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
            defaultValue={
              filters.dateTo
            }
          />
        </div>

        <div>
          <label
            htmlFor="pageSize"
            className="text-sm font-bold text-[var(--starland-dark-text)]"
          >
            Rows
          </label>

          <select
            id="pageSize"
            name="pageSize"
            className="starland-input mt-2"
            defaultValue={String(
              filters.pageSize,
            )}
          >
            <option value="20">
              20 rows
            </option>

            <option value="50">
              50 rows
            </option>

            <option value="100">
              100 rows
            </option>
          </select>
        </div>

        <div className="flex flex-wrap items-end gap-2 md:col-span-2 xl:col-span-5">
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
            href="/dashboard/attendance/automation/alerts/acknowledgements"
            className="starland-btn starland-btn-soft"
          >
            <X
              className="h-4 w-4"
              aria-hidden="true"
            />

            Reset
          </Link>
        </div>
      </form>
    </section>
  );
}