export type ApprovedLeaveAutomationRetryActionState = {
  ok: boolean;
  message: string;
  originalRunAuditLogId?: number;
  runAuditLogId?: number | null;
  checkedCount?: number;
  generatedCount?: number;
  existingAttendanceCount?: number;
  exceptionProtectedCount?: number;
  notScheduledCount?: number;
  fieldErrors?: {
    confirmRetry?: string[];
  };
};

export const initialApprovedLeaveAutomationRetryActionState: ApprovedLeaveAutomationRetryActionState =
  {
    ok: false,
    message: "",
  };