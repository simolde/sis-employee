import type { EmployeeScheduleHistoryData } from "../types/employee-schedule-history-types";

function escapeCsvValue(value: string | number | boolean): string {
  const text = String(value);
  const escaped = text.replaceAll('"', '""');

  return `"${escaped}"`;
}

function buildSafeFilePart(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

export function buildEmployeeScheduleHistoryCsv(
  data: EmployeeScheduleHistoryData,
): string {
  const headers = [
    "Employee ID",
    "Employee Number",
    "Employee Name",
    "Branch",
    "Department",
    "Designation",
    "Current Schedule Code",
    "Current Schedule Name",
    "Current Shift Name",
    "Current Shift Time",
    "Assignment ID",
    "Schedule Code",
    "Schedule Name",
    "Shift Code",
    "Shift Name",
    "Shift Time",
    "Days of Week",
    "Valid From",
    "Valid To",
    "Assignment Status",
    "Assigned By",
    "Remarks",
    "Created At",
    "Updated At",
  ];

  const rows = data.assignments.map((assignment) => [
    data.employee.empId,
    data.employee.empNumber,
    data.employee.fullName,
    data.employee.branchName,
    data.employee.departmentName,
    data.employee.designationName,
    data.employee.currentScheduleCode,
    data.employee.currentScheduleName,
    data.employee.currentShiftName,
    data.employee.currentShiftTime,
    assignment.assignmentId,
    assignment.scheduleCode,
    assignment.scheduleName,
    assignment.shiftCode,
    assignment.shiftName,
    assignment.shiftTime,
    assignment.daysOfWeek,
    assignment.validFrom,
    assignment.validTo,
    assignment.isActive ? "ACTIVE" : "INACTIVE",
    assignment.assignedBy,
    assignment.remarks,
    assignment.createdAt,
    assignment.updatedAt,
  ]);

  const summaryRows = [
    ["Summary"],
    ["Total Assignments", data.summary.totalAssignments],
    ["Active Assignments", data.summary.activeAssignments],
    ["Inactive Assignments", data.summary.inactiveAssignments],
    [],
  ];

  return [
    ...summaryRows.map((row) => row.map(escapeCsvValue).join(",")),
    headers.map(escapeCsvValue).join(","),
    ...rows.map((row) => row.map(escapeCsvValue).join(",")),
  ].join("\r\n");
}

export function buildEmployeeScheduleHistoryFileName(
  data: EmployeeScheduleHistoryData,
): string {
  const employeePart = buildSafeFilePart(
    `${data.employee.empNumber}-${data.employee.fullName}`,
  );

  return `employee-schedule-history-${employeePart || data.employee.empId}.csv`;
}