import type { AttendanceAutomationFilteredAlertResult } from "../types/attendance-automation-alert-filter-types";

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

function buildCsvRow(
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

function safeFilePart(
  value: string,
): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function buildAttendanceAutomationAlertCsv(
  result: AttendanceAutomationFilteredAlertResult,
): string {
  const rows: string[] = [];

  rows.push(
    buildCsvRow([
      "Attendance Automation Alerts",
    ]),
  );

  rows.push(
    buildCsvRow([
      "Generated At",
      result.source.generatedAt,
    ]),
  );

  rows.push(
    buildCsvRow([
      "Overall Status",
      result.source.overallStatus,
    ]),
  );

  rows.push(
    buildCsvRow([
      "Overall Description",
      result.source
        .overallDescription,
    ]),
  );

  rows.push("");

  rows.push(
    buildCsvRow([
      "Applied Search",
      result.filters.q || "None",
    ]),
  );

  rows.push(
    buildCsvRow([
      "Applied Severity",
      result.filters.severity || "All",
    ]),
  );

  rows.push(
    buildCsvRow([
      "Applied Alert Code",
      result.filters.code || "All",
    ]),
  );

  rows.push("");

  rows.push(
    buildCsvRow([
      "Matching Alerts",
      result.summary.totalMatchingAlerts,
    ]),
  );

  rows.push(
    buildCsvRow([
      "Acknowledged Alerts",
      result.summary.acknowledgedAlerts,
    ]),
  );

  rows.push(
    buildCsvRow([
      "Unacknowledged Alerts",
      result.summary.unacknowledgedAlerts,
    ]),
  );

  rows.push("");

  rows.push(
    buildCsvRow([
      "Severity",
      "Code",
      "Title",
      "Message",
      "Details",

      "Acknowledged",
      "Acknowledged By",
      "Acknowledged At",
      "Acknowledged Until",
      "Acknowledgement Note",

      "Action",
      "Action URL",
      "Detected At",
    ]),
  );

  for (const alert of result.alerts) {
    const acknowledgement =
      alert.acknowledgement;

    rows.push(
      buildCsvRow([
        alert.severity,
        alert.code,
        alert.title,
        alert.message,
        alert.details.join(" | "),

        acknowledgement !== null,

        acknowledgement
          ?.actorUserId ?? "",

        acknowledgement
          ?.acknowledgedAt ?? "",

        acknowledgement
          ?.acknowledgedUntil ?? "",

        acknowledgement?.note ?? "",

        alert.action?.label ?? "",
        alert.action?.href ?? "",
        alert.detectedAt,
      ]),
    );
  }

  return rows.join("\r\n");
}

export function buildAttendanceAutomationAlertCsvFileName(
  result: AttendanceAutomationFilteredAlertResult,
): string {
  const severityPart =
    result.filters.severity
      ? safeFilePart(
          result.filters.severity,
        )
      : "all-severities";

  const codePart =
    result.filters.code
      ? safeFilePart(
          result.filters.code,
        )
      : "all-codes";

  const searchPart =
    result.filters.q
      ? safeFilePart(
          result.filters.q,
        )
      : "all-alerts";

  const datePart = new Date()
    .toISOString()
    .slice(0, 10);

  return (
    [
      "attendance-automation-alerts",
      datePart,
      severityPart,
      codePart,
      searchPart,
    ].join("-") + ".csv"
  );
}