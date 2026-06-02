import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  History,
  Info,
  MapPin,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { getCurrentSession } from "@/features/auth/server/session";
import { AttendanceReviewPanel } from "@/features/attendance/components/attendance-review-panel";
import { getAttendanceDetail } from "@/features/attendance/server/attendance-queries";
import { canManageEmployees } from "@/lib/security/roles";
import type { AttendanceReviewStatusValue } from "@/features/attendance/types/attendance-review-action-state";

type AttendanceDetailPageProps = {
  params: Promise<{
    attendanceId: string;
  }>;
};

function statusBadgeClass(status: string): string {
  if (status === "ON_TIME") {
    return "starland-badge-success";
  }

  if (status === "LATE" || status === "HALF_DAY") {
    return "starland-badge-warning";
  }

  if (status === "ABSENT" || status === "MISSING_TIMEOUT") {
    return "starland-badge-danger";
  }

  return "starland-badge-info";
}

function formatStatusLabel(status: string): string {
  return status.replaceAll("_", " ");
}

function PunchCard({
  title,
  time,
  source,
  branchName,
  latitude,
  longitude,
  address,
  photo,
  remark,
  reason,
}: {
  title: string;
  time: string;
  source: string;
  branchName: string;
  latitude: string;
  longitude: string;
  address: string;
  photo: string;
  remark: string;
  reason: string;
}) {
  return (
    <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
      <div className="flex items-center gap-2">
        <Clock3 className="h-5 w-5 text-[var(--starland-main-green)]" />

        <h3 className="text-base font-extrabold text-[var(--starland-dark-text)]">
          {title}
        </h3>
      </div>

      <dl className="mt-4 grid gap-3 text-sm">
        <div>
          <dt className="font-bold text-[var(--starland-muted-text)]">Time</dt>
          <dd className="mt-1 font-extrabold text-[var(--starland-dark-text)]">
            {time}
          </dd>
        </div>

        <div>
          <dt className="font-bold text-[var(--starland-muted-text)]">Source</dt>
          <dd className="mt-1 text-[var(--starland-dark-text)]">{source}</dd>
        </div>

        <div>
          <dt className="font-bold text-[var(--starland-muted-text)]">Branch</dt>
          <dd className="mt-1 text-[var(--starland-dark-text)]">
            {branchName}
          </dd>
        </div>

        <div>
          <dt className="font-bold text-[var(--starland-muted-text)]">
            GPS Coordinates
          </dt>
          <dd className="mt-1 text-[var(--starland-dark-text)]">
            {latitude}, {longitude}
          </dd>
        </div>

        <div>
          <dt className="font-bold text-[var(--starland-muted-text)]">
            Address
          </dt>
          <dd className="mt-1 whitespace-pre-wrap text-[var(--starland-dark-text)]">
            {address}
          </dd>
        </div>

        <div>
          <dt className="font-bold text-[var(--starland-muted-text)]">Photo</dt>
          <dd className="mt-1 break-all text-[var(--starland-dark-text)]">
            {photo}
          </dd>
        </div>

        <div>
          <dt className="font-bold text-[var(--starland-muted-text)]">Remark</dt>
          <dd className="mt-1 whitespace-pre-wrap text-[var(--starland-dark-text)]">
            {remark}
          </dd>
        </div>

        <div>
          <dt className="font-bold text-[var(--starland-muted-text)]">Reason</dt>
          <dd className="mt-1 whitespace-pre-wrap text-[var(--starland-dark-text)]">
            {reason}
          </dd>
        </div>
      </dl>
    </article>
  );
}

export default async function AttendanceDetailPage({
  params,
}: AttendanceDetailPageProps) {
  const { attendanceId } = await params;
  const [attendance, session] = await Promise.all([
    getAttendanceDetail(attendanceId),
    getCurrentSession(),
  ]);

  if (!attendance) {
    notFound();
  }

  const canReview =
    Boolean(session && canManageEmployees(session.role)) &&
    Boolean(attendance.reviewRequired);

  return (
    <section className="starland-page space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="starland-badge starland-badge-success">
            Attendance Record
          </span>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
            Attendance Details
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            Review time-in, time-out, schedule, GPS, selfie path, attendance
            logs, and audit history.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={`/dashboard/attendance/${attendance.attendanceId}/audit`}
            className="starland-btn starland-btn-primary"
          >
            <History className="h-4 w-4" aria-hidden="true" />
            Audit History
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
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
              {attendance.empNumber}
            </span>

            <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
              {attendance.departmentName}
            </span>

            <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
              {attendance.branchName}
            </span>

            <span
              className={[
                "starland-badge",
                statusBadgeClass(attendance.status),
              ].join(" ")}
            >
              {formatStatusLabel(attendance.status)}
            </span>

            {attendance.reviewRequired ? (
              <span className="starland-badge starland-badge-warning">
                Review Required
              </span>
            ) : (
              <span className="starland-badge starland-badge-success">
                Normal Punch
              </span>
            )}
          </div>

          <h2 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl">
            {attendance.employeeName}
          </h2>

          <p className="mt-2 text-sm leading-6 text-white/70">
            {attendance.scheduleName} · {attendance.shiftTime}
          </p>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <CalendarDays className="h-6 w-6 text-[var(--starland-info)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Attendance Date
            </p>

            <p className="mt-1 text-lg font-extrabold text-[var(--starland-dark-text)]">
              {attendance.attDate}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <Clock3 className="h-6 w-6 text-[var(--starland-success)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Total Hours
            </p>

            <p className="mt-1 text-lg font-extrabold text-[var(--starland-dark-text)]">
              {attendance.totalHours}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            {attendance.reviewRequired ? (
              <Info className="h-6 w-6 text-[var(--starland-warning)]" />
            ) : (
              <ShieldCheck className="h-6 w-6 text-[var(--starland-success)]" />
            )}

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Review Rule
            </p>

            <p className="mt-1 text-sm font-extrabold text-[var(--starland-dark-text)]">
              {attendance.reviewRequired
                ? "Manual/Edit/Correction"
                : "No Review Needed"}
            </p>

            <p className="mt-1 text-xs font-semibold text-[var(--starland-muted-text)]">
              {attendance.reviewRequired
                ? "HR verification required"
                : "Normal RFID/Kiosk/ODL punch"}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <UserRound className="h-6 w-6 text-[var(--starland-main-green)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Approval
            </p>

            <p className="mt-1 text-sm font-extrabold text-[var(--starland-dark-text)]">
              {attendance.approvedBy}
            </p>

            <p className="mt-1 text-xs font-semibold text-[var(--starland-muted-text)]">
              {attendance.approvedAt}
            </p>
          </article>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        <PunchCard
          title="Time In"
          time={attendance.timeIn.time}
          source={attendance.timeIn.source}
          branchName={attendance.timeIn.branchName}
          latitude={attendance.timeIn.latitude}
          longitude={attendance.timeIn.longitude}
          address={attendance.timeIn.address}
          photo={attendance.timeIn.photo}
          remark={attendance.timeIn.remark}
          reason={attendance.timeIn.reason}
        />

        <PunchCard
          title="Time Out"
          time={attendance.timeOut.time}
          source={attendance.timeOut.source}
          branchName={attendance.timeOut.branchName}
          latitude={attendance.timeOut.latitude}
          longitude={attendance.timeOut.longitude}
          address={attendance.timeOut.address}
          photo={attendance.timeOut.photo}
          remark={attendance.timeOut.remark}
          reason={attendance.timeOut.reason}
        />
      </div>

      {canReview ? (
        <AttendanceReviewPanel
          attendanceId={attendance.attendanceId}
          currentStatus={attendance.status as AttendanceReviewStatusValue}
          verifiedBy={attendance.verifiedBy}
          verifiedAt={attendance.verifiedAt}
          approvedBy={attendance.approvedBy}
          approvedAt={attendance.approvedAt}
        />
      ) : null}

      <section className="starland-card overflow-hidden">
        <div className="border-b border-[var(--starland-border)] px-5 py-4">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-[var(--starland-main-green)]" />

            <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
              Attendance Logs
            </h2>
          </div>

          <p className="mt-1 text-sm leading-6 text-[var(--starland-muted-text)]">
            All punch events, repeated scan attempts, manual edits, and
            correction records for this attendance.
          </p>
        </div>

        <div className="starland-scroll-x">
          <table className="starland-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Punched At</th>
                <th>Source</th>
                <th>Branch</th>
                <th>GPS</th>
                <th>Remarks</th>
                <th>Reason</th>
              </tr>
            </thead>

            <tbody>
              {attendance.logs.length > 0 ? (
                attendance.logs.map((log) => (
                  <tr key={log.logId}>
                    <td>{formatStatusLabel(log.punchType)}</td>
                    <td>{log.punchedAt}</td>
                    <td>{log.source}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-[var(--starland-muted-text)]" />
                        {log.branchName}
                      </div>
                    </td>
                    <td>
                      {log.latitude}, {log.longitude}
                    </td>
                    <td>{log.remarks}</td>
                    <td>{log.reason}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7}>No attendance logs found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}