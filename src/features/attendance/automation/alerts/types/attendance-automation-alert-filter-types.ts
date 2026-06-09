import type { AttendanceAutomationAlertViewItem } from "./attendance-automation-alert-acknowledgement-types";
import type {
  AttendanceAutomationAlertCenterData,
  AttendanceAutomationAlertCode,
  AttendanceAutomationAlertSeverity,
} from "./attendance-automation-alert-types";

export const ATTENDANCE_AUTOMATION_ALERT_CODES =
  [
    "SECRET_NOT_CONFIGURED",
    "AUTOMATION_RUNS_NOT_FOUND",
    "SCHEDULE_OVERDUE",
    "SCHEDULE_LATE_COMPLETION",
    "RECENT_AUTOMATION_FAILURE",
    "LOW_SUCCESS_RATE",
    "ACTIVE_EXECUTION_LOCK",
    "INVALID_SCHEDULE_CONFIGURATION",
    "INVALID_LOCK_LEASE",
    "LOCAL_PRODUCTION_URL",
    "DEGRADED_HEALTH",
    "AUTOMATION_CRON_RECEIPT_MISSING",
    "HEALTH_CRON_RECEIPT_MISSING",
    "AUTOMATION_CRON_RECEIPT_ATTENTION",
    "HEALTH_CRON_RECEIPT_ATTENTION",
    "CRON_RELIABILITY_CONFIGURATION",
    "CRON_RELIABILITY_WARMING_UP",
    "CRON_RELIABILITY_AT_RISK",
    "CRON_RELIABILITY_BREACHED",
  ] as const satisfies readonly AttendanceAutomationAlertCode[];

export type AttendanceAutomationAlertSeverityFilter =
  | ""
  | AttendanceAutomationAlertSeverity;

export type AttendanceAutomationAlertCodeFilter =
  | ""
  | AttendanceAutomationAlertCode;

export type AttendanceAutomationAlertFilters = {
  q: string;

  severity:
    AttendanceAutomationAlertSeverityFilter;

  code:
    AttendanceAutomationAlertCodeFilter;
};

export type AttendanceAutomationFilteredAlertResult = {
  source:
    AttendanceAutomationAlertCenterData;

  filters:
    AttendanceAutomationAlertFilters;

  alerts:
    AttendanceAutomationAlertViewItem[];

  availableCodes:
    AttendanceAutomationAlertCode[];

  summary: {
    totalMatchingAlerts: number;

    matchingCriticalAlerts: number;
    matchingWarningAlerts: number;
    matchingInformationalAlerts: number;

    acknowledgedAlerts: number;
    unacknowledgedAlerts: number;

    hasActiveFilters: boolean;
  };
};