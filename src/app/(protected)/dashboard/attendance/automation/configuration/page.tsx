import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  CircleAlert,
  ExternalLink,
  KeyRound,
  LockKeyhole,
  ServerCog,
  Settings2,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { requireCanManageEmployees } from "@/features/auth/server/permission-guards";
import { AttendanceAutomationCommandBuilder } from "@/features/attendance/automation/configuration/components/attendance-automation-command-builder";
import { getAttendanceAutomationConfigurationData } from "@/features/attendance/automation/configuration/server/attendance-automation-configuration-queries";

export const dynamic = "force-dynamic";

function EnvironmentVariableRow({
  name,
  value,
  description,
}: {
  name: string;
  value: string;
  description: string;
}) {
  return (
    <tr>
      <td>
        <code className="text-xs font-bold text-[var(--starland-dark-text)]">
          {name}
        </code>
      </td>

      <td>
        <code className="text-xs text-[var(--starland-dark-text)]">
          {value}
        </code>
      </td>

      <td className="text-sm text-[var(--starland-muted-text)]">
        {description}
      </td>
    </tr>
  );
}

export default async function AttendanceAutomationConfigurationPage() {
  await requireCanManageEmployees();

  const data =
    getAttendanceAutomationConfigurationData();

  return (
    <section className="starland-page space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="starland-badge starland-badge-info">
            Automation Setup
          </span>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
            Attendance Automation Configuration
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            Review protected endpoint settings,
            scheduler timing, concurrency-lock
            configuration, and safe commands for
            external execution.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/attendance/automation/health"
            className="starland-btn starland-btn-primary"
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

      <section className="starland-card overflow-hidden">
        <div className="bg-[var(--starland-deep-green)] p-5 text-white sm:p-6">
          <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
            {data.environment.toUpperCase()}
          </span>

          <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
            Protected Scheduler Setup
          </h2>

          <p className="mt-2 max-w-4xl text-sm leading-6 text-white/70">
            Secret values are never rendered. This
            page displays only their configuration
            source, expected header, and length.
          </p>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <KeyRound
              className={[
                "h-7 w-7",
                data.secret.configured
                  ? "text-[var(--starland-success)]"
                  : "text-[var(--starland-danger)]",
              ].join(" ")}
              aria-hidden="true"
            />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Automation Secret
            </p>

            <p className="mt-1 text-xl font-extrabold text-[var(--starland-dark-text)]">
              {data.secret.configured
                ? "Configured"
                : "Missing"}
            </p>

            <p className="mt-2 text-xs font-semibold text-[var(--starland-muted-text)]">
              Source: {data.secret.source}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <CalendarClock
              className="h-7 w-7 text-[var(--starland-info)]"
              aria-hidden="true"
            />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Daily Schedule
            </p>

            <p className="mt-1 text-xl font-extrabold text-[var(--starland-dark-text)]">
              {data.schedule.scheduleLabel}
            </p>

            <p className="mt-2 text-xs font-semibold text-[var(--starland-muted-text)]">
              Grace:{" "}
              {data.schedule.graceMinutes} minutes
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <LockKeyhole
              className="h-7 w-7 text-[var(--starland-warning)]"
              aria-hidden="true"
            />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Lock Safety Timeout
            </p>

            <p className="mt-1 text-xl font-extrabold text-[var(--starland-dark-text)]">
              {data.lock.leaseSeconds} seconds
            </p>

            <p className="mt-2 text-xs font-semibold text-[var(--starland-muted-text)]">
              {data.lock.leaseMinutes} minute(s)
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <ServerCog
              className="h-7 w-7 text-[var(--starland-main-green)]"
              aria-hidden="true"
            />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Maximum Per Run
            </p>

            <p className="mt-1 text-xl font-extrabold text-[var(--starland-dark-text)]">
              {data.maximumRecordsPerRun}
            </p>

            <p className="mt-2 text-xs font-semibold text-[var(--starland-muted-text)]">
              Recommended range:{" "}
              {data.recommendedDateRangeDays} days
            </p>
          </article>
        </div>
      </section>

      {data.warnings.length > 0 ? (
        <section className="space-y-3">
          {data.warnings.map((warning) => (
            <article
              key={warning.code}
              className="rounded-2xl border border-amber-200 bg-amber-50 p-4"
            >
              <div className="flex items-start gap-3">
                <TriangleAlert
                  className="mt-0.5 h-5 w-5 shrink-0 text-amber-700"
                  aria-hidden="true"
                />

                <div>
                  <h2 className="font-extrabold text-amber-800">
                    {warning.title}
                  </h2>

                  <p className="mt-1 text-sm font-semibold leading-6 text-amber-700">
                    {warning.message}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </section>
      ) : (
        <section className="rounded-2xl border border-green-200 bg-green-50 p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2
              className="mt-0.5 h-5 w-5 shrink-0 text-green-700"
              aria-hidden="true"
            />

            <div>
              <h2 className="font-extrabold text-green-800">
                Configuration checks passed
              </h2>

              <p className="mt-1 text-sm font-semibold text-green-700">
                No automation configuration warnings
                were detected.
              </p>
            </div>
          </div>
        </section>
      )}

      <section className="grid gap-5 xl:grid-cols-2">
        <article className="starland-card overflow-hidden">
          <div className="border-b border-[var(--starland-border)] px-5 py-4">
            <div className="flex items-center gap-2">
              <ShieldCheck
                className="h-5 w-5 text-[var(--starland-success)]"
                aria-hidden="true"
              />

              <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
                Endpoint Authentication
              </h2>
            </div>
          </div>

          <dl className="grid gap-4 p-5 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-[var(--starland-muted-text)]">
                Secret Source
              </dt>

              <dd className="mt-1 break-all font-bold text-[var(--starland-dark-text)]">
                {data.secret.source}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-[var(--starland-muted-text)]">
                Secret Length
              </dt>

              <dd className="mt-1 font-bold text-[var(--starland-dark-text)]">
                {data.secret.configured
                  ? `${data.secret.secretLength} characters`
                  : "Not configured"}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-[var(--starland-muted-text)]">
                Request Header
              </dt>

              <dd className="mt-1 break-all font-bold text-[var(--starland-dark-text)]">
                {data.secret.requestHeaderName}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-[var(--starland-muted-text)]">
                Environment Variable
              </dt>

              <dd className="mt-1 break-all font-bold text-[var(--starland-dark-text)]">
                {
                  data.secret
                    .environmentVariableName
                }
              </dd>
            </div>
          </dl>
        </article>

        <article className="starland-card overflow-hidden">
          <div className="border-b border-[var(--starland-border)] px-5 py-4">
            <div className="flex items-center gap-2">
              <ExternalLink
                className="h-5 w-5 text-[var(--starland-info)]"
                aria-hidden="true"
              />

              <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
                Endpoint URLs
              </h2>
            </div>
          </div>

          <div className="space-y-4 p-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--starland-muted-text)]">
                Application Base URL
              </p>

              <code className="mt-2 block overflow-x-auto whitespace-nowrap rounded-xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] px-3 py-2 text-xs text-[var(--starland-dark-text)]">
                {data.applicationBaseUrl}
              </code>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--starland-muted-text)]">
                Automation Endpoint
              </p>

              <code className="mt-2 block overflow-x-auto whitespace-nowrap rounded-xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] px-3 py-2 text-xs text-[var(--starland-dark-text)]">
                POST {data.automationEndpointUrl}
              </code>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-[var(--starland-muted-text)]">
                Health Endpoint
              </p>

              <code className="mt-2 block overflow-x-auto whitespace-nowrap rounded-xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] px-3 py-2 text-xs text-[var(--starland-dark-text)]">
                GET {data.healthEndpointUrl}
              </code>
            </div>
          </div>
        </article>
      </section>

      <AttendanceAutomationCommandBuilder
        data={data}
      />

      <section className="starland-card overflow-hidden">
        <div className="border-b border-[var(--starland-border)] px-5 py-4">
          <div className="flex items-center gap-2">
            <Settings2
              className="h-5 w-5 text-[var(--starland-info)]"
              aria-hidden="true"
            />

            <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
              Environment Variables
            </h2>
          </div>

          <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
            Restart the Node.js application after
            changing server-side environment
            variables.
          </p>
        </div>

        <div className="starland-scroll-x">
          <table className="starland-table">
            <thead>
              <tr>
                <th>Variable</th>
                <th>Current / Example</th>
                <th>Description</th>
              </tr>
            </thead>

            <tbody>
              <EnvironmentVariableRow
                name="NEXT_PUBLIC_APP_URL"
                value={
                  data.applicationBaseUrl
                }
                description="Public HTTPS base URL used when generating endpoint commands."
              />

              <EnvironmentVariableRow
                name="ATTENDANCE_AUTOMATION_SECRET"
                value={
                  data.secret.source ===
                  "ATTENDANCE_AUTOMATION_SECRET"
                    ? "Configured"
                    : "Recommended"
                }
                description="Primary protected automation secret. Use a long random value."
              />

              <EnvironmentVariableRow
                name="ATTENDANCE_AUTOMATION_EXPECTED_HOUR"
                value={String(
                  data.schedule.expectedHour,
                )}
                description="Expected daily API execution hour using 24-hour Asia/Manila time."
              />

              <EnvironmentVariableRow
                name="ATTENDANCE_AUTOMATION_EXPECTED_MINUTE"
                value={String(
                  data.schedule.expectedMinute,
                )}
                description="Expected minute of the scheduled API execution."
              />

              <EnvironmentVariableRow
                name="ATTENDANCE_AUTOMATION_GRACE_MINUTES"
                value={String(
                  data.schedule.graceMinutes,
                )}
                description="Allowed delay after the expected execution time."
              />

              <EnvironmentVariableRow
                name="ATTENDANCE_AUTOMATION_LOCK_LEASE_SECONDS"
                value={String(
                  data.lock.leaseSeconds,
                )}
                description="Maximum transaction window while the shared MySQL automation lock is held."
              />
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
        <div className="flex items-start gap-3">
          <CircleAlert
            className="mt-0.5 h-5 w-5 shrink-0 text-blue-700"
            aria-hidden="true"
          />

          <div className="text-sm font-semibold leading-6 text-blue-800">
            <p>
              Schedule the protected automation call
              once each day. A separate health check
              may run after the grace deadline to
              notify administrators when execution is
              stale or degraded.
            </p>

            <p className="mt-2">
              Current expected execution:{" "}
              <strong>
                {data.schedule.scheduleLabel}
              </strong>
              . Current grace deadline is{" "}
              <strong>
                {data.schedule.graceMinutes} minutes
              </strong>{" "}
              later.
            </p>
          </div>
        </div>
      </section>
    </section>
  );
}