import Link from "next/link";
import {
  ArrowLeft,
  CalendarCheck,
  History,
  Play,
  RefreshCw,
} from "lucide-react";
import { requireCanManageEmployees } from "@/features/auth/server/permission-guards";
import { AttendanceAutomationHealthSummary } from "@/features/attendance/automation/health/components/attendance-automation-health-summary";
import { RecentAttendanceAutomationRuns } from "@/features/attendance/automation/health/components/recent-attendance-automation-runs";
import { getAttendanceAutomationHealthData } from "@/features/attendance/automation/health/server/attendance-automation-health-queries";

export const dynamic = "force-dynamic";

function RunSnapshot({
  title,
  run,
}: {
  title: string;
  run:
    | Awaited<
        ReturnType<
          typeof getAttendanceAutomationHealthData
        >
      >["latestRun"]
    | null;
}) {
  return (
    <article className="starland-card p-5">
      <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
        {title}
      </h2>

      {run ? (
        <div className="mt-4">
          <div className="flex flex-wrap gap-2">
            <span
              className={[
                "starland-badge",
                run.status === "COMPLETED"
                  ? "starland-badge-success"
                  : run.status === "FAILED"
                    ? "starland-badge-danger"
                    : "starland-badge-warning",
              ].join(" ")}
            >
              {run.status}
            </span>

            <span className="starland-badge starland-badge-info">
              {run.executionMode}
            </span>
          </div>

          <p className="mt-4 text-xl font-extrabold text-[var(--starland-dark-text)]">
            Run #{run.activityLogId}
          </p>

          <p className="mt-1 break-all text-xs font-semibold text-[var(--starland-muted-text)]">
            {run.runKey}
          </p>

          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-[var(--starland-muted-text)]">
                Checked
              </dt>

              <dd className="mt-1 font-bold text-[var(--starland-dark-text)]">
                {run.checkedCount}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-[var(--starland-muted-text)]">
                Generated
              </dt>

              <dd className="mt-1 font-bold text-[var(--starland-dark-text)]">
                {run.generatedCount}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-[var(--starland-muted-text)]">
                Duration
              </dt>

              <dd className="mt-1 font-bold text-[var(--starland-dark-text)]">
                {run.durationLabel}
              </dd>
            </div>

            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-[var(--starland-muted-text)]">
                Executed
              </dt>

              <dd className="mt-1 font-bold text-[var(--starland-dark-text)]">
                {run.ageLabel}
              </dd>
            </div>
          </dl>

          <Link
            href={`/dashboard/attendance/automation/approved-leave-excused/history/${run.activityLogId}`}
            className="starland-btn starland-btn-soft starland-btn-sm mt-5"
          >
            Open Run
          </Link>
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-dashed border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-5">
          <p className="font-bold text-[var(--starland-dark-text)]">
            No matching run
          </p>

          <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
            No automation execution of this type exists
            in the monitoring window.
          </p>
        </div>
      )}
    </article>
  );
}

export default async function AttendanceAutomationHealthPage() {
  await requireCanManageEmployees();

  const data =
    await getAttendanceAutomationHealthData();

  return (
    <section className="starland-page space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="starland-badge starland-badge-info">
            Automation Monitoring
          </span>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
            Attendance Automation Health
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            Monitor approved-leave automation
            configuration, recent execution health,
            failures, generated attendance records,
            retries, and stale scheduled processing.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/attendance/automation/approved-leave-excused"
            className="starland-btn starland-btn-primary"
          >
            <Play
              className="h-4 w-4"
              aria-hidden="true"
            />
            Run Automation
          </Link>

          <Link
            href="/dashboard/attendance/automation/approved-leave-excused/history"
            className="starland-btn starland-btn-soft"
          >
            <History
              className="h-4 w-4"
              aria-hidden="true"
            />
            Run History
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
          <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
            Last {data.monitoringWindowDays} Days
          </span>

          <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
            Approved-Leave EXCUSED Automation
          </h2>

          <p className="mt-2 max-w-4xl text-sm leading-6 text-white/70">
            The automation is considered healthy when
            its endpoint secret is configured, its
            latest run succeeds, no failure occurs in
            the last 24 hours, and a run was recorded
            recently.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
              <RefreshCw
                className="h-3.5 w-3.5"
                aria-hidden="true"
              />
              Status: {data.statusLabel}
            </span>

            <span className="inline-flex items-center gap-2 rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
              <CalendarCheck
                className="h-3.5 w-3.5"
                aria-hidden="true"
              />
              Generated:{" "}
              {data.summary.generatedRecords}
            </span>
          </div>
        </div>
      </section>

      <AttendanceAutomationHealthSummary
        data={data}
      />

      <section className="grid gap-5 xl:grid-cols-3">
        <RunSnapshot
          title="Latest Run"
          run={data.latestRun}
        />

        <RunSnapshot
          title="Latest Completed Run"
          run={data.latestCompletedRun}
        />

        <RunSnapshot
          title="Latest Failed Run"
          run={data.latestFailedRun}
        />
      </section>

      <RecentAttendanceAutomationRuns
        data={data}
      />
    </section>
  );
}