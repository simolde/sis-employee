import type { ApprovedLeaveAutomationHistoryResult } from "../types/approved-leave-automation-history-types";

function escapeCsvValue(
  value:
    | string
    | number
    | boolean
    | null
    | undefined,
): string {
  const text = String(value ?? "—");

  return `"${text.replaceAll('"', '""')}"`;
}

function safeFilePart(
  value: string,
): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
}

export function buildApprovedLeaveAutomationHistoryCsv(
  result: ApprovedLeaveAutomationHistoryResult,
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
    [
      "Approved-Leave EXCUSED Automation Run History",
    ],
    ["Search", result.filters.q || "—"],
    [
      "Execution Mode",
      result.filters.executionMode ||
        "All executions",
    ],
    [
      "Run Date From",
      result.filters.dateFrom || "—",
    ],
    [
      "Run Date To",
      result.filters.dateTo || "—",
    ],
    [
      "Total Runs",
      result.summary.totalRuns,
    ],
    [
      "Matching Runs",
      result.summary.matchingRuns,
    ],
    [
      "Dashboard Runs",
      result.summary.dashboardRuns,
    ],
    [
      "API/System Runs",
      result.summary.apiRuns,
    ],
    [
      "Completed Runs on Page",
      result.summary.completedRunsOnPage,
    ],
    [
      "Failed Runs on Page",
      result.summary.failedRunsOnPage,
    ],
    [
      "Generated Records on Page",
      result.summary.generatedRecordsOnPage,
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
    "Activity Log ID",
    "Run Key",
    "Execution Mode",
    "Status",
    "Actor User ID",
    "Attendance Date From",
    "Attendance Date To",
    "Employee Search",
    "Branch ID",
    "Department ID",
    "Limit",
    "Checked",
    "Generated",
    "Existing Attendance",
    "No Approved Leave",
    "Exception Protected",
    "Not Scheduled",
    "Skipped",
    "Started At",
    "Completed At",
    "Duration Milliseconds",
    "Duration",
    "Created At",
  ];

  const rows = result.records.map(
    (record) => [
      record.activityLogId,
      record.runKey,
      record.executionMode,
      record.status,
      record.actorUserId ?? "SYSTEM",
      record.attendanceDateFrom,
      record.attendanceDateTo,
      record.employeeSearch || "—",
      record.branchId || "All",
      record.departmentId || "All",
      record.limit,
      record.checkedCount,
      record.generatedCount,
      record.existingAttendanceCount,
      record.noApprovedLeaveCount,
      record.exceptionProtectedCount,
      record.notScheduledCount,
      record.skippedCount,
      record.startedAt,
      record.completedAt,
      record.durationMs,
      record.durationLabel,
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

export function buildApprovedLeaveAutomationHistoryFileName(
  result: ApprovedLeaveAutomationHistoryResult,
): string {
  const datePart = safeFilePart(
    `${result.filters.dateFrom || "all"}-${
      result.filters.dateTo || "all"
    }`,
  );

  const executionPart =
    result.filters.executionMode
      ? safeFilePart(
          result.filters.executionMode,
        )
      : "all-executions";

  const searchPart = result.filters.q
    ? safeFilePart(result.filters.q)
    : "all";

  return `approved-leave-automation-history-${datePart}-${executionPart}-${searchPart}-page-${result.pagination.page}.csv`;
}