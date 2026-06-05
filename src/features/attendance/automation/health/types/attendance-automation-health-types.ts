import type {
  ApprovedLeaveAutomationExecutionMode,
  ApprovedLeaveAutomationRunStatus,
} from "../../history/types/approved-leave-automation-history-types";

export type AttendanceAutomationHealthStatus =
  | "HEALTHY"
  | "DEGRADED"
  | "STALE"
  | "NO_RUNS"
  | "NOT_CONFIGURED";

export type AttendanceAutomationScheduleComplianceStatus =
  | "ON_SCHEDULE"
  | "NOT_DUE"
  | "GRACE_PERIOD"
  | "LATE_COMPLETED"
  | "OVERDUE"
  | "NO_API_RUNS";

export type AttendanceAutomationScheduleConfigurationSource =
  | "DEFAULTS"
  | "ENVIRONMENT";

export type AttendanceAutomationScheduleConfiguration = {
  timeZone: "Asia/Manila";
  expectedHour: number;
  expectedMinute: number;
  graceMinutes: number;
  source: AttendanceAutomationScheduleConfigurationSource;
  scheduleLabel: string;
  invalidVariables: string[];
};

export type AttendanceAutomationScheduleCompliance = {
  status: AttendanceAutomationScheduleComplianceStatus;
  statusLabel: string;
  statusDescription: string;

  expectedRunAt: string;
  expectedRunAtIso: string;

  graceDeadline: string;
  graceDeadlineIso: string;

  latestApiRunAt: string | null;
  latestApiRunAtIso: string | null;

  hasApiRunForCurrentWindow: boolean;

  minutesUntilExpectedRun: number | null;
  minutesUntilGraceDeadline: number | null;
  minutesLate: number | null;
  minutesOverdue: number | null;
};

export type AttendanceAutomationHealthRun = {
  activityLogId: number;
  runKey: string;
  executionMode: ApprovedLeaveAutomationExecutionMode;
  status: ApprovedLeaveAutomationRunStatus;
  actorUserId: number | null;
  checkedCount: number;
  generatedCount: number;
  durationMs: number;
  durationLabel: string;
  createdAt: string;
  createdAtIso: string;
  ageLabel: string;
  retryOfRunAuditLogId: number | null;
};

export type AttendanceAutomationHealthData = {
  secretConfigured: boolean;
  status: AttendanceAutomationHealthStatus;
  statusLabel: string;
  statusDescription: string;
  monitoringWindowDays: number;
  isPartial: boolean;

  scheduleConfiguration: AttendanceAutomationScheduleConfiguration;
  scheduleCompliance: AttendanceAutomationScheduleCompliance;

  summary: {
    totalRuns: number;
    completedRuns: number;
    failedRuns: number;
    unknownRuns: number;

    runsToday: number;
    apiRunsToday: number;

    failuresLast24Hours: number;
    generatedRecords: number;
    retries: number;

    dashboardRuns: number;
    apiRuns: number;

    successRate: number;
  };

  latestRun: AttendanceAutomationHealthRun | null;
  latestApiRun: AttendanceAutomationHealthRun | null;
  latestCompletedRun: AttendanceAutomationHealthRun | null;
  latestFailedRun: AttendanceAutomationHealthRun | null;
  recentRuns: AttendanceAutomationHealthRun[];
};