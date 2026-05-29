import type { NoticeReadReportData } from "../types/notice-types";

type NoticeReadReportTableProps = {
  data: NoticeReadReportData;
};

export function NoticeReadReportTable({ data }: NoticeReadReportTableProps) {
  return (
    <section className="starland-card overflow-hidden">
      <div className="border-b border-[var(--starland-border)] px-5 py-4">
        <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
          Read Report
        </h2>
        <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
          Shows expected recipients based on notice audience, branch, and
          department targeting.
        </p>
      </div>

      <div className="starland-scroll-x">
        <table className="starland-table">
          <thead>
            <tr>
              <th>Employee / User</th>
              <th>Role</th>
              <th>Branch</th>
              <th>Department</th>
              <th>Status</th>
              <th>Read At</th>
            </tr>
          </thead>

          <tbody>
            {data.recipients.length > 0 ? (
              data.recipients.map((recipient) => (
                <tr key={recipient.userId}>
                  <td>
                    <p className="font-bold text-[var(--starland-dark-text)]">
                      {recipient.employeeName}
                    </p>
                    <p className="mt-1 text-xs text-[var(--starland-muted-text)]">
                      {recipient.username} · {recipient.email}
                    </p>
                  </td>
                  <td>{recipient.roleName}</td>
                  <td>{recipient.branchName}</td>
                  <td>{recipient.departmentName}</td>
                  <td>
                    <span
                      className={[
                        "starland-badge",
                        recipient.hasRead
                          ? "starland-badge-success"
                          : "starland-badge-warning",
                      ].join(" ")}
                    >
                      {recipient.hasRead ? "READ" : "UNREAD"}
                    </span>
                  </td>
                  <td>{recipient.readAt}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6}>
                  <div className="rounded-2xl border border-dashed border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-6 text-center">
                    <p className="font-bold text-[var(--starland-dark-text)]">
                      No expected recipients found
                    </p>
                    <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
                      Check the selected audience, branch, department, and user
                      role setup.
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