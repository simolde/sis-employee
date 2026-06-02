import Link from "next/link";
import {
  ArrowLeft,
  ClipboardCheck,
  Clock3,
  ClockAlert,
  FileSpreadsheet,
  Hourglass,
  ShieldCheck,
} from "lucide-react";
import { requireCanManageEmployees } from "@/features/auth/server/permission-guards";
import { AttendanceAutomationRunner } from "@/features/attendance/automation/components/attendance-automation-runner";
import { getAttendanceAutomationStatus } from "@/features/attendance/automation/server/attendance-automation-queries";

function StatusBadge({ ok }: { ok: boolean }) {
  return (
    <span
      className={[
        "starland-badge",
        ok ? "starland-badge-success" : "starland-badge-danger",
      ].join(" ")}
    >
      {ok ? "OK" : "Needs Setup"}
    </span>
  );
}

export default async function AttendanceAutomationPage() {
  await requireCanManageEmployees();

  const status = await getAttendanceAutomationStatus();

  const cronUrlExample =
    "/api/cron/mark-missing-timeouts?secret=<MISSING_TIMEOUT_CRON_SECRET>&limit=200";

  return (
    <section className="starland-page space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="starland-badge starland-badge-info">
            Attendance Automation
          </span>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
            Attendance Automation Status
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            Check the automatic missing-timeout cron setup, actor account, and
            current workload before configuring Hostinger cron jobs.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/attendance/actions"
            className="starland-btn starland-btn-primary"
          >
            <Clock3 className="h-4 w-4" aria-hidden="true" />
            Attendance Actions
          </Link>

          <Link
            href="/dashboard/attendance"
            className="starland-btn starland-btn-soft"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Attendance
          </Link>
        </div>
      </div>

      <section className="starland-card overflow-hidden">
        <div className="bg-[var(--starland-deep-green)] p-5 text-white sm:p-6">
          <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
            Cron Health Check
          </span>

          <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
            Automatic Missing Timeout Job
          </h2>

          <p className="mt-2 max-w-4xl text-sm leading-6 text-white/70">
            The cron route marks old time-in records without time-out as
            MISSING_TIMEOUT. It does not make records manual and does not send
            normal records to HR review.
          </p>
        </div>

        <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <ShieldCheck className="h-7 w-7 text-[var(--starland-success)]" />

            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-sm font-bold text-[var(--starland-muted-text)]">
                Cron Secret
              </p>

              <StatusBadge ok={status.cronSecretConfigured} />
            </div>

            <p className="mt-2 text-sm leading-6 text-[var(--starland-muted-text)]">
              Environment variable:
              <br />
              <code>MISSING_TIMEOUT_CRON_SECRET</code>
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <ClipboardCheck className="h-7 w-7 text-[var(--starland-info)]" />

            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-sm font-bold text-[var(--starland-muted-text)]">
                Cron Actor
              </p>

              <StatusBadge ok={status.cronActorFound} />
            </div>

            <p className="mt-2 text-sm leading-6 text-[var(--starland-muted-text)]">
              {status.cronActorEmail}
              <br />
              User: {status.cronActorUsername}
              <br />
              Status: {status.cronActorStatus}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <ClockAlert className="h-7 w-7 text-[var(--starland-warning)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Eligible Missing Timeouts
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {status.eligibleMissingTimeouts}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <Hourglass className="h-7 w-7 text-[var(--starland-danger)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Open Manual Review
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {status.openReviewRecords}
            </p>
          </article>
        </div>

        <div className="grid gap-4 px-5 pb-5 md:grid-cols-2">
          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <FileSpreadsheet className="h-7 w-7 text-[var(--starland-success)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Already Marked Missing Timeout
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {status.markedMissingTimeouts}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <Clock3 className="h-7 w-7 text-[var(--starland-info)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Recommended Schedule
            </p>

            <p className="mt-1 text-lg font-extrabold text-[var(--starland-dark-text)]">
              {status.recommendedSchedule}
            </p>

            <p className="mt-2 text-sm leading-6 text-[var(--starland-muted-text)]">
              Batch limit: {status.batchLimit} records per run.
            </p>
          </article>
        </div>
      </section>

      <AttendanceAutomationRunner
        batchLimit={status.batchLimit}
        eligibleMissingTimeouts={status.eligibleMissingTimeouts}
      />

      <section className="starland-card p-5">
        <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
          Hostinger Cron Setup
        </h2>

        <p className="mt-2 text-sm leading-6 text-[var(--starland-muted-text)]">
          Add this URL format to Hostinger cron. Replace the secret placeholder
          with the exact value from your server environment. Do not expose the
          secret in screenshots or commits.
        </p>

        <div className="mt-4 overflow-x-auto rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
          <code className="text-sm font-semibold text-[var(--starland-dark-text)]">
            {cronUrlExample}
          </code>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-[var(--starland-border)] bg-white p-4">
            <p className="text-sm font-bold text-[var(--starland-dark-text)]">
              Method
            </p>

            <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
              GET or POST
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--starland-border)] bg-white p-4">
            <p className="text-sm font-bold text-[var(--starland-dark-text)]">
              Endpoint
            </p>

            <p className="mt-1 break-all text-sm text-[var(--starland-muted-text)]">
              {status.endpointPath}
            </p>
          </div>
        </div>
      </section>
    </section>
  );
}