import type { LeaveStatusValue } from "../types/leave-types";

type LeaveStatusBadgeProps = {
  status: LeaveStatusValue;
};

const statusClassMap: Record<LeaveStatusValue, string> = {
  PENDING: "starland-badge-warning",
  APPROVED: "starland-badge-success",
  REJECTED: "starland-badge-danger",
  CANCELLED: "starland-badge-info",
};

export function LeaveStatusBadge({ status }: LeaveStatusBadgeProps) {
  return (
    <span className={["starland-badge", statusClassMap[status]].join(" ")}>
      {status}
    </span>
  );
}