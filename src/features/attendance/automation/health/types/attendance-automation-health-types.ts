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

  summary: {
    totalRuns: number;
    completedRuns: number;
    failedRuns: number;
    unknownRuns: number;
    runsToday: number;
    failuresLast24Hours: number;
    generatedRecords: number;
    retries: number;
    dashboardRuns: number;
    apiRuns: number;
    successRate: number;
  };

  latestRun: AttendanceAutomationHealthRun | null;
  latestCompletedRun: AttendanceAutomationHealthRun | null;
  latestFailedRun: AttendanceAutomationHealthRun | null;
  recentRuns: AttendanceAutomationHealthRun[];
};