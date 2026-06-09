import {
  Activity,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Gauge,
  History,
  Search,
  TriangleAlert,
} from "lucide-react";
import { AttendanceAutomationCronReceiptReportActions } from "./attendance-automation-cron-receipt-report-actions";
import type {
  AttendanceAutomationCronReceiptDailyState,
  AttendanceAutomationCronReceiptReportData,
  AttendanceAutomationCronReceiptTaskResult,
  AttendanceAutomationCronReceiptTimeliness,
} from "../types/attendance-automation-cron-receipt-report-types";

type AttendanceAutomationCronReceiptReportDashboardProps = {
  data:
    AttendanceAutomationCronReceiptReportData;
};

function stateBadgeClass(
  state:
    AttendanceAutomationCronReceiptDailyState,
): string {
  switch (state) {
    case "HEALTHY":
      return "starland-badge-success";

    case "WARNING":
      return "starland-badge-warning";

    case "CRITICAL":
      return "starland-badge-danger";
  }
}

function timelinessBadgeClass(
  timeliness:
    AttendanceAutomationCronReceiptTimeliness,
): string {
  switch (timeliness) {
    case "ON_TIME":
      return "starland-badge-success";

    case "EARLY":
      return "starland-badge-info";

    case "LATE":
      return "starland-badge-warning";

    case "MISSING":
      return "starland-badge-danger";
  }
}

function outcomeBadgeClass(
  outcome:
    AttendanceAutomationCronReceiptTaskResult["outcome"],
): string {
  switch (outcome) {
    case "SUCCESS":
      return "starland-badge-success";

    case "ATTENTION":
      return "starland-badge-warning";

    case "SKIPPED":
      return "starland-badge-info";

    case "FAILED":
      return "starland-badge-danger";

    case null:
      return "starland-badge-danger";
  }
}

function formatAverageDuration(
  value: number | null,
): string {
  if (value === null) {
    return "No data";
  }

  if (value < 1000) {
    return `${value} ms`;
  }

  const seconds =
    value / 1000;

  if (seconds < 60) {
    return `${seconds.toFixed(2)} sec`;
  }

  return `${Math.floor(seconds / 60)} min ${Math.round(seconds % 60)} sec`;
}

function delayLabel(
  value: number | null,
): string {
  if (value === null) {
    return "No receipt";
  }

  if (value === 0) {
    return "Exact schedule";
  }

  if (value > 0) {
    return `${value} min late`;
  }

  return `${Math.abs(value)} min early`;
}

function TaskResultCell({
  result,
}: {
  result:
    AttendanceAutomationCronReceiptTaskResult;
}) {
  return (
    <div className="min-w-72 space-y-2">
      <div className="flex flex-wrap gap-2">
        <span
          className={[
            "starland-badge",
            timelinessBadgeClass(
              result.timeliness,
            ),
          ].join(" ")}
        >
          {result.timeliness}
        </span>

        <span
          className={[
            "starland-badge",
            outcomeBadgeClass(
              result.outcome,
            ),
          ].join(" ")}
        >
          {result.outcome ??
            "NO RECEIPT"}
        </span>
      </div>

      <p className="text-xs font-bold text-(--starland-muted-text)">
        Expected: {result.expectedAt}
      </p>

      <p className="text-xs font-semibold text-[var(--starland-muted-text)]">
        {delayLabel(
          result.delayMinutes,
        )}
      </p>

      {result.receiptActivityLogId !==
      null ? (
        <>
          <p className="text-sm font-extrabold text-[var(--starland-dark-text)]">
            Receipt #
            {
              result.receiptActivityLogId
            }
          </p>

          <p className="text-xs font-semibold text-[var(--starland-muted-text)]">
            HTTP:{" "}
            {result.httpStatus ??
              "Not recorded"}
          </p>

          <p className="text-xs font-semibold text-[var(--starland-muted-text)]">
            Started:{" "}
            {result.startedAt}
          </p>

          <p className="text-xs font-semibold text-[var(--starland-muted-text)]">
            Duration:{" "}
            {result.durationLabel}
          </p>

          {result.message ? (
            <p className="max-w-80 whitespace-normal text-xs leading-5 text-[var(--starland-muted-text)]">
              {result.message}
            </p>
          ) : null}
        </>
      ) : (
        <p className="text-sm font-semibold text-red-700">
          No V2 receipt recorded.
        </p>
      )}
    </div>
  );
}

export function AttendanceAutomationCronReceiptReportDashboard({
  data,
}: AttendanceAutomationCronReceiptReportDashboardProps) {
  return (
    <div className="space-y-5">
      <section className="starland-card p-5 print:hidden">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <form className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div>
              <label
                htmlFor="days"
                className="text-sm font-bold text-[var(--starland-dark-text)]"
              >
                Report Range
              </label>

              <select
                id="days"
                name="days"
                className="starland-input mt-2 min-w-44"
                defaultValue={String(
                  data.filters.days,
                )}
              >
                <option value="7">
                  Last 7 days
                </option>

                <option value="14">
                  Last 14 days
                </option>

                <option value="30">
                  Last 30 days
                </option>

                <option value="60">
                  Last 60 days
                </option>

                <option value="90">
                  Last 90 days
                </option>
              </select>
            </div>

            <button
              type="submit"
              className="starland-btn starland-btn-primary"
            >
              <Search
                className="h-4 w-4"
                aria-hidden="true"
              />

              Apply Range
            </button>
          </form>

          <AttendanceAutomationCronReceiptReportActions
            data={data}
          />
        </div>
      </section>

      <section className="hidden border-b border-black pb-4 print:block">
        <h1 className="text-2xl font-extrabold">
          Starland Attendance Automation Cron
          Receipt Coverage Report
        </h1>

        <p className="mt-2 text-sm">
          Range: {data.range.dateFromLabel} to{" "}
          {data.range.dateToLabel}
        </p>

        <p className="mt-1 text-sm">
          Generated: {data.generatedAt}
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="starland-card p-4">
          <History
            className="h-7 w-7 text-[var(--starland-info)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Total Days
          </p>

          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {data.summary.totalDays}
          </p>
        </article>

        <article className="starland-card p-4">
          <CheckCircle2
            className="h-7 w-7 text-[var(--starland-success)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Healthy Days
          </p>

          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {data.summary.healthyDays}
          </p>
        </article>

        <article className="starland-card p-4">
          <TriangleAlert
            className="h-7 w-7 text-[var(--starland-warning)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Warning Days
          </p>

          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {data.summary.warningDays}
          </p>
        </article>

        <article className="starland-card p-4">
          <CircleAlert
            className="h-7 w-7 text-[var(--starland-danger)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Critical Days
          </p>

          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {data.summary.criticalDays}
          </p>
        </article>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="starland-card p-4">
          <Gauge
            className="h-7 w-7 text-[var(--starland-main-green)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Automation Coverage
          </p>

          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {
              data.summary
                .automationCoverageRate
            }
            %
          </p>

          <p className="mt-2 text-xs text-[var(--starland-muted-text)]">
            {
              data.summary
                .automationReceiptDays
            }{" "}
            of {data.summary.totalDays} days
          </p>
        </article>

        <article className="starland-card p-4">
          <Gauge
            className="h-7 w-7 text-[var(--starland-main-green)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Health Coverage
          </p>

          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {
              data.summary
                .healthCoverageRate
            }
            %
          </p>

          <p className="mt-2 text-xs text-[var(--starland-muted-text)]">
            {
              data.summary
                .healthReceiptDays
            }{" "}
            of {data.summary.totalDays} days
          </p>
        </article>

        <article className="starland-card p-4">
          <Activity
            className="h-7 w-7 text-[var(--starland-info)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Automation Success
          </p>

          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {
              data.summary
                .automationSuccessRate
            }
            %
          </p>
        </article>

        <article className="starland-card p-4">
          <Activity
            className="h-7 w-7 text-[var(--starland-info)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Health Success
          </p>

          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {
              data.summary
                .healthSuccessRate
            }
            %
          </p>
        </article>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <article className="starland-card p-4">
          <Clock3
            className="h-7 w-7 text-[var(--starland-info)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Average Automation Duration
          </p>

          <p className="mt-1 text-2xl font-extrabold text-[var(--starland-dark-text)]">
            {formatAverageDuration(
              data.summary
                .averageAutomationDurationMs,
            )}
          </p>
        </article>

        <article className="starland-card p-4">
          <Clock3
            className="h-7 w-7 text-[var(--starland-success)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Average Health Duration
          </p>

          <p className="mt-1 text-2xl font-extrabold text-[var(--starland-dark-text)]">
            {formatAverageDuration(
              data.summary
                .averageHealthDurationMs,
            )}
          </p>
        </article>
      </section>

      <section className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm font-semibold leading-6 text-blue-800">
        <p>
          Automation schedule:{" "}
          <strong>
            {data.schedule.automationTimeLabel}
          </strong>
          . Health schedule:{" "}
          <strong>
            {data.schedule.healthTimeLabel}
          </strong>
          . A receipt is considered on time when it
          starts within{" "}
          {data.schedule.onTimeToleranceMinutes}{" "}
          minutes before or after its expected time.
        </p>

        <p className="mt-2">
          Monitoring is currently{" "}
          <strong>
            {data.monitoring.enabled
              ? "enabled"
              : "disabled"}
          </strong>
          . Historical reporting remains available
          in both states.
        </p>
      </section>

      <section className="starland-card overflow-hidden">
        <div className="border-b border-[var(--starland-border)] px-5 py-4">
          <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
            Daily Receipt Coverage
          </h2>

          <p className="mt-1 text-sm leading-6 text-[var(--starland-muted-text)]">
            V2 Hostinger cron receipts from{" "}
            {data.range.dateFromLabel} through{" "}
            {data.range.dateToLabel}.
          </p>
        </div>

        <div className="starland-scroll-x">
          <table className="starland-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Daily State</th>
                <th>Automation Receipt</th>
                <th>Health Receipt</th>
              </tr>
            </thead>

            <tbody>
              {data.rows.map((row) => (
                <tr key={row.date}>
                  <td>
                    <div className="min-w-44">
                      <p className="font-extrabold text-[var(--starland-dark-text)]">
                        {row.date}
                      </p>

                      <p className="mt-1 text-xs text-[var(--starland-muted-text)]">
                        {row.dateLabel}
                      </p>
                    </div>
                  </td>

                  <td>
                    <span
                      className={[
                        "starland-badge",
                        stateBadgeClass(
                          row.state,
                        ),
                      ].join(" ")}
                    >
                      {row.state}
                    </span>
                  </td>

                  <td>
                    <TaskResultCell
                      result={
                        row.automation
                      }
                    />
                  </td>

                  <td>
                    <TaskResultCell
                      result={row.health}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {data.metadata.isPartial ? (
          <div className="border-t border-amber-200 bg-amber-50 px-5 py-4 text-sm font-semibold text-amber-800">
            This range contains more than{" "}
            {
              data.metadata
                .maximumScannedReceipts
            }{" "}
            V2 receipt records. Reduce the report
            range for complete results.
          </div>
        ) : null}
      </section>
    </div>
  );
}