import {
  Activity,
  CalendarCheck,
  CheckCircle2,
  CircleAlert,
  CloudCog,
  KeyRound,
  LayoutDashboard,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  TimerOff,
  TriangleAlert,
} from "lucide-react";
import type {
  AttendanceAutomationHealthData,
  AttendanceAutomationHealthStatus,
} from "../types/attendance-automation-health-types";

type AttendanceAutomationHealthSummaryProps = {
  data: AttendanceAutomationHealthData;
};

function statusContainerClass(
  status: AttendanceAutomationHealthStatus,
): string {
  switch (status) {
    case "HEALTHY":
      return "border-green-200 bg-green-50 text-green-800";

    case "DEGRADED":
      return "border-red-200 bg-red-50 text-red-800";

    case "STALE":
      return "border-amber-200 bg-amber-50 text-amber-800";

    case "NO_RUNS":
      return "border-blue-200 bg-blue-50 text-blue-800";

    case "NOT_CONFIGURED":
      return "border-red-200 bg-red-50 text-red-800";
  }
}

function statusIcon(
  status: AttendanceAutomationHealthStatus,
) {
  switch (status) {
    case "HEALTHY":
      return CheckCircle2;

    case "DEGRADED":
      return ShieldAlert;

    case "STALE":
      return TimerOff;

    case "NO_RUNS":
      return CircleAlert;

    case "NOT_CONFIGURED":
      return KeyRound;
  }
}

export function AttendanceAutomationHealthSummary({
  data,
}: AttendanceAutomationHealthSummaryProps) {
  const StatusIcon =
    statusIcon(data.status);

  return (
    <div className="space-y-5">
      <section
        className={[
          "rounded-2xl border p-5",
          statusContainerClass(
            data.status,
          ),
        ].join(" ")}
      >
        <div className="flex items-start gap-3">
          <StatusIcon
            className="mt-0.5 h-7 w-7 shrink-0"
            aria-hidden="true"
          />

          <div>
            <p className="text-xs font-extrabold uppercase tracking-wide">
              Automation Health
            </p>

            <h2 className="mt-1 text-xl font-extrabold">
              {data.statusLabel}
            </h2>

            <p className="mt-2 max-w-4xl text-sm font-semibold leading-6">
              {data.statusDescription}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="starland-card p-4">
          <Activity className="h-7 w-7 text-[var(--starland-info)]" />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Runs in 30 Days
          </p>

          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {data.summary.totalRuns}
          </p>
        </article>

        <article className="starland-card p-4">
          <CheckCircle2 className="h-7 w-7 text-[var(--starland-success)]" />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Completed Runs
          </p>

          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {
              data.summary
                .completedRuns
            }
          </p>
        </article>

        <article className="starland-card p-4">
          <TriangleAlert className="h-7 w-7 text-[var(--starland-danger)]" />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Failed Runs
          </p>

          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {data.summary.failedRuns}
          </p>
        </article>

        <article className="starland-card p-4">
          <RefreshCw className="h-7 w-7 text-[var(--starland-main-green)]" />

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
          <CalendarCheck className="h-7 w-7 text-[var(--starland-success)]" />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            EXCUSED Generated
          </p>

          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {
              data.summary
                .generatedRecords
            }
          </p>
        </article>

        <article className="starland-card p-4">
          <CloudCog className="h-7 w-7 text-[var(--starland-info)]" />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            API / System Runs
          </p>

          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {data.summary.apiRuns}
          </p>
        </article>

        <article className="starland-card p-4">
          <LayoutDashboard className="h-7 w-7 text-[var(--starland-main-green)]" />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Dashboard Runs
          </p>

          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {
              data.summary
                .dashboardRuns
            }
          </p>
        </article>

        <article className="starland-card p-4">
          <RotateCcw className="h-7 w-7 text-[var(--starland-warning)]" />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Retry Runs
          </p>

          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {data.summary.retries}
          </p>
        </article>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="starland-card p-4">
          <Activity className="h-7 w-7 text-[var(--starland-info)]" />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Runs Today
          </p>

          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {data.summary.runsToday}
          </p>
        </article>

        <article className="starland-card p-4">
          <ShieldAlert className="h-7 w-7 text-[var(--starland-danger)]" />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Failures in 24 Hours
          </p>

          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {
              data.summary
                .failuresLast24Hours
            }
          </p>
        </article>

        <article className="starland-card p-4">
          <CircleAlert className="h-7 w-7 text-[var(--starland-warning)]" />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Unknown Status
          </p>

          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {
              data.summary
                .unknownRuns
            }
          </p>
        </article>

        <article className="starland-card p-4">
          <KeyRound
            className={[
              "h-7 w-7",
              data.secretConfigured
                ? "text-[var(--starland-success)]"
                : "text-[var(--starland-danger)]",
            ].join(" ")}
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Endpoint Secret
          </p>

          <p className="mt-1 text-xl font-extrabold text-[var(--starland-dark-text)]">
            {data.secretConfigured
              ? "Configured"
              : "Missing"}
          </p>
        </article>
      </section>
    </div>
  );
}