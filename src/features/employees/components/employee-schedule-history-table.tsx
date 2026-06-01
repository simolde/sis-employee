import type { EmployeeScheduleHistoryData } from "../types/employee-schedule-history-types";

type EmployeeScheduleHistoryTableProps = {
  data: EmployeeScheduleHistoryData;
};

function AssignmentStatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <span
      className={[
        "starland-badge",
        isActive ? "starland-badge-success" : "starland-badge-warning",
      ].join(" ")}
    >
      {isActive ? "ACTIVE" : "INACTIVE"}
    </span>
  );
}

export function EmployeeScheduleHistoryTable({
  data,
}: EmployeeScheduleHistoryTableProps) {
  return (
    <section className="starland-card overflow-hidden">
      <div className="border-b border-[var(--starland-border)] px-5 py-4">
        <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
          Schedule Assignment History
        </h2>

        <p className="mt-1 text-sm leading-6 text-[var(--starland-muted-text)]">
          Shows the current and previous schedule assignments for this employee.
        </p>
      </div>

      <div className="starland-scroll-x">
        <table className="starland-table">
          <thead>
            <tr>
              <th>Schedule</th>
              <th>Shift</th>
              <th>Days</th>
              <th>Validity</th>
              <th>Status</th>
              <th>Assigned By</th>
              <th>Remarks</th>
              <th>Created</th>
              <th>Updated</th>
            </tr>
          </thead>

          <tbody>
            {data.assignments.length > 0 ? (
              data.assignments.map((assignment) => (
                <tr key={assignment.assignmentId}>
                  <td>
                    <p className="font-bold text-[var(--starland-dark-text)]">
                      {assignment.scheduleName}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-[var(--starland-muted-text)]">
                      {assignment.scheduleCode}
                    </p>
                  </td>

                  <td>
                    <p className="font-bold text-[var(--starland-dark-text)]">
                      {assignment.shiftName}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-[var(--starland-muted-text)]">
                      {assignment.shiftCode} · {assignment.shiftTime}
                    </p>
                  </td>

                  <td>{assignment.daysOfWeek}</td>

                  <td>
                    <p className="font-semibold text-[var(--starland-dark-text)]">
                      From: {assignment.validFrom}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-[var(--starland-muted-text)]">
                      To: {assignment.validTo}
                    </p>
                  </td>

                  <td>
                    <AssignmentStatusBadge isActive={assignment.isActive} />
                  </td>

                  <td>{assignment.assignedBy}</td>
                  <td>{assignment.remarks}</td>
                  <td>{assignment.createdAt}</td>
                  <td>{assignment.updatedAt}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9}>
                  <div className="rounded-2xl border border-dashed border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-6 text-center">
                    <p className="font-bold text-[var(--starland-dark-text)]">
                      No schedule assignment history
                    </p>

                    <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
                      Assign a schedule from the employee edit page to create a
                      history record.
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