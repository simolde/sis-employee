import Link from "next/link";
import {
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  UserRound,
} from "lucide-react";
import type {
  ApprovedLeaveExcusedSyncFilters,
  ApprovedLeaveExcusedSyncResult,
} from "../types/approved-leave-excused-sync-types";

type ApprovedLeaveExcusedSyncTableProps = {
  result: ApprovedLeaveExcusedSyncResult;
};

function buildPageHref(
  filters: ApprovedLeaveExcusedSyncFilters,
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

  if (filters.dateFrom) {
    params.set(
      "dateFrom",
      filters.dateFrom,
    );
  }

  if (filters.dateTo) {
    params.set(
      "dateTo",
      filters.dateTo,
    );
  }

  params.set("page", String(page));

  return `/dashboard/attendance/excused/sync?${params.toString()}`;
}

export function ApprovedLeaveExcusedSyncTable({
  result,
}: ApprovedLeaveExcusedSyncTableProps) {
  return (
    <section className="starland-card overflow-hidden print:shadow-none">
      <div className="border-b border-[var(--starland-border)] px-5 py-4">
        <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
          Missing Approved-Leave EXCUSED
          Records
        </h2>

        <p className="mt-1 text-sm leading-6 text-[var(--starland-muted-text)]">
          These scheduled approved-leave dates do
          not currently have any attendance record.
        </p>
      </div>

      <div className="starland-scroll-x print:overflow-visible">
        <table className="starland-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Branch / Department</th>
              <th>Schedule</th>
              <th>Attendance Date</th>
              <th>Approved Leave</th>
              <th>Expected Result</th>
            </tr>
          </thead>

          <tbody>
            {result.records.length > 0 ? (
              result.records.map((record) => (
                <tr
                  key={`${record.empId}-${record.attendanceDateInput}`}
                >
                  <td>
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[var(--starland-light-bg)]">
                        <UserRound
                          className="h-4 w-4 text-[var(--starland-main-green)]"
                          aria-hidden="true"
                        />
                      </div>

                      <div>
                        <p className="font-bold text-[var(--starland-dark-text)]">
                          {record.employeeName}
                        </p>

                        <p className="mt-1 text-xs font-semibold text-[var(--starland-muted-text)]">
                          {record.empNumber}
                        </p>
                      </div>
                    </div>
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
                    <p className="font-semibold text-[var(--starland-dark-text)]">
                      {record.scheduleName}
                    </p>
                  </td>

                  <td>
                    <p className="font-bold text-[var(--starland-dark-text)]">
                      {record.attendanceDate}
                    </p>
                  </td>

                  <td>
                    <div className="min-w-48">
                      <p className="font-bold text-[var(--starland-dark-text)]">
                        {
                          record.leaveTypeName
                        }
                      </p>

                      <p className="mt-1 text-xs font-semibold text-[var(--starland-muted-text)]">
                        Leave #{record.leaveId}
                      </p>

                      <p className="mt-1 text-xs text-[var(--starland-muted-text)]">
                        {record.leaveDateFrom} –{" "}
                        {record.leaveDateTo}
                      </p>
                    </div>
                  </td>

                  <td>
                    <span className="starland-badge starland-badge-success">
                      EXCUSED
                    </span>

                    <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-[var(--starland-muted-text)]">
                      <CalendarCheck
                        className="h-3.5 w-3.5"
                        aria-hidden="true"
                      />
                      Automatic approved-leave
                      attendance
                    </p>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6}>
                  <div className="rounded-2xl border border-dashed border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-6 text-center">
                    <p className="font-bold text-[var(--starland-dark-text)]">
                      No missing EXCUSED records
                      found
                    </p>

                    <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
                      Approved-leave dates in this
                      range already have attendance,
                      are not scheduled, or are
                      protected by an exception
                      date.
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
          {result.pagination.totalItems} missing
          record(s)
        </p>

        <div className="flex gap-2">
          <Link
            href={buildPageHref(
              result.filters,
              result.pagination.page - 1,
            )}
            aria-disabled={
              !result.pagination
                .hasPreviousPage
            }
            className={[
              "starland-btn starland-btn-soft starland-btn-sm",
              !result.pagination
                .hasPreviousPage
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