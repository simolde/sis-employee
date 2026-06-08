import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  CheckCircle2,
  CircleAlert,
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
import { getAttendanceAutomationLockDiagnosticData } from "@/features/attendance/automation/diagnostics/server/attendance-automation-lock-diagnostics";
import type {
  AttendanceAutomationLockDiagnosticData,
  AttendanceAutomationLockDiagnosticStatus,
} from "@/features/attendance/automation/diagnostics/types/attendance-automation-lock-diagnostic-types";

export const dynamic = "force-dynamic";

function statusContainerClass(
  status: AttendanceAutomationLockDiagnosticStatus,
): string {
  switch (status) {
    case "PASS":
      return "border-green-200 bg-green-50 text-green-800";

    case "WARNING":
      return "border-amber-200 bg-amber-50 text-amber-800";

    case "FAIL":
      return "border-red-200 bg-red-50 text-red-800";
  }
}

function DiagnosticStatusIcon({
  status,
}: {
  status: AttendanceAutomationLockDiagnosticStatus;
}) {
  if (status === "PASS") {
    return (
      <CheckCircle2
        className="h-8 w-8 shrink-0"
        aria-hidden="true"
      />
    );
  }

  if (status === "WARNING") {
    return (
      <TriangleAlert
        className="h-8 w-8 shrink-0"
        aria-hidden="true"
      />
    );
  }

  return (
    <CircleAlert
      className="h-8 w-8 shrink-0"
      aria-hidden="true"
    />
  );
}

function CheckResult({
  label,
  passed,
}: {
  label: string;
  passed: boolean;
}) {
  return (
    <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
      {passed ? (
        <CheckCircle2
          className="h-6 w-6 text-[var(--starland-success)]"
          aria-hidden="true"
        />
      ) : (
        <CircleAlert
          className="h-6 w-6 text-[var(--starland-danger)]"
          aria-hidden="true"
        />
      )}

      <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
        {label}
      </p>

      <p
        className={[
          "mt-1 text-lg font-extrabold",
          passed
            ? "text-green-700"
            : "text-red-700",
        ].join(" ")}
      >
        {passed ? "PASSED" : "FAILED"}
      </p>
    </article>
  );
}

function ProductionLockCard({
  data,
}: {
  data: AttendanceAutomationLockDiagnosticData;
}) {
  const lock =
    data.productionLock;

  return (
    <section className="starland-card overflow-hidden">
      <div className="border-b border-[var(--starland-border)] px-5 py-4">
        <div className="flex items-center gap-2">
          <LockKeyhole
            className="h-5 w-5 text-[var(--starland-info)]"
            aria-hidden="true"
          />

          <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
            Production Automation Lock
          </h2>
        </div>
      </div>

      <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
          <Activity
            className="h-6 w-6 text-[var(--starland-info)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Status
          </p>

          <p className="mt-1 text-xl font-extrabold text-[var(--starland-dark-text)]">
            {lock.status}
          </p>
        </article>

        <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
          <ServerCog
            className="h-6 w-6 text-[var(--starland-warning)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Owner Connection
          </p>

          <p className="mt-1 text-xl font-extrabold text-[var(--starland-dark-text)]">
            {lock.ownerConnectionId !== null
              ? `#${lock.ownerConnectionId}`
              : "No owner"}
          </p>
        </article>

        <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
          <Network
            className="h-6 w-6 text-[var(--starland-main-green)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Distributed
          </p>

          <p className="mt-1 text-xl font-extrabold text-[var(--starland-dark-text)]">
            {lock.distributed
              ? "YES"
              : "NO"}
          </p>
        </article>

        <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
          <KeyRound
            className="h-6 w-6 text-[var(--starland-info)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Provider
          </p>

          <p className="mt-1 break-all text-sm font-extrabold text-[var(--starland-dark-text)]">
            {lock.source}
          </p>
        </article>
      </div>

      <div className="border-t border-[var(--starland-border)] px-5 py-4">
        <p className="text-xs font-bold uppercase tracking-wide text-[var(--starland-muted-text)]">
          Lock Name
        </p>

        <code className="mt-2 block break-all rounded-xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] px-3 py-2 text-xs font-semibold text-[var(--starland-dark-text)]">
          {lock.lockName}
        </code>
      </div>
    </section>
  );
}

export default async function AttendanceAutomationDiagnosticsPage() {
  await requireCanManageEmployees();

  const data =
    await getAttendanceAutomationLockDiagnosticData();

  return (
    <section className="starland-page space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="starland-badge starland-badge-info">
            Database Diagnostics
          </span>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
            Automation Lock Diagnostics
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            Verify that the connected MySQL or
            MariaDB server supports the named locks
            used to coordinate attendance automation
            across application processes.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/attendance/automation/diagnostics"
            className="starland-btn starland-btn-primary"
          >
            <RefreshCw
              className="h-4 w-4"
              aria-hidden="true"
            />

            Run Again
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

      <section
        className={[
          "rounded-2xl border p-5",
          statusContainerClass(
            data.overallStatus,
          ),
        ].join(" ")}
      >
        <div className="flex items-start gap-3">
          <DiagnosticStatusIcon
            status={data.overallStatus}
          />

          <div>
            <p className="text-xs font-extrabold uppercase tracking-wide">
              Diagnostic Result
            </p>

            <h2 className="mt-1 text-xl font-extrabold">
              {data.statusLabel}
            </h2>

            <p className="mt-2 max-w-4xl text-sm font-semibold leading-6">
              {data.statusDescription}
            </p>

            <p className="mt-3 text-xs font-bold">
              Checked: {data.checkedAt}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <article className="starland-card p-4">
          <Database
            className="h-7 w-7 text-[var(--starland-info)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Database Server
          </p>

          <p className="mt-1 break-words text-lg font-extrabold text-[var(--starland-dark-text)]">
            {data.database.serverVersion}
          </p>
        </article>

        <article className="starland-card p-4">
          <Database
            className="h-7 w-7 text-[var(--starland-main-green)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Selected Database
          </p>

          <p className="mt-1 break-words text-lg font-extrabold text-[var(--starland-dark-text)]">
            {data.database.databaseName ??
              "Not reported"}
          </p>
        </article>

        <article className="starland-card p-4">
          <ServerCog
            className="h-7 w-7 text-[var(--starland-warning)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Diagnostic Connection
          </p>

          <p className="mt-1 text-lg font-extrabold text-[var(--starland-dark-text)]">
            {data.database
              .diagnosticConnectionId !== null
              ? `#${data.database.diagnosticConnectionId}`
              : "Unknown"}
          </p>
        </article>
      </section>

      <section className="starland-card overflow-hidden">
        <div className="border-b border-[var(--starland-border)] px-5 py-4">
          <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
            Named-Lock Capability Checks
          </h2>

          <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
            A unique temporary lock was used. The
            production automation lock was not
            acquired or modified.
          </p>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-3">
          <CheckResult
            label="GET_LOCK Supported"
            passed={
              data.capability
                .getLockSupported
            }
          />

          <CheckResult
            label="Temporary Lock Acquired"
            passed={
              data.capability
                .lockAcquired
            }
          />

          <CheckResult
            label="Owner Detected"
            passed={
              data.capability
                .ownerDetected
            }
          />

          <CheckResult
            label="Owner Matches Connection"
            passed={
              data.capability
                .ownerMatchedConnection
            }
          />

          <CheckResult
            label="Temporary Lock Released"
            passed={
              data.capability
                .lockReleased
            }
          />

          <CheckResult
            label="Lock Free After Release"
            passed={
              data.capability
                .lockFreeAfterRelease
            }
          />
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <article className="starland-card p-4">
          <Clock3
            className="h-7 w-7 text-[var(--starland-info)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Acquire Duration
          </p>

          <p className="mt-1 text-2xl font-extrabold text-[var(--starland-dark-text)]">
            {data.timing.acquireDurationMs} ms
          </p>
        </article>

        <article className="starland-card p-4">
          <Clock3
            className="h-7 w-7 text-[var(--starland-success)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Release Duration
          </p>

          <p className="mt-1 text-2xl font-extrabold text-[var(--starland-dark-text)]">
            {data.timing.releaseDurationMs} ms
          </p>
        </article>

        <article className="starland-card p-4">
          <Clock3
            className="h-7 w-7 text-[var(--starland-warning)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Total Duration
          </p>

          <p className="mt-1 text-2xl font-extrabold text-[var(--starland-dark-text)]">
            {data.timing.totalDurationMs} ms
          </p>
        </article>
      </section>

      <ProductionLockCard data={data} />

      <section className="starland-card overflow-hidden">
        <div className="border-b border-[var(--starland-border)] px-5 py-4">
          <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
            Diagnostic Messages
          </h2>
        </div>

        <div className="p-5">
          {data.issues.length > 0 ? (
            <ul className="space-y-3">
              {data.issues.map((issue) => (
                <li
                  key={issue}
                  className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-800"
                >
                  <TriangleAlert
                    className="mt-0.5 h-5 w-5 shrink-0"
                    aria-hidden="true"
                  />

                  <span>{issue}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="rounded-2xl border border-green-200 bg-green-50 p-5 text-center">
              <CheckCircle2
                className="mx-auto h-9 w-9 text-green-700"
                aria-hidden="true"
              />

              <h3 className="mt-3 font-extrabold text-green-800">
                No diagnostic issues detected
              </h3>

              <p className="mt-2 text-sm font-semibold text-green-700">
                The temporary MySQL named-lock
                lifecycle completed successfully.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm font-semibold leading-6 text-blue-800">
        <p>
          Diagnostic lock:
        </p>

        <code className="mt-2 block break-all rounded-xl border border-blue-200 bg-white/70 px-3 py-2 text-xs">
          {data.diagnosticLockName}
        </code>

        <p className="mt-3">
          This temporary lock is different from the
          production attendance automation lock and
          cannot block normal automation execution.
        </p>
      </section>
    </section>
  );
}