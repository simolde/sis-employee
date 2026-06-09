import type {
  AttendanceAutomationAlertAction,
  AttendanceAutomationAlertCode,
  AttendanceAutomationAlertOverallStatus,
  AttendanceAutomationAlertSeverity,
} from "../../types/attendance-automation-alert-types";

export const ATTENDANCE_AUTOMATION_ALERT_SNAPSHOT_ACTION =
  "ATTENDANCE_AUTOMATION_ALERT_SNAPSHOT_V1";

export const ATTENDANCE_AUTOMATION_ALERT_SNAPSHOT_ENTITY_TYPE =
  "attendance_automation_alert_snapshot_v1";

export type AttendanceAutomationAlertSnapshotAlert = {
  code: AttendanceAutomationAlertCode;

  severity:
    AttendanceAutomationAlertSeverity;

  title: string;
  message: string;

  details: string[];

  action:
    AttendanceAutomationAlertAction | null;
};

export type AttendanceAutomationAlertSnapshotSummary = {
  totalAlerts: number;
  criticalAlerts: number;
  warningAlerts: number;
  informationalAlerts: number;
};

export type AttendanceAutomationAlertSnapshotRecord = {
  activityLogId: number;

  snapshotKey: string;
  fingerprint: string;

  overallStatus:
    AttendanceAutomationAlertOverallStatus;

  summary:
    AttendanceAutomationAlertSnapshotSummary;

  alerts:
    AttendanceAutomationAlertSnapshotAlert[];

  evaluatedAt: string;
  evaluatedAtIso: string;

  createdAt: string;
  createdAtIso: string;
};

export type AttendanceAutomationAlertIncidentTransitionKind =
  | "ALERT_OPENED"
  | "ALERT_RESOLVED"
  | "SEVERITY_CHANGED"
  | "OVERALL_STATUS_CHANGED";

export type AttendanceAutomationAlertIncidentTransition = {
  transitionKey: string;

  kind:
    AttendanceAutomationAlertIncidentTransitionKind;

  snapshotActivityLogId: number;

  alertCode:
    AttendanceAutomationAlertCode | null;

  alertTitle: string;

  previousSeverity:
    AttendanceAutomationAlertSeverity | null;

  currentSeverity:
    AttendanceAutomationAlertSeverity | null;

  previousOverallStatus:
    AttendanceAutomationAlertOverallStatus | null;

  currentOverallStatus:
    AttendanceAutomationAlertOverallStatus | null;

  occurredAt: string;
  occurredAtIso: string;
};

export type AttendanceAutomationAlertIncidentData = {
  generatedAt: string;
  generatedAtIso: string;

  monitoringWindowDays: number;

  latestSnapshot:
    AttendanceAutomationAlertSnapshotRecord | null;

  summary: {
    totalSnapshots: number;

    currentAlertCount: number;
    currentCriticalAlerts: number;
    currentWarningAlerts: number;
    currentInformationalAlerts: number;

    openedTransitions: number;
    resolvedTransitions: number;
    severityChangedTransitions: number;
    overallStatusChangedTransitions: number;

    snapshotAgeHours: number | null;
    snapshotStale: boolean;
  };

  currentAlerts:
    AttendanceAutomationAlertSnapshotAlert[];

  transitions:
    AttendanceAutomationAlertIncidentTransition[];

  recentSnapshots:
    AttendanceAutomationAlertSnapshotRecord[];
};