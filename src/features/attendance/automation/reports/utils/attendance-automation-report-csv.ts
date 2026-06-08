import type { AttendanceAutomationReportData } from "../types/attendance-automation-report-types";

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

function rowToCsv(
  row: Array<
    | string
    | number
    | boolean
    | null
    | undefined
  >,
): string {
  return row
    .map(escapeCsvValue)
    .join(",");
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

export function buildAttendanceAutomationReportCsv(
  data: AttendanceAutomationReportData,
): string {
  const rows: string[] = [];

  rows.push(
    rowToCsv([
      "Attendance Automation Report",
    ]),
  );

  rows.push(
    rowToCsv([
      "Date From",
      data.filters.dateFrom,
    ]),
  );

  rows.push(
    rowToCsv([
      "Date To",
      data.filters.dateTo,
    ]),
  );

  rows.push(
    rowToCsv([
      "Execution Mode",
      data.filters.executionMode ||
        "All",
    ]),
  );

  rows.push(
    rowToCsv([
      "Status",
      data.filters.status || "All",
    ]),
  );

  rows.push("");

  rows.push(
    rowToCsv([
      "Summary Metric",
      "Value",
    ]),
  );

  rows.push(
    rowToCsv([
      "Total Runs",
      data.summary.totalRuns,
    ]),
  );

  rows.push(
    rowToCsv([
      "Completed Runs",
      data.summary.completedRuns,
    ]),
  );

  rows.push(
    rowToCsv([
      "Failed Runs",
      data.summary.failedRuns,
    ]),
  );

  rows.push(
    rowToCsv([
      "Unknown Runs",
      data.summary.unknownRuns,
    ]),
  );

  rows.push(
    rowToCsv([
      "Success Rate",
      `${data.summary.successRate}%`,
    ]),
  );

  rows.push(
    rowToCsv([
      "Generated Records",
      data.summary.generatedRecords,
    ]),
  );

  rows.push(
    rowToCsv([
      "Checked Records",
      data.summary.checkedRecords,
    ]),
  );

  rows.push(
    rowToCsv([
      "Retry Runs",
      data.summary.retryRuns,
    ]),
  );

  rows.push(
    rowToCsv([
      "Average Duration",
      data.summary.averageDurationLabel,
    ]),
  );

  rows.push(
    rowToCsv([
      "Maximum Duration",
      data.summary.maximumDurationLabel,
    ]),
  );

  rows.push("");
  rows.push(
    rowToCsv([
      "Daily Trend",
    ]),
  );

  rows.push(
    rowToCsv([
      "Date",
      "Total Runs",
      "Completed",
      "Failed",
      "Unknown",
      "API Runs",
      "Dashboard Runs",
      "Retries",
      "Generated",
      "Average Duration",
      "Success Rate",
    ]),
  );

  for (const item of data.dailyTrend) {
    rows.push(
      rowToCsv([
        item.dateKey,
        item.totalRuns,
        item.completedRuns,
        item.failedRuns,
        item.unknownRuns,
        item.apiRuns,
        item.dashboardRuns,
        item.retryRuns,
        item.generatedRecords,
        item.averageDurationLabel,
        `${item.successRate}%`,
      ]),
    );
  }

  rows.push("");
  rows.push(
    rowToCsv([
      "Execution Breakdown",
    ]),
  );

  rows.push(
    rowToCsv([
      "Execution Mode",
      "Total Runs",
      "Completed",
      "Failed",
      "Retries",
      "Generated",
      "Average Duration",
      "Success Rate",
    ]),
  );

  for (
    const item of
    data.executionBreakdown
  ) {
    rows.push(
      rowToCsv([
        item.executionMode,
        item.totalRuns,
        item.completedRuns,
        item.failedRuns,
        item.retryRuns,
        item.generatedRecords,
        item.averageDurationLabel,
        `${item.successRate}%`,
      ]),
    );
  }

  rows.push("");
  rows.push(
    rowToCsv([
      "Slowest Runs",
    ]),
  );

  rows.push(
    rowToCsv([
      "Activity Log ID",
      "Run Key",
      "Execution Mode",
      "Status",
      "Actor",
      "Checked",
      "Generated",
      "Duration",
      "Retry Of",
      "Created At",
    ]),
  );

  for (const run of data.slowestRuns) {
    rows.push(
      rowToCsv([
        run.activityLogId,
        run.runKey,
        run.executionMode,
        run.status,
        run.actorUserId ?? "SYSTEM",
        run.checkedCount,
        run.generatedCount,
        run.durationLabel,
        run.retryOfRunAuditLogId ?? "—",
        run.createdAt,
      ]),
    );
  }

  return rows.join("\r\n");
}

export function buildAttendanceAutomationReportFileName(
  data: AttendanceAutomationReportData,
): string {
  const executionPart =
    data.filters.executionMode
      ? safeFilePart(
          data.filters.executionMode,
        )
      : "all-executions";

  const statusPart =
    data.filters.status
      ? safeFilePart(
          data.filters.status,
        )
      : "all-statuses";

  return [
    "attendance-automation-report",
    safeFilePart(
      data.filters.dateFrom,
    ),
    "to",
    safeFilePart(
      data.filters.dateTo,
    ),
    executionPart,
    statusPart,
  ].join("-") + ".csv";
}