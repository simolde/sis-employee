import type {
  AttendanceAutomationCronReceiptReportData,
  AttendanceAutomationCronReceiptTaskResult,
} from "../types/attendance-automation-cron-receipt-report-types";

function escapeCsvValue(
  value:
    | string
    | number
    | boolean
    | null
    | undefined,
): string {
  const text =
    String(value ?? "");

  return `"${text.replaceAll('"', '""')}"`;
}

function createCsvRow(
  values: Array<
    | string
    | number
    | boolean
    | null
    | undefined
  >,
): string {
  return values
    .map(escapeCsvValue)
    .join(",");
}

function taskValues(
  result:
    AttendanceAutomationCronReceiptTaskResult,
): Array<
  | string
  | number
  | boolean
  | null
> {
  return [
    result.expectedAt,
    result.timeliness,
    result.delayMinutes,

    result.receiptActivityLogId,
    result.receiptKey,

    result.outcome,
    result.httpStatus,

    result.startedAt,
    result.finishedAt,

    result.durationMs,
    result.durationLabel,

    result.message,

    result.healthy,
  ];
}

export function buildAttendanceAutomationCronReceiptReportCsv(
  data:
    AttendanceAutomationCronReceiptReportData,
): string {
  const rows: string[] = [];

  rows.push(
    createCsvRow([
      "Starland Attendance Automation Cron Receipt Coverage Report",
    ]),
  );

  rows.push(
    createCsvRow([
      "Generated",
      data.generatedAt,
    ]),
  );

  rows.push(
    createCsvRow([
      "Date From",
      data.range.dateFrom,
    ]),
  );

  rows.push(
    createCsvRow([
      "Date To",
      data.range.dateTo,
    ]),
  );

  rows.push(
    createCsvRow([
      "Monitoring Enabled",
      data.monitoring.enabled,
    ]),
  );

  rows.push(
    createCsvRow([
      "Monitoring Configuration Valid",
      data.monitoring.valid,
    ]),
  );

  rows.push(
    createCsvRow([
      "Automation Schedule",
      `${data.schedule.automationTimeLabel} ${data.schedule.timeZone}`,
    ]),
  );

  rows.push(
    createCsvRow([
      "Health Schedule",
      `${data.schedule.healthTimeLabel} ${data.schedule.timeZone}`,
    ]),
  );

  rows.push(
    createCsvRow([
      "On-Time Tolerance",
      `${data.schedule.onTimeToleranceMinutes} minutes`,
    ]),
  );

  rows.push("");

  rows.push(
    createCsvRow([
      "Summary",
      "Value",
    ]),
  );

  rows.push(
    createCsvRow([
      "Total Days",
      data.summary.totalDays,
    ]),
  );

  rows.push(
    createCsvRow([
      "Healthy Days",
      data.summary.healthyDays,
    ]),
  );

  rows.push(
    createCsvRow([
      "Warning Days",
      data.summary.warningDays,
    ]),
  );

  rows.push(
    createCsvRow([
      "Critical Days",
      data.summary.criticalDays,
    ]),
  );

  rows.push(
    createCsvRow([
      "Automation Coverage Rate",
      `${data.summary.automationCoverageRate}%`,
    ]),
  );

  rows.push(
    createCsvRow([
      "Health Coverage Rate",
      `${data.summary.healthCoverageRate}%`,
    ]),
  );

  rows.push(
    createCsvRow([
      "Automation Success Rate",
      `${data.summary.automationSuccessRate}%`,
    ]),
  );

  rows.push(
    createCsvRow([
      "Health Success Rate",
      `${data.summary.healthSuccessRate}%`,
    ]),
  );

  rows.push("");

  rows.push(
    createCsvRow([
      "Date",
      "Date Label",
      "Daily State",

      "Automation Expected",
      "Automation Timeliness",
      "Automation Delay Minutes",
      "Automation Receipt ID",
      "Automation Receipt Key",
      "Automation Outcome",
      "Automation HTTP Status",
      "Automation Started",
      "Automation Finished",
      "Automation Duration MS",
      "Automation Duration",
      "Automation Message",
      "Automation Healthy",

      "Health Expected",
      "Health Timeliness",
      "Health Delay Minutes",
      "Health Receipt ID",
      "Health Receipt Key",
      "Health Outcome",
      "Health HTTP Status",
      "Health Started",
      "Health Finished",
      "Health Duration MS",
      "Health Duration",
      "Health Message",
      "Health Healthy",
    ]),
  );

  for (const row of data.rows) {
    rows.push(
      createCsvRow([
        row.date,
        row.dateLabel,
        row.state,

        ...taskValues(
          row.automation,
        ),

        ...taskValues(
          row.health,
        ),
      ]),
    );
  }

  return rows.join("\r\n");
}

export function buildAttendanceAutomationCronReceiptReportFileName(
  data:
    AttendanceAutomationCronReceiptReportData,
): string {
  return [
    "attendance-cron-receipt-report",
    data.range.dateFrom,
    "to",
    data.range.dateTo,
    `${data.filters.days}-days.csv`,
  ].join("-");
}