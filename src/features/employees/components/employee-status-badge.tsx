import { formatStatusLabel } from "@/lib/utils/formatting";
import type { EmployeeStatusValue } from "../types/employee-types";

type EmployeeStatusBadgeProps = {
  status: EmployeeStatusValue;
};

const statusClassMap: Record<EmployeeStatusValue, string> = {
  ACTIVE: "starland-badge-success",
  INACTIVE: "starland-badge-info",
  RESIGNED: "starland-badge-warning",
  TERMINATED: "starland-badge-danger",
  ON_LEAVE: "starland-badge-warning",
};

export function EmployeeStatusBadge({ status }: EmployeeStatusBadgeProps) {
  return (
    <span className={["starland-badge", statusClassMap[status]].join(" ")}>
      {formatStatusLabel(status)}
    </span>
  );
}