import type {
  AttendanceAutomationAlertCode,
  AttendanceAutomationAlertSeverity,
} from "../../../types/attendance-automation-alert-types";

export type AttendanceAutomationAlertIncidentLifecycleStatus =
  | "OPEN"
  | "RESOLVED";

export type AttendanceAutomationAlertIncidentLifecycleOverallStatus =
  | "HEALTHY"
  | "ATTENTION"
  | "CRITICAL"
  | "NO_DATA";

export type AttendanceAutomationAlertIncidentLifecycleRecord = {
  incidentKey: string;

  alertCode:
    AttendanceAutomationAlertCode;

  title: string;

  status:
    AttendanceAutomationAlertIncidentLifecycleStatus;

  openingSeverity:
    AttendanceAutomationAlertSeverity;

  currentSeverity:
    AttendanceAutomationAlertSeverity;

  peakSeverity:
    AttendanceAutomationAlertSeverity;

  openedAt: string;
  openedAtIso: string;

  lastObservedAt: string;
  lastObservedAtIso: string;

  resolvedAt: string | null;
  resolvedAtIso: string | null;

  openedSnapshotActivityLogId: number;

  lastObservedSnapshotActivityLogId: number;

  resolvedSnapshotActivityLogId:
    number | null;

  durationHours: number;
  durationLabel: string;

  observationCount: number;
  severityChangeCount: number;
};

export type AttendanceAutomationAlertIncidentLifecycleCodeSummary = {
  alertCode:
    AttendanceAutomationAlertCode;

  title: string;

  incidentCount: number;
  openIncidentCount: number;
  resolvedIncidentCount: number;

  criticalIncidentCount: number;
  warningIncidentCount: number;
  informationalIncidentCount: number;

  averageResolutionHours:
    number | null;

  longestResolutionHours:
    number | null;

  currentOpenDurationHours:
    number | null;

  latestStatus:
    AttendanceAutomationAlertIncidentLifecycleStatus;

  latestOpenedAt: string;
  latestOpenedAtIso: string;
};

export type AttendanceAutomationAlertIncidentLifecycleData = {
  overallStatus:
    AttendanceAutomationAlertIncidentLifecycleOverallStatus;

  overallLabel: string;
  overallDescription: string;

  generatedAt: string;
  generatedAtIso: string;

  monitoringWindowDays: number;

  summary: {
    totalIncidents: number;

    openIncidents: number;
    resolvedIncidents: number;

    criticalOpenIncidents: number;
    warningOpenIncidents: number;
    informationalOpenIncidents: number;

    averageResolutionHours:
      number | null;

    medianResolutionHours:
      number | null;

    longestResolvedHours:
      number | null;

    longestOpenHours:
      number | null;

    totalSeverityChanges: number;
  };

  openIncidents:
    AttendanceAutomationAlertIncidentLifecycleRecord[];

  recentResolvedIncidents:
    AttendanceAutomationAlertIncidentLifecycleRecord[];

  incidentsByCode:
    AttendanceAutomationAlertIncidentLifecycleCodeSummary[];

  metadata: {
    source:
      "ALERT_SNAPSHOT_ACTIVITY_LOGS";

    snapshotCount: number;

    firstSnapshotAt:
      string | null;

    firstSnapshotAtIso:
      string | null;

    latestSnapshotAt:
      string | null;

    latestSnapshotAtIso:
      string | null;

    windowBounded: boolean;
  };
};