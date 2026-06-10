import Link from "next/link";
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  ClockAlert,
  Clock3,
  Edit3,
  RefreshCw,
  ShieldCheck,
  TimerOff,
} from "lucide-react";
import { requireCanManageEmployees } from "@/features/auth/server/permission-guards";
import { AttendanceStatusRecalculationRunner } from "@/features/attendance/status-recalculation/components/attendance-status-recalculation-runner";
import { getAttendanceStatusRecalculationSummary } from "@/features/attendance/status-recalculation/server/attendance-status-recalculation-service";

export default async function AttendanceStatusRecalculationPage() {
  await requireCanManageEmployees();

  const summary =
    await getAttendanceStatusRecalculationSummary();

  const batchLimit =
    300;

  return (
    <section className="starland-page space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="starland-badge starland-badge-info">
            Status Automation
          </span>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
            Attendance Status Recalculation
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            Recalculate normal attendance records using
            each assigned schedule, shift start and end
            time, overnight behavior, and the effective
            global late-grace policy.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/attendance/schedule-assignment"
            className="starland-btn starland-btn-primary"
          >
            <CalendarClock
              className="h-4 w-4"
              aria-hidden="true"
            />

            Assign Schedules
          </Link>

          <Link
            href="/dashboard/attendance/absences/candidates"
            className="starland-btn starland-btn-soft"
          >
            <TimerOff
              className="h-4 w-4"
              aria-hidden="true"
            />

            Absence Candidates
          </Link>

          <Link
            href="/dashboard/attendance/actions"
            className="starland-btn starland-btn-soft"
          >
            <RefreshCw
              className="h-4 w-4"
              aria-hidden="true"
            />

            Attendance Actions
          </Link>

          <Link
            href="/dashboard/attendance"
            className="starland-btn starland-btn-soft"
          >
            <ArrowLeft
              className="h-4 w-4"
              aria-hidden="true"
            />

            Back to Attendance
          </Link>
        </div>
      </div>

      <section className="starland-card overflow-hidden">
        <div className="bg-[var(--starland-deep-green)] p-5 text-white sm:p-6">
          <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
            Automatic Rule
          </span>

          <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
            Schedule and Policy Based Calculation
          </h2>

          <p className="mt-2 max-w-4xl text-sm leading-6 text-white/70">
            ON_TIME and LATE use the greater of the
            shift grace and global policy grace.
            HALF_DAY uses worked minutes. Missing
            time-out assignment is handled separately
            by the canonical missing-timeout service.
          </p>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <ShieldCheck
              className="h-7 w-7 text-[var(--starland-info)]"
              aria-hidden="true"
            />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Normal Records
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {summary.totalNormalRecords}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <Clock3
              className="h-7 w-7 text-[var(--starland-success)]"
              aria-hidden="true"
            />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Recalculable
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {summary.normalRecordsWithSchedule}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <CheckCircle2
              className="h-7 w-7 text-[var(--starland-success)]"
              aria-hidden="true"
            />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              On Time
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {summary.onTimeRecords}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <ClockAlert
              className="h-7 w-7 text-[var(--starland-warning)]"
              aria-hidden="true"
            />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Late
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {summary.lateRecords}
            </p>
          </article>
        </div>

        <div className="grid gap-4 px-5 pb-5 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <TimerOff
              className="h-7 w-7 text-[var(--starland-warning)]"
              aria-hidden="true"
            />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Half Day
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {summary.halfDayRecords}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <ClockAlert
              className="h-7 w-7 text-[var(--starland-danger)]"
              aria-hidden="true"
            />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Missing Timeout
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {summary.missingTimeoutRecords}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <Edit3
              className="h-7 w-7 text-[var(--starland-info)]"
              aria-hidden="true"
            />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Manual Skipped
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {summary.skippedManualRecords}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <RefreshCw
              className="h-7 w-7 text-[var(--starland-main-green)]"
              aria-hidden="true"
            />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Batch Limit
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {batchLimit}
            </p>
          </article>
        </div>
      </section>

      <section className="starland-card p-5">
        <div className="flex items-start gap-3">
          <ShieldCheck
            className="mt-0.5 h-6 w-6 shrink-0 text-[var(--starland-main-green)]"
            aria-hidden="true"
          />

          <div>
            <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
              Effective Attendance Policies
            </h2>

            <p className="mt-1 text-sm leading-6 text-[var(--starland-muted-text)]">
              These values are loaded from the
              persistent Attendance Policy settings.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="starland-badge starland-badge-info">
                Global grace:{" "}
                {summary.policyLateGraceMinutes} minute(s)
              </span>

              <span
                className={[
                  "starland-badge",

                  summary.policyAutoMarkMissingTimeout
                    ? "starland-badge-success"
                    : "starland-badge-danger",
                ].join(" ")}
              >
                Missing-timeout automation:{" "}
                {summary.policyAutoMarkMissingTimeout
                  ? "ENABLED"
                  : "DISABLED"}
              </span>

              <span className="starland-badge starland-badge-warning">
                Missing-timeout threshold:{" "}
                {summary.policyMissingTimeoutMinutes} minute(s)
              </span>
            </div>

            <p className="mt-4 text-sm leading-6 text-[var(--starland-muted-text)]">
              This recalculation page does not assign
              MISSING_TIMEOUT. Use the Missing Time-Out
              automation or authorized administrative
              action for that status.
            </p>
          </div>
        </div>
      </section>

      <section className="starland-card p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <span className="starland-badge starland-badge-warning">
              Before Recalculation
            </span>

            <h2 className="mt-3 text-lg font-extrabold text-[var(--starland-dark-text)]">
              Make Sure Employees Have Schedules
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
              Automatic status calculation requires an
              assigned employee schedule. Use schedule
              assignment first for employees without
              schedules or employees assigned to the
              wrong schedule.
            </p>
          </div>

          <Link
            href="/dashboard/attendance/schedule-assignment"
            className="starland-btn starland-btn-primary"
          >
            <CalendarClock
              className="h-4 w-4"
              aria-hidden="true"
            />

            Open Schedule Assignment
          </Link>
        </div>
      </section>

      <AttendanceStatusRecalculationRunner
        batchLimit={batchLimit}
        eligibleCount={
          summary.normalRecordsWithSchedule
        }
      />

      <section className="starland-card p-5">
        <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
          Recommended HR Workflow
        </h2>

        <div className="mt-4 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <p className="font-bold text-[var(--starland-dark-text)]">
              1. Assign Schedules
            </p>

            <p className="mt-2 text-sm leading-6 text-[var(--starland-muted-text)]">
              Bulk assign schedules by branch,
              department, designation, employee type,
              or current schedule.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <p className="font-bold text-[var(--starland-dark-text)]">
              2. Recalculate Status
            </p>

            <p className="mt-2 text-sm leading-6 text-[var(--starland-muted-text)]">
              Recalculate normal records using the
              assigned shift and global grace policy.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <p className="font-bold text-[var(--starland-dark-text)]">
              3. Mark Missing Time-Outs
            </p>

            <p className="mt-2 text-sm leading-6 text-[var(--starland-muted-text)]">
              Run the canonical missing-timeout process
              so open records use the configured policy
              threshold and complete audit trail.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <p className="font-bold text-[var(--starland-dark-text)]">
              4. Review Exceptions
            </p>

            <p className="mt-2 text-sm leading-6 text-[var(--starland-muted-text)]">
              HR reviews manual input, corrections,
              exceptional overrides, and unresolved
              attendance records.
            </p>
          </div>
        </div>
      </section>
    </section>
  );
}