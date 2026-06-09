import {
  Activity,
  CalendarClock,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Flame,
  Gauge,
  PauseCircle,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import type {
  AttendanceAutomationCronReliabilityData,
  AttendanceAutomationCronReliabilityDayState,
  AttendanceAutomationCronReliabilityStatus,
  AttendanceAutomationCronReliabilityTaskState,
  AttendanceAutomationCronReliabilityWindow,
} from "../types/attendance-automation-cron-reliability-types";

type AttendanceAutomationCronReliabilityDashboardProps = {
  data:
    AttendanceAutomationCronReliabilityData;
};

function statusContainerClass(
  status:
    AttendanceAutomationCronReliabilityStatus,
): string {
  switch (status) {
    case "HEALTHY":
      return "border-green-200 bg-green-50 text-green-800";

    case "AT_RISK":
      return "border-amber-200 bg-amber-50 text-amber-800";

    case "BREACHED":
      return "border-red-200 bg-red-50 text-red-800";

    case "WARMING_UP":
      return "border-blue-200 bg-blue-50 text-blue-800";

    case "DISABLED":
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

function ReliabilityStatusIcon({
  status,
  className,
}: {
  status:
    AttendanceAutomationCronReliabilityStatus;

  className: string;
}) {
  switch (status) {
    case "HEALTHY":
      return (
        <CheckCircle2
          className={className}
          aria-hidden="true"
        />
      );

    case "AT_RISK":
      return (
        <TriangleAlert
          className={className}
          aria-hidden="true"
        />
      );

    case "BREACHED":
      return (
        <CircleAlert
          className={className}
          aria-hidden="true"
        />
      );

    case "WARMING_UP":
      return (
        <Clock3
          className={className}
          aria-hidden="true"
        />
      );

    case "DISABLED":
      return (
        <PauseCircle
          className={className}
          aria-hidden="true"
        />
      );
  }
}

function dayBadgeClass(
  state:
    AttendanceAutomationCronReliabilityDayState,
): string {
  switch (state) {
    case "HEALTHY":
      return "starland-badge-success";

    case "WARNING":
      return "starland-badge-warning";

    case "CRITICAL":
      return "starland-badge-danger";

    case "PENDING":
      return "starland-badge-info";

    case "NOT_MONITORED":
      return "bg-slate-100 text-slate-700";
  }
}

function taskBadgeClass(
  state:
    AttendanceAutomationCronReliabilityTaskState,
): string {
  switch (state) {
    case "HEALTHY":
      return "starland-badge-success";

    case "WARNING":
      return "starland-badge-warning";

    case "CRITICAL":
      return "starland-badge-danger";

    case "PENDING":
      return "starland-badge-info";
  }
}

function ReliabilityWindowCard({
  window,
  targetPercent,
}: {
  window:
    AttendanceAutomationCronReliabilityWindow;

  targetPercent: number;
}) {
  return (
    <article className="starland-card overflow-hidden">
      <div className="border-b border-[var(--starland-border)] px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[var(--starland-muted-text)]">
              Reliability Window
            </p>

            <h2 className="mt-1 text-lg font-extrabold text-[var(--starland-dark-text)]">
              {window.label}
            </h2>
          </div>

          <span
            className={[
              "rounded-full border px-3 py-1 text-xs font-extrabold",
              statusContainerClass(
                window.status,
              ),
            ].join(" ")}
          >
            {window.status}
          </span>
        </div>
      </div>

      <div className="space-y-4 p-5">
        <div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm font-bold text-[var(--starland-muted-text)]">
              Healthy-day rate
            </span>

            <strong className="text-lg text-[var(--starland-dark-text)]">
              {window.healthyDayRate}%
            </strong>
          </div>

          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-[var(--starland-main-green)]"
              style={{
                width:
                  `${Math.min(window.healthyDayRate, 100)}%`,
              }}
            />
          </div>

          <p className="mt-2 text-xs font-semibold text-[var(--starland-muted-text)]">
            Target: {targetPercent}%
          </p>
        </div>

        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-3">
            <dt className="font-bold text-[var(--starland-muted-text)]">
              Due days
            </dt>

            <dd className="mt-1 text-xl font-extrabold text-[var(--starland-dark-text)]">
              {window.dueDays}
            </dd>
          </div>

          <div className="rounded-xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-3">
            <dt className="font-bold text-[var(--starland-muted-text)]">
              Pending
            </dt>

            <dd className="mt-1 text-xl font-extrabold text-[var(--starland-dark-text)]">
              {window.pendingDays}
            </dd>
          </div>

          <div className="rounded-xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-3">
            <dt className="font-bold text-[var(--starland-muted-text)]">
              Automation coverage
            </dt>

            <dd className="mt-1 text-lg font-extrabold text-[var(--starland-dark-text)]">
              {window.automationCoverageRate}%
            </dd>
          </div>

          <div className="rounded-xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-3">
            <dt className="font-bold text-[var(--starland-muted-text)]">
              Health coverage
            </dt>

            <dd className="mt-1 text-lg font-extrabold text-[var(--starland-dark-text)]">
              {window.healthCoverageRate}%
            </dd>
          </div>

          <div className="rounded-xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-3">
            <dt className="font-bold text-[var(--starland-muted-text)]">
              Automation on time
            </dt>

            <dd className="mt-1 text-lg font-extrabold text-[var(--starland-dark-text)]">
              {window.automationOnTimeRate}%
            </dd>
          </div>

          <div className="rounded-xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-3">
            <dt className="font-bold text-[var(--starland-muted-text)]">
              Health on time
            </dt>

            <dd className="mt-1 text-lg font-extrabold text-[var(--starland-dark-text)]">
              {window.healthOnTimeRate}%
            </dd>
          </div>
        </dl>

        <div className="flex flex-wrap gap-2">
          <span className="starland-badge starland-badge-success">
            {window.healthyDays} healthy
          </span>

          <span className="starland-badge starland-badge-warning">
            {window.warningDays} warning
          </span>

          <span className="starland-badge starland-badge-danger">
            {window.criticalDays} critical
          </span>
        </div>
      </div>
    </article>
  );
}

export function AttendanceAutomationCronReliabilityDashboard({
  data,
}: AttendanceAutomationCronReliabilityDashboardProps) {
  return (
    <div className="space-y-5">
      <section
        className={[
          "rounded-2xl border p-5",
          statusContainerClass(
            data.overallStatus,
          ),
        ].join(" ")}
      >
        <div className="flex items-start gap-3">
          <ReliabilityStatusIcon
            status={data.overallStatus}
            className="h-8 w-8 shrink-0"
          />

          <div>
            <p className="text-xs font-extrabold uppercase tracking-wide">
              Hostinger Cron Reliability
            </p>

            <h2 className="mt-1 text-xl font-extrabold">
              {data.overallLabel}
            </h2>

            <p className="mt-2 max-w-4xl text-sm font-semibold leading-6">
              {data.overallDescription}
            </p>

            <p className="mt-3 text-xs font-bold">
              Evaluated: {data.generatedAt}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="starland-card p-4">
          <ShieldCheck
            className="h-7 w-7 text-[var(--starland-main-green)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            SLO Target
          </p>

          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {data.configuration.targetPercent}%
          </p>
        </article>

        <article className="starland-card p-4">
          <CalendarClock
            className="h-7 w-7 text-[var(--starland-info)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Effective Start
          </p>

          <p className="mt-1 text-xl font-extrabold text-[var(--starland-dark-text)]">
            {
              data.configuration
                .effectiveMonitoringStartedOn
            }
          </p>

          <p className="mt-2 text-xs font-semibold text-[var(--starland-muted-text)]">
            {
              data.configuration
                .effectiveMonitoringStartedOnSource
            }
          </p>
        </article>

        <article className="starland-card p-4">
          <Flame
            className="h-7 w-7 text-[var(--starland-warning)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Current Healthy Streak
          </p>

          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {
              data.streaks
                .currentHealthyStreak
            }
          </p>
        </article>

        <article className="starland-card p-4">
          <Gauge
            className="h-7 w-7 text-[var(--starland-info)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Longest Healthy Streak
          </p>

          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {
              data.streaks
                .longestHealthyStreak
            }
          </p>
        </article>
      </section>

      <section className="grid gap-5 xl:grid-cols-3">
        <ReliabilityWindowCard
          window={
            data.windows.last7Days
          }
          targetPercent={
            data.configuration
              .targetPercent
          }
        />

        <ReliabilityWindowCard
          window={
            data.windows.last30Days
          }
          targetPercent={
            data.configuration
              .targetPercent
          }
        />

        <ReliabilityWindowCard
          window={
            data.windows.last90Days
          }
          targetPercent={
            data.configuration
              .targetPercent
          }
        />
      </section>

      {data.issues.length > 0 ? (
        <section className="space-y-3">
          {data.issues.map((issue) => (
            <article
              key={issue}
              className="rounded-2xl border border-amber-200 bg-amber-50 p-4"
            >
              <div className="flex items-start gap-3">
                <TriangleAlert
                  className="mt-0.5 h-5 w-5 shrink-0 text-amber-700"
                  aria-hidden="true"
                />

                <p className="text-sm font-semibold leading-6 text-amber-800">
                  {issue}
                </p>
              </div>
            </article>
          ))}
        </section>
      ) : null}

      <section className="starland-card overflow-hidden">
        <div className="border-b border-[var(--starland-border)] px-5 py-4">
          <div className="flex items-center gap-2">
            <Activity
              className="h-5 w-5 text-[var(--starland-info)]"
              aria-hidden="true"
            />

            <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
              Recent Reliability Days
            </h2>
          </div>

          <p className="mt-1 text-sm leading-6 text-[var(--starland-muted-text)]">
            Pending days are excluded from reliability
            rates until the expected cron execution
            time and tolerance have passed.
          </p>
        </div>

        <div className="starland-scroll-x">
          <table className="starland-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Day State</th>
                <th>Automation</th>
                <th>Health</th>
                <th>Automation Receipt</th>
                <th>Health Receipt</th>
              </tr>
            </thead>

            <tbody>
              {data.recentDays.map((day) => (
                <tr key={day.date}>
                  <td>
                    <p className="font-extrabold text-[var(--starland-dark-text)]">
                      {day.date}
                    </p>

                    <p className="mt-1 text-xs text-[var(--starland-muted-text)]">
                      {day.dateLabel}
                    </p>
                  </td>

                  <td>
                    <span
                      className={[
                        "starland-badge",
                        dayBadgeClass(
                          day.state,
                        ),
                      ].join(" ")}
                    >
                      {day.state}
                    </span>
                  </td>

                  <td>
                    <span
                      className={[
                        "starland-badge",
                        taskBadgeClass(
                          day.automationState,
                        ),
                      ].join(" ")}
                    >
                      {day.automationState}
                    </span>

                    <p className="mt-2 min-w-44 text-xs text-[var(--starland-muted-text)]">
                      Due:{" "}
                      {day.automationExpectedAt}
                    </p>
                  </td>

                  <td>
                    <span
                      className={[
                        "starland-badge",
                        taskBadgeClass(
                          day.healthState,
                        ),
                      ].join(" ")}
                    >
                      {day.healthState}
                    </span>

                    <p className="mt-2 min-w-44 text-xs text-[var(--starland-muted-text)]">
                      Due:{" "}
                      {day.healthExpectedAt}
                    </p>
                  </td>

                  <td>
                    {day.automationReceiptId !==
                    null ? (
                      <>
                        <strong>
                          #
                          {
                            day.automationReceiptId
                          }
                        </strong>

                        <p className="mt-1 text-xs text-[var(--starland-muted-text)]">
                          {
                            day.automationOutcome
                          }
                        </p>
                      </>
                    ) : (
                      "—"
                    )}
                  </td>

                  <td>
                    {day.healthReceiptId !==
                    null ? (
                      <>
                        <strong>
                          #
                          {
                            day.healthReceiptId
                          }
                        </strong>

                        <p className="mt-1 text-xs text-[var(--starland-muted-text)]">
                          {
                            day.healthOutcome
                          }
                        </p>
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}