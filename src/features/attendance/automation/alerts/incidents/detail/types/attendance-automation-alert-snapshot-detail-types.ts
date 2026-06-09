import type {
  AttendanceAutomationAlertCode,
  AttendanceAutomationAlertOverallStatus,
  AttendanceAutomationAlertSeverity,
} from "../../../types/attendance-automation-alert-types";
import type {
  AttendanceAutomationAlertSnapshotAlert,
  AttendanceAutomationAlertSnapshotRecord,
} from "../../types/attendance-automation-alert-incident-types";

export type AttendanceAutomationAlertSnapshotComparisonKind =
  | "OPENED"
  | "RESOLVED"
  | "SEVERITY_CHANGED"
  | "CONTENT_CHANGED"
  | "UNCHANGED";

export type AttendanceAutomationAlertSnapshotNeighbor = {
  activityLogId: number;

  overallStatus:
    AttendanceAutomationAlertOverallStatus;

  evaluatedAt: string;
  evaluatedAtIso: string;

  totalAlerts: number;
};

export type AttendanceAutomationAlertSnapshotComparisonItem = {
  comparisonKey: string;

  kind:
    AttendanceAutomationAlertSnapshotComparisonKind;

  code:
    AttendanceAutomationAlertCode;

  title: string;

  previousSeverity:
    AttendanceAutomationAlertSeverity | null;

  currentSeverity:
    AttendanceAutomationAlertSeverity | null;

  previousAlert:
    AttendanceAutomationAlertSnapshotAlert | null;

  currentAlert:
    AttendanceAutomationAlertSnapshotAlert | null;
};

export type AttendanceAutomationAlertSnapshotDetailData = {
  generatedAt: string;
  generatedAtIso: string;

  snapshot:
    AttendanceAutomationAlertSnapshotRecord;

  previousSnapshot:
    AttendanceAutomationAlertSnapshotNeighbor | null;

  nextSnapshot:
    AttendanceAutomationAlertSnapshotNeighbor | null;

  comparison: {
    hasPreviousSnapshot: boolean;

    totalChanges: number;

    openedAlerts: number;
    resolvedAlerts: number;

    severityChangedAlerts: number;
    contentChangedAlerts: number;

    unchangedAlerts: number;

    items:
      AttendanceAutomationAlertSnapshotComparisonItem[];
  };
};