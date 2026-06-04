import { Archive } from "lucide-react";
import { archiveAttendanceExceptionAction } from "../server/attendance-exception-actions";
import type { AttendanceExceptionResult } from "../types/attendance-exception-types";

type AttendanceExceptionTableProps = {
  result: AttendanceExceptionResult;
};

function formatTypeLabel(value: string): string {
  return value.replaceAll("_", " ");
}

function statusBadgeClass(status: string): string {
  if (status === "ACTIVE") {
    return "starland-badge-success";
  }

  if (status === "ARCHIVED") {
    return "starland-badge-warning";
  }

  return "starland-badge-info";
}

export function AttendanceExceptionTable({
  result,
}: AttendanceExceptionTableProps) {
  return (
    <section className="starland-card overflow-hidden">
      <div className="border-b border-[var(--starland-border)] px-5 py-4">
        <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
          Exception Dates
        </h2>

        <p className="mt-1 text-sm leading-6 text-[var(--starland-muted-text)]">
          Active exception dates will be used by absence generation in the next
          integration step.
        </p>
      </div>

      <div className="starland-scroll-x">
        <table className="starland-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Branch</th>
              <th>Type</th>
              <th>Title</th>
              <th>Absence Rule</th>
              <th>Status</th>
              <th>Created</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {result.records.length > 0 ? (
              result.records.map((record) => (
                <tr key={record.exceptionId}>
                  <td>
                    <p className="font-bold text-[var(--starland-dark-text)]">
                      {record.exceptionDate}
                    </p>
                  </td>

                  <td>{record.branchName}</td>

                  <td>
                    <span className="starland-badge starland-badge-info">
                      {formatTypeLabel(record.exceptionType)}
                    </span>
                  </td>

                  <td>
                    <p className="font-bold text-[var(--starland-dark-text)]">
                      {record.title}
                    </p>

                    <p className="mt-1 max-w-xs text-xs leading-5 text-[var(--starland-muted-text)]">
                      {record.description}
                    </p>
                  </td>

                  <td>
                    {record.affectsAbsenceGeneration ? (
                      <span className="starland-badge starland-badge-danger">
                        EXCLUDE ABSENT
                      </span>
                    ) : (
                      <span className="starland-badge starland-badge-warning">
                        INFO ONLY
                      </span>
                    )}
                  </td>

                  <td>
                    <span
                      className={[
                        "starland-badge",
                        statusBadgeClass(record.status),
                      ].join(" ")}
                    >
                      {record.status}
                    </span>
                  </td>

                  <td>{record.createdAt}</td>

                  <td>
                    {record.status === "ACTIVE" ? (
                      <form action={archiveAttendanceExceptionAction}>
                        <input
                          type="hidden"
                          name="exceptionId"
                          value={record.exceptionId}
                        />

                        <button
                          type="submit"
                          className="starland-btn starland-btn-soft starland-btn-sm"
                        >
                          <Archive className="h-4 w-4" aria-hidden="true" />
                          Archive
                        </button>
                      </form>
                    ) : (
                      <span className="text-sm font-semibold text-[var(--starland-muted-text)]">
                        —
                      </span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8}>
                  <div className="rounded-2xl border border-dashed border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-6 text-center">
                    <p className="font-bold text-[var(--starland-dark-text)]">
                      No attendance exceptions found
                    </p>

                    <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
                      Add a holiday, suspension, no-work day, or rest day first.
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