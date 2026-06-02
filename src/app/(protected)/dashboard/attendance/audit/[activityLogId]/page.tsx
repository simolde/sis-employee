import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarClock,
  Database,
  Eye,
  FileJson,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { requireCanManageEmployees } from "@/features/auth/server/permission-guards";
import { getAttendanceAuditDetail } from "@/features/attendance/audit/server/attendance-audit-detail-queries";

type AttendanceAuditDetailPageProps = {
  params: Promise<{
    activityLogId: string;
  }>;
};

function formatActionLabel(action: string): string {
  return action.replaceAll("_", " ");
}

function actionBadgeClass(action: string): string {
  if (action.includes("APPROVED") || action.includes("VERIFIED")) {
    return "starland-badge-success";
  }

  if (action.includes("MISSING_TIMEOUT")) {
    return "starland-badge-danger";
  }

  if (action.includes("MANUAL")) {
    return "starland-badge-warning";
  }

  return "starland-badge-info";
}

function JsonBlock({ title, value }: { title: string; value: string }) {
  return (
    <article className="starland-card overflow-hidden">
      <div className="border-b border-[var(--starland-border)] px-5 py-4">
        <div className="flex items-center gap-2">
          <FileJson className="h-5 w-5 text-[var(--starland-main-green)]" />

          <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
            {title}
          </h2>
        </div>
      </div>

      <div className="p-5">
        <pre className="max-h-[520px] overflow-auto whitespace-pre-wrap break-words rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4 text-xs leading-5 text-[var(--starland-muted-text)]">
          {value}
        </pre>
      </div>
    </article>
  );
}

export default async function AttendanceAuditDetailPage({
  params,
}: AttendanceAuditDetailPageProps) {
  await requireCanManageEmployees();

  const { activityLogId } = await params;
  const auditLog = await getAttendanceAuditDetail(activityLogId);

  if (!auditLog) {
    notFound();
  }

  return (
    <section className="starland-page space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="starland-badge starland-badge-info">
            Audit Detail
          </span>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--starland-dark-text)]">
            Attendance Audit Log #{auditLog.activityLogId}
          </h1>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--starland-muted-text)]">
            Review the exact attendance audit action, actor, timestamp, and JSON
            value changes.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {auditLog.entityId !== "—" ? (
            <Link
              href={`/dashboard/attendance/${auditLog.entityId}`}
              className="starland-btn starland-btn-primary"
            >
              <Eye className="h-4 w-4" aria-hidden="true" />
              Open Attendance Record
            </Link>
          ) : null}

          <Link
            href="/dashboard/attendance/audit"
            className="starland-btn starland-btn-soft"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Audit Trail
          </Link>
        </div>
      </div>

      <section className="starland-card overflow-hidden">
        <div className="bg-[var(--starland-deep-green)] p-5 text-white sm:p-6">
          <span
            className={[
              "starland-badge",
              actionBadgeClass(auditLog.action),
            ].join(" ")}
          >
            {formatActionLabel(auditLog.action)}
          </span>

          <h2 className="mt-4 text-2xl font-extrabold tracking-tight">
            Attendance #{auditLog.entityId}
          </h2>

          <p className="mt-2 max-w-4xl text-sm leading-6 text-white/70">
            Entity type: {auditLog.entityType}
          </p>
        </div>

        <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-4">
          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <UserRound className="h-7 w-7 text-[var(--starland-info)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Actor
            </p>

            <p className="mt-1 text-lg font-extrabold text-[var(--starland-dark-text)]">
              {auditLog.actorName}
            </p>

            <p className="mt-1 text-xs font-semibold text-[var(--starland-muted-text)]">
              {auditLog.actorEmail}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <ShieldCheck className="h-7 w-7 text-[var(--starland-success)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Actor Account
            </p>

            <p className="mt-1 text-lg font-extrabold text-[var(--starland-dark-text)]">
              User ID: {auditLog.actorUserId ?? "—"}
            </p>

            <p className="mt-1 text-xs font-semibold text-[var(--starland-muted-text)]">
              Status: {auditLog.actorStatus}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <CalendarClock className="h-7 w-7 text-[var(--starland-warning)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Created At
            </p>

            <p className="mt-1 text-lg font-extrabold text-[var(--starland-dark-text)]">
              {auditLog.createdAt}
            </p>
          </article>

          <article className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-4">
            <Database className="h-7 w-7 text-[var(--starland-info)]" />

            <p className="mt-3 text-sm font-bold text-[var(--starland-muted-text)]">
              Request Info
            </p>

            <p className="mt-1 break-all text-sm font-bold text-[var(--starland-dark-text)]">
              IP: {auditLog.ipAddress}
            </p>

            <p className="mt-1 break-all text-xs font-semibold text-[var(--starland-muted-text)]">
              Agent: {auditLog.userAgent}
            </p>
          </article>
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        <JsonBlock title="Old Value" value={auditLog.oldValue} />
        <JsonBlock title="New Value" value={auditLog.newValue} />
      </div>
    </section>
  );
}