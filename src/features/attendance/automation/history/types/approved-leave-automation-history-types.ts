export const APPROVED_LEAVE_EXCUSED_AUTOMATION_RUN_ACTION =
  "ATTENDANCE_APPROVED_LEAVE_EXCUSED_AUTOMATION_RUN";

export type ApprovedLeaveAutomationExecutionMode =
  | "DASHBOARD"
  | "API";

export type ApprovedLeaveAutomationExecutionModeFilter =
  | ""
  | ApprovedLeaveAutomationExecutionMode;

export type ApprovedLeaveAutomationHistoryFilters = {
  q: string;
  executionMode: ApprovedLeaveAutomationExecutionModeFilter;
  dateFrom: string;
  dateTo: string;
  page: number;
  pageSize: number;
};

export type ApprovedLeaveAutomationHistoryItem = {
  activityLogId: number;
  runKey: string;
  executionMode: ApprovedLeaveAutomationExecutionMode;
  actorUserId: number | null;
  attendanceDateFrom: string;
  attendanceDateTo: string;
  limit: number;
  checkedCount: number;
  generatedCount: number;
  existingAttendanceCount: number;
  noApprovedLeaveCount: number;
  exceptionProtectedCount: number;
  notScheduledCount: number;
  skippedCount: number;
  startedAt: string;
  completedAt: string;
  durationMs: number;
  durationLabel: string;
  createdAt: string;
};

export type ApprovedLeaveAutomationHistoryResult = {
  filters: ApprovedLeaveAutomationHistoryFilters;
  records: ApprovedLeaveAutomationHistoryItem[];
  summary: {
    totalRuns: number;
    matchingRuns: number;
    dashboardRuns: number;
    apiRuns: number;
    generatedRecordsOnPage: number;
    currentPageRecords: number;
  };
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
};