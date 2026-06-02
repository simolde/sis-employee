import Link from "next/link";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import type {
  AttendanceAuditFilters,
  AttendanceAuditItem,
  AttendanceAuditResult,
} from "../types/attendance-audit-types";

type AttendanceAuditTableProps = {
  result: AttendanceAuditResult;
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

function buildPageHref(filters: AttendanceAuditFilters, page: number): string {
  const params = new URLSearchParams();

  if (filters.q) {
    params.set("q", filters.q);
  }

  if (filters.action !== "ALL") {
    params.set("action", filters.action);
  }

  params.set("page", String(page));

  return `/dashboard/attendance/audit?${params.toString()}`;
}

function JsonPreview({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <details className="rounded-2xl border border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-3">
      <summary className="cursor-pointer text-xs font-bold text-[var(--starland-dark-text)]">
        {title}
      </summary>

      <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap break-words text-xs leading-5 text-[var(--starland-muted-text)]">
        {value}
      </pre>
    </details>
  );
}

function AttendanceAuditRow({ record }: { record: AttendanceAuditItem }) {
  return (
    <tr>
      <td>
        <span className={["starland-badge", actionBadgeClass(record.action)].join(" ")}>
          {formatActionLabel(record.action)}
        </span>

        <p className="mt-2 text-xs font-semibold text-[var(--starland-muted-text)]">
          Log #{record.logId}
        </p>
      </td>

      <td>
        <p className="font-semibold text-[var(--starland-dark-text)]">
          Attendance #{record.entityId}
        </p>

        <p className="mt-1 text-xs text-[var(--starland-muted-text)]">
          Entity: {record.entityType}
        </p>
      </td>

      <td>
        <p className="font-semibold text-[var(--starland-dark-text)]">
          User ID: {record.actorUserId ?? "—"}
        </p>

        <p className="mt-1 text-xs text-[var(--starland-muted-text)]">
          {record.createdAt}
        </p>
      </td>

      <td className="min-w-[280px]">
        <div className="space-y-2">
          <JsonPreview title="Old Value" value={record.oldValue} />
          <JsonPreview title="New Value" value={record.newValue} />
        </div>
      </td>

      <td>
        {record.entityId !== "—" ? (
          <Link
            href={`/dashboard/attendance/${record.entityId}`}
            className="starland-btn starland-btn-primary starland-btn-sm"
          >
            <Eye className="h-4 w-4" aria-hidden="true" />
            View Record
          </Link>
        ) : (
          <span className="text-sm text-[var(--starland-muted-text)]">—</span>
        )}
      </td>
    </tr>
  );
}

export function AttendanceAuditTable({ result }: AttendanceAuditTableProps) {
  return (
    <section className="starland-card overflow-hidden">
      <div className="border-b border-[var(--starland-border)] px-5 py-4">
        <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
          Attendance Audit Logs
        </h2>

        <p className="mt-1 text-sm leading-6 text-[var(--starland-muted-text)]">
          Shows audit history for attendance-related actions only.
        </p>
      </div>

      <div className="starland-scroll-x">
        <table className="starland-table">
          <thead>
            <tr>
              <th>Action</th>
              <th>Record</th>
              <th>Actor / Date</th>
              <th>Audit Values</th>
              <th>Open</th>
            </tr>
          </thead>

          <tbody>
            {result.records.length > 0 ? (
              result.records.map((record) => (
                <AttendanceAuditRow key={record.logId} record={record} />
              ))
            ) : (
              <tr>
                <td colSpan={5}>
                  <div className="rounded-2xl border border-dashed border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-6 text-center">
                    <p className="font-bold text-[var(--starland-dark-text)]">
                      No audit logs found
                    </p>

                    <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
                      Change the filters or create attendance activity first.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-[var(--starland-border)] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-semibold text-[var(--starland-muted-text)]">
          Page {result.pagination.page} of {result.pagination.totalPages} ·{" "}
          {result.pagination.totalItems} log(s)
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