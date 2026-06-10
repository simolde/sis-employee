import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  ClockAlert,
  FileClock,
  RefreshCw,
  Settings2,
  ShieldCheck,
  TimerOff,
} from "lucide-react";
import { requireCanManageEmployees } from "@/features/auth/server/permission-guards";
import { AttendanceAutomationRunner } from "@/features/attendance/automation/components/attendance-automation-runner";
import { getAttendanceAutomationStatus } from "@/features/attendance/automation/server/attendance-automation-queries";

export const dynamic =
  "force-dynamic";

function ConfigurationStatus({
  configured,
  configuredLabel,
  missingLabel,
}: {
  configured: boolean;
  configuredLabel: string;
  missingLabel: string;
}) {
  return (
    <span
      className={[
        "starland-badge",

        configured
          ? "starland-badge-success"
          : "starland-badge-danger",
      ].join(" ")}
    >
      {configured
        ? configuredLabel
        : missingLabel}
    </span>
  );
}

export default async function AttendanceAutomationOverviewPage() {
  await requireCanManageEmployees();

  const data =
    await getAttendanceAutomationStatus();

  return (
    <section className="starland-page space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="starland-badge starland-badge-info">
            Attendance Operations
          </span>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
            Attendance Automation Overview
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            Review persistent attendance policies,
            missing time-out candidates, status
            recalculation readiness, cron
            configuration, and production automation
            tools.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/settings/attendance-policies"
            className="starland-btn starland-btn-primary"
          >
            <Settings2
              className="h-4 w-4"
              aria-hidden="true"
            />

            Attendance Policies
          </Link>

          <Link
            href="/dashboard/attendance/automation/scheduler"
            className="starland-btn starland-btn-soft"
          >
            <CalendarClock
              className="h-4 w-4"
              aria-hidden="true"
            />

            Scheduler Setup
          </Link>

          <Link
            href="/dashboard/attendance/actions"
            className="starland-btn starland-btn-soft"
          >
            <ArrowLeft
              className="h-4 w-4"
              aria-hidden="true"
            />

            Attendance Actions
          </Link>
        </div>
      </div>

      <section className="starland-card overflow-hidden">
        <div className="bg-[var(--starland-deep-green)] p-5 text-white sm:p-6">
          <div className="flex items-start gap-3">
            <RefreshCw
              className="mt-1 h-7 w-7 shrink-0"
              aria-hidden="true"
            />

            <div>
              <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
                Policy-Controlled Automation
              </span>

              <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
                Missing Time-Out and Status Processing
              </h2>

              <p className="mt-2 max-w-4xl text-sm leading-6 text-white/70">
                Missing time-out assignment uses the
                persistent policy threshold and is
                owned by one canonical service.
                Status recalculation handles normal
                schedule-based statuses separately.
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
              Automation:{" "}
              {data.autoMarkMissingTimeout
                ? "Enabled"
                : "Disabled"}
            </span>

            <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
              Threshold:{" "}
              {data.missingTimeoutMinutes} minutes
            </span>

            <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
              Schedule:{" "}
              {data.recommendedSchedule}
            </span>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="starland-card p-4">
          <ClockAlert
            className="h-7 w-7 text-[var(--starland-warning)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Eligible Missing Time-Outs
          </p>

          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {data.eligibleMissingTimeouts}
          </p>

          <p className="mt-2 text-xs font-semibold leading-5 text-[var(--starland-muted-text)]">
            Open normal attendance records older than
            the configured policy threshold.
          </p>
        </article>

        <article className="starland-card p-4">
          <TimerOff
            className="h-7 w-7 text-[var(--starland-danger)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Already Marked
          </p>

          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {data.markedMissingTimeouts}
          </p>

          <p className="mt-2 text-xs font-semibold leading-5 text-[var(--starland-muted-text)]">
            Attendance records currently classified
            as MISSING_TIMEOUT.
          </p>
        </article>

        <article className="starland-card p-4">
          <ClipboardCheck
            className="h-7 w-7 text-[var(--starland-info)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Open Review Records
          </p>

          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {data.openReviewRecords}
          </p>

          <p className="mt-2 text-xs font-semibold leading-5 text-[var(--starland-muted-text)]">
            Manual attendance and corrections still
            awaiting review or approval.
          </p>
        </article>

        <article className="starland-card p-4">
          <CheckCircle2
            className="h-7 w-7 text-[var(--starland-success)]"
            aria-hidden="true"
          />

          <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
            Status Recalculable
          </p>

          <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
            {
              data.attendanceStatusNormalRecordsWithSchedule
            }
          </p>

          <p className="mt-2 text-xs font-semibold leading-5 text-[var(--starland-muted-text)]">
            Normal records with an assigned schedule
            eligible for status recalculation.
          </p>
        </article>
      </section>

      <section className="starland-card p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck
            className="mt-0.5 h-6 w-6 shrink-0 text-[var(--starland-main-green)]"
            aria-hidden="true"
          />

          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
              Effective Missing Time-Out Policy
            </h2>

            <p className="mt-1 text-sm leading-6 text-[var(--starland-muted-text)]">
              These values are loaded from persistent
              Attendance Policy storage and are used
              by the dashboard action and cron
              endpoint.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <span
                className={[
                  "starland-badge",

                  data.autoMarkMissingTimeout
                    ? "starland-badge-success"
                    : "starland-badge-danger",
                ].join(" ")}
              >
                Automatic marking:{" "}
                {data.autoMarkMissingTimeout
                  ? "ENABLED"
                  : "DISABLED"}
              </span>

              <span className="starland-badge starland-badge-warning">
                Threshold:{" "}
                {data.missingTimeoutMinutes} minutes
              </span>

              <span className="starland-badge starland-badge-info">
                Maximum per run:{" "}
                {data.batchLimit}
              </span>
            </div>
          </div>
        </div>
      </section>

      <AttendanceAutomationRunner
        automationEnabled={
          data.autoMarkMissingTimeout
        }
        missingTimeoutMinutes={
          data.missingTimeoutMinutes
        }
        batchLimit={
          data.batchLimit
        }
        eligibleMissingTimeouts={
          data.eligibleMissingTimeouts
        }
      />

      <section className="starland-card overflow-hidden">
        <div className="border-b border-[var(--starland-border)] px-5 py-4">
          <div className="flex items-center gap-2">
            <Activity
              className="h-5 w-5 text-[var(--starland-info)]"
              aria-hidden="true"
            />

            <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
              Cron and Actor Configuration
            </h2>
          </div>

          <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
            Secret values are never displayed. Only
            configuration status and actor identity
            are shown.
          </p>
        </div>

        <div className="grid gap-4 p-5 lg:grid-cols-2">
          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <h3 className="font-extrabold text-[var(--starland-dark-text)]">
              Missing Time-Out Cron
            </h3>

            <div className="mt-3 flex flex-wrap gap-2">
              <ConfigurationStatus
                configured={
                  data.cronSecretConfigured
                }
                configuredLabel="SECRET CONFIGURED"
                missingLabel="SECRET MISSING"
              />

              <ConfigurationStatus
                configured={
                  data.cronActorFound
                }
                configuredLabel="ACTOR FOUND"
                missingLabel="ACTOR NOT FOUND"
              />
            </div>

            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-[var(--starland-muted-text)]">
                  Endpoint
                </dt>

                <dd className="mt-1 break-all text-sm font-bold text-[var(--starland-dark-text)]">
                  {data.endpointPath}
                </dd>
              </div>

              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-[var(--starland-muted-text)]">
                  Actor
                </dt>

                <dd className="mt-1 break-all text-sm font-bold text-[var(--starland-dark-text)]">
                  {data.cronActorUsername} ·{" "}
                  {data.cronActorStatus}
                </dd>
              </div>

              <div className="sm:col-span-2">
                <dt className="text-xs font-bold uppercase tracking-wide text-[var(--starland-muted-text)]">
                  Actor Email
                </dt>

                <dd className="mt-1 break-all text-sm font-bold text-[var(--starland-dark-text)]">
                  {data.cronActorEmail}
                </dd>
              </div>
            </dl>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <h3 className="font-extrabold text-[var(--starland-dark-text)]">
              Status Recalculation Cron
            </h3>

            <div className="mt-3 flex flex-wrap gap-2">
              <ConfigurationStatus
                configured={
                  data.attendanceStatusCronSecretConfigured
                }
                configuredLabel="SECRET CONFIGURED"
                missingLabel="SECRET MISSING"
              />

              <ConfigurationStatus
                configured={
                  data.attendanceStatusCronActorFound
                }
                configuredLabel="ACTOR FOUND"
                missingLabel="ACTOR NOT FOUND"
              />
            </div>

            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-[var(--starland-muted-text)]">
                  Endpoint
                </dt>

                <dd className="mt-1 break-all text-sm font-bold text-[var(--starland-dark-text)]">
                  {
                    data.attendanceStatusEndpointPath
                  }
                </dd>
              </div>

              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-[var(--starland-muted-text)]">
                  Actor
                </dt>

                <dd className="mt-1 break-all text-sm font-bold text-[var(--starland-dark-text)]">
                  {
                    data.attendanceStatusCronActorUsername
                  }{" "}
                  ·{" "}
                  {
                    data.attendanceStatusCronActorStatus
                  }
                </dd>
              </div>

              <div className="sm:col-span-2">
                <dt className="text-xs font-bold uppercase tracking-wide text-[var(--starland-muted-text)]">
                  Actor Email
                </dt>

                <dd className="mt-1 break-all text-sm font-bold text-[var(--starland-dark-text)]">
                  {
                    data.attendanceStatusCronActorEmail
                  }
                </dd>
              </div>
            </dl>
          </article>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Link
          href="/dashboard/attendance/missing-timeouts"
          className="starland-card p-5 transition-transform duration-200 hover:-translate-y-0.5"
        >
          <ClockAlert
            className="h-7 w-7 text-[var(--starland-danger)]"
            aria-hidden="true"
          />

          <h2 className="mt-4 font-extrabold text-[var(--starland-dark-text)]">
            Missing Time-Outs
          </h2>

          <p className="mt-2 text-sm leading-6 text-[var(--starland-muted-text)]">
            Review candidates and use authorized
            manual marking tools.
          </p>
        </Link>

        <Link
          href="/dashboard/attendance/status-recalculation"
          className="starland-card p-5 transition-transform duration-200 hover:-translate-y-0.5"
        >
          <RefreshCw
            className="h-7 w-7 text-[var(--starland-info)]"
            aria-hidden="true"
          />

          <h2 className="mt-4 font-extrabold text-[var(--starland-dark-text)]">
            Status Recalculation
          </h2>

          <p className="mt-2 text-sm leading-6 text-[var(--starland-muted-text)]">
            Recalculate ON_TIME, LATE, HALF_DAY, and
            ABSENT using schedule policies.
          </p>
        </Link>

        <Link
          href="/dashboard/attendance/automation/scheduler"
          className="starland-card p-5 transition-transform duration-200 hover:-translate-y-0.5"
        >
          <CalendarClock
            className="h-7 w-7 text-[var(--starland-warning)]"
            aria-hidden="true"
          />

          <h2 className="mt-4 font-extrabold text-[var(--starland-dark-text)]">
            Scheduler Setup
          </h2>

          <p className="mt-2 text-sm leading-6 text-[var(--starland-muted-text)]">
            Configure Hostinger production cron jobs
            and monitoring receipts.
          </p>
        </Link>

        <Link
          href="/dashboard/attendance/automation/health"
          className="starland-card p-5 transition-transform duration-200 hover:-translate-y-0.5"
        >
          <Activity
            className="h-7 w-7 text-[var(--starland-success)]"
            aria-hidden="true"
          />

          <h2 className="mt-4 font-extrabold text-[var(--starland-dark-text)]">
            Automation Health
          </h2>

          <p className="mt-2 text-sm leading-6 text-[var(--starland-muted-text)]">
            Monitor execution history, scheduler
            compliance, failures, and locks.
          </p>
        </Link>

        <Link
          href="/dashboard/attendance/automation/readiness"
          className="starland-card p-5 transition-transform duration-200 hover:-translate-y-0.5"
        >
          <ClipboardCheck
            className="h-7 w-7 text-[var(--starland-main-green)]"
            aria-hidden="true"
          />

          <h2 className="mt-4 font-extrabold text-[var(--starland-dark-text)]">
            Production Readiness
          </h2>

          <p className="mt-2 text-sm leading-6 text-[var(--starland-muted-text)]">
            Run the deployment preflight before
            enabling production scheduling.
          </p>
        </Link>

        <Link
          href="/dashboard/attendance/automation/alerts"
          className="starland-card p-5 transition-transform duration-200 hover:-translate-y-0.5"
        >
          <ShieldCheck
            className="h-7 w-7 text-[var(--starland-warning)]"
            aria-hidden="true"
          />

          <h2 className="mt-4 font-extrabold text-[var(--starland-dark-text)]">
            Automation Alerts
          </h2>

          <p className="mt-2 text-sm leading-6 text-[var(--starland-muted-text)]">
            Review active automation and scheduler
            warning conditions.
          </p>
        </Link>

        <Link
          href="/dashboard/attendance/automation/reports"
          className="starland-card p-5 transition-transform duration-200 hover:-translate-y-0.5"
        >
          <FileClock
            className="h-7 w-7 text-[var(--starland-info)]"
            aria-hidden="true"
          />

          <h2 className="mt-4 font-extrabold text-[var(--starland-dark-text)]">
            Automation Reports
          </h2>

          <p className="mt-2 text-sm leading-6 text-[var(--starland-muted-text)]">
            Analyze run reliability, duration,
            generated records, and failures.
          </p>
        </Link>

        <Link
          href="/dashboard/attendance/automation/configuration"
          className="starland-card p-5 transition-transform duration-200 hover:-translate-y-0.5"
        >
          <Settings2
            className="h-7 w-7 text-[var(--starland-main-green)]"
            aria-hidden="true"
          />

          <h2 className="mt-4 font-extrabold text-[var(--starland-dark-text)]">
            Configuration
          </h2>

          <p className="mt-2 text-sm leading-6 text-[var(--starland-muted-text)]">
            Review endpoint, secret, scheduling, and
            lock configuration.
          </p>
        </Link>
      </section>
    </section>
  );
}