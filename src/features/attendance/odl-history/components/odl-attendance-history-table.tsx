import Link from "next/link";
import { ChevronLeft, ChevronRight, Eye } from "lucide-react";
import type {
  OdlAttendanceHistoryFilters,
  OdlAttendanceHistoryResult,
} from "../types/odl-attendance-history-types";

type OdlAttendanceHistoryTableProps = {
  result: OdlAttendanceHistoryResult;
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

function buildPageHref(
  filters: OdlAttendanceHistoryFilters,
  page: number,
): string {
  const params = new URLSearchParams();

  if (filters.dateFrom) {
    params.set("dateFrom", filters.dateFrom);
  }

  if (filters.dateTo) {
    params.set("dateTo", filters.dateTo);
  }

  params.set("page", String(page));

  return `/dashboard/attendance/odl/history?${params.toString()}`;
}

export function OdlAttendanceHistoryTable({
  result,
}: OdlAttendanceHistoryTableProps) {
  return (
    <section className="starland-card overflow-hidden print:shadow-none">
      <div className="border-b border-[var(--starland-border)] px-5 py-4">
        <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
          ODL Attendance Records
        </h2>

        <p className="mt-1 text-sm leading-6 text-[var(--starland-muted-text)]">
          This table only shows your own WEB / ODL time-in and time-out records.
        </p>
      </div>

      <div className="starland-scroll-x print:overflow-visible">
        <table className="starland-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Time In</th>
              <th>Time Out</th>
              <th>Source</th>
              <th>Status</th>
              <th>Total Hours</th>
              <th>Manual?</th>
              <th className="print:hidden">Open</th>
            </tr>
          </thead>

          <tbody>
            {result.records.length > 0 ? (
              result.records.map((record) => (
                <tr key={record.attendanceId}>
                  <td className="font-bold text-[var(--starland-dark-text)]">
                    {record.attDate}
                  </td>

                  <td>{record.timeIn}</td>
                  <td>{record.timeOut}</td>
                  <td>{record.source}</td>

                  <td>
                    <span
                      className={[
                        "starland-badge",
                        statusBadgeClass(record.status),
                      ].join(" ")}
                    >
                      {formatStatusLabel(record.status)}
                    </span>
                  </td>

                  <td>{record.totalHours}</td>

                  <td>
                    {record.isManual ? (
                      <span className="starland-badge starland-badge-warning">
                        YES
                      </span>
                    ) : (
                      <span className="starland-badge starland-badge-success">
                        NO
                      </span>
                    )}
                  </td>

                  <td className="print:hidden">
                    <Link
                      href={`/dashboard/attendance/${record.attendanceId}`}
                      className="starland-btn starland-btn-primary starland-btn-sm"
                    >
                      <Eye className="h-4 w-4" aria-hidden="true" />
                      View
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8}>
                  <div className="rounded-2xl border border-dashed border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-6 text-center">
                    <p className="font-bold text-[var(--starland-dark-text)]">
                      No ODL attendance records found
                    </p>

                    <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
                      Try changing the date range or submit your first ODL
                      attendance record.
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