import type { AbsenceCandidateResult } from "../types/absence-candidate-types";

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

export function buildAbsenceCandidatesCsv(
  result: AbsenceCandidateResult,
): string {
  const summaryRows: Array<Array<string | number | boolean | null | undefined>> =
    [
      ["Absence Candidates Preview"],
      ["Selected Date", result.summary.selectedDate],
      ["Search", result.filters.q || "—"],
      ["Branch ID", result.filters.branchId || "All"],
      ["Department ID", result.filters.departmentId || "All"],
      ["Schedule ID", result.filters.scheduleId || "All"],
      ["Active Only", result.filters.activeOnly ? "YES" : "NO"],
      ["Scheduled Employees", result.summary.scheduledEmployees],
      ["Employees Without Attendance", result.summary.employeesWithoutAttendance],
      ["Matching Employees", result.summary.matchingEmployees],
      ["Candidate Absences", result.summary.candidateAbsences],
      ["Page", result.pagination.page],
      ["Page Size", result.pagination.pageSize],
      [],
    ];

  const headers = [
    "Employee ID",
    "Employee Number",
    "Employee Name",
    "Employee Status",
    "Branch",
    "Department",
    "Schedule",
    "Schedule Days",
    "Shift Time",
    "Expected Status",
  ];

  const rows = result.records.map((record) => [
    record.empId,
    record.empNumber,
    record.employeeName,
    record.employeeStatus,
    record.branchName,
    record.departmentName,
    record.scheduleName,
    record.scheduleDays,
    record.shiftTime,
    record.expectedStatus,
  ]);

  return [
    ...summaryRows.map((row) => row.map(escapeCsvValue).join(",")),
    headers.map(escapeCsvValue).join(","),
    ...rows.map((row) => row.map(escapeCsvValue).join(",")),
  ].join("\r\n");
}

export function buildAbsenceCandidatesFileName(
  result: AbsenceCandidateResult,
): string {
  const datePart = safeFilePart(result.filters.date || "selected-date");
  const branchPart = result.filters.branchId
    ? `branch-${safeFilePart(result.filters.branchId)}`
    : "all-branches";
  const departmentPart = result.filters.departmentId
    ? `department-${safeFilePart(result.filters.departmentId)}`
    : "all-departments";
  const searchPart = result.filters.q ? safeFilePart(result.filters.q) : "all";

  return `absence-candidates-${datePart}-${branchPart}-${departmentPart}-${searchPart}.csv`;
}