import Link from "next/link";
import { Search } from "lucide-react";
import {
  employeeStatusValues,
  type EmployeeListSearchParams,
} from "../types/employee-types";

type EmployeeListFiltersProps = {
  filters: EmployeeListSearchParams;
};

export function EmployeeListFilters({ filters }: EmployeeListFiltersProps) {
  return (
    <form className="starland-card grid gap-4 p-4 md:grid-cols-[1fr_220px_auto_auto] md:items-end">
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
            placeholder="Employee no., name, email, department..."
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
          {employeeStatusValues.map((status) => (
            <option key={status} value={status}>
              {status.replaceAll("_", " ")}
            </option>
          ))}
        </select>
      </div>

      <input type="hidden" name="page" value="1" />
      <input type="hidden" name="pageSize" value={filters.pageSize} />

      <button type="submit" className="starland-btn starland-btn-primary">
        Search
      </button>

      <Link href="/dashboard/employees" className="starland-btn starland-btn-soft">
        Reset
      </Link>
    </form>
  );
}