import Link from "next/link";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import type {
  AttendanceReviewQueueFilters,
  AttendanceReviewQueueItem,
  AttendanceReviewQueueResult,
} from "../types/attendance-review-queue-types";

type AttendanceReviewQueueTableProps = {
  result: AttendanceReviewQueueResult;
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

function reviewBadgeClass(record: AttendanceReviewQueueItem): string {
  if (record.approvedBy !== "—") {
    return "starland-badge-success";
  }

  if (record.verifiedBy !== "—") {
    return "starland-badge-info";
  }

  return "starland-badge-warning";
}

function reviewBadgeLabel(record: AttendanceReviewQueueItem): string {
  if (record.approvedBy !== "—") {
    return "APPROVED";
  }

  if (record.verifiedBy !== "—") {
    return "VERIFIED";
  }

  return "OPEN";
}

function buildPageHref(filters: AttendanceReviewQueueFilters, page: number) {
  const params = new URLSearchParams();

  if (filters.q) {
    params.set("q", filters.q);
  }

  if (filters.dateFrom) {
    params.set("dateFrom", filters.dateFrom);
  }

  if (filters.dateTo) {
    params.set("dateTo", filters.dateTo);
  }

  params.set("reviewStatus", filters.reviewStatus);
  params.set("page", String(page));

  return `/dashboard/attendance/review?${params.toString()}`;
}

export function AttendanceReviewQueueTable({
  result,
}: AttendanceReviewQueueTableProps) {
  return (
    <section className="starland-card overflow-hidden print:shadow-none">
      <div className="border-b border-[var(--starland-border)] px-5 py-4">
        <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
          Review Queue
        </h2>

        <p className="mt-1 text-sm leading-6 text-[var(--starland-muted-text)]">
          Only manual attendance, manual edits, and corrections are listed here.
        </p>
      </div>

      <div className="starland-scroll-x">
        <table className="starland-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Branch / Department</th>
              <th>Date / Time</th>
              <th>Schedule</th>
              <th>Source</th>
              <th>Status</th>
              <th>Review</th>
              <th>Latest Review Log</th>
              <th className="print:hidden">Action</th>
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
                  </td>

                  <td>
                    <p>{record.branchName}</p>

                    <p className="mt-1 text-xs font-semibold text-[var(--starland-muted-text)]">
                      {record.departmentName}
                    </p>
                  </td>

                  <td>
                    <p className="font-semibold text-[var(--starland-dark-text)]">
                      {record.attDate}
                    </p>

                    <p className="mt-1 text-xs font-semibold text-[var(--starland-muted-text)]">
                      {record.timeIn} - {record.timeOut}
                    </p>

                    <p className="mt-1 text-xs font-semibold text-[var(--starland-muted-text)]">
                      Total: {record.totalHours}
                    </p>
                  </td>

                  <td>{record.scheduleName}</td>

                  <td>
                    <span className="starland-badge starland-badge-warning">
                      {record.source}
                    </span>
                  </td>

                  <td>
                    <span
                      className={[
                        "starland-badge",
                        statusBadgeClass(record.attendanceStatus),
                      ].join(" ")}
                    >
                      {formatStatusLabel(record.attendanceStatus)}
                    </span>
                  </td>

                  <td>
                    <span
                      className={[
                        "starland-badge",
                        reviewBadgeClass(record),
                      ].join(" ")}
                    >
                      {reviewBadgeLabel(record)}
                    </span>

                    <p className="mt-2 text-xs font-semibold text-[var(--starland-muted-text)]">
                      {record.reviewReason}
                    </p>

                    <p className="mt-1 text-xs text-[var(--starland-muted-text)]">
                      Verified: {record.verifiedBy}
                    </p>

                    <p className="mt-1 text-xs text-[var(--starland-muted-text)]">
                      Approved: {record.approvedBy}
                    </p>
                  </td>

                  <td className="max-w-xs">
                    <p className="text-xs leading-5 text-[var(--starland-muted-text)]">
                      {record.latestReviewLog}
                    </p>
                  </td>

                  <td className="print:hidden">
                    <Link
                      href={`/dashboard/attendance/${record.attendanceId}`}
                      className="starland-btn starland-btn-primary starland-btn-sm"
                    >
                      <Eye className="h-4 w-4" aria-hidden="true" />
                      Review
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9}>
                  <div className="rounded-2xl border border-dashed border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-6 text-center">
                    <p className="font-bold text-[var(--starland-dark-text)]">
                      No records found
                    </p>

                    <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
                      No manual attendance, manual edits, or corrections match
                      your current filters.
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
          {result.pagination.totalItems} record(s)
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