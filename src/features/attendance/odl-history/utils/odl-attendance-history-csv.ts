import type { OdlAttendanceHistoryResult } from "../types/odl-attendance-history-types";

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

export function buildOdlAttendanceHistoryCsv(
  result: OdlAttendanceHistoryResult,
): string {
  const summaryRows = [
    ["My ODL Attendance History"],
    ["Employee", result.employee?.fullName ?? "No employee profile linked"],
    ["Employee Number", result.employee?.empNumber ?? "—"],
    ["Department", result.employee?.departmentName ?? "—"],
    ["Designation", result.employee?.designationName ?? "—"],
    ["Branch", result.employee?.branchName ?? "—"],
    ["Date From", result.filters.dateFrom || "—"],
    ["Date To", result.filters.dateTo || "—"],
    ["Total ODL Records", result.summary.totalRecords],
    ["Completed", result.summary.completedRecords],
    ["Late", result.summary.lateRecords],
    ["Missing Timeout", result.summary.missingTimeoutRecords],
    ["Current Page", result.pagination.page],
    ["Page Size", result.pagination.pageSize],
    [],
  ];

  const headers = [
    "Attendance ID",
    "Date",
    "Time In",
    "Time Out",
    "Source",
    "Status",
    "Total Hours",
    "Manual",
  ];

  const rows = result.records.map((record) => [
    record.attendanceId,
    record.attDate,
    record.timeIn,
    record.timeOut,
    record.source,
    record.status,
    record.totalHours,
    record.isManual ? "YES" : "NO",
  ]);

  return [
    ...summaryRows.map((row) => row.map(escapeCsvValue).join(",")),
    headers.map(escapeCsvValue).join(","),
    ...rows.map((row) => row.map(escapeCsvValue).join(",")),
  ].join("\r\n");
}

export function buildOdlAttendanceHistoryFileName(
  result: OdlAttendanceHistoryResult,
): string {
  const employeePart = safeFilePart(result.employee?.empNumber ?? "employee");
  const datePart = safeFilePart(
    `${result.filters.dateFrom || "all"}-${result.filters.dateTo || "all"}`,
  );

  return `odl-attendance-history-${employeePart}-${datePart}.csv`;
}