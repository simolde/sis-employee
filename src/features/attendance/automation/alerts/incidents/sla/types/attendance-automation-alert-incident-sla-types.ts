import type {
  AttendanceAutomationAlertCode,
  AttendanceAutomationAlertSeverity,
} from "../../../types/attendance-automation-alert-types";

export type AttendanceAutomationAlertIncidentSlaOverallStatus =
  | "HEALTHY"
  | "WARNING"
  | "BREACHED"
  | "NO_DATA";

export type AttendanceAutomationAlertIncidentSlaState =
  | "WITHIN_TARGET"
  | "AT_RISK"
  | "BREACHED";

export type AttendanceAutomationAlertIncidentSlaConfigurationSource =
  | "ENVIRONMENT"
  | "DEFAULT";

export type AttendanceAutomationAlertIncidentSlaThreshold = {
  severity:
    AttendanceAutomationAlertSeverity;

  targetHours: number;

  source:
    AttendanceAutomationAlertIncidentSlaConfigurationSource;

  valid: boolean;

  variableName: string;
  rawValue: string | null;
};

export type AttendanceAutomationAlertIncidentSlaRecord = {
  incidentKey: string;

  alertCode:
    AttendanceAutomationAlertCode;

  title: string;

  severity:
    AttendanceAutomationAlertSeverity;

  peakSeverity:
    AttendanceAutomationAlertSeverity;

  slaState:
    AttendanceAutomationAlertIncidentSlaState;

  targetHours: number;

  elapsedHours: number;
  elapsedLabel: string;

  progressPercent: number;

  remainingHours: number | null;
  remainingLabel: string | null;

  overdueHours: number | null;
  overdueLabel: string | null;

  openedAt: string;
  openedAtIso: string;

  deadlineAt: string;
  deadlineAtIso: string;

  lastObservedAt: string;
  lastObservedAtIso: string;

  openedSnapshotActivityLogId: number;

  lastObservedSnapshotActivityLogId: number;

  observationCount: number;
  severityChangeCount: number;
};

export type AttendanceAutomationAlertIncidentSlaData = {
  overallStatus:
    AttendanceAutomationAlertIncidentSlaOverallStatus;

  overallLabel: string;
  overallDescription: string;

  generatedAt: string;
  generatedAtIso: string;

  configuration: {
    warningPercent: number;
    warningPercentValid: boolean;

    critical:
      AttendanceAutomationAlertIncidentSlaThreshold;

    warning:
      AttendanceAutomationAlertIncidentSlaThreshold;

    informational:
      AttendanceAutomationAlertIncidentSlaThreshold;
  };

  summary: {
    totalOpenIncidents: number;

    withinTargetIncidents: number;
    atRiskIncidents: number;
    breachedIncidents: number;

    criticalBreaches: number;
    warningBreaches: number;
    informationalBreaches: number;

    breachRate: number;

    maximumOverdueHours: number | null;
    nearestDeadlineHours: number | null;
  };

  incidents:
    AttendanceAutomationAlertIncidentSlaRecord[];

  issues: string[];

  metadata: {
    source:
      "ALERT_INCIDENT_LIFECYCLE";

    lifecycleStatus: string;

    lifecycleSnapshotCount: number;

    monitoringWindowDays: number;
  };
};