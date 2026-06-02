import type { AttendanceReviewQueueResult } from "../types/attendance-review-queue-types";

function escapeCsvValue(value: string | number | boolean): string {
  const text = String(value);
  const escaped = text.replaceAll('"', '""');

  return `"${escaped}"`;
}

function safeFilePart(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

export function buildAttendanceReviewQueueCsv(
  result: AttendanceReviewQueueResult,
): string {
  const summaryRows = [
    ["Attendance Review Queue"],
    ["Search", result.filters.q || "—"],
    ["Date From", result.filters.dateFrom || "—"],
    ["Date To", result.filters.dateTo || "—"],
    ["Review Status", result.filters.reviewStatus],
    ["Total Review Required", result.summary.totalReviewRequired],
    ["Open Review", result.summary.openReview],
    ["Verified Not Approved", result.summary.verifiedNotApproved],
    ["Approved", result.summary.approved],
    [],
  ];

  const headers = [
    "Attendance ID",
    "Employee Number",
    "Employee Name",
    "Branch",
    "Department",
    "Schedule",
    "Attendance Date",
    "Time In",
    "Time Out",
    "Source",
    "Attendance Status",
    "Total Hours",
    "Review Reason",
    "Is Manual",
    "Verified By",
    "Verified At",
    "Approved By",
    "Approved At",
    "Latest Review Log",
  ];

  const rows = result.records.map((record) => [
    record.attendanceId,
    record.empNumber,
    record.employeeName,
    record.branchName,
    record.departmentName,
    record.scheduleName,
    record.attDate,
    record.timeIn,
    record.timeOut,
    record.source,
    record.attendanceStatus,
    record.totalHours,
    record.reviewReason,
    record.isManual ? "YES" : "NO",
    record.verifiedBy,
    record.verifiedAt,
    record.approvedBy,
    record.approvedAt,
    record.latestReviewLog,
  ]);

  return [
    ...summaryRows.map((row) => row.map(escapeCsvValue).join(",")),
    headers.map(escapeCsvValue).join(","),
    ...rows.map((row) => row.map(escapeCsvValue).join(",")),
  ].join("\r\n");
}

export function buildAttendanceReviewQueueFileName(
  result: AttendanceReviewQueueResult,
): string {
  const datePart = safeFilePart(
    `${result.filters.dateFrom || "all"}-${result.filters.dateTo || "all"}`,
  );
  const statusPart = safeFilePart(result.filters.reviewStatus);

  return `attendance-review-queue-${datePart}-${statusPart || "open"}.csv`;
}