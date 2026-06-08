import Link from "next/link";
import {
  Filter,
  Search,
  X,
} from "lucide-react";
import type { AttendanceAutomationFilteredAlertResult } from "../types/attendance-automation-alert-filter-types";

type AttendanceAutomationAlertFiltersProps = {
  result: AttendanceAutomationFilteredAlertResult;
};

function formatAlertCode(
  code: string,
): string {
  return code
    .split("_")
    .map((word) => {
      const lower = word.toLowerCase();

      return (
        lower.charAt(0).toUpperCase() +
        lower.slice(1)
      );
    })
    .join(" ");
}

export function AttendanceAutomationAlertFilters({
  result,
}: AttendanceAutomationAlertFiltersProps) {
  const activeCodes = new Set(
    result.source.alerts.map(
      (alert) => alert.code,
    ),
  );

  return (
    <section className="starland-card p-5 print:hidden">
      <div className="mb-4 flex items-center gap-2">
        <Filter
          className="h-5 w-5 text-[var(--starland-info)]"
          aria-hidden="true"
        />

        <div>
          <h2 className="font-extrabold text-[var(--starland-dark-text)]">
            Filter Automation Alerts
          </h2>

          <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
            Search active alerts or narrow the
            results by severity and alert code.
          </p>
        </div>
      </div>

      <form className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(12rem,1fr)_minmax(16rem,1fr)_auto]">
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
            type="search"
            className="starland-input mt-2"
            defaultValue={result.filters.q}
            placeholder="Search title, message, code, or details"
          />
        </div>

        <div>
          <label
            htmlFor="severity"
            className="text-sm font-bold text-[var(--starland-dark-text)]"
          >
            Severity
          </label>

          <select
            id="severity"
            name="severity"
            className="starland-input mt-2"
            defaultValue={
              result.filters.severity
            }
          >
            <option value="">
              All severities
            </option>

            <option value="CRITICAL">
              Critical
            </option>

            <option value="WARNING">
              Warning
            </option>

            <option value="INFO">
              Information
            </option>
          </select>
        </div>

        <div>
          <label
            htmlFor="code"
            className="text-sm font-bold text-[var(--starland-dark-text)]"
          >
            Alert Code
          </label>

          <select
            id="code"
            name="code"
            className="starland-input mt-2"
            defaultValue={
              result.filters.code
            }
          >
            <option value="">
              All alert codes
            </option>

            {result.availableCodes.map(
              (code) => (
                <option
                  key={code}
                  value={code}
                >
                  {formatAlertCode(code)}
                  {activeCodes.has(code)
                    ? " — Active"
                    : ""}
                </option>
              ),
            )}
          </select>
        </div>

        <div className="flex flex-wrap items-end gap-2">
          <button
            type="submit"
            className="starland-btn starland-btn-primary"
          >
            <Search
              className="h-4 w-4"
              aria-hidden="true"
            />

            Apply
          </button>

          <Link
            href="/dashboard/attendance/automation/alerts"
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