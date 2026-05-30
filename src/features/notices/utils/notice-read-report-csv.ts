import type { NoticeReadReportData } from "../types/notice-types";

function escapeCsvValue(value: string | number | boolean): string {
  const text = String(value);
  const escaped = text.replaceAll('"', '""');

  return `"${escaped}"`;
}

export function buildNoticeReadReportCsv(data: NoticeReadReportData): string {
  const headers = [
    "Notice ID",
    "Notice Title",
    "Audience",
    "Branch",
    "Department",
    "Notice Status",
    "Published At",
    "Expires At",
    "User ID",
    "Username",
    "Email",
    "Employee Name",
    "Role",
    "User Branch",
    "User Department",
    "Read Status",
    "Read At",
  ];

  const rows = data.recipients.map((recipient) => [
    data.notice.noticeId,
    data.notice.title,
    data.notice.audience,
    data.notice.branchName,
    data.notice.departmentName,
    data.notice.status,
    data.notice.publishedAt,
    data.notice.expiresAt,
    recipient.userId,
    recipient.username,
    recipient.email,
    recipient.employeeName,
    recipient.roleName,
    recipient.branchName,
    recipient.departmentName,
    recipient.hasRead ? "READ" : "UNREAD",
    recipient.readAt,
  ]);

  return [
    headers.map(escapeCsvValue).join(","),
    ...rows.map((row) => row.map(escapeCsvValue).join(",")),
  ].join("\r\n");
}

export function buildNoticeReadReportFileName(
  data: NoticeReadReportData,
): string {
  const safeTitle = data.notice.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);

  return `notice-read-report-${data.notice.noticeId}-${safeTitle || "report"}.csv`;
}