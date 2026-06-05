import Link from "next/link";
import { ChevronLeft, ChevronRight, Edit3 } from "lucide-react";
import type {
  AttendanceExceptionAuditFilters,
  AttendanceExceptionAuditItem,
  AttendanceExceptionAuditResult,
} from "../types/attendance-exception-audit-types";

type AttendanceExceptionAuditTableProps = {
  result: AttendanceExceptionAuditResult;
};

function buildPageHref(
  filters: AttendanceExceptionAuditFilters,
  page: number,
): string {
  const params = new URLSearchParams();

  if (filters.q) {
    params.set("q", filters.q);
  }

  if (filters.action) {
    params.set("action", filters.action);
  }

  if (filters.dateFrom) {
    params.set("dateFrom", filters.dateFrom);
  }

  if (filters.dateTo) {
    params.set("dateTo", filters.dateTo);
  }

  params.set("page", String(page));

  return `/dashboard/attendance/exceptions/audit?${params.toString()}`;
}

function formatActionLabel(action: string): string {
  return action
    .replace("ATTENDANCE_EXCEPTION_", "")
    .replaceAll("_", " ");
}

function actionBadgeClass(action: string): string {
  if (action === "ATTENDANCE_EXCEPTION_CREATED") {
    return "starland-badge-success";
  }

  if (action === "ATTENDANCE_EXCEPTION_UPDATED") {
    return "starland-badge-info";
  }

  if (action === "ATTENDANCE_EXCEPTION_ARCHIVED") {
    return "starland-badge-warning";
  }

  return "starland-badge-info";
}

function AuditValueBox({ label, value }: { label: string; value: string }) {
  return (
    <details className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-3">
      <summary className="cursor-pointer text-xs font-bold uppercase tracking-wide text-[var(--starland-muted-text)]">
        {label}
      </summary>

      <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap break-words text-xs leading-5 text-[var(--starland-dark-text)]">
        {value}
      </pre>
    </details>
  );
}

function AttendanceExceptionAuditRow({
  record,
}: {
  record: AttendanceExceptionAuditItem;
}) {
  return (
    <tr>
      <td>
        <p className="font-bold text-[var(--starland-dark-text)]">
          #{record.activityLogId}
        </p>

        <p className="mt-1 text-xs font-semibold text-[var(--starland-muted-text)]">
          {record.createdAt}
        </p>
      </td>

      <td>
        <span
          className={["starland-badge", actionBadgeClass(record.action)].join(
            " ",
          )}
        >
          {formatActionLabel(record.action)}
        </span>
      </td>

      <td>
        <p className="font-semibold text-[var(--starland-dark-text)]">
          Exception ID: {record.entityId}
        </p>

        <p className="mt-1 text-xs text-[var(--starland-muted-text)]">
          Actor User ID: {record.actorUserId ?? "—"}
        </p>
      </td>

      <td>
        <div className="grid gap-3 xl:grid-cols-2">
          <AuditValueBox label="Old Value" value={record.oldValueText} />
          <AuditValueBox label="New Value" value={record.newValueText} />
        </div>
      </td>

      <td className="print:hidden">
        {record.entityId !== "—" ? (
          <Link
            href={`/dashboard/attendance/exceptions/${record.entityId}/edit`}
            className="starland-btn starland-btn-soft starland-btn-sm"
          >
            <Edit3 className="h-4 w-4" aria-hidden="true" />
            Open
          </Link>
        ) : (
          <span className="text-sm font-semibold text-[var(--starland-muted-text)]">
            —
          </span>
        )}
      </td>
    </tr>
  );
}

export function AttendanceExceptionAuditTable({
  result,
}: AttendanceExceptionAuditTableProps) {
  return (
    <section className="starland-card overflow-hidden print:shadow-none">
      <div className="border-b border-[var(--starland-border)] px-5 py-4">
        <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
          Exception Calendar Audit Logs
        </h2>

        <p className="mt-1 text-sm leading-6 text-[var(--starland-muted-text)]">
          Tracks create, update, and archive actions for attendance exception
          dates.
        </p>
      </div>

      <div className="starland-scroll-x print:overflow-visible">
        <table className="starland-table">
          <thead>
            <tr>
              <th>Log</th>
              <th>Action</th>
              <th>Entity / Actor</th>
              <th>Changes</th>
              <th className="print:hidden">Open</th>
            </tr>
          </thead>

          <tbody>
            {result.records.length > 0 ? (
              result.records.map((record) => (
                <AttendanceExceptionAuditRow
                  key={record.activityLogId}
                  record={record}
                />
              ))
            ) : (
              <tr>
                <td colSpan={5}>
                  <div className="rounded-2xl border border-dashed border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-6 text-center">
                    <p className="font-bold text-[var(--starland-dark-text)]">
                      No exception audit logs found
                    </p>

                    <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
                      Try changing the date range, action filter, or search.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-[var(--starland-border)] px-5 py-4 print:hidden sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold text-[var(--starland-muted-text)]">
          Page {result.pagination.page} of {result.pagination.totalPages} ·{" "}
          {result.pagination.totalItems} audit log(s)
        </p>

        <div className="flex gap-2">
          <Link
            href={buildPageHref(result.filters, result.pagination.page - 1)}
            aria-disabled={!result.pagination.hasPreviousPage}
            className={[
              "starland-btn starland-btn-soft starland-btn-sm",
              !result.pagination.hasPreviousPage
                ? "pointer-events-none opacity-50"
                : "",
            ].join(" ")}
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            Previous
          </Link>

          <Link
            href={buildPageHref(result.filters, result.pagination.page + 1)}
            aria-disabled={!result.pagination.hasNextPage}
            className={[
              "starland-btn starland-btn-soft starland-btn-sm",
              !result.pagination.hasNextPage
                ? "pointer-events-none opacity-50"
                : "",
            ].join(" ")}
          >
            Next
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}