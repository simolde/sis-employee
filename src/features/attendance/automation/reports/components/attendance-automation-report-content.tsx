import Link from "next/link";
import {
  Activity,
  CalendarCheck,
  CheckCircle2,
  Clock3,
  CloudCog,
  Gauge,
  LayoutDashboard,
  RotateCcw,
  Timer,
  TriangleAlert,
} from "lucide-react";
import type {
  AttendanceAutomationReportData,
  AttendanceAutomationReportRunStatus,
} from "../types/attendance-automation-report-types";

type AttendanceAutomationReportContentProps = {
  data: AttendanceAutomationReportData;
};

function statusBadgeClass(
  status: AttendanceAutomationReportRunStatus,
): string {
  if (status === "COMPLETED") {
    return "starland-badge-success";
  }

  if (status === "FAILED") {
    return "starland-badge-danger";
  }

  return "starland-badge-warning";
}

export function AttendanceAutomationReportContent({
  data,
}: AttendanceAutomationReportContentProps) {
  return (
    <div className="space-y-5">
      {data.metadata.isPartial ? (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-800">
          The selected date range contains{" "}
          {data.metadata.databaseRunsInRange} run
          records. Report calculations are based on
          the most recent{" "}
          {data.metadata.maximumScannedRuns} records.
          Reduce the date range for complete totals.
        </section>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="starland-card p-4">
          <Activity
            className="h-7 w-7 text-[var(--starland-info)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Total Runs
          </p>

          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {data.summary.totalRuns}
          </p>
        </article>

        <article className="starland-card p-4">
          <CheckCircle2
            className="h-7 w-7 text-[var(--starland-success)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Completed Runs
          </p>

          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {data.summary.completedRuns}
          </p>
        </article>

        <article className="starland-card p-4">
          <TriangleAlert
            className="h-7 w-7 text-[var(--starland-danger)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Failed Runs
          </p>

          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {data.summary.failedRuns}
          </p>
        </article>

        <article className="starland-card p-4">
          <Gauge
            className="h-7 w-7 text-[var(--starland-main-green)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Success Rate
          </p>

          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {data.summary.successRate}%
          </p>
        </article>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="starland-card p-4">
          <CalendarCheck
            className="h-7 w-7 text-[var(--starland-success)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            EXCUSED Generated
          </p>

          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {data.summary.generatedRecords}
          </p>
        </article>

        <article className="starland-card p-4">
          <RotateCcw
            className="h-7 w-7 text-[var(--starland-warning)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Retry Runs
          </p>

          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {data.summary.retryRuns}
          </p>
        </article>

        <article className="starland-card p-4">
          <Timer
            className="h-7 w-7 text-[var(--starland-info)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Average Duration
          </p>

          <p className="mt-1 text-2xl font-extrabold text-[var(--starland-dark-text)]">
            {data.summary.averageDurationLabel}
          </p>
        </article>

        <article className="starland-card p-4">
          <Clock3
            className="h-7 w-7 text-[var(--starland-danger)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Maximum Duration
          </p>

          <p className="mt-1 text-2xl font-extrabold text-[var(--starland-dark-text)]">
            {data.summary.maximumDurationLabel}
          </p>
        </article>
      </section>

      <section className="starland-card overflow-hidden">
        <div className="border-b border-[var(--starland-border)] px-5 py-4">
          <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
            Daily Automation Trend
          </h2>

          <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
            Daily execution volume, generated
            attendance, duration, and success rate
            in Asia/Manila time.
          </p>
        </div>

        <div className="starland-scroll-x">
          <table className="starland-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Total</th>
                <th>Completed</th>
                <th>Failed</th>
                <th>API</th>
                <th>Dashboard</th>
                <th>Retries</th>
                <th>Generated</th>
                <th>Average Duration</th>
                <th>Success Rate</th>
              </tr>
            </thead>

            <tbody>
              {data.dailyTrend.length > 0 ? (
                data.dailyTrend.map(
                  (item) => (
                    <tr key={item.dateKey}>
                      <td>
                        <p className="font-bold text-[var(--starland-dark-text)]">
                          {item.dateLabel}
                        </p>
                      </td>

                      <td>{item.totalRuns}</td>

                      <td>
                        <span className="starland-badge starland-badge-success">
                          {item.completedRuns}
                        </span>
                      </td>

                      <td>
                        <span className="starland-badge starland-badge-danger">
                          {item.failedRuns}
                        </span>
                      </td>

                      <td>{item.apiRuns}</td>

                      <td>
                        {item.dashboardRuns}
                      </td>

                      <td>{item.retryRuns}</td>

                      <td>
                        {item.generatedRecords}
                      </td>

                      <td>
                        {
                          item.averageDurationLabel
                        }
                      </td>

                      <td>
                        <strong>
                          {item.successRate}%
                        </strong>
                      </td>
                    </tr>
                  ),
                )
              ) : (
                <tr>
                  <td colSpan={10}>
                    <div className="rounded-2xl border border-dashed border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-6 text-center">
                      <p className="font-bold text-[var(--starland-dark-text)]">
                        No matching automation runs
                      </p>

                      <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
                        Adjust the report filters or
                        run the approved-leave
                        automation.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        {data.executionBreakdown.map(
          (item) => (
            <article
              key={item.executionMode}
              className="starland-card p-5"
            >
              <div className="flex items-center gap-3">
                {item.executionMode ===
                "API" ? (
                  <CloudCog
                    className="h-7 w-7 text-[var(--starland-info)]"
                    aria-hidden="true"
                  />
                ) : (
                  <LayoutDashboard
                    className="h-7 w-7 text-[var(--starland-main-green)]"
                    aria-hidden="true"
                  />
                )}

                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-[var(--starland-muted-text)]">
                    Execution Source
                  </p>

                  <h2 className="text-xl font-extrabold text-[var(--starland-dark-text)]">
                    {item.executionMode}
                  </h2>
                </div>
              </div>

              <dl className="mt-5 grid gap-4 sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-bold uppercase text-[var(--starland-muted-text)]">
                    Total Runs
                  </dt>

                  <dd className="mt-1 text-xl font-extrabold text-[var(--starland-dark-text)]">
                    {item.totalRuns}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-bold uppercase text-[var(--starland-muted-text)]">
                    Success Rate
                  </dt>

                  <dd className="mt-1 text-xl font-extrabold text-[var(--starland-dark-text)]">
                    {item.successRate}%
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-bold uppercase text-[var(--starland-muted-text)]">
                    Generated
                  </dt>

                  <dd className="mt-1 font-bold text-[var(--starland-dark-text)]">
                    {item.generatedRecords}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-bold uppercase text-[var(--starland-muted-text)]">
                    Average Duration
                  </dt>

                  <dd className="mt-1 font-bold text-[var(--starland-dark-text)]">
                    {
                      item.averageDurationLabel
                    }
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-bold uppercase text-[var(--starland-muted-text)]">
                    Completed
                  </dt>

                  <dd className="mt-1 font-bold text-green-700">
                    {item.completedRuns}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-bold uppercase text-[var(--starland-muted-text)]">
                    Failed / Retries
                  </dt>

                  <dd className="mt-1 font-bold text-[var(--starland-dark-text)]">
                    {item.failedRuns} /{" "}
                    {item.retryRuns}
                  </dd>
                </div>
              </dl>
            </article>
          ),
        )}
      </section>

      <section className="starland-card overflow-hidden">
        <div className="border-b border-[var(--starland-border)] px-5 py-4">
          <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
            Slowest Automation Runs
          </h2>

          <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
            The ten longest executions among the
            currently filtered records.
          </p>
        </div>

        <div className="starland-scroll-x">
          <table className="starland-table">
            <thead>
              <tr>
                <th>Run</th>
                <th>Execution</th>
                <th>Status</th>
                <th>Checked</th>
                <th>Generated</th>
                <th>Duration</th>
                <th>Created</th>
                <th className="print:hidden">
                  Details
                </th>
              </tr>
            </thead>

            <tbody>
              {data.slowestRuns.length > 0 ? (
                data.slowestRuns.map(
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

                        {run.isRetry ? (
                          <p className="mt-1 text-xs font-bold text-[var(--starland-warning)]">
                            Retry of #
                            {
                              run.retryOfRunAuditLogId
                            }
                          </p>
                        ) : null}
                      </td>

                      <td>
                        {run.executionMode}
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
                        {run.checkedCount}
                      </td>

                      <td>
                        {run.generatedCount}
                      </td>

                      <td>
                        <strong>
                          {run.durationLabel}
                        </strong>
                      </td>

                      <td>{run.createdAt}</td>

                      <td className="print:hidden">
                        <Link
                          href={`/dashboard/attendance/automation/approved-leave-excused/history/${run.activityLogId}`}
                          className="starland-btn starland-btn-soft starland-btn-sm"
                        >
                          Open
                        </Link>
                      </td>
                    </tr>
                  ),
                )
              ) : (
                <tr>
                  <td colSpan={8}>
                    <p className="py-5 text-center text-sm font-semibold text-[var(--starland-muted-text)]">
                      No runs are available for
                      duration analysis.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}