import Link from "next/link";
import {
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";
import type {
  ExcusedRecordFilters,
  ExcusedRecordItem,
  ExcusedRecordResult,
} from "../types/excused-record-types";

type ExcusedRecordsTableProps = {
  result: ExcusedRecordResult;
};

function buildPageHref(
  filters: ExcusedRecordFilters,
  page: number,
): string {
  const params = new URLSearchParams();

  if (filters.q) {
    params.set("q", filters.q);
  }

  if (filters.branchId) {
    params.set(
      "branchId",
      filters.branchId,
    );
  }

  if (filters.departmentId) {
    params.set(
      "departmentId",
      filters.departmentId,
    );
  }

  if (filters.scheduleId) {
    params.set(
      "scheduleId",
      filters.scheduleId,
    );
  }

  if (filters.source) {
    params.set("source", filters.source);
  }

  if (filters.dateFrom) {
    params.set(
      "dateFrom",
      filters.dateFrom,
    );
  }

  if (filters.dateTo) {
    params.set("dateTo", filters.dateTo);
  }

  params.set("page", String(page));

  return `/dashboard/attendance/excused?${params.toString()}`;
}

function employeeStatusBadgeClass(
  status: string,
): string {
  if (status === "ACTIVE") {
    return "starland-badge-success";
  }

  if (status === "INACTIVE") {
    return "starland-badge-warning";
  }

  return "starland-badge-info";
}

function sourceBadgeClass(
  record: ExcusedRecordItem,
): string {
  if (record.isManual) {
    return "starland-badge-warning";
  }

  if (record.leave) {
    return "starland-badge-success";
  }

  return "starland-badge-info";
}

function ExcusedRecordRow({
  record,
}: {
  record: ExcusedRecordItem;
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
              employeeStatusBadgeClass(
                record.employeeStatus,
              ),
            ].join(" ")}
          >
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

      <td>
        <p className="font-bold text-[var(--starland-dark-text)]">
          {record.scheduleName}
        </p>

        <p className="mt-1 text-xs text-[var(--starland-muted-text)]">
          {record.shiftTime}
        </p>
      </td>

      <td>
        <p className="font-bold text-[var(--starland-dark-text)]">
          {record.attDate}
        </p>

        <p className="mt-1 text-xs text-[var(--starland-muted-text)]">
          Created: {record.createdAt}
        </p>
      </td>

      <td>
        <span className="starland-badge starland-badge-success">
          EXCUSED
        </span>

        <p className="mt-2">
          <span
            className={[
              "starland-badge",
              sourceBadgeClass(record),
            ].join(" ")}
          >
            {record.sourceLabel}
          </span>
        </p>
      </td>

      <td>
        {record.leave ? (
          <div className="min-w-52">
            <div className="flex items-center gap-2">
              <CalendarCheck
                className="h-4 w-4 text-[var(--starland-success)]"
                aria-hidden="true"
              />

              <p className="font-bold text-[var(--starland-dark-text)]">
                {record.leave.leaveTypeName}
              </p>
            </div>

            <p className="mt-2 text-xs font-semibold text-[var(--starland-muted-text)]">
              Leave #{record.leave.leaveId}
            </p>

            <p className="mt-1 text-xs text-[var(--starland-muted-text)]">
              {record.leave.dateFrom} –{" "}
              {record.leave.dateTo}
            </p>
          </div>
        ) : (
          <div className="min-w-44">
            <p className="font-semibold text-[var(--starland-muted-text)]">
              No approved leave link
            </p>

            <p className="mt-1 text-xs text-[var(--starland-muted-text)]">
              This may be a manual EXCUSED
              correction.
            </p>
          </div>
        )}
      </td>

      <td className="print:hidden">
        <Link
          href={`/dashboard/attendance/${record.attendanceId}`}
          className="starland-btn starland-btn-soft starland-btn-sm"
        >
          <Eye
            className="h-4 w-4"
            aria-hidden="true"
          />
          View
        </Link>
      </td>
    </tr>
  );
}

export function ExcusedRecordsTable({
  result,
}: ExcusedRecordsTableProps) {
  return (
    <section className="starland-card overflow-hidden print:shadow-none">
      <div className="border-b border-[var(--starland-border)] px-5 py-4">
        <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
          EXCUSED Attendance Records
        </h2>

        <p className="mt-1 text-sm leading-6 text-[var(--starland-muted-text)]">
          Automatic records are linked to
          approved leave when a matching leave
          application is available.
        </p>
      </div>

      <div className="starland-scroll-x print:overflow-visible">
        <table className="starland-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Branch / Department</th>
              <th>Schedule</th>
              <th>Date</th>
              <th>Status / Source</th>
              <th>Approved Leave</th>
              <th className="print:hidden">
                Open
              </th>
            </tr>
          </thead>

          <tbody>
            {result.records.length > 0 ? (
              result.records.map((record) => (
                <ExcusedRecordRow
                  key={record.attendanceId}
                  record={record}
                />
              ))
            ) : (
              <tr>
                <td colSpan={7}>
                  <div className="rounded-2xl border border-dashed border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-6 text-center">
                    <p className="font-bold text-[var(--starland-dark-text)]">
                      No EXCUSED records found
                    </p>

                    <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
                      Try changing the date range,
                      source, or employee filters.
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
          Page {result.pagination.page} of{" "}
          {result.pagination.totalPages} ·{" "}
          {result.pagination.totalItems} EXCUSED
          record(s)
        </p>

        <div className="flex gap-2">
          <Link
            href={buildPageHref(
              result.filters,
              result.pagination.page - 1,
            )}
            aria-disabled={
              !result.pagination.hasPreviousPage
            }
            className={[
              "starland-btn starland-btn-soft starland-btn-sm",
              !result.pagination.hasPreviousPage
                ? "pointer-events-none opacity-50"
                : "",
            ].join(" ")}
          >
            <ChevronLeft
              className="h-4 w-4"
              aria-hidden="true"
            />
            Previous
          </Link>

          <Link
            href={buildPageHref(
              result.filters,
              result.pagination.page + 1,
            )}
            aria-disabled={
              !result.pagination.hasNextPage
            }
            className={[
              "starland-btn starland-btn-soft starland-btn-sm",
              !result.pagination.hasNextPage
                ? "pointer-events-none opacity-50"
                : "",
            ].join(" ")}
          >
            Next
            <ChevronRight
              className="h-4 w-4"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}