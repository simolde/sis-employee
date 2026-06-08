import type { AttendanceAutomationHealthStatus } from "../../health/types/attendance-automation-health-types";
import type { AttendanceAutomationLockHealthStatus } from "../../health/types/attendance-automation-lock-health-types";
import type { AttendanceAutomationScheduleComplianceStatus } from "../../health/types/attendance-automation-health-types";

export type AttendanceAutomationAlertSeverity =
  | "CRITICAL"
  | "WARNING"
  | "INFO";

export type AttendanceAutomationAlertCode =
  | "SECRET_NOT_CONFIGURED"
  | "AUTOMATION_RUNS_NOT_FOUND"
  | "SCHEDULE_OVERDUE"
  | "SCHEDULE_LATE_COMPLETION"
  | "RECENT_AUTOMATION_FAILURE"
  | "LOW_SUCCESS_RATE"
  | "ACTIVE_EXECUTION_LOCK"
  | "INVALID_SCHEDULE_CONFIGURATION"
  | "INVALID_LOCK_LEASE"
  | "LOCAL_PRODUCTION_URL"
  | "DEGRADED_HEALTH";

export type AttendanceAutomationAlertAction = {
  label: string;
  href: string;
};

export type AttendanceAutomationAlertItem = {
  code: AttendanceAutomationAlertCode;
  severity: AttendanceAutomationAlertSeverity;

  title: string;
  message: string;

  details: string[];

  action:
    | AttendanceAutomationAlertAction
    | null;

  detectedAt: string;
};

export type AttendanceAutomationAlertOverallStatus =
  | "HEALTHY"
  | "ATTENTION"
  | "CRITICAL";

export type AttendanceAutomationAlertCenterData = {
  overallStatus:
    AttendanceAutomationAlertOverallStatus;

  overallLabel: string;
  overallDescription: string;

  generatedAt: string;

  alerts: AttendanceAutomationAlertItem[];

  summary: {
    totalAlerts: number;
    criticalAlerts: number;
    warningAlerts: number;
    informationalAlerts: number;
  };

  signals: {
    healthStatus:
      AttendanceAutomationHealthStatus;

    scheduleStatus:
      AttendanceAutomationScheduleComplianceStatus;

    lockStatus:
      AttendanceAutomationLockHealthStatus;

    secretConfigured: boolean;

    totalRuns: number;
    failuresLast24Hours: number;
    successRate: number;

    latestRunId: number | null;
    latestFailedRunId: number | null;
  };
};