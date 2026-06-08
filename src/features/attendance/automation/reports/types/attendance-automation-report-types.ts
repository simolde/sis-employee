export type AttendanceAutomationReportExecutionMode =
  | "API"
  | "DASHBOARD";

export type AttendanceAutomationReportExecutionModeFilter =
  | ""
  | AttendanceAutomationReportExecutionMode;

export type AttendanceAutomationReportRunStatus =
  | "COMPLETED"
  | "FAILED"
  | "UNKNOWN";

export type AttendanceAutomationReportStatusFilter =
  | ""
  | AttendanceAutomationReportRunStatus;

export type AttendanceAutomationReportFilters = {
  dateFrom: string;
  dateTo: string;
  executionMode: AttendanceAutomationReportExecutionModeFilter;
  status: AttendanceAutomationReportStatusFilter;
};

export type AttendanceAutomationReportRun = {
  activityLogId: number;
  runKey: string;

  executionMode:
    AttendanceAutomationReportExecutionMode;

  status:
    AttendanceAutomationReportRunStatus;

  actorUserId: number | null;

  checkedCount: number;
  generatedCount: number;
  existingAttendanceCount: number;
  exceptionProtectedCount: number;
  notScheduledCount: number;
  skippedCount: number;

  durationMs: number;
  durationLabel: string;

  retryOfRunAuditLogId: number | null;
  isRetry: boolean;

  createdAt: string;
  createdAtIso: string;
  dateKey: string;
};

export type AttendanceAutomationDailyTrendItem = {
  dateKey: string;
  dateLabel: string;

  totalRuns: number;
  completedRuns: number;
  failedRuns: number;
  unknownRuns: number;

  apiRuns: number;
  dashboardRuns: number;
  retryRuns: number;

  generatedRecords: number;

  averageDurationMs: number;
  averageDurationLabel: string;

  successRate: number;
};

export type AttendanceAutomationExecutionBreakdownItem = {
  executionMode:
    AttendanceAutomationReportExecutionMode;

  totalRuns: number;
  completedRuns: number;
  failedRuns: number;
  generatedRecords: number;
  retryRuns: number;

  averageDurationMs: number;
  averageDurationLabel: string;

  successRate: number;
};

export type AttendanceAutomationReportData = {
  filters: AttendanceAutomationReportFilters;

  summary: {
    totalRuns: number;
    completedRuns: number;
    failedRuns: number;
    unknownRuns: number;

    generatedRecords: number;
    checkedRecords: number;
    retryRuns: number;

    successRate: number;

    averageDurationMs: number;
    averageDurationLabel: string;

    maximumDurationMs: number;
    maximumDurationLabel: string;
  };

  dailyTrend:
    AttendanceAutomationDailyTrendItem[];

  executionBreakdown:
    AttendanceAutomationExecutionBreakdownItem[];

  slowestRuns:
    AttendanceAutomationReportRun[];

  metadata: {
    databaseRunsInRange: number;
    scannedRuns: number;
    matchingRuns: number;
    isPartial: boolean;
    maximumScannedRuns: number;
  };
};