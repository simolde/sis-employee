import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarClock,
  ClockAlert,
  ShieldCheck,
  TimerOff,
} from "lucide-react";
import { requireCanManageEmployees } from "@/features/auth/server/permission-guards";
import { MissingTimeoutActions } from "@/features/attendance/maintenance/components/missing-timeout-actions";
import { getMissingTimeoutMaintenanceData } from "@/features/attendance/maintenance/server/missing-timeout-queries";

export default async function AttendanceMaintenancePage() {
  await requireCanManageEmployees();

  const data = await getMissingTimeoutMaintenanceData();

  return (
    <section className="starland-page space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="starland-badge starland-badge-warning">
            Attendance Maintenance
          </span>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
            Missing Time-out Maintenance
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            Find normal RFID, biometric/kiosk, and ODL attendance records with
            time-in but no time-out after the allowed cutoff.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href="/dashboard/attendance/actions"
            className="starland-btn starland-btn-primary"
          >
            <CalendarClock className="h-4 w-4" aria-hidden="true" />
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
            Policy
          </span>

          <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
            Normal Missing Time-outs Are Not HR Review Items
          </h2>

          <p className="mt-2 max-w-4xl text-sm leading-6 text-white/70">
            This page marks normal attendance records as MISSING TIMEOUT when
            time-out was not recorded after the cutoff. Manual attendance and
            corrections remain in the HR review workflow instead.
          </p>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <TimerOff className="h-6 w-6 text-[var(--starland-danger)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Candidates
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {data.summary.candidateCount}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <ClockAlert className="h-6 w-6 text-[var(--starland-warning)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              With Schedule
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {data.summary.withSchedule}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <AlertTriangle className="h-6 w-6 text-[var(--starland-info)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Without Schedule
            </p>

            <p className="mt-1 text-3xl font-extrabold text-[var(--starland-dark-text)]">
              {data.summary.withoutSchedule}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <ShieldCheck className="h-6 w-6 text-[var(--starland-success)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Review Required
            </p>

            <p className="mt-1 text-lg font-extrabold text-[var(--starland-dark-text)]">
              No
            </p>

            <p className="mt-1 text-xs font-semibold text-[var(--starland-muted-text)]">
              Normal missing timeout only
            </p>
          </article>
        </div>
      </section>

      <section className="starland-card p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
              Mark Candidate Records
            </h2>

            <p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
              This action updates all current candidates to MISSING TIMEOUT.
              Records already pending review, manual records, and corrections
              are excluded.
            </p>
          </div>

          <MissingTimeoutActions candidateCount={data.summary.candidateCount} />
        </div>
      </section>

      <section className="starland-card overflow-hidden">
        <div className="border-b border-[var(--starland-border)] px-5 py-4">
          <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
            Missing Time-out Candidates
          </h2>

          <p className="mt-1 text-sm leading-6 text-[var(--starland-muted-text)]">
            Records below have time-in, no time-out, are not manual, and passed
            the cutoff.
          </p>
        </div>

        <div className="starland-scroll-x">
          <table className="starland-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Branch / Department</th>
                <th>Schedule / Shift</th>
                <th>Date</th>
                <th>Time In</th>
                <th>Scheduled End</th>
                <th>Cutoff</th>
                <th>Source</th>
                <th>Status</th>
                <th>Reason</th>
              </tr>
            </thead>

            <tbody>
              {data.candidates.length > 0 ? (
                data.candidates.map((candidate) => (
                  <tr key={candidate.attendanceId}>
                    <td>
                      <p className="font-bold text-[var(--starland-dark-text)]">
                        {candidate.employeeName}
                      </p>

                      <p className="mt-1 text-xs font-semibold text-[var(--starland-muted-text)]">
                        {candidate.empNumber}
                      </p>
                    </td>

                    <td>
                      <p>{candidate.branchName}</p>

                      <p className="mt-1 text-xs font-semibold text-[var(--starland-muted-text)]">
                        {candidate.departmentName}
                      </p>
                    </td>

                    <td>
                      <p className="font-semibold text-[var(--starland-dark-text)]">
                        {candidate.scheduleName}
                      </p>

                      <p className="mt-1 text-xs font-semibold text-[var(--starland-muted-text)]">
                        {candidate.shiftTime}
                      </p>
                    </td>

                    <td>{candidate.attDate}</td>
                    <td>{candidate.timeIn}</td>
                    <td>{candidate.scheduledEnd}</td>
                    <td>{candidate.cutoffAt}</td>
                    <td>{candidate.source}</td>

                    <td>
                      <span className="starland-badge starland-badge-warning">
                        {candidate.currentStatus.replaceAll("_", " ")}
                      </span>
                    </td>

                    <td className="max-w-xs">
                      <p className="text-xs leading-5 text-[var(--starland-muted-text)]">
                        {candidate.reason}
                      </p>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={10}>
                    <div className="rounded-2xl border border-dashed border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-6 text-center">
                      <p className="font-bold text-[var(--starland-dark-text)]">
                        No missing time-out candidates
                      </p>

                      <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
                        There are no normal attendance records ready to mark as
                        MISSING TIMEOUT.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}