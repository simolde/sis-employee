import type {
  AttendanceAutomationAlertIncidentData,
  AttendanceAutomationAlertIncidentTransition,
  AttendanceAutomationAlertSnapshotAlert,
  AttendanceAutomationAlertSnapshotRecord,
} from "../types/attendance-automation-alert-incident-types";

function escapeCsvValue(
  value:
    | string
    | number
    | boolean
    | null
    | undefined,
): string {
  const normalized =
    String(value ?? "");

  return `"${normalized.replaceAll('"', '""')}"`;
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

function flattenDetails(
  details: string[],
): string {
  return details.join(" | ");
}

function formatAction(
  alert:
    AttendanceAutomationAlertSnapshotAlert,
): string {
  if (!alert.action) {
    return "";
  }

  return [
    alert.action.label,
    alert.action.href,
  ].join(" — ");
}

function createCurrentAlertRow(
  alert:
    AttendanceAutomationAlertSnapshotAlert,
): string {
  return createCsvRow([
    alert.severity,
    alert.code,
    alert.title,
    alert.message,
    flattenDetails(
      alert.details,
    ),
    formatAction(alert),
  ]);
}

function createTransitionRow(
  transition:
    AttendanceAutomationAlertIncidentTransition,
): string {
  return createCsvRow([
    transition.occurredAt,
    transition.occurredAtIso,

    transition.kind,

    transition.alertCode,
    transition.alertTitle,

    transition.previousSeverity,
    transition.currentSeverity,

    transition.previousOverallStatus,
    transition.currentOverallStatus,

    transition.snapshotActivityLogId,
  ]);
}

function createSnapshotRow(
  snapshot:
    AttendanceAutomationAlertSnapshotRecord,
): string {
  return createCsvRow([
    snapshot.activityLogId,
    snapshot.snapshotKey,

    snapshot.evaluatedAt,
    snapshot.evaluatedAtIso,

    snapshot.createdAt,
    snapshot.createdAtIso,

    snapshot.overallStatus,

    snapshot.summary.totalAlerts,
    snapshot.summary.criticalAlerts,
    snapshot.summary.warningAlerts,
    snapshot.summary.informationalAlerts,

    snapshot.fingerprint,

    snapshot.alerts
      .map(
        (alert) =>
          `${alert.severity}:${alert.code}`,
      )
      .join(" | "),
  ]);
}

export function buildAttendanceAutomationAlertIncidentCsv(
  data:
    AttendanceAutomationAlertIncidentData,
): string {
  const rows: string[] = [];

  rows.push(
    createCsvRow([
      "Starland Attendance Automation Alert Incident Timeline",
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
      "Generated ISO",
      data.generatedAtIso,
    ]),
  );

  rows.push(
    createCsvRow([
      "Monitoring Window",
      `${data.monitoringWindowDays} days`,
    ]),
  );

  rows.push(
    createCsvRow([
      "Latest Snapshot ID",
      data.latestSnapshot
        ?.activityLogId ?? null,
    ]),
  );

  rows.push(
    createCsvRow([
      "Latest Snapshot Status",
      data.latestSnapshot
        ?.overallStatus ?? "NONE",
    ]),
  );

  rows.push(
    createCsvRow([
      "Latest Snapshot Age Hours",
      data.summary.snapshotAgeHours,
    ]),
  );

  rows.push(
    createCsvRow([
      "Latest Snapshot Stale",
      data.summary.snapshotStale,
    ]),
  );

  rows.push("");

  rows.push(
    createCsvRow([
      "Incident Summary",
      "Value",
    ]),
  );

  rows.push(
    createCsvRow([
      "Total Snapshots",
      data.summary.totalSnapshots,
    ]),
  );

  rows.push(
    createCsvRow([
      "Current Alerts",
      data.summary.currentAlertCount,
    ]),
  );

  rows.push(
    createCsvRow([
      "Current Critical Alerts",
      data.summary.currentCriticalAlerts,
    ]),
  );

  rows.push(
    createCsvRow([
      "Current Warning Alerts",
      data.summary.currentWarningAlerts,
    ]),
  );

  rows.push(
    createCsvRow([
      "Current Informational Alerts",
      data.summary.currentInformationalAlerts,
    ]),
  );

  rows.push(
    createCsvRow([
      "Opened Transitions",
      data.summary.openedTransitions,
    ]),
  );

  rows.push(
    createCsvRow([
      "Resolved Transitions",
      data.summary.resolvedTransitions,
    ]),
  );

  rows.push(
    createCsvRow([
      "Severity Changed Transitions",
      data.summary.severityChangedTransitions,
    ]),
  );

  rows.push(
    createCsvRow([
      "Overall Status Changed Transitions",
      data.summary.overallStatusChangedTransitions,
    ]),
  );

  rows.push("");
  rows.push(
    createCsvRow([
      "CURRENT SNAPSHOT ALERTS",
    ]),
  );

  rows.push(
    createCsvRow([
      "Severity",
      "Code",
      "Title",
      "Message",
      "Details",
      "Action",
    ]),
  );

  if (data.currentAlerts.length === 0) {
    rows.push(
      createCsvRow([
        "",
        "",
        "No current alerts",
        "",
        "",
        "",
      ]),
    );
  } else {
    for (
      const alert of
      data.currentAlerts
    ) {
      rows.push(
        createCurrentAlertRow(
          alert,
        ),
      );
    }
  }

  rows.push("");
  rows.push(
    createCsvRow([
      "ALERT STATE TRANSITIONS",
    ]),
  );

  rows.push(
    createCsvRow([
      "Occurred",
      "Occurred ISO",
      "Transition Kind",
      "Alert Code",
      "Alert Title",
      "Previous Severity",
      "Current Severity",
      "Previous Overall Status",
      "Current Overall Status",
      "Snapshot Activity Log ID",
    ]),
  );

  if (data.transitions.length === 0) {
    rows.push(
      createCsvRow([
        "",
        "",
        "",
        "",
        "No transitions recorded",
        "",
        "",
        "",
        "",
        "",
      ]),
    );
  } else {
    for (
      const transition of
      data.transitions
    ) {
      rows.push(
        createTransitionRow(
          transition,
        ),
      );
    }
  }

  rows.push("");
  rows.push(
    createCsvRow([
      "ALERT SNAPSHOTS",
    ]),
  );

  rows.push(
    createCsvRow([
      "Activity Log ID",
      "Snapshot Key",
      "Evaluated",
      "Evaluated ISO",
      "Created",
      "Created ISO",
      "Overall Status",
      "Total Alerts",
      "Critical Alerts",
      "Warning Alerts",
      "Informational Alerts",
      "Fingerprint",
      "Alert Codes",
    ]),
  );

  if (
    data.recentSnapshots.length === 0
  ) {
    rows.push(
      createCsvRow([
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "",
        "No snapshots recorded",
      ]),
    );
  } else {
    for (
      const snapshot of
      data.recentSnapshots
    ) {
      rows.push(
        createSnapshotRow(
          snapshot,
        ),
      );
    }
  }

  return rows.join("\r\n");
}

export function buildAttendanceAutomationAlertIncidentCsvFileName(
  data:
    AttendanceAutomationAlertIncidentData,
): string {
  const generatedDate =
    data.generatedAtIso.slice(
      0,
      10,
    );

  return [
    "attendance-automation-alert-incidents",
    generatedDate,
    `${data.monitoringWindowDays}-days.csv`,
  ].join("-");
}