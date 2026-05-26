import Link from "next/link";
import { Eye } from "lucide-react";
import type { MyAttendanceListResult } from "../types/attendance-types";
import { AttendanceStatusBadge } from "./attendance-status-badge";

type MyAttendanceTableProps = {
  result: MyAttendanceListResult;
};

function createPageHref(page: number): string {
  const params = new URLSearchParams();

  params.set("page", String(page));
  params.set("pageSize", "10");

  return `/dashboard/attendance?${params.toString()}`;
}

function createDetailHref(attendanceId: number): string {
  const params = new URLSearchParams();

  params.set("detailId", String(attendanceId));

  return `/dashboard/attendance?${params.toString()}`;
}

export function MyAttendanceTable({ result }: MyAttendanceTableProps) {
  return (
    <section className="starland-card overflow-hidden">
      <div className="border-b border-[var(--starland-border)] px-5 py-4">
        <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
          My Attendance History
        </h2>
        <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
          Only your own web/RFID/biometric attendance records are shown here.
        </p>
      </div>

      <div className="starland-scroll-x">
        <table className="starland-table">
          <thead>
            <tr>
              <th>Date</th>
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
            {result.records.length > 0 ? (
              result.records.map((record) => (
                <tr key={record.attendanceId}>
                  <td className="font-bold text-[var(--starland-dark-text)]">
                    {record.attDate}
                  </td>
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
                      href={createDetailHref(record.attendanceId)}
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
                <td colSpan={10}>
                  <div className="rounded-2xl border border-dashed border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-6 text-center">
                    <p className="font-bold text-[var(--starland-dark-text)]">
                      No attendance records yet
                    </p>
                    <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
                      Your attendance history will appear here after time-in.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="border-t border-[var(--starland-border)] p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[var(--starland-muted-text)]">
            Page{" "}
            <span className="font-bold text-[var(--starland-dark-text)]">
              {result.pagination.page}
            </span>{" "}
            of{" "}
            <span className="font-bold text-[var(--starland-dark-text)]">
              {result.pagination.totalPages}
            </span>
          </p>

          <div className="flex gap-2">
            {result.pagination.hasPreviousPage ? (
              <Link
                href={createPageHref(result.pagination.page - 1)}
                className="starland-btn starland-btn-secondary starland-btn-sm"
              >
                Previous
              </Link>
            ) : (
              <span className="starland-btn starland-btn-secondary starland-btn-sm">
                Previous
              </span>
            )}

            {result.pagination.hasNextPage ? (
              <Link
                href={createPageHref(result.pagination.page + 1)}
                className="starland-btn starland-btn-secondary starland-btn-sm"
              >
                Next
              </Link>
            ) : (
              <span className="starland-btn starland-btn-secondary starland-btn-sm">
                Next
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}