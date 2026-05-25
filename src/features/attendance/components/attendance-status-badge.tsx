import { formatStatusLabel } from "@/lib/utils/formatting";
import type { AttendanceStatusValue } from "../types/attendance-types";

type AttendanceStatusBadgeProps = {
  status: AttendanceStatusValue;
};

const statusClassMap: Record<AttendanceStatusValue, string> = {
  ON_TIME: "starland-badge-success",
  LATE: "starland-badge-warning",
  HALF_DAY: "starland-badge-warning",
  ABSENT: "starland-badge-danger",
  EXCUSED: "starland-badge-info",
  PENDING_REVIEW: "starland-badge-info",
  MISSING_TIMEOUT: "starland-badge-danger",
};

export function AttendanceStatusBadge({ status }: AttendanceStatusBadgeProps) {
  return (
    <span className={["starland-badge", statusClassMap[status]].join(" ")}>
      {formatStatusLabel(status)}
    </span>
  );
}