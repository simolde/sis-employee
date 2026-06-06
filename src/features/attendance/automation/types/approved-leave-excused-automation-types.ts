export type ApprovedLeaveExcusedAutomationActionState = {
  ok: boolean;
  message: string;

  busy?: boolean;
  retryAfterSeconds?: number;

  checkedCount?: number;
  generatedCount?: number;
  existingAttendanceCount?: number;
  noApprovedLeaveCount?: number;
  exceptionProtectedCount?: number;
  notScheduledCount?: number;
  skippedCount?: number;

  runAuditLogId?: number | null;

  fieldErrors?: {
    dateFrom?: string[];
    dateTo?: string[];
    limit?: string[];
    confirmRun?: string[];
  };
};

export const initialApprovedLeaveExcusedAutomationActionState: ApprovedLeaveExcusedAutomationActionState =
  {
    ok: false,
    message: "",
    busy: false,
  };