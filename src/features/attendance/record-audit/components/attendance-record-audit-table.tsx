import Link from "next/link";
import { Eye, FileJson } from "lucide-react";
import type {
  AttendanceRecordAuditItem,
  AttendanceRecordAuditResult,
} from "../types/attendance-record-audit-types";

type AttendanceRecordAuditTableProps = {
  result: AttendanceRecordAuditResult;
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

function JsonPreview({ title, value }: { title: string; value: string }) {
  return (
    <details className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-3 print:border-0 print:bg-transparent print:p-0">
      <summary className="cursor-pointer text-xs font-bold text-[var(--starland-dark-text)] print:list-none">
        {title}
      </summary>

      <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap break-words text-xs leading-5 text-[var(--starland-muted-text)] print:max-h-none print:overflow-visible">
        {value}
      </pre>
    </details>
  );
}

function AttendanceRecordAuditRow({
  record,
}: {
  record: AttendanceRecordAuditItem;
}) {
  return (
    <tr>
      <td>
        <span
          className={["starland-badge", actionBadgeClass(record.action)].join(
            " ",
          )}
        >
          {formatActionLabel(record.action)}
        </span>

        <p className="mt-2 text-xs font-semibold text-[var(--starland-muted-text)]">
          Log #{record.activityLogId}
        </p>
      </td>

      <td>
        <p className="font-bold text-[var(--starland-dark-text)]">
          {record.actorName}
        </p>

        <p className="mt-1 text-xs text-[var(--starland-muted-text)]">
          {record.actorEmail}
        </p>

        <p className="mt-1 text-xs text-[var(--starland-muted-text)]">
          User ID: {record.actorUserId ?? "—"} · Status: {record.actorStatus}
        </p>

        <p className="mt-2 text-xs font-semibold text-[var(--starland-muted-text)]">
          {record.createdAt}
        </p>
      </td>

      <td className="min-w-[280px]">
        <div className="space-y-2">
          <JsonPreview title="Old Value" value={record.oldValue} />
          <JsonPreview title="New Value" value={record.newValue} />
        </div>
      </td>

      <td className="print:hidden">
        <div className="flex flex-wrap gap-2">
          <Link
            href={`/dashboard/attendance/audit/${record.activityLogId}`}
            className="starland-btn starland-btn-primary starland-btn-sm"
          >
            <FileJson className="h-4 w-4" aria-hidden="true" />
            View Audit
          </Link>

          <Link
            href={`/dashboard/attendance/${record.entityId}`}
            className="starland-btn starland-btn-soft starland-btn-sm"
          >
            <Eye className="h-4 w-4" aria-hidden="true" />
            View Record
          </Link>
        </div>
      </td>
    </tr>
  );
}

export function AttendanceRecordAuditTable({
  result,
}: AttendanceRecordAuditTableProps) {
  return (
    <section className="starland-card overflow-hidden print:shadow-none">
      <div className="border-b border-[var(--starland-border)] px-5 py-4">
        <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
          Audit History for Attendance #{result.header.attendanceId}
        </h2>

        <p className="mt-1 text-sm leading-6 text-[var(--starland-muted-text)]">
          Shows every attendance-related audit log for this single record.
        </p>
      </div>

      <div className="starland-scroll-x print:overflow-visible">
        <table className="starland-table">
          <thead>
            <tr>
              <th>Action</th>
              <th>Actor / Date</th>
              <th>Audit Values</th>
              <th className="print:hidden">Open</th>
            </tr>
          </thead>

          <tbody>
            {result.records.length > 0 ? (
              result.records.map((record) => (
                <AttendanceRecordAuditRow
                  key={record.activityLogId}
                  record={record}
                />
              ))
            ) : (
              <tr>
                <td colSpan={4}>
                  <div className="rounded-2xl border border-dashed border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-6 text-center">
                    <p className="font-bold text-[var(--starland-dark-text)]">
                      No audit logs found for this attendance record
                    </p>

                    <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
                      Audit logs will appear here after manual changes, reviews,
                      approvals, or missing-timeout automation.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}