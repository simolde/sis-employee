import type { ExcusedRecordResult } from "../types/excused-record-types";

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

export function buildExcusedRecordsCsv(
  result: ExcusedRecordResult,
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
    ["EXCUSED Attendance Records"],
    ["Search", result.filters.q || "—"],
    [
      "Branch ID",
      result.filters.branchId || "All",
    ],
    [
      "Department ID",
      result.filters.departmentId || "All",
    ],
    [
      "Schedule ID",
      result.filters.scheduleId || "All",
    ],
    [
      "Source",
      result.filters.source || "All",
    ],
    [
      "Date From",
      result.filters.dateFrom || "—",
    ],
    [
      "Date To",
      result.filters.dateTo || "—",
    ],
    [
      "Total EXCUSED",
      result.summary.totalExcused,
    ],
    [
      "Matching EXCUSED",
      result.summary.matchingExcused,
    ],
    [
      "Automatic EXCUSED",
      result.summary.automaticExcused,
    ],
    [
      "Manual EXCUSED",
      result.summary.manualExcused,
    ],
    [
      "Linked Approved Leave",
      result.summary.linkedApprovedLeave,
    ],
    [
      "Current Page Records",
      result.summary.currentPageRecords,
    ],
    ["Page", result.pagination.page],
    ["Page Size", result.pagination.pageSize],
    [],
  ];

  const headers = [
    "Attendance ID",
    "Employee ID",
    "Employee Number",
    "Employee Name",
    "Employee Status",
    "Branch",
    "Department",
    "Schedule",
    "Shift Time",
    "Attendance Date",
    "Status",
    "Source",
    "Leave ID",
    "Leave Type",
    "Leave Date From",
    "Leave Date To",
    "Created At",
  ];

  const rows = result.records.map(
    (record) => [
      record.attendanceId,
      record.empId,
      record.empNumber,
      record.employeeName,
      record.employeeStatus,
      record.branchName,
      record.departmentName,
      record.scheduleName,
      record.shiftTime,
      record.attDate,
      record.status,
      record.sourceLabel,
      record.leave?.leaveId ?? "—",
      record.leave?.leaveTypeName ?? "—",
      record.leave?.dateFrom ?? "—",
      record.leave?.dateTo ?? "—",
      record.createdAt,
    ],
  );

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

export function buildExcusedRecordsFileName(
  result: ExcusedRecordResult,
): string {
  const datePart = safeFilePart(
    `${result.filters.dateFrom || "all"}-${
      result.filters.dateTo || "all"
    }`,
  );

  const sourcePart = result.filters.source
    ? safeFilePart(result.filters.source)
    : "all-sources";

  const searchPart = result.filters.q
    ? safeFilePart(result.filters.q)
    : "all";

  return `excused-records-${datePart}-${sourcePart}-${searchPart}.csv`;
}