import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  BellRing,
  RefreshCw,
} from "lucide-react";
import { requireCanManageEmployees } from "@/features/auth/server/permission-guards";
import { AttendanceAutomationAlertActions } from "@/features/attendance/automation/alerts/components/attendance-automation-alert-actions";
import { AttendanceAutomationAlertEndpointCard } from "@/features/attendance/automation/alerts/components/attendance-automation-alert-endpoint-card";
import { AttendanceAutomationAlertFilters } from "@/features/attendance/automation/alerts/components/attendance-automation-alert-filters";
import { AttendanceAutomationAlertList } from "@/features/attendance/automation/alerts/components/attendance-automation-alert-list";
import { AttendanceAutomationAlertSummary } from "@/features/attendance/automation/alerts/components/attendance-automation-alert-summary";
import { AttendanceAutomationFilteredAlertSummary } from "@/features/attendance/automation/alerts/components/attendance-automation-filtered-alert-summary";
import {
  getFilteredAttendanceAutomationAlerts,
  parseAttendanceAutomationAlertSearchParams,
} from "@/features/attendance/automation/alerts/server/attendance-automation-alert-filter-queries";

export const dynamic = "force-dynamic";

type AttendanceAutomationAlertsPageProps = {
  searchParams: Promise<
    Record<
      string,
      string | string[] | undefined
    >
  >;
};

export default async function AttendanceAutomationAlertsPage({
  searchParams,
}: AttendanceAutomationAlertsPageProps) {
  await requireCanManageEmployees();

  const resolvedSearchParams =
    await searchParams;

  const filters =
    parseAttendanceAutomationAlertSearchParams(
      resolvedSearchParams,
    );

  const result =
    await getFilteredAttendanceAutomationAlerts(
      filters,
    );

  const data = result.source;

  return (
    <section className="starland-page space-y-5">
      <div className="flex flex-col gap-4 print:hidden sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="starland-badge starland-badge-info">
            Operations Monitoring
          </span>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
            Attendance Automation Alerts
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            Search, filter, print, and export active
            automation configuration, scheduler,
            failure, reliability, and execution-lock
            conditions.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:items-end">
          <AttendanceAutomationAlertActions
            result={result}
          />

          <div className="flex flex-wrap gap-2">
            <Link
              href="/dashboard/attendance/automation/alerts"
              className="starland-btn starland-btn-soft"
            >
              <RefreshCw
                className="h-4 w-4"
                aria-hidden="true"
              />

              Refresh
            </Link>

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
          <div className="flex items-start gap-3">
            <BellRing
              className="mt-1 h-7 w-7 shrink-0"
              aria-hidden="true"
            />

            <div>
              <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
                Live Derived Alerts
              </span>

              <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
                Automation Operations Center
              </h2>

              <p className="mt-2 max-w-4xl text-sm leading-6 text-white/70">
                Alerts are generated from server
                configuration, automation health,
                scheduler compliance, recent run
                history, and the execution lock.
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
              Health:{" "}
              {data.signals.healthStatus}
            </span>

            <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
              Schedule:{" "}
              {data.signals.scheduleStatus}
            </span>

            <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
              Lock:{" "}
              {data.signals.lockStatus}
            </span>

            <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
              Overall: {data.overallStatus}
            </span>
          </div>
        </div>
      </section>

      <AttendanceAutomationAlertSummary
        data={data}
      />

      <AttendanceAutomationAlertEndpointCard
        data={data}
      />

      <AttendanceAutomationAlertFilters
        result={result}
      />

      <AttendanceAutomationFilteredAlertSummary
        result={result}
      />

      <AttendanceAutomationAlertList
        alerts={result.alerts}
        filtered={
          result.summary.hasActiveFilters
        }
        emptyTitle={
          result.summary.hasActiveFilters
            ? "No alerts match the filters"
            : "No active automation alerts"
        }
        emptyDescription={
          result.summary.hasActiveFilters
            ? "Change or reset the search, severity, or alert-code filters to display other active automation alerts."
            : "The current secret, scheduler, execution history, reliability, and lock checks have no active alert conditions."
        }
      />
    </section>
  );
}