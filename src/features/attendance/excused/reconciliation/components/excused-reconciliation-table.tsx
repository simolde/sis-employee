import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import type {
  ExcusedReconciliationFilters,
  ExcusedReconciliationItem,
  ExcusedReconciliationResult,
} from "../types/excused-reconciliation-types";

type ExcusedReconciliationTableProps = {
  result: ExcusedReconciliationResult;
};

function buildPageHref(
  filters: ExcusedReconciliationFilters,
  page: number,
): string {
  const params = new URLSearchParams();

  if (filters.q) {
    params.set("q", filters.q);
  }

  if (filters.branchId) {
    params.set("branchId", filters.branchId);
  }

  if (filters.departmentId) {
    params.set("departmentId", filters.departmentId);
  }

  if (filters.scheduleId) {
    params.set("scheduleId", filters.scheduleId);
  }

  if (filters.dateFrom) {
    params.set("dateFrom", filters.dateFrom);
  }

  if (filters.dateTo) {
    params.set("dateTo", filters.dateTo);
  }

  params.set("page", String(page));

  return `/dashboard/attendance/excused/reconciliation?${params.toString()}`;
}

function ReconciliationStatus({
  record,
}: {
  record: ExcusedReconciliationItem;
}) {
  if (record.rollbackEligible) {
    return (
      <div>
        <span className="starland-badge starland-badge-warning">
          ROLLBACK ELIGIBLE
        </span>

        <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-amber-700">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
          Generation log verified
        </p>
      </div>
    );
  }

  return (
    <div>
      <span className="starland-badge starland-badge-danger">
        MANUAL INVESTIGATION
      </span>

      <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-red-700">
        <ShieldAlert className="h-3.5 w-3.5" aria-hidden="true" />
        Generation log missing
      </p>
    </div>
  );
}

export function ExcusedReconciliationTable({
  result,
}: ExcusedReconciliationTableProps) {
  return (
    <section className="starland-card overflow-hidden">
      <div className="border-b border-[var(--starland-border)] px-5 py-4">
        <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
          Unsupported Automatic EXCUSED Records
        </h2>

        <p className="mt-1 text-sm leading-6 text-[var(--starland-muted-text)]">
          These records are no longer covered by approved leave. Records without
          generation provenance remain protected from automatic deletion.
        </p>
      </div>

      <div className="starland-scroll-x">
        <table className="starland-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Branch / Department</th>
              <th>Schedule</th>
              <th>Attendance Date</th>
              <th>Issue</th>
              <th>Reconciliation</th>
              <th>Open</th>
            </tr>
          </thead>

          <tbody>
            {result.records.length > 0 ? (
              result.records.map((record) => (
                <tr key={record.attendanceId}>
                  <td>
                    <p className="font-bold text-[var(--starland-dark-text)]">
                      {record.employeeName}
                    </p>

                    <p className="mt-1 text-xs font-semibold text-[var(--starland-muted-text)]">
                      {record.empNumber}
                    </p>

                    <p className="mt-2">
                      <span className="starland-badge starland-badge-info">
                        {record.employeeStatus}
                      </span>
                    </p>
                  </td>

                  <td>
                    <p className="font-semibold text-[var(--starland-dark-text)]">
                      {record.branchName}
                    </p>

                    <p className="mt-1 text-xs text-[var(--starland-muted-text)]">
                      {record.departmentName}
                    </p>
                  </td>

                  <td>{record.scheduleName}</td>

                  <td>
                    <p className="font-bold text-[var(--starland-dark-text)]">
                      {record.attDate}
                    </p>

                    <p className="mt-1 text-xs text-[var(--starland-muted-text)]">
                      Created: {record.createdAt}
                    </p>
                  </td>

                  <td>
                    <span className="starland-badge starland-badge-warning">
                      {record.issueLabel}
                    </span>
                  </td>

                  <td>
                    <ReconciliationStatus record={record} />
                  </td>

                  <td>
                    <Link
                      href={`/dashboard/attendance/${record.attendanceId}`}
                      className="starland-btn starland-btn-soft starland-btn-sm"
                    >
                      <Eye className="h-4 w-4" aria-hidden="true" />
                      View
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7}>
                  <div className="rounded-2xl border border-dashed border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-6 text-center">
                    <p className="font-bold text-[var(--starland-dark-text)]">
                      No stale automatic EXCUSED records found
                    </p>

                    <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
                      Automatic EXCUSED records in this range are still covered
                      by approved leave.
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
          {result.pagination.totalItems} unsupported record(s)
        </p>

        <div className="flex gap-2">
          <Link
            href={buildPageHref(
              result.filters,
              result.pagination.page - 1,
            )}
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
            href={buildPageHref(
              result.filters,
              result.pagination.page + 1,
            )}
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