import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  ClockAlert,
  Edit3,
  Eye,
  History,
  ShieldCheck,
  TimerOff,
} from "lucide-react";
import { requireCanManageEmployees } from "@/features/auth/server/permission-guards";
import { AttendanceRecordAuditTable } from "@/features/attendance/record-audit/components/attendance-record-audit-table";
import { getAttendanceRecordAuditData } from "@/features/attendance/record-audit/server/attendance-record-audit-queries";

type AttendanceRecordAuditPageProps = {
  params: Promise<{
    attendanceId: string;
  }>;
};

function formatStatusLabel(status: string): string {
  return status.replaceAll("_", " ");
}

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

export default async function AttendanceRecordAuditPage({
  params,
}: AttendanceRecordAuditPageProps) {
  await requireCanManageEmployees();

  const { attendanceId } = await params;
  const result = await getAttendanceRecordAuditData(attendanceId);

  if (!result) {
    notFound();
  }

  return (
    <section className="starland-page space-y-5">
      <div className="flex flex-col gap-4 print:hidden sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="starland-badge starland-badge-info">
            Record Audit
          </span>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
            Attendance Record Audit History
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            Review all audit logs connected to this specific attendance record.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link
            href={`/dashboard/attendance/${result.header.attendanceId}`}
            className="starland-btn starland-btn-primary"
          >
            <Eye className="h-4 w-4" aria-hidden="true" />
            Open Attendance Record
          </Link>

          <Link
            href="/dashboard/attendance/audit"
            className="starland-btn starland-btn-soft"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Audit Trail
          </Link>
        </div>
      </div>

      <section className="starland-card overflow-hidden print:shadow-none">
        <div className="bg-[var(--starland-deep-green)] p-5 text-white sm:p-6">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex rounded-full bg-white/12 px-3 py-1 text-xs font-bold">
              {result.header.empNumber}
            </span>

            <span
              className={[
                "starland-badge",
                statusBadgeClass(result.header.status),
              ].join(" ")}
            >
              {formatStatusLabel(result.header.status)}
            </span>
          </div>

          <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
            {result.header.employeeName}
          </h2>

          <p className="mt-2 max-w-4xl text-sm leading-6 text-white/70">
            Attendance #{result.header.attendanceId} · {result.header.attDate} ·{" "}
            {result.header.branchName} · {result.header.departmentName} · Source:{" "}
            {result.header.source}
          </p>
        </div>

        <div className="grid gap-4 p-5 md:grid-cols-3 xl:grid-cols-6">
          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <History className="h-6 w-6 text-[var(--starland-info)]" />

            <p className="mt-3 text-xs font-bold uppercase tracking-wide text-[var(--starland-muted-text)]">
              Total Logs
            </p>

            <p className="mt-1 text-2xl font-extrabold text-[var(--starland-dark-text)]">
              {result.summary.totalLogs}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <ClipboardCheck className="h-6 w-6 text-[var(--starland-warning)]" />

            <p className="mt-3 text-xs font-bold uppercase tracking-wide text-[var(--starland-muted-text)]">
              Manual Created
            </p>

            <p className="mt-1 text-2xl font-extrabold text-[var(--starland-dark-text)]">
              {result.summary.manualCreated}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <Edit3 className="h-6 w-6 text-[var(--starland-warning)]" />

            <p className="mt-3 text-xs font-bold uppercase tracking-wide text-[var(--starland-muted-text)]">
              Manual Corrected
            </p>

            <p className="mt-1 text-2xl font-extrabold text-[var(--starland-dark-text)]">
              {result.summary.manualCorrected}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <TimerOff className="h-6 w-6 text-[var(--starland-danger)]" />

            <p className="mt-3 text-xs font-bold uppercase tracking-wide text-[var(--starland-muted-text)]">
              Missing Timeout
            </p>

            <p className="mt-1 text-2xl font-extrabold text-[var(--starland-dark-text)]">
              {result.summary.missingTimeout}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <ShieldCheck className="h-6 w-6 text-[var(--starland-info)]" />

            <p className="mt-3 text-xs font-bold uppercase tracking-wide text-[var(--starland-muted-text)]">
              Verified
            </p>

            <p className="mt-1 text-2xl font-extrabold text-[var(--starland-dark-text)]">
              {result.summary.verified}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <CheckCircle2 className="h-6 w-6 text-[var(--starland-success)]" />

            <p className="mt-3 text-xs font-bold uppercase tracking-wide text-[var(--starland-muted-text)]">
              Approved
            </p>

            <p className="mt-1 text-2xl font-extrabold text-[var(--starland-dark-text)]">
              {result.summary.approved}
            </p>
          </article>
        </div>
      </section>

      <AttendanceRecordAuditTable result={result} />
    </section>
  );
}