import Link from "next/link";
import {
  approveLeaveRequestAction,
  cancelLeaveRequestAction,
  rejectLeaveRequestAction,
  reverseApprovedLeaveRequestAction,
} from "../server/leave-actions";
import type { LeavePageData } from "../types/leave-types";
import { LeaveStatusBadge } from "./leave-status-badge";

type LeaveTableProps = {
  data: LeavePageData;
};

function createPageHref(data: LeavePageData, page: number): string {
  const params = new URLSearchParams();

  if (data.filters.status !== "ALL") {
    params.set("status", data.filters.status);
  }

  params.set("page", String(page));
  params.set("pageSize", String(data.filters.pageSize));

  return `/dashboard/leaves?${params.toString()}`;
}

function ReviewActions({ leaveId }: { leaveId: number }) {
  const approveAction = approveLeaveRequestAction.bind(null, String(leaveId));
  const rejectAction = rejectLeaveRequestAction.bind(null, String(leaveId));

  return (
    <div className="space-y-2">
      <form action={approveAction}>
        <button
          type="submit"
          className="starland-btn starland-btn-primary starland-btn-sm w-full"
        >
          Approve
        </button>
      </form>

      <form action={rejectAction} className="space-y-2">
        <textarea
          name="rejectionReason"
          className="starland-input min-h-16 resize-y text-xs"
          placeholder="Required rejection reason"
        />
        <button
          type="submit"
          className="starland-btn starland-btn-danger starland-btn-sm w-full"
        >
          Reject
        </button>
      </form>
    </div>
  );
}

function CancelAction({ leaveId }: { leaveId: number }) {
  const cancelAction = cancelLeaveRequestAction.bind(null, String(leaveId));

  return (
    <form action={cancelAction}>
      <button
        type="submit"
        className="starland-btn starland-btn-danger starland-btn-sm"
      >
        Cancel
      </button>
    </form>
  );
}

function ReverseApprovedAction({ leaveId }: { leaveId: number }) {
  const reverseAction = reverseApprovedLeaveRequestAction.bind(
    null,
    String(leaveId),
  );

  return (
    <form action={reverseAction}>
      <button
        type="submit"
        className="starland-btn starland-btn-danger starland-btn-sm"
      >
        Reverse Approved
      </button>
    </form>
  );
}

export function LeaveTable({ data }: LeaveTableProps) {
  return (
    <section className="starland-card overflow-hidden">
      <div className="border-b border-[var(--starland-border)] px-5 py-4">
        <h2 className="text-lg font-extrabold text-[var(--starland-dark-text)]">
          {data.canManage ? "Leave Requests" : "My Leave Requests"}
        </h2>
        <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
          {data.canManage
            ? "Review, approve, reject, or reverse approved employee leave requests."
            : "Track your submitted leave requests and cancel pending requests."}
        </p>
      </div>

      <div className="border-b border-[var(--starland-border)] p-4">
        <form className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div>
            <label
              htmlFor="status"
              className="text-sm font-bold text-[var(--starland-dark-text)]"
            >
              Status
            </label>
            <select
              id="status"
              name="status"
              className="starland-input mt-2 min-w-48"
              defaultValue={data.filters.status}
            >
              <option value="ALL">All Status</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <input type="hidden" name="page" value="1" />
          <input type="hidden" name="pageSize" value={data.filters.pageSize} />

          <button type="submit" className="starland-btn starland-btn-primary">
            Filter
          </button>

          <Link href="/dashboard/leaves" className="starland-btn starland-btn-soft">
            Reset
          </Link>
        </form>
      </div>

      <div className="starland-scroll-x">
        <table className="starland-table">
          <thead>
            <tr>
              <th>Employee</th>
              <th>Leave Type</th>
              <th>Dates</th>
              <th>Total Days</th>
              <th>Reason</th>
              <th>Status</th>
              <th>Review</th>
              <th>Created</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {data.leaves.length > 0 ? (
              data.leaves.map((leave) => (
                <tr key={leave.leaveId}>
                  <td>
                    <p className="font-bold text-[var(--starland-dark-text)]">
                      {leave.employeeName}
                    </p>
                    <p className="mt-1 text-xs text-[var(--starland-muted-text)]">
                      {leave.empNumber} · {leave.departmentName}
                    </p>
                  </td>
                  <td>{leave.leaveTypeName}</td>
                  <td>
                    <p>{leave.dateFrom}</p>
                    <p className="text-xs text-[var(--starland-muted-text)]">
                      to {leave.dateTo}
                    </p>
                  </td>
                  <td>{leave.totalDays}</td>
                  <td className="max-w-sm">{leave.reason}</td>
                  <td>
                    <LeaveStatusBadge status={leave.status} />
                  </td>
                  <td>
                    <p className="font-semibold">{leave.approvedBy}</p>
                    <p className="mt-1 text-xs text-[var(--starland-muted-text)]">
                      {leave.approvedAt}
                    </p>
                    <p className="mt-1 text-xs text-[var(--starland-muted-text)]">
                      {leave.rejectionReason}
                    </p>
                  </td>
                  <td>{leave.createdAt}</td>
                  <td>
                    {leave.status === "PENDING" && data.canManage ? (
                      <ReviewActions leaveId={leave.leaveId} />
                    ) : null}

                    {leave.status === "PENDING" && !data.canManage ? (
                      <CancelAction leaveId={leave.leaveId} />
                    ) : null}

                    {leave.status === "APPROVED" && data.canManage ? (
                      <ReverseApprovedAction leaveId={leave.leaveId} />
                    ) : null}

                    {leave.status !== "PENDING" &&
                    !(leave.status === "APPROVED" && data.canManage) ? (
                      <span className="text-sm text-[var(--starland-muted-text)]">
                        —
                      </span>
                    ) : null}
                  </td>
                  <td>
                    {leave.attachment === "—" ? (
                      "—"
                    ) : (
                      <Link
                        href={`/${leave.attachment}`}
                        className="font-bold text-[var(--starland-main-green)] hover:underline"
                        target="_blank"
                      >
                        View Attachment
                      </Link>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9}>
                  <div className="rounded-2xl border border-dashed border-[var(--starland-border)] bg-[var(--starland-modern-bg)] p-6 text-center">
                    <p className="font-bold text-[var(--starland-dark-text)]">
                      No leave requests found
                    </p>
                    <p className="mt-1 text-sm text-[var(--starland-muted-text)]">
                      Submitted leave requests will appear here.
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
              {data.pagination.page}
            </span>{" "}
            of{" "}
            <span className="font-bold text-[var(--starland-dark-text)]">
              {data.pagination.totalPages}
            </span>{" "}
            · {data.pagination.totalItems} result
            {data.pagination.totalItems === 1 ? "" : "s"}
          </p>

          <div className="flex gap-2">
            {data.pagination.hasPreviousPage ? (
              <Link
                href={createPageHref(data, data.pagination.page - 1)}
                className="starland-btn starland-btn-secondary starland-btn-sm"
              >
                Previous
              </Link>
            ) : (
              <span
                aria-disabled="true"
                className="starland-btn starland-btn-secondary starland-btn-sm"
              >
                Previous
              </span>
            )}

            {data.pagination.hasNextPage ? (
              <Link
                href={createPageHref(data, data.pagination.page + 1)}
                className="starland-btn starland-btn-secondary starland-btn-sm"
              >
                Next
              </Link>
            ) : (
              <span
                aria-disabled="true"
                className="starland-btn starland-btn-secondary starland-btn-sm"
              >
                Next
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}