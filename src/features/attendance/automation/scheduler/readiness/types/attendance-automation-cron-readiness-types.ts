import type {
  AttendanceAutomationSchedulerHeartbeatOutcome,
  AttendanceAutomationSchedulerHeartbeatState,
} from "../../heartbeats/types/attendance-automation-scheduler-heartbeat-types";
import type {
  AttendanceAutomationSchedulerMonitoringSource,
} from "../../server/attendance-automation-scheduler-monitoring-config";

export type AttendanceAutomationCronReadinessStatus =
  | "READY"
  | "READY_WITH_WARNINGS"
  | "BLOCKED"
  | "DISABLED";

export type AttendanceAutomationCronReadinessCheckStatus =
  | "PASS"
  | "WARNING"
  | "FAIL"
  | "SKIPPED";

export type AttendanceAutomationCronReadinessCheckCode =
  | "MONITORING_CONFIGURATION"
  | "APPLICATION_URL"
  | "AUTOMATION_SECRET"
  | "SCHEDULE_CONFIGURATION"
  | "AUTOMATION_RECEIPT"
  | "HEALTH_RECEIPT"
  | "RECEIPT_HISTORY";

export type AttendanceAutomationCronReadinessCheck = {
  code:
    AttendanceAutomationCronReadinessCheckCode;

  status:
    AttendanceAutomationCronReadinessCheckStatus;

  title: string;
  message: string;

  details: string[];
};

export type AttendanceAutomationCronReadinessData = {
  overallStatus:
    AttendanceAutomationCronReadinessStatus;

  overallLabel: string;
  overallDescription: string;

  checkedAt: string;
  checkedAtIso: string;

  environment:
    | "development"
    | "production"
    | "test";

  monitoring: {
    enabled: boolean;
    valid: boolean;

    source:
      AttendanceAutomationSchedulerMonitoringSource;

    variableName: string;

    rawValue: string | null;

    normalizedValue:
      | "true"
      | "false";
  };

  summary: {
    totalChecks: number;
    passedChecks: number;
    warningChecks: number;
    failedChecks: number;
    skippedChecks: number;
  };

  checks:
    AttendanceAutomationCronReadinessCheck[];

  signals: {
    applicationBaseUrl: string;

    secretConfigured: boolean;

    scheduleLabel: string;
    graceMinutes: number;

    schedulerHeartbeatState:
      AttendanceAutomationSchedulerHeartbeatState;

    automationReceiptState:
      AttendanceAutomationSchedulerHeartbeatState;

    healthReceiptState:
      AttendanceAutomationSchedulerHeartbeatState;

    latestAutomationReceiptId:
      number | null;

    latestAutomationOutcome:
      AttendanceAutomationSchedulerHeartbeatOutcome | null;

    latestHealthReceiptId:
      number | null;

    latestHealthOutcome:
      AttendanceAutomationSchedulerHeartbeatOutcome | null;

    totalReceipts: number;
  };
};