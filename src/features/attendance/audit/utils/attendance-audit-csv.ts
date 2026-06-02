import type { AttendanceAuditResult } from "../types/attendance-audit-types";

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

export function buildAttendanceAuditCsv(result: AttendanceAuditResult): string {
  const summaryRows = [
    ["Attendance Audit Trail"],
    ["Search", result.filters.q || "—"],
    ["Action", result.filters.action],
    ["Total Logs", result.pagination.totalItems],
    ["Page", result.pagination.page],
    ["Page Size", result.pagination.pageSize],
    [],
  ];

  const headers = [
    "Log ID",
    "Actor User ID",
    "Action",
    "Entity Type",
    "Attendance ID",
    "Created At",
    "Old Value",
    "New Value",
  ];

  const rows = result.records.map((record) => [
    record.logId,
    record.actorUserId ?? "—",
    record.action,
    record.entityType,
    record.entityId,
    record.createdAt,
    record.oldValue,
    record.newValue,
  ]);

  return [
    ...summaryRows.map((row) => row.map(escapeCsvValue).join(",")),
    headers.map(escapeCsvValue).join(","),
    ...rows.map((row) => row.map(escapeCsvValue).join(",")),
  ].join("\r\n");
}

export function buildAttendanceAuditFileName(
  result: AttendanceAuditResult,
): string {
  const actionPart = safeFilePart(result.filters.action || "all");
  const searchPart = result.filters.q ? safeFilePart(result.filters.q) : "all";

  return `attendance-audit-${actionPart}-${searchPart}.csv`;
}