import type { AttendanceExceptionAuditResult } from "../types/attendance-exception-audit-types";

function escapeCsvValue(
  value: string | number | boolean | null | undefined,
): string {
  const text = String(value ?? "—");
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

export function buildAttendanceExceptionAuditCsv(
  result: AttendanceExceptionAuditResult,
): string {
  const summaryRows: Array<Array<string | number | boolean | null | undefined>> =
    [
      ["Attendance Exception Audit"],
      ["Search", result.filters.q || "—"],
      ["Action", result.filters.action || "All actions"],
      ["Date From", result.filters.dateFrom || "—"],
      ["Date To", result.filters.dateTo || "—"],
      ["Total Logs", result.summary.totalLogs],
      ["Matching Logs", result.summary.matchingLogs],
      ["Created Logs", result.summary.createdLogs],
      ["Updated Logs", result.summary.updatedLogs],
      ["Archived Logs", result.summary.archivedLogs],
      ["Current Page Records", result.summary.currentPageRecords],
      ["Page", result.pagination.page],
      ["Page Size", result.pagination.pageSize],
      [],
    ];

  const headers = [
    "Activity Log ID",
    "Actor User ID",
    "Action",
    "Entity Type",
    "Entity ID",
    "Old Value",
    "New Value",
    "Created At",
  ];

  const rows = result.records.map((record) => [
    record.activityLogId,
    record.actorUserId ?? "—",
    record.action,
    record.entityType,
    record.entityId,
    record.oldValueText,
    record.newValueText,
    record.createdAt,
  ]);

  return [
    ...summaryRows.map((row) => row.map(escapeCsvValue).join(",")),
    headers.map(escapeCsvValue).join(","),
    ...rows.map((row) => row.map(escapeCsvValue).join(",")),
  ].join("\r\n");
}

export function buildAttendanceExceptionAuditFileName(
  result: AttendanceExceptionAuditResult,
): string {
  const datePart = safeFilePart(
    `${result.filters.dateFrom || "all"}-${result.filters.dateTo || "all"}`,
  );
  const actionPart = result.filters.action
    ? safeFilePart(result.filters.action)
    : "all-actions";
  const searchPart = result.filters.q ? safeFilePart(result.filters.q) : "all";

  return `attendance-exception-audit-${datePart}-${actionPart}-${searchPart}.csv`;
}