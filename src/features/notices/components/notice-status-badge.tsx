import type { NoticeStatusValue } from "../types/notice-types";

type NoticeStatusBadgeProps = {
  status: NoticeStatusValue;
};

const statusClassMap: Record<NoticeStatusValue, string> = {
  DRAFT: "starland-badge-warning",
  PUBLISHED: "starland-badge-success",
  ARCHIVED: "starland-badge-danger",
};

export function NoticeStatusBadge({ status }: NoticeStatusBadgeProps) {
  return (
    <span className={["starland-badge", statusClassMap[status]].join(" ")}>
      {status}
    </span>
  );
}