import type { EmployeeDetail } from "../types/employee-types";

type EmployeeRecentAttendanceTableProps = {
  records: EmployeeDetail["recentAttendance"];
};

function getStatusClass(status: string): string {
  if (status === "ON_TIME") {
    return "starland-badge-success";
  }

  if (status === "LATE" || status === "HALF_DAY") {
    return "starland-badge-warning";
  }

  if (status === "MISSING_TIMEOUT" || status === "ABSENT") {
    return "starland-badge-danger";
  }

  return "starland-badge-info";
}

export function EmployeeRecentAttendanceTable({
  records,
}: EmployeeRecentAttendanceTableProps) {
  return (
    <section className="starland-card overflow-hidden">
      <div className="border-b border-[var(--starland-border)] px-5 py-4">
        <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
          Recent Attendance
        </h2>
        <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
          Latest attendance records for this employee.
        </p>
      </div>

      <div className="starland-scroll-x">
        <table className="starland-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Time In</th>
              <th>Time Out</th>
              <th>Total Hours</th>
              <th>Source</th>
              <th>Branch</th>
              <th>Status</th>
            </tr>
          </thead>

          <tbody>
            {records.length > 0 ? (
              records.map((record) => (
                <tr key={record.attendanceId}>
                  <td className="font-bold text-[var(--starland-dark-text)]">
                    {record.attDate}
                  </td>
                  <td>{record.timeIn}</td>
                  <td>{record.timeOut}</td>
                  <td>{record.totalHours}</td>
                  <td>{record.source}</td>
                  <td>{record.branch}</td>
                  <td>
                    <span
                      className={[
                        "starland-badge",
                        getStatusClass(record.status),
                      ].join(" ")}
                    >
                      {record.status.replaceAll("_", " ")}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7}>
                  <div className="rounded-2xl border border-dashed border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-6 text-center">
                    <p className="font-bold text-[var(--starland-dark-text)]">
                      No attendance records yet
                    </p>
                    <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
                      Recent time-in and time-out records will appear here.
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