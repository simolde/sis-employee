import type { AttendanceExceptionResult } from "../types/attendance-exception-types";

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

export function buildAttendanceExceptionsCsv(
  result: AttendanceExceptionResult,
): string {
  const summaryRows: Array<Array<string | number | boolean | null | undefined>> =
    [
      ["Attendance Exception Calendar"],
      ["Search", result.filters.q || "—"],
      ["Branch ID", result.filters.branchId || "All branches"],
      ["Type", result.filters.type || "All types"],
      ["Date From", result.filters.dateFrom || "—"],
      ["Date To", result.filters.dateTo || "—"],
      ["Active Only", result.filters.activeOnly ? "YES" : "NO"],
      ["Active Exceptions", result.summary.totalActiveExceptions],
      ["Matching Exceptions", result.summary.totalMatchingExceptions],
      ["Affects ABSENT Generation", result.summary.affectsAbsenceGeneration],
      ["Current Page Records", result.summary.currentPageRecords],
      [],
    ];

  const headers = [
    "Exception ID",
    "Date",
    "Branch",
    "Type",
    "Title",
    "Description",
    "Affects ABSENT Generation",
    "Status",
    "Created At",
  ];

  const rows = result.records.map((record) => [
    record.exceptionId,
    record.exceptionDate,
    record.branchName,
    record.exceptionType,
    record.title,
    record.description,
    record.affectsAbsenceGeneration ? "YES" : "NO",
    record.status,
    record.createdAt,
  ]);

  return [
    ...summaryRows.map((row) => row.map(escapeCsvValue).join(",")),
    headers.map(escapeCsvValue).join(","),
    ...rows.map((row) => row.map(escapeCsvValue).join(",")),
  ].join("\r\n");
}

export function buildAttendanceExceptionsFileName(
  result: AttendanceExceptionResult,
): string {
  const datePart = safeFilePart(
    `${result.filters.dateFrom || "all"}-${result.filters.dateTo || "all"}`,
  );
  const typePart = result.filters.type
    ? safeFilePart(result.filters.type)
    : "all-types";
  const searchPart = result.filters.q ? safeFilePart(result.filters.q) : "all";

  return `attendance-exceptions-${datePart}-${typePart}-${searchPart}.csv`;
}