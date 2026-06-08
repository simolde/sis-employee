import Link from "next/link";
import {
  Activity,
  AlertCircle,
  ArrowUpRight,
  BellRing,
  CalendarClock,
  CheckCircle2,
  CircleAlert,
  CloudCog,
  Gauge,
  History,
  Info,
  KeyRound,
  LockKeyhole,
  Play,
  Settings2,
  TriangleAlert,
} from "lucide-react";
import type {
  AttendanceAutomationAlertItem,
  AttendanceAutomationAlertOverallStatus,
  AttendanceAutomationAlertSeverity,
} from "../../alerts/types/attendance-automation-alert-types";
import type { AttendanceAutomationOverviewData } from "../types/attendance-automation-overview-types";

type AttendanceAutomationOverviewProps = {
  data: AttendanceAutomationOverviewData;
};

function overallContainerClass(
  status: AttendanceAutomationAlertOverallStatus,
): string {
  switch (status) {
    case "HEALTHY":
      return "border-green-200 bg-green-50 text-green-800";

    case "ATTENTION":
      return "border-amber-200 bg-amber-50 text-amber-800";

    case "CRITICAL":
      return "border-red-200 bg-red-50 text-red-800";
  }
}

function OverallStatusIcon({
  status,
}: {
  status: AttendanceAutomationAlertOverallStatus;
}) {
  const className =
    "h-8 w-8 shrink-0";

  switch (status) {
    case "HEALTHY":
      return (
        <CheckCircle2
          className={className}
          aria-hidden="true"
        />
      );

    case "ATTENTION":
      return (
        <TriangleAlert
          className={className}
          aria-hidden="true"
        />
      );

    case "CRITICAL":
      return (
        <AlertCircle
          className={className}
          aria-hidden="true"
        />
      );
  }
}

function alertContainerClass(
  severity: AttendanceAutomationAlertSeverity,
): string {
  switch (severity) {
    case "CRITICAL":
      return "border-red-200 bg-red-50";

    case "WARNING":
      return "border-amber-200 bg-amber-50";

    case "INFO":
      return "border-blue-200 bg-blue-50";
  }
}

function alertTextClass(
  severity: AttendanceAutomationAlertSeverity,
): string {
  switch (severity) {
    case "CRITICAL":
      return "text-red-800";

    case "WARNING":
      return "text-amber-800";

    case "INFO":
      return "text-blue-800";
  }
}

function AlertItemIcon({
  severity,
}: {
  severity: AttendanceAutomationAlertSeverity;
}) {
  const className =
    "mt-0.5 h-5 w-5 shrink-0";

  switch (severity) {
    case "CRITICAL":
      return (
        <AlertCircle
          className={`${className} text-red-700`}
          aria-hidden="true"
        />
      );

    case "WARNING":
      return (
        <TriangleAlert
          className={`${className} text-amber-700`}
          aria-hidden="true"
        />
      );

    case "INFO":
      return (
        <Info
          className={`${className} text-blue-700`}
          aria-hidden="true"
        />
      );
  }
}

function OverviewAlertCard({
  alert,
}: {
  alert: AttendanceAutomationAlertItem;
}) {
  return (
    <article
      className={[
        "rounded-2xl border p-4",
        alertContainerClass(
          alert.severity,
        ),
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <AlertItemIcon
          severity={alert.severity}
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between">
            <h3
              className={[
                "font-extrabold",
                alertTextClass(
                  alert.severity,
                ),
              ].join(" ")}
            >
              {alert.title}
            </h3>

            <span
              className={[
                "text-xs font-extrabold uppercase tracking-wide",
                alertTextClass(
                  alert.severity,
                ),
              ].join(" ")}
            >
              {alert.severity}
            </span>
          </div>

          <p
            className={[
              "mt-2 text-sm font-semibold leading-6",
              alertTextClass(
                alert.severity,
              ),
            ].join(" ")}
          >
            {alert.message}
          </p>

          {alert.action ? (
            <Link
              href={alert.action.href}
              className="starland-btn starland-btn-soft starland-btn-sm mt-4"
            >
              {alert.action.label}

              <ArrowUpRight
                className="h-4 w-4"
                aria-hidden="true"
              />
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function SignalCard({
  icon,
  label,
  value,
  description,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  description: string;
}) {
  return (
    <article className="starland-card p-4">
      {icon}

      <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
        {label}
      </p>

      <p className="mt-1 break-words text-xl font-extrabold text-[var(--starland-dark-text)]">
        {value}
      </p>

      <p className="mt-2 text-xs font-semibold leading-5 text-[var(--starland-muted-text)]">
        {description}
      </p>
    </article>
  );
}

export function AttendanceAutomationOverview({
  data,
}: AttendanceAutomationOverviewProps) {
  return (
    <div className="space-y-5">
      <section
        className={[
          "rounded-2xl border p-5",
          overallContainerClass(
            data.overallStatus,
          ),
        ].join(" ")}
      >
        <div className="flex items-start gap-3">
          <OverallStatusIcon
            status={data.overallStatus}
          />

          <div>
            <p className="text-xs font-extrabold uppercase tracking-wide">
              Automation Operations Status
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
        <SignalCard
          icon={
            <Activity
              className="h-7 w-7 text-[var(--starland-info)]"
              aria-hidden="true"
            />
          }
          label="Health Status"
          value={data.healthStatus}
          description="Overall automation health based on configuration, history, and scheduler compliance."
        />

        <SignalCard
          icon={
            <CalendarClock
              className="h-7 w-7 text-[var(--starland-warning)]"
              aria-hidden="true"
            />
          }
          label="Scheduler Status"
          value={data.scheduleStatus}
          description="Only protected API/system runs satisfy the daily scheduler requirement."
        />

        <SignalCard
          icon={
            <LockKeyhole
              className="h-7 w-7 text-[var(--starland-main-green)]"
              aria-hidden="true"
            />
          }
          label="Execution Lock"
          value={data.lockStatus}
          description="Prevents dashboard, API, and retry automation from executing simultaneously."
        />

        <SignalCard
          icon={
            <KeyRound
              className={[
                "h-7 w-7",
                data.secretConfigured
                  ? "text-[var(--starland-success)]"
                  : "text-[var(--starland-danger)]",
              ].join(" ")}
              aria-hidden="true"
            />
          }
          label="Protected Endpoint"
          value={
            data.secretConfigured
              ? "CONFIGURED"
              : "MISSING"
          }
          description="The automation secret protects scheduler, health, and alert endpoints."
        />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SignalCard
          icon={
            <BellRing
              className="h-7 w-7 text-[var(--starland-danger)]"
              aria-hidden="true"
            />
          }
          label="Active Alerts"
          value={data.summary.totalAlerts}
          description={`${data.summary.criticalAlerts} critical, ${data.summary.warningAlerts} warning, and ${data.summary.informationalAlerts} informational.`}
        />

        <SignalCard
          icon={
            <Gauge
              className="h-7 w-7 text-[var(--starland-main-green)]"
              aria-hidden="true"
            />
          }
          label="Success Rate"
          value={`${data.summary.successRate}%`}
          description="Calculated from known completed and failed automation executions."
        />

        <SignalCard
          icon={
            <CloudCog
              className="h-7 w-7 text-[var(--starland-info)]"
              aria-hidden="true"
            />
          }
          label="Recorded Runs"
          value={data.summary.totalRuns}
          description="Approved-leave automation executions within the current monitoring window."
        />

        <SignalCard
          icon={
            <TriangleAlert
              className="h-7 w-7 text-[var(--starland-danger)]"
              aria-hidden="true"
            />
          }
          label="Failures in 24 Hours"
          value={
            data.summary
              .failuresLast24Hours
          }
          description="Recent failed runs requiring investigation or a controlled retry."
        />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Link
          href="/dashboard/attendance/automation/approved-leave-excused"
          className="starland-card block p-5 transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <Play
            className="h-7 w-7 text-[var(--starland-success)]"
            aria-hidden="true"
          />

          <h2 className="mt-3 font-extrabold text-[var(--starland-dark-text)]">
            Run Automation
          </h2>

          <p className="mt-1 text-sm leading-6 text-[var(--starland-muted-text)]">
            Preview and generate missing EXCUSED
            attendance from approved leaves.
          </p>
        </Link>

        <Link
          href="/dashboard/attendance/automation/alerts"
          className="starland-card block p-5 transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <BellRing
            className="h-7 w-7 text-[var(--starland-warning)]"
            aria-hidden="true"
          />

          <h2 className="mt-3 font-extrabold text-[var(--starland-dark-text)]">
            Alert Center
          </h2>

          <p className="mt-1 text-sm leading-6 text-[var(--starland-muted-text)]">
            Review critical, warning, and
            informational automation conditions.
          </p>
        </Link>

        <Link
          href="/dashboard/attendance/automation/health"
          className="starland-card block p-5 transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <Activity
            className="h-7 w-7 text-[var(--starland-info)]"
            aria-hidden="true"
          />

          <h2 className="mt-3 font-extrabold text-[var(--starland-dark-text)]">
            Health Monitoring
          </h2>

          <p className="mt-1 text-sm leading-6 text-[var(--starland-muted-text)]">
            Inspect schedule compliance, endpoint
            health, and the execution lock.
          </p>
        </Link>

        <Link
          href="/dashboard/attendance/automation/configuration"
          className="starland-card block p-5 transition hover:-translate-y-0.5 hover:shadow-md"
        >
          <Settings2
            className="h-7 w-7 text-[var(--starland-main-green)]"
            aria-hidden="true"
          />

          <h2 className="mt-3 font-extrabold text-[var(--starland-dark-text)]">
            Configuration
          </h2>

          <p className="mt-1 text-sm leading-6 text-[var(--starland-muted-text)]">
            Verify protected endpoints, scheduler
            timing, and lock settings.
          </p>
        </Link>
      </section>

      <section className="starland-card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-[var(--starland-border)] px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
              Highest-Priority Alerts
            </h2>

            <p className="mt-1 text-sm leading-6 text-[var(--starland-muted-text)]">
              Critical conditions appear first,
              followed by warnings and informational
              notices.
            </p>
          </div>

          <Link
            href="/dashboard/attendance/automation/alerts"
            className="starland-btn starland-btn-soft starland-btn-sm"
          >
            View All Alerts

            <ArrowUpRight
              className="h-4 w-4"
              aria-hidden="true"
            />
          </Link>
        </div>

        <div className="space-y-4 p-5">
          {data.topAlerts.length > 0 ? (
            data.topAlerts.map((alert) => (
              <OverviewAlertCard
                key={alert.code}
                alert={alert}
              />
            ))
          ) : (
            <div className="rounded-2xl border border-green-200 bg-green-50 p-6 text-center">
              <CheckCircle2
                className="mx-auto h-9 w-9 text-green-700"
                aria-hidden="true"
              />

              <h3 className="mt-3 text-lg font-extrabold text-green-800">
                No active automation alerts
              </h3>

              <p className="mx-auto mt-2 max-w-xl text-sm font-semibold leading-6 text-green-700">
                Current configuration, scheduler,
                run history, health, and execution
                lock checks have no active warning or
                critical conditions.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <article className="starland-card p-5">
          <History
            className="h-7 w-7 text-[var(--starland-info)]"
            aria-hidden="true"
          />

          <h2 className="mt-3 text-lg font-extrabold text-[var(--starland-dark-text)]">
            Latest Automation Run
          </h2>

          {data.latestRunId ? (
            <>
              <p className="mt-2 text-2xl font-extrabold text-[var(--starland-dark-text)]">
                Run #{data.latestRunId}
              </p>

              <Link
                href={`/dashboard/attendance/automation/approved-leave-excused/history/${data.latestRunId}`}
                className="starland-btn starland-btn-soft starland-btn-sm mt-4"
              >
                Open Latest Run

                <ArrowUpRight
                  className="h-4 w-4"
                  aria-hidden="true"
                />
              </Link>
            </>
          ) : (
            <p className="mt-2 text-sm font-semibold text-[var(--starland-muted-text)]">
              No automation run is currently
              recorded.
            </p>
          )}
        </article>

        <article className="starland-card p-5">
          <CircleAlert
            className="h-7 w-7 text-[var(--starland-danger)]"
            aria-hidden="true"
          />

          <h2 className="mt-3 text-lg font-extrabold text-[var(--starland-dark-text)]">
            Latest Failed Run
          </h2>

          {data.latestFailedRunId ? (
            <>
              <p className="mt-2 text-2xl font-extrabold text-[var(--starland-dark-text)]">
                Run #{data.latestFailedRunId}
              </p>

              <Link
                href={`/dashboard/attendance/automation/approved-leave-excused/history/${data.latestFailedRunId}`}
                className="starland-btn starland-btn-danger starland-btn-sm mt-4"
              >
                Review Failure

                <ArrowUpRight
                  className="h-4 w-4"
                  aria-hidden="true"
                />
              </Link>
            </>
          ) : (
            <p className="mt-2 text-sm font-semibold text-[var(--starland-muted-text)]">
              No failed automation run exists in the
              current monitoring window.
            </p>
          )}
        </article>
      </section>
    </div>
  );
}