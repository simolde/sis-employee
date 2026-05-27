export function getLeaveNoticeMessage(notice: string): string {
  const noticeMap: Record<string, string> = {
    "leave-approved": "Leave request approved successfully.",
    "leave-rejected": "Leave request rejected successfully.",
    "leave-cancelled": "Leave request cancelled successfully.",
    "leave-reversed":
      "Approved leave was reversed successfully. Paid leave balance was restored when applicable.",
    "insufficient-leave-balance":
      "Cannot approve this paid leave request because the employee has insufficient leave balance.",
  };

  return noticeMap[notice] ?? "";
}