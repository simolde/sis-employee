import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  BarChart3,
  History,
  Search,
} from "lucide-react";
import { requireCanManageEmployees } from "@/features/auth/server/permission-guards";
import { AttendanceAutomationReportActions } from "@/features/attendance/automation/reports/components/attendance-automation-report-actions";
import { AttendanceAutomationReportContent } from "@/features/attendance/automation/reports/components/attendance-automation-report-content";
import {
  getAttendanceAutomationReportData,
  parseAttendanceAutomationReportSearchParams,
} from "@/features/attendance/automation/reports/server/attendance-automation-report-queries";
import type { AttendanceAutomationReportFilters } from "@/features/attendance/automation/reports/types/attendance-automation-report-types";

export const dynamic = "force-dynamic";

type AttendanceAutomationReportsPageProps = {
  searchParams: Promise<
    Record<
      string,
      string | string[] | undefined
    >
  >;
};

function ReportFilters({
  filters,
}: {
  filters: AttendanceAutomationReportFilters;
}) {
  return (
    <section className="starland-card p-5 print:hidden">
      <form className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

            <option value="API">
              API / system
            </option>

            <option value="DASHBOARD">
              Dashboard
            </option>
          </select>
        </div>

        <div>
          <label
            htmlFor="status"
            className="text-sm font-bold text-[var(--starland-dark-text)]"
          >
            Run Status
          </label>

          <select
            id="status"
            name="status"
            className="starland-input mt-2"
            defaultValue={
              filters.status
            }
          >
            <option value="">
              All statuses
            </option>

            <option value="COMPLETED">
              Completed
            </option>

            <option value="FAILED">
              Failed
            </option>

            <option value="UNKNOWN">
              Unknown
            </option>
          </select>
        </div>

        <div className="flex flex-wrap items-end gap-2 sm:col-span-2 xl:col-span-4">
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
            href="/dashboard/attendance/automation/reports"
            className="starland-btn starland-btn-soft"
          >
            Reset
          </Link>
        </div>
      </form>
    </section>
  );
}

export default async function AttendanceAutomationReportsPage({
  searchParams,
}: AttendanceAutomationReportsPageProps) {
  await requireCanManageEmployees();

  const resolvedSearchParams =
    await searchParams;

  const filters =
    parseAttendanceAutomationReportSearchParams(
      resolvedSearchParams,
    );

  const data =
    await getAttendanceAutomationReportData(
      filters,
    );

  return (
    <section className="starland-page space-y-5">
      <div className="flex flex-col gap-4 print:hidden sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="starland-badge starland-badge-info">
            Automation Analytics
          </span>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
            Attendance Automation Reports
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            Analyze approved-leave automation
            reliability, generated records,
            duration, execution sources, and retry
            activity.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:items-end">
          <AttendanceAutomationReportActions
            data={data}
          />

          <div className="flex flex-wrap gap-2">
            <Link
              href="/dashboard/attendance/automation/health"
              className="starland-btn starland-btn-soft"
            >
              <Activity
                className="h-4 w-4"
                aria-hidden="true"
              />

              Automation Health
            </Link>

            <Link
              href="/dashboard/attendance/automation/approved-leave-excused/history"
              className="starland-btn starland-btn-soft"
            >
              <History
                className="h-4 w-4"
                aria-hidden="true"
              />

              Run History
            </Link>

            <Link
              href="/dashboard/attendance/automation"
              className="starland-btn starland-btn-soft"
            >
              <ArrowLeft
                className="h-4 w-4"
                aria-hidden="true"
              />

              Automation Overview
            </Link>
          </div>
        </div>
      </div>

      <section className="starland-card overflow-hidden print:shadow-none">
        <div className="bg-[var(--starland-deep-green)] p-5 text-white sm:p-6">
          <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
            {data.filters.dateFrom} through{" "}
            {data.filters.dateTo}
          </span>

          <div className="mt-4 flex items-start gap-3">
            <BarChart3
              className="mt-1 h-7 w-7 shrink-0"
              aria-hidden="true"
            />

            <div>
              <h2 className="text-2xl font-extrabold tracking-tight">
                Automation Performance Summary
              </h2>

              <p className="mt-2 max-w-4xl text-sm leading-6 text-white/70">
                Results include the selected
                execution source and status filters.
                Daily grouping uses Asia/Manila
                time.
              </p>
            </div>
          </div>
        </div>
      </section>

      <ReportFilters
        filters={data.filters}
      />

      <AttendanceAutomationReportContent
        data={data}
      />
    </section>
  );
}