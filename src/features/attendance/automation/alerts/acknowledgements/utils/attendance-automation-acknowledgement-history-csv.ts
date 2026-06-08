import type {
  AttendanceAutomationAcknowledgementHistoryData,
  AttendanceAutomationAcknowledgementHistoryRecord,
} from "../types/attendance-automation-alert-acknowledgement-history-types";

function escapeCsvValue(
  value:
    | string
    | number
    | boolean
    | null
    | undefined,
): string {
  const text = String(value ?? "");

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

function sanitizeFileNamePart(
  value: string,
): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function createRecordRow(
  record: AttendanceAutomationAcknowledgementHistoryRecord,
): string {
  return createCsvRow([
    record.activityLogId,
    record.alertCode,
    record.alertTitle,
    record.alertSeverity,
    record.action,
    record.status,

    record.actorUserId !== null
      ? record.actorUserId
      : "SYSTEM",

    record.durationHours ?? "",

    record.acknowledgedAt ?? "",
    record.acknowledgedUntil ?? "",
    record.clearedAt ?? "",

    record.note ?? "",
    record.createdAt,
  ]);
}

export function buildAttendanceAutomationAcknowledgementHistoryCsv(
  data: AttendanceAutomationAcknowledgementHistoryData,
): string {
  const rows: string[] = [];

  rows.push(
    createCsvRow([
      "Attendance Automation Alert Acknowledgement History",
    ]),
  );

  rows.push(
    createCsvRow([
      "Date From",
      data.filters.dateFrom,
    ]),
  );

  rows.push(
    createCsvRow([
      "Date To",
      data.filters.dateTo,
    ]),
  );

  rows.push(
    createCsvRow([
      "Search",
      data.filters.q || "None",
    ]),
  );

  rows.push(
    createCsvRow([
      "Action Filter",
      data.filters.action || "All",
    ]),
  );

  rows.push(
    createCsvRow([
      "Status Filter",
      data.filters.status || "All",
    ]),
  );

  rows.push(
    createCsvRow([
      "Current Page",
      data.pagination.page,
    ]),
  );

  rows.push(
    createCsvRow([
      "Total Pages",
      data.pagination.totalPages,
    ]),
  );

  rows.push(
    createCsvRow([
      "Rows Per Page",
      data.pagination.pageSize,
    ]),
  );

  rows.push("");

  rows.push(
    createCsvRow([
      "Summary Metric",
      "Value",
    ]),
  );

  rows.push(
    createCsvRow([
      "Total Matching Events",
      data.summary.totalMatchingRecords,
    ]),
  );

  rows.push(
    createCsvRow([
      "Acknowledgement Events",
      data.summary.acknowledgementEvents,
    ]),
  );

  rows.push(
    createCsvRow([
      "Clearing Events",
      data.summary.clearingEvents,
    ]),
  );

  rows.push(
    createCsvRow([
      "Active Acknowledgements",
      data.summary.activeAcknowledgements,
    ]),
  );

  rows.push(
    createCsvRow([
      "Expired Acknowledgements",
      data.summary.expiredAcknowledgements,
    ]),
  );

  rows.push(
    createCsvRow([
      "Cleared Acknowledgements",
      data.summary.clearedAcknowledgements,
    ]),
  );

  rows.push(
    createCsvRow([
      "Superseded Acknowledgements",
      data.summary.supersededAcknowledgements,
    ]),
  );

  rows.push("");

  rows.push(
    createCsvRow([
      "Activity Log ID",
      "Alert Code",
      "Alert Title",
      "Severity",
      "Action",
      "Current State",
      "Administrator User ID",
      "Duration Hours",
      "Acknowledged At",
      "Acknowledged Until",
      "Cleared At",
      "Note",
      "Recorded At",
    ]),
  );

  for (const record of data.records) {
    rows.push(
      createRecordRow(record),
    );
  }

  return rows.join("\r\n");
}

export function buildAttendanceAutomationAcknowledgementHistoryFileName(
  data: AttendanceAutomationAcknowledgementHistoryData,
): string {
  const actionPart = data.filters.action
    ? sanitizeFileNamePart(
        data.filters.action,
      )
    : "all-actions";

  const statusPart = data.filters.status
    ? sanitizeFileNamePart(
        data.filters.status,
      )
    : "all-states";

  const searchPart = data.filters.q
    ? sanitizeFileNamePart(
        data.filters.q,
      )
    : "all-records";

  const fileNameParts = [
    "attendance-automation-acknowledgements",
    sanitizeFileNamePart(
      data.filters.dateFrom,
    ),
    "to",
    sanitizeFileNamePart(
      data.filters.dateTo,
    ),
    actionPart,
    statusPart,
    searchPart,
    `page-${data.pagination.page}`,
  ];

  return `${fileNameParts.join("-")}.csv`;
}