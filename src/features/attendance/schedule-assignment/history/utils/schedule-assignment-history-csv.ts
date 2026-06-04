import type { ScheduleAssignmentHistoryResult } from "../types/schedule-assignment-history-types";

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

export function buildScheduleAssignmentHistoryCsv(
  result: ScheduleAssignmentHistoryResult,
): string {
  const summaryRows: Array<Array<string | number | boolean | null | undefined>> =
    [
      ["Employee Schedule Assignment History"],
      ["Search", result.filters.q || "—"],
      ["State", result.filters.state],
      ["Created From", result.filters.dateFrom || "—"],
      ["Created To", result.filters.dateTo || "—"],
      ["Matching Assignments", result.summary.totalMatchingAssignments],
      ["Current Assignments", result.summary.activeAssignments],
      ["Closed Assignments", result.summary.inactiveAssignments],
      ["Current Page Records", result.summary.currentPageRecords],
      ["Page", result.pagination.page],
      ["Page Size", result.pagination.pageSize],
      [],
    ];

  const headers = [
    "Assignment ID",
    "Employee ID",
    "Employee Number",
    "Employee Name",
    "Employee Status",
    "Branch",
    "Department",
    "Schedule",
    "Shift Time",
    "Valid From",
    "Valid To",
    "Current Assignment",
    "Assigned By",
    "Assigned By Email",
    "Created At",
    "Remarks",
  ];

  const rows = result.records.map((record) => [
    record.assignmentId,
    record.empId,
    record.empNumber,
    record.employeeName,
    record.employeeStatus,
    record.branchName,
    record.departmentName,
    record.scheduleName,
    record.shiftTime,
    record.validFrom,
    record.validTo,
    record.isActive ? "YES" : "NO",
    record.assignedByName,
    record.assignedByEmail,
    record.createdAt,
    record.remarks,
  ]);

  return [
    ...summaryRows.map((row) => row.map(escapeCsvValue).join(",")),
    headers.map(escapeCsvValue).join(","),
    ...rows.map((row) => row.map(escapeCsvValue).join(",")),
  ].join("\r\n");
}

export function buildScheduleAssignmentHistoryFileName(
  result: ScheduleAssignmentHistoryResult,
): string {
  const statePart = safeFilePart(result.filters.state || "all");
  const searchPart = result.filters.q ? safeFilePart(result.filters.q) : "all";
  const datePart = safeFilePart(
    `${result.filters.dateFrom || "all"}-${result.filters.dateTo || "all"}`,
  );

  return `schedule-assignment-history-${statePart}-${datePart}-${searchPart}.csv`;
}