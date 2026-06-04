import Link from "next/link";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import type {
  ScheduleAssignmentHistoryFilters,
  ScheduleAssignmentHistoryItem,
  ScheduleAssignmentHistoryResult,
} from "../types/schedule-assignment-history-types";

type ScheduleAssignmentHistoryTableProps = {
  result: ScheduleAssignmentHistoryResult;
};

function buildPageHref(
  filters: ScheduleAssignmentHistoryFilters,
  page: number,
): string {
  const params = new URLSearchParams();

  if (filters.q) {
    params.set("q", filters.q);
  }

  if (filters.state !== "ALL") {
    params.set("state", filters.state);
  }

  if (filters.dateFrom) {
    params.set("dateFrom", filters.dateFrom);
  }

  if (filters.dateTo) {
    params.set("dateTo", filters.dateTo);
  }

  params.set("page", String(page));

  return `/dashboard/attendance/schedule-assignment/history?${params.toString()}`;
}

function formatStatusLabel(status: string): string {
  return status.replaceAll("_", " ");
}

function employeeStatusBadgeClass(status: string): string {
  if (status === "ACTIVE") {
    return "starland-badge-success";
  }

  if (status === "INACTIVE") {
    return "starland-badge-warning";
  }

  return "starland-badge-info";
}

function AssignmentHistoryRow({
  record,
}: {
  record: ScheduleAssignmentHistoryItem;
}) {
  return (
    <tr>
      <td>
        <p className="font-bold text-[var(--starland-dark-text)]">
          {record.employeeName}
        </p>

        <p className="mt-1 text-xs font-semibold text-[var(--starland-muted-text)]">
          {record.empNumber}
        </p>

        <p className="mt-2">
          <span
            className={[
              "starland-badge",
              employeeStatusBadgeClass(record.employeeStatus),
            ].join(" ")}
          >
            {formatStatusLabel(record.employeeStatus)}
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

      <td>
        <p className="font-bold text-[var(--starland-dark-text)]">
          {record.scheduleName}
        </p>

        <p className="mt-1 text-xs font-semibold text-[var(--starland-muted-text)]">
          {record.shiftTime}
        </p>
      </td>

      <td>
        <p className="font-semibold text-[var(--starland-dark-text)]">
          From: {record.validFrom}
        </p>

        <p className="mt-1 text-xs text-[var(--starland-muted-text)]">
          To: {record.validTo}
        </p>

        <p className="mt-2">
          {record.isActive ? (
            <span className="starland-badge starland-badge-success">
              CURRENT
            </span>
          ) : (
            <span className="starland-badge starland-badge-warning">
              CLOSED
            </span>
          )}
        </p>
      </td>

      <td>
        <p className="font-semibold text-[var(--starland-dark-text)]">
          {record.assignedByName}
        </p>

        <p className="mt-1 text-xs text-[var(--starland-muted-text)]">
          {record.assignedByEmail}
        </p>

        <p className="mt-2 text-xs font-semibold text-[var(--starland-muted-text)]">
          {record.createdAt}
        </p>
      </td>

      <td>
        <p className="max-w-xs whitespace-pre-wrap text-sm leading-6 text-[var(--starland-muted-text)]">
          {record.remarks}
        </p>
      </td>

      <td>
        <Link
          href={`/dashboard/employees/${record.empId}`}
          className="starland-btn starland-btn-soft starland-btn-sm"
        >
          <Eye className="h-4 w-4" aria-hidden="true" />
          View Employee
        </Link>
      </td>
    </tr>
  );
}

export function ScheduleAssignmentHistoryTable({
  result,
}: ScheduleAssignmentHistoryTableProps) {
  return (
    <section className="starland-card overflow-hidden">
      <div className="border-b border-[var(--starland-border)] px-5 py-4">
        <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
          Schedule Assignment Records
        </h2>

        <p className="mt-1 text-sm leading-6 text-[var(--starland-muted-text)]">
          Shows schedule assignment history created from manual and bulk
          assignment workflows.
        </p>
      </div>

      <div className="starland-scroll-x">
        <table className="starland-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Branch / Department</th>
              <th>Schedule</th>
              <th>Effective Dates</th>
              <th>Assigned By</th>
              <th>Remarks</th>
              <th>Open</th>
            </tr>
          </thead>

          <tbody>
            {result.records.length > 0 ? (
              result.records.map((record) => (
                <AssignmentHistoryRow
                  key={record.assignmentId}
                  record={record}
                />
              ))
            ) : (
              <tr>
                <td colSpan={7}>
                  <div className="rounded-2xl border border-dashed border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-6 text-center">
                    <p className="font-bold text-[var(--starland-dark-text)]">
                      No schedule assignment history found
                    </p>

                    <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
                      Try changing the filters or assign schedules first.
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
          {result.pagination.totalItems} assignment(s)
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