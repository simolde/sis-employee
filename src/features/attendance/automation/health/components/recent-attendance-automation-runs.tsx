import Link from "next/link";
import {
  ArrowUpRight,
  CloudCog,
  LayoutDashboard,
  RotateCcw,
} from "lucide-react";
import type {
  AttendanceAutomationHealthData,
  AttendanceAutomationHealthRun,
} from "../types/attendance-automation-health-types";

type RecentAttendanceAutomationRunsProps = {
  data: AttendanceAutomationHealthData;
};

function statusBadgeClass(
  status: AttendanceAutomationHealthRun["status"],
): string {
  if (status === "COMPLETED") {
    return "starland-badge-success";
  }

  if (status === "FAILED") {
    return "starland-badge-danger";
  }

  return "starland-badge-warning";
}

function ExecutionBadge({
  executionMode,
}: {
  executionMode: AttendanceAutomationHealthRun["executionMode"];
}) {
  if (executionMode === "API") {
    return (
      <span className="starland-badge starland-badge-info">
        <CloudCog
          className="h-3.5 w-3.5"
          aria-hidden="true"
        />
        API / SYSTEM
      </span>
    );
  }

  return (
    <span className="starland-badge starland-badge-success">
      <LayoutDashboard
        className="h-3.5 w-3.5"
        aria-hidden="true"
      />
      DASHBOARD
    </span>
  );
}

export function RecentAttendanceAutomationRuns({
  data,
}: RecentAttendanceAutomationRunsProps) {
  return (
    <section className="starland-card overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-[var(--starland-border)] px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
            Recent Approved-Leave Automation Runs
          </h2>

          <p className="mt-1 text-sm leading-6 text-[var(--starland-muted-text)]">
            The most recent API, scheduled, dashboard,
            and retry executions.
          </p>
        </div>

        <Link
          href="/dashboard/attendance/automation/approved-leave-excused/history"
          className="starland-btn starland-btn-soft starland-btn-sm"
        >
          View Full History
          <ArrowUpRight
            className="h-4 w-4"
            aria-hidden="true"
          />
        </Link>
      </div>

      <div className="starland-scroll-x">
        <table className="starland-table">
          <thead>
            <tr>
              <th>Run</th>
              <th>Execution</th>
              <th>Status</th>
              <th>Results</th>
              <th>Duration</th>
              <th>When</th>
              <th>Details</th>
            </tr>
          </thead>

          <tbody>
            {data.recentRuns.length > 0 ? (
              data.recentRuns.map(
                (run) => (
                  <tr
                    key={
                      run.activityLogId
                    }
                  >
                    <td>
                      <p className="font-bold text-[var(--starland-dark-text)]">
                        Run #
                        {
                          run.activityLogId
                        }
                      </p>

                      <p className="mt-1 max-w-48 break-all text-xs font-semibold text-[var(--starland-muted-text)]">
                        {run.runKey}
                      </p>

                      {run.retryOfRunAuditLogId ? (
                        <p className="mt-2 flex items-center gap-1 text-xs font-bold text-[var(--starland-warning)]">
                          <RotateCcw
                            className="h-3.5 w-3.5"
                            aria-hidden="true"
                          />
                          Retry of #
                          {
                            run.retryOfRunAuditLogId
                          }
                        </p>
                      ) : null}
                    </td>

                    <td>
                      <ExecutionBadge
                        executionMode={
                          run.executionMode
                        }
                      />

                      <p className="mt-2 text-xs font-semibold text-[var(--starland-muted-text)]">
                        Actor:{" "}
                        {run.actorUserId ??
                          "SYSTEM"}
                      </p>
                    </td>

                    <td>
                      <span
                        className={[
                          "starland-badge",
                          statusBadgeClass(
                            run.status,
                          ),
                        ].join(" ")}
                      >
                        {run.status}
                      </span>
                    </td>

                    <td>
                      <div className="min-w-36 space-y-1 text-sm font-semibold text-[var(--starland-muted-text)]">
                        <p>
                          Checked:{" "}
                          {run.checkedCount}
                        </p>

                        <p>
                          Generated:{" "}
                          {run.generatedCount}
                        </p>
                      </div>
                    </td>

                    <td>
                      <p className="font-bold text-[var(--starland-dark-text)]">
                        {run.durationLabel}
                      </p>
                    </td>

                    <td>
                      <p className="font-semibold text-[var(--starland-dark-text)]">
                        {run.ageLabel}
                      </p>

                      <p className="mt-1 min-w-40 text-xs text-[var(--starland-muted-text)]">
                        {run.createdAt}
                      </p>
                    </td>

                    <td>
                      <Link
                        href={`/dashboard/attendance/automation/approved-leave-excused/history/${run.activityLogId}`}
                        className="starland-btn starland-btn-soft starland-btn-sm"
                      >
                        Open
                        <ArrowUpRight
                          className="h-4 w-4"
                          aria-hidden="true"
                        />
                      </Link>
                    </td>
                  </tr>
                ),
              )
            ) : (
              <tr>
                <td colSpan={7}>
                  <div className="rounded-2xl border border-dashed border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-6 text-center">
                    <p className="font-bold text-[var(--starland-dark-text)]">
                      No automation runs found
                    </p>

                    <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
                      Run the approved-leave automation
                      from the dashboard or protected API
                      endpoint.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {data.isPartial ? (
        <div className="border-t border-amber-200 bg-amber-50 px-5 py-3 text-sm font-semibold text-amber-800">
          The 30-day monitoring window contains more
          than 5,000 runs. Health totals that require
          JSON inspection are based on the most recent
          5,000 records.
        </div>
      ) : null}
    </section>
  );
}