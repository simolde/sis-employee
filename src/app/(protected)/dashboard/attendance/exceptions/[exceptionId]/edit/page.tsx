import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, TimerOff } from "lucide-react";
import { requireCanManageEmployees } from "@/features/auth/server/permission-guards";
import { AttendanceExceptionEditForm } from "@/features/attendance/exceptions/components/attendance-exception-edit-form";
import { getAttendanceExceptionEditData } from "@/features/attendance/exceptions/server/attendance-exception-edit-queries";

type AttendanceExceptionEditPageProps = {
  params: Promise<{
    exceptionId: string;
  }>;
};

function parseExceptionId(value: string): number | null {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

export default async function AttendanceExceptionEditPage({
  params,
}: AttendanceExceptionEditPageProps) {
  await requireCanManageEmployees();

  const resolvedParams = await params;
  const exceptionId = parseExceptionId(resolvedParams.exceptionId);

  if (!exceptionId) {
    notFound();
  }

  const data = await getAttendanceExceptionEditData(exceptionId);

  if (!data) {
    notFound();
  }

  return (
    <section className="starland-page space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="starland-badge starland-badge-info">
            Attendance Exceptions
          </span>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
            Edit Exception Date
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            Update the selected attendance exception. This affects absence
            candidate preview and ABSENT generation when the exception is active
            and marked to exclude ABSENT generation.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/attendance/exceptions"
            className="starland-btn starland-btn-primary"
          >
            <CalendarDays className="h-4 w-4" aria-hidden="true" />
            Exception Calendar
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
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Attendance Actions
          </Link>
        </div>
      </div>

      <AttendanceExceptionEditForm data={data} />

      <section className="starland-card p-5">
        <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
          Edit Reminder
        </h2>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <p className="font-bold text-[var(--starland-dark-text)]">
              Active Status
            </p>

            <p className="mt-2 text-sm leading-6 text-[var(--starland-muted-text)]">
              Only active exceptions are used by absence preview and ABSENT
              generation.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <p className="font-bold text-[var(--starland-dark-text)]">
              Branch Scope
            </p>

            <p className="mt-2 text-sm leading-6 text-[var(--starland-muted-text)]">
              All branches blocks all employees. A selected branch blocks only
              that branch.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <p className="font-bold text-[var(--starland-dark-text)]">
              Activity Log
            </p>

            <p className="mt-2 text-sm leading-6 text-[var(--starland-muted-text)]">
              Every update stores old and new values in the attendance audit
              trail.
            </p>
          </div>
        </div>
      </section>
    </section>
  );
}