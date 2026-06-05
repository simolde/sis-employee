import Link from "next/link";
import {
  ArrowLeft,
  CalendarCheck,
  CloudCog,
  History,
  LayoutDashboard,
  Play,
  Search,
} from "lucide-react";
import { requireCanManageEmployees } from "@/features/auth/server/permission-guards";
import { ApprovedLeaveAutomationHistoryTable } from "@/features/attendance/automation/history/components/approved-leave-automation-history-table";
import {
  getApprovedLeaveAutomationHistory,
  parseApprovedLeaveAutomationHistorySearchParams,
} from "@/features/attendance/automation/history/server/approved-leave-automation-history-queries";
import type { ApprovedLeaveAutomationHistoryFilters } from "@/features/attendance/automation/history/types/approved-leave-automation-history-types";

type ApprovedLeaveAutomationHistoryPageProps = {
  searchParams: Promise<
    Record<
      string,
      string | string[] | undefined
    >
  >;
};

function AutomationHistoryFilters({
  filters,
}: {
  filters: ApprovedLeaveAutomationHistoryFilters;
}) {
  return (
    <section className="starland-card p-5">
      <form className="grid gap-4 xl:grid-cols-4">
        <div>
          <label
            htmlFor="dateFrom"
            className="text-sm font-bold text-[var(--starland-dark-text)]"
          >
            Run Date From
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
            Run Date To
          </label>

          <input
            id="dateTo"
            name="dateTo"
            type="date"
            className="starland-input mt-2"
            defaultValue={filters.dateTo}
          />
        </div>

        <div>
          <label
            htmlFor="executionMode"
            className="text-sm font-bold text-[var(--starland-dark-text)]"
          >
            Execution Mode
          </label>

          <select
            id="executionMode"
            name="executionMode"
            className="starland-input mt-2"
            defaultValue={
              filters.executionMode
            }
          >
            <option value="">
              All executions
            </option>

            <option value="DASHBOARD">
              Dashboard
            </option>

            <option value="API">
              API / system
            </option>
          </select>
        </div>

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
            placeholder="Run key or actor user ID"
            defaultValue={filters.q}
          />
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
            Apply Filters
          </button>

          <Link
            href="/dashboard/attendance/automation/approved-leave-excused/history"
            className="starland-btn starland-btn-soft"
          >
            Reset
          </Link>
        </div>
      </form>
    </section>
  );
}

export default async function ApprovedLeaveAutomationHistoryPage({
  searchParams,
}: ApprovedLeaveAutomationHistoryPageProps) {
  await requireCanManageEmployees();

  const resolvedSearchParams =
    await searchParams;

  const filters =
    parseApprovedLeaveAutomationHistorySearchParams(
      resolvedSearchParams,
    );

  const result =
    await getApprovedLeaveAutomationHistory(
      filters,
    );

  return (
    <section className="starland-page space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="starland-badge starland-badge-info">
            Automation History
          </span>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
            Approved-Leave Automation Runs
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            Review completed dashboard and
            protected API executions, including
            runs that did not generate attendance.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/attendance/automation/approved-leave-excused"
            className="starland-btn starland-btn-primary"
          >
            <Play
              className="h-4 w-4"
              aria-hidden="true"
            />
            Run Automation
          </Link>

          <Link
            href="/dashboard/attendance/excused"
            className="starland-btn starland-btn-soft"
          >
            <CalendarCheck
              className="h-4 w-4"
              aria-hidden="true"
            />
            EXCUSED Records
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

      <section className="starland-card overflow-hidden">
        <div className="bg-[var(--starland-deep-green)] p-5 text-white sm:p-6">
          <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
            Run-Level Traceability
          </span>

          <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
            Automation Execution Summary
          </h2>

          <p className="mt-2 max-w-4xl text-sm leading-6 text-white/70">
            Run-level logs complement the
            individual attendance-generation logs
            by recording the requested date range,
            limit, execution source, totals, and
            duration.
          </p>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-5">
          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <History className="h-7 w-7 text-[var(--starland-info)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Total Runs
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {result.summary.totalRuns}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <Search className="h-7 w-7 text-[var(--starland-main-green)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Matching Runs
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {
                result.summary
                  .matchingRuns
              }
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <LayoutDashboard className="h-7 w-7 text-[var(--starland-success)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Dashboard Runs
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {
                result.summary
                  .dashboardRuns
              }
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <CloudCog className="h-7 w-7 text-[var(--starland-info)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              API / System Runs
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {result.summary.apiRuns}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <CalendarCheck className="h-7 w-7 text-[var(--starland-success)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Generated on Page
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {
                result.summary
                  .generatedRecordsOnPage
              }
            </p>
          </article>
        </div>
      </section>

      <AutomationHistoryFilters
        filters={result.filters}
      />

      <ApprovedLeaveAutomationHistoryTable
        result={result}
      />
    </section>
  );
}