import type { ExcusedAutomationAuditResult } from "../types/excused-audit-types";

function escapeCsvValue(
  value:
    | string
    | number
    | boolean
    | null
    | undefined,
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

export function buildExcusedAutomationAuditCsv(
  result: ExcusedAutomationAuditResult,
): string {
  const summaryRows: Array<
    Array<
      | string
      | number
      | boolean
      | null
      | undefined
    >
  > = [
    ["EXCUSED Attendance Automation Audit"],
    ["Search", result.filters.q || "—"],
    [
      "Action",
      result.filters.action || "All EXCUSED automation actions",
    ],
    ["Date From", result.filters.dateFrom || "—"],
    ["Date To", result.filters.dateTo || "—"],
    [
      "Total Automation Logs",
      result.summary.totalAutomationLogs,
    ],
    ["Matching Logs", result.summary.matchingLogs],
    ["Generated Logs", result.summary.generatedLogs],
    ["Rollback Logs", result.summary.rollbackLogs],
    [
      "Current Page Records",
      result.summary.currentPageRecords,
    ],
    ["Page", result.pagination.page],
    ["Page Size", result.pagination.pageSize],
    [],
  ];

  const headers = [
    "Activity Log ID",
    "Actor User ID",
    "Action",
    "Attendance Entity ID",
    "Old Value",
    "New Value",
    "Created At",
  ];

  const rows = result.records.map((record) => [
    record.activityLogId,
    record.actorUserId ?? "—",
    record.action,
    record.entityId,
    record.oldValueText,
    record.newValueText,
    record.createdAt,
  ]);

  return [
    ...summaryRows.map((row) =>
      row.map(escapeCsvValue).join(","),
    ),
    headers.map(escapeCsvValue).join(","),
    ...rows.map((row) =>
      row.map(escapeCsvValue).join(","),
    ),
  ].join("\r\n");
}

export function buildExcusedAutomationAuditFileName(
  result: ExcusedAutomationAuditResult,
): string {
  const datePart = safeFilePart(
    `${result.filters.dateFrom || "all"}-${
      result.filters.dateTo || "all"
    }`,
  );

  const actionPart = result.filters.action
    ? safeFilePart(result.filters.action)
    : "all-actions";

  const searchPart = result.filters.q
    ? safeFilePart(result.filters.q)
    : "all";

  return `excused-automation-audit-${datePart}-${actionPart}-${searchPart}-page-${result.pagination.page}.csv`;
}