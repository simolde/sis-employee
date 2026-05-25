import Link from "next/link";
import { Search } from "lucide-react";
import {
  attendanceSourceValues,
  attendanceStatusValues,
  type AttendanceListSearchParams,
} from "../types/attendance-types";

type AttendanceListFiltersProps = {
  filters: AttendanceListSearchParams;
};

export function AttendanceListFilters({ filters }: AttendanceListFiltersProps) {
  return (
    <form className="starland-card grid gap-4 p-4 lg:grid-cols-[1fr_180px_180px_170px_170px_auto_auto] lg:items-end">
      <div>
        <label
          htmlFor="q"
          className="text-sm font-bold text-[var(--starland-dark-text)]"
        >
          Search
        </label>
        <div className="relative mt-2">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--starland-muted-text)]"
            aria-hidden="true"
          />
          <input
            id="q"
            name="q"
            className="starland-input pl-10"
            placeholder="Employee no., name, department, branch..."
            defaultValue={filters.q}
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="status"
          className="text-sm font-bold text-[var(--starland-dark-text)]"
        >
          Status
        </label>
        <select
          id="status"
          name="status"
          className="starland-input mt-2"
          defaultValue={filters.status}
        >
          <option value="ALL">All Status</option>
          {attendanceStatusValues.map((status) => (
            <option key={status} value={status}>
              {status.replaceAll("_", " ")}
            </option>
          ))}
        </select>
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
          <option value="ALL">All Source</option>
          {attendanceSourceValues.map((source) => (
            <option key={source} value={source}>
              {source}
            </option>
          ))}
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

      <input type="hidden" name="page" value="1" />
      <input type="hidden" name="pageSize" value={filters.pageSize} />

      <button type="submit" className="starland-btn starland-btn-primary">
        Filter
      </button>

      <Link href="/dashboard/attendance" className="starland-btn starland-btn-soft">
        Reset
      </Link>
    </form>
  );
}