import type { AbsenceRecordResult } from "../types/absence-record-types";

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

export function buildAbsenceRecordsCsv(result: AbsenceRecordResult): string {
  const summaryRows: Array<Array<string | number | boolean | null | undefined>> =
    [
      ["Generated ABSENT Records"],
      ["Search", result.filters.q || "—"],
      ["Date From", result.filters.dateFrom || "—"],
      ["Date To", result.filters.dateTo || "—"],
      ["Branch ID", result.filters.branchId || "All"],
      ["Department ID", result.filters.departmentId || "All"],
      ["Schedule ID", result.filters.scheduleId || "All"],
      ["Total ABSENT Records", result.summary.totalAbsences],
      ["Automatic ABSENT Records", result.summary.automaticAbsences],
      ["Manual ABSENT Records", result.summary.manualAbsences],
      ["Current Page Records", result.summary.currentPageRecords],
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
    "Manual",
    "Created At",
  ];

  const rows = result.records.map((record) => [
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
    record.isManual ? "YES" : "NO",
    record.createdAt,
  ]);

  return [
    ...summaryRows.map((row) => row.map(escapeCsvValue).join(",")),
    headers.map(escapeCsvValue).join(","),
    ...rows.map((row) => row.map(escapeCsvValue).join(",")),
  ].join("\r\n");
}

export function buildAbsenceRecordsFileName(
  result: AbsenceRecordResult,
): string {
  const datePart = safeFilePart(
    `${result.filters.dateFrom || "all"}-${result.filters.dateTo || "all"}`,
  );
  const searchPart = result.filters.q ? safeFilePart(result.filters.q) : "all";

  return `absent-records-${datePart}-${searchPart}.csv`;
}