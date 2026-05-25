import Link from "next/link";
import { Eye } from "lucide-react";
import type {
  AttendanceListItem,
  AttendanceListSearchParams,
} from "../types/attendance-types";
import { AttendanceStatusBadge } from "./attendance-status-badge";

type AttendanceTableProps = {
  records: AttendanceListItem[];
  filters: AttendanceListSearchParams;
};

function createDetailHref(input: {
  attendanceId: number;
  filters: AttendanceListSearchParams;
}): string {
  const params = new URLSearchParams();

  if (input.filters.q) {
    params.set("q", input.filters.q);
  }

  if (input.filters.status !== "ALL") {
    params.set("status", input.filters.status);
  }

  if (input.filters.source !== "ALL") {
    params.set("source", input.filters.source);
  }

  if (input.filters.dateFrom) {
    params.set("dateFrom", input.filters.dateFrom);
  }

  if (input.filters.dateTo) {
    params.set("dateTo", input.filters.dateTo);
  }

  params.set("page", String(input.filters.page));
  params.set("pageSize", String(input.filters.pageSize));
  params.set("detailId", String(input.attendanceId));

  return `/dashboard/attendance?${params.toString()}`;
}

export function AttendanceTable({ records, filters }: AttendanceTableProps) {
  return (
    <section className="starland-card overflow-hidden">
      <div className="border-b border-[var(--starland-border)] px-5 py-4">
        <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
          Attendance Records
        </h2>
        <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
          Records are loaded with server-side filters and pagination.
        </p>
      </div>

      <div className="starland-scroll-x">
        <table className="starland-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Employee</th>
              <th>Department</th>
              <th>Schedule</th>
              <th>Time In</th>
              <th>Time Out</th>
              <th>Total</th>
              <th>Source</th>
              <th>Branch</th>
              <th>Status</th>
              <th>Flags</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {records.length > 0 ? (
              records.map((record) => (
                <tr key={record.attendanceId}>
                  <td className="font-bold text-[var(--starland-dark-text)]">
                    {record.attDate}
                  </td>
                  <td>
                    <p className="font-bold text-[var(--starland-dark-text)]">
                      {record.employeeName}
                    </p>
                    <p className="mt-1 text-xs text-[var(--starland-muted-text)]">
                      {record.empNumber}
                    </p>
                  </td>
                  <td>{record.departmentName}</td>
                  <td>{record.scheduleName}</td>
                  <td>{record.timeIn}</td>
                  <td>{record.timeOut}</td>
                  <td>{record.totalHours}</td>
                  <td>{record.source}</td>
                  <td>{record.branchName}</td>
                  <td>
                    <AttendanceStatusBadge status={record.status} />
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {record.isManual ? (
                        <span className="starland-badge starland-badge-warning">
                          MANUAL
                        </span>
                      ) : null}

                      {!record.isSynced ? (
                        <span className="starland-badge starland-badge-info">
                          UNSYNCED
                        </span>
                      ) : null}

                      {!record.isManual && record.isSynced ? (
                        <span className="text-sm text-[var(--starland-muted-text)]">
                          —
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td>
                    <Link
                      href={createDetailHref({
                        attendanceId: record.attendanceId,
                        filters,
                      })}
                      className="starland-btn starland-btn-secondary starland-btn-sm"
                    >
                      <Eye className="h-4 w-4" aria-hidden="true" />
                      View
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={12}>
                  <div className="rounded-2xl border border-dashed border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-6 text-center">
                    <p className="font-bold text-[var(--starland-dark-text)]">
                      No attendance records found
                    </p>
                    <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
                      Try changing the date range, status, source, or search
                      keyword.
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