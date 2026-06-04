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

  const summary = await getAttendanceStatusRecalculationSummary();
  const batchLimit = 300;

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
            Automatically calculate attendance status using each employee&apos;s
            assigned schedule, shift start time, shift end time, grace minutes,
            and overnight setting.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/attendance/schedule-assignment"
            className="starland-btn starland-btn-primary"
          >
            <CalendarClock className="h-4 w-4" aria-hidden="true" />
            Assign Schedules
          </Link>

          <Link
            href="/dashboard/attendance/absences/candidates"
            className="starland-btn starland-btn-soft"
          >
            <TimerOff className="h-4 w-4" aria-hidden="true" />
            Absence Candidates
          </Link>

          <Link
            href="/dashboard/attendance/actions"
            className="starland-btn starland-btn-soft"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
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
            Automatic Rule
          </span>

          <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
            Schedule + Shift Based Calculation
          </h2>

          <p className="mt-2 max-w-4xl text-sm leading-6 text-white/70">
            ON_TIME and LATE are based on shift start time plus grace minutes.
            HALF_DAY is based on worked minutes. MISSING_TIMEOUT is based on old
            records with time-in but no time-out.
          </p>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <ShieldCheck className="h-7 w-7 text-[var(--starland-info)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Normal Records
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {summary.totalNormalRecords}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <Clock3 className="h-7 w-7 text-[var(--starland-success)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              With Schedule
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {summary.normalRecordsWithSchedule}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <CheckCircle2 className="h-7 w-7 text-[var(--starland-success)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              On Time
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {summary.onTimeRecords}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <ClockAlert className="h-7 w-7 text-[var(--starland-warning)]" />

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
            <TimerOff className="h-7 w-7 text-[var(--starland-warning)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Half Day
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {summary.halfDayRecords}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <ClockAlert className="h-7 w-7 text-[var(--starland-danger)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Missing Timeout
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {summary.missingTimeoutRecords}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <Edit3 className="h-7 w-7 text-[var(--starland-info)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Manual Skipped
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {summary.skippedManualRecords}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <RefreshCw className="h-7 w-7 text-[var(--starland-main-green)]" />

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
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <span className="starland-badge starland-badge-warning">
              Before Recalculation
            </span>

            <h2 className="mt-3 text-lg font-extrabold text-[var(--starland-dark-text)]">
              Make Sure Employees Have Schedules
            </h2>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
              Automatic status calculation requires Employee.scheduleId. Use
              bulk schedule assignment first for employees without schedules or
              employees assigned to the wrong schedule.
            </p>
          </div>

          <Link
            href="/dashboard/attendance/schedule-assignment"
            className="starland-btn starland-btn-primary"
          >
            <CalendarClock className="h-4 w-4" aria-hidden="true" />
            Open Schedule Assignment
          </Link>
        </div>
      </section>

      <AttendanceStatusRecalculationRunner
        batchLimit={batchLimit}
        eligibleCount={summary.normalRecordsWithSchedule}
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
              Bulk assign schedules by branch, department, designation,
              employee type, or current schedule.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <p className="font-bold text-[var(--starland-dark-text)]">
              2. Recalculate Status
            </p>

            <p className="mt-2 text-sm leading-6 text-[var(--starland-muted-text)]">
              Run automatic status recalculation so normal records follow the
              assigned shift rules.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <p className="font-bold text-[var(--starland-dark-text)]">
              3. Preview Absences
            </p>

            <p className="mt-2 text-sm leading-6 text-[var(--starland-muted-text)]">
              Preview scheduled employees who have no attendance record before
              generating ABSENT records.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <p className="font-bold text-[var(--starland-dark-text)]">
              4. Review Exceptions
            </p>

            <p className="mt-2 text-sm leading-6 text-[var(--starland-muted-text)]">
              HR only reviews manual input, edits, corrections, and exceptional
              override records.
            </p>
          </div>
        </div>
      </section>
    </section>
  );
}