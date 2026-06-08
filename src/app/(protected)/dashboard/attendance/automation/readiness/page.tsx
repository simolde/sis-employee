import Link from "next/link";
import type { ReactNode } from "react";
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  CircleAlert,
  ClipboardCheck,
  Clock3,
  Database,
  KeyRound,
  LockKeyhole,
  Network,
  RefreshCw,
  ServerCog,
  TriangleAlert,
} from "lucide-react";
import { requireCanManageEmployees } from "@/features/auth/server/permission-guards";
import { getAttendanceAutomationReadinessData } from "@/features/attendance/automation/readiness/server/attendance-automation-readiness";
import type {
  AttendanceAutomationReadinessCheck,
  AttendanceAutomationReadinessCheckStatus,
  AttendanceAutomationReadinessStatus,
} from "@/features/attendance/automation/readiness/types/attendance-automation-readiness-types";

export const dynamic = "force-dynamic";

function overallContainerClass(
  status:
    AttendanceAutomationReadinessStatus,
): string {
  switch (status) {
    case "READY":
      return "border-green-200 bg-green-50 text-green-800";

    case "READY_WITH_WARNINGS":
      return "border-amber-200 bg-amber-50 text-amber-800";

    case "BLOCKED":
      return "border-red-200 bg-red-50 text-red-800";
  }
}

function checkContainerClass(
  status:
    AttendanceAutomationReadinessCheckStatus,
): string {
  switch (status) {
    case "PASS":
      return "border-green-200 bg-green-50";

    case "WARNING":
      return "border-amber-200 bg-amber-50";

    case "FAIL":
      return "border-red-200 bg-red-50";
  }
}

function checkTextClass(
  status:
    AttendanceAutomationReadinessCheckStatus,
): string {
  switch (status) {
    case "PASS":
      return "text-green-800";

    case "WARNING":
      return "text-amber-800";

    case "FAIL":
      return "text-red-800";
  }
}

function StatusIcon({
  status,
  className,
}: {
  status:
    AttendanceAutomationReadinessCheckStatus;

  className: string;
}) {
  switch (status) {
    case "PASS":
      return (
        <CheckCircle2
          className={`${className} text-green-700`}
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

    case "FAIL":
      return (
        <CircleAlert
          className={`${className} text-red-700`}
          aria-hidden="true"
        />
      );
  }
}

function ReadinessCheckCard({
  check,
}: {
  check:
    AttendanceAutomationReadinessCheck;
}) {
  return (
    <article
      className={[
        "rounded-2xl border p-5",
        checkContainerClass(
          check.status,
        ),
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        <StatusIcon
          status={check.status}
          className="mt-0.5 h-6 w-6 shrink-0"
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <span
                className={[
                  "text-xs font-extrabold uppercase tracking-wide",
                  checkTextClass(
                    check.status,
                  ),
                ].join(" ")}
              >
                {check.status}
              </span>

              <h3
                className={[
                  "mt-1 text-lg font-extrabold",
                  checkTextClass(
                    check.status,
                  ),
                ].join(" ")}
              >
                {check.title}
              </h3>
            </div>

            <code
              className={[
                "break-all text-xs font-bold",
                checkTextClass(
                  check.status,
                ),
              ].join(" ")}
            >
              {check.code}
            </code>
          </div>

          <p
            className={[
              "mt-3 text-sm font-semibold leading-6",
              checkTextClass(
                check.status,
              ),
            ].join(" ")}
          >
            {check.message}
          </p>

          {check.details.length > 0 ? (
            <ul
              className={[
                "mt-4 space-y-2 text-sm font-semibold",
                checkTextClass(
                  check.status,
                ),
              ].join(" ")}
            >
              {check.details.map(
                (detail) => (
                  <li
                    key={detail}
                    className="flex items-start gap-2"
                  >
                    <span
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-current"
                      aria-hidden="true"
                    />

                    <span>{detail}</span>
                  </li>
                ),
              )}
            </ul>
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
  icon: ReactNode;
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

export default async function AttendanceAutomationReadinessPage() {
  await requireCanManageEmployees();

  const data =
    await getAttendanceAutomationReadinessData();

  return (
    <section className="starland-page space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="starland-badge starland-badge-info">
            Deployment Preflight
          </span>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
            Automation Production Readiness
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            Validate the environment, scheduler,
            database lock, queue strategy, health,
            and protected endpoints before enabling
            production attendance automation.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/attendance/automation/readiness"
            className="starland-btn starland-btn-primary"
          >
            <RefreshCw
              className="h-4 w-4"
              aria-hidden="true"
            />

            Run Preflight Again
          </Link>

          <Link
            href="/dashboard/attendance/automation/diagnostics"
            className="starland-btn starland-btn-soft"
          >
            <Database
              className="h-4 w-4"
              aria-hidden="true"
            />

            Lock Diagnostics
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

      <section
        className={[
          "rounded-2xl border p-5",
          overallContainerClass(
            data.overallStatus,
          ),
        ].join(" ")}
      >
        <div className="flex items-start gap-3">
          <StatusIcon
            status={
              data.overallStatus === "READY"
                ? "PASS"
                : data.overallStatus ===
                    "READY_WITH_WARNINGS"
                  ? "WARNING"
                  : "FAIL"
            }
            className="h-8 w-8 shrink-0"
          />

          <div>
            <p className="text-xs font-extrabold uppercase tracking-wide">
              Production Readiness
            </p>

            <h2 className="mt-1 text-xl font-extrabold">
              {data.overallLabel}
            </h2>

            <p className="mt-2 max-w-4xl text-sm font-semibold leading-6">
              {data.overallDescription}
            </p>

            <p className="mt-3 text-xs font-bold">
              Evaluated: {data.checkedAt}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SignalCard
          icon={
            <ClipboardCheck
              className="h-7 w-7 text-[var(--starland-info)]"
              aria-hidden="true"
            />
          }
          label="Total Checks"
          value={data.summary.totalChecks}
          description="Environment, database, scheduler, queue, health, and deployment checks."
        />

        <SignalCard
          icon={
            <CheckCircle2
              className="h-7 w-7 text-[var(--starland-success)]"
              aria-hidden="true"
            />
          }
          label="Passed"
          value={data.summary.passedChecks}
          description="Checks that require no corrective action."
        />

        <SignalCard
          icon={
            <TriangleAlert
              className="h-7 w-7 text-[var(--starland-warning)]"
              aria-hidden="true"
            />
          }
          label="Warnings"
          value={data.summary.warningChecks}
          description="Operational warnings that do not currently block automation."
        />

        <SignalCard
          icon={
            <CircleAlert
              className="h-7 w-7 text-[var(--starland-danger)]"
              aria-hidden="true"
            />
          }
          label="Failed"
          value={data.summary.failedChecks}
          description="Blocking conditions that should be resolved before production scheduling."
        />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SignalCard
          icon={
            <Activity
              className="h-7 w-7 text-[var(--starland-info)]"
              aria-hidden="true"
            />
          }
          label="Automation Health"
          value={
            data.signals.healthStatus
          }
          description="Current automation health classification."
        />

        <SignalCard
          icon={
            <Clock3
              className="h-7 w-7 text-[var(--starland-warning)]"
              aria-hidden="true"
            />
          }
          label="Scheduler"
          value={
            data.signals.schedulerStatus
          }
          description="Current daily API scheduler compliance."
        />

        <SignalCard
          icon={
            <LockKeyhole
              className="h-7 w-7 text-[var(--starland-main-green)]"
              aria-hidden="true"
            />
          }
          label="MySQL Lock"
          value={
            data.signals
              .mysqlDiagnosticStatus
          }
          description="Distributed-lock diagnostic result."
        />

        <SignalCard
          icon={
            <Network
              className="h-7 w-7 text-[var(--starland-info)]"
              aria-hidden="true"
            />
          }
          label="Queue Driver"
          value={
            data.signals.queueDriver
              .toUpperCase()
          }
          description={
            data.signals.queueDriver ===
            "sync"
              ? "Redis is not required."
              : `Redis configured: ${data.signals.redisConfigured ? "Yes" : "No"}.`
          }
        />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <SignalCard
          icon={
            <KeyRound
              className="h-7 w-7 text-[var(--starland-success)]"
              aria-hidden="true"
            />
          }
          label="Protected Secret"
          value={
            data.signals.secretConfigured
              ? "CONFIGURED"
              : "MISSING"
          }
          description="Used by automation, health, alert, readiness, and diagnostic endpoints."
        />

        <SignalCard
          icon={
            <ServerCog
              className="h-7 w-7 text-[var(--starland-info)]"
              aria-hidden="true"
            />
          }
          label="Application Port"
          value={data.signals.port}
          description="Port used by the Node.js application process."
        />

        <SignalCard
          icon={
            <Database
              className="h-7 w-7 text-[var(--starland-main-green)]"
              aria-hidden="true"
            />
          }
          label="Environment"
          value={
            data.environment.toUpperCase()
          }
          description={
            data.signals.applicationBaseUrl
          }
        />
      </section>

      <section className="starland-card overflow-hidden">
        <div className="border-b border-[var(--starland-border)] px-5 py-4">
          <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
            Readiness Checks
          </h2>

          <p className="mt-1 text-sm leading-6 text-[var(--starland-muted-text)]">
            Failed checks block production
            readiness. Warning checks allow
            operation but should still be reviewed.
          </p>
        </div>

        <div className="space-y-4 p-5">
          {data.checks.map((check) => (
            <ReadinessCheckCard
              key={check.code}
              check={check}
            />
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm font-semibold leading-6 text-blue-800">
        <p>
          Current queue configuration:
        </p>

        <code className="mt-2 block rounded-xl border border-blue-200 bg-white/70 px-3 py-2 text-xs">
          QUEUE_DRIVER=
          &quot;{data.signals.queueDriver}&quot;
          <br />
          REDIS_URL=
          &quot;
          {data.signals.redisConfigured
            ? "configured"
            : ""}
          &quot;
          <br />
          PORT=
          &quot;{data.signals.port}&quot;
        </code>

        <p className="mt-3">
          With the synchronous queue driver, the
          empty Redis URL is expected and does not
          block deployment readiness.
        </p>
      </section>
    </section>
  );
}