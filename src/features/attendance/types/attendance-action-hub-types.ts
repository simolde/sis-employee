export type AttendanceActionHubStats = {
  totalToday: number;
  onTimeToday: number;
  lateToday: number;
  halfDayToday: number;
  absentToday: number;
  excusedToday: number;

  missingTimeout: number;
  manualToday: number;
  webToday: number;
  pendingReview: number;
  openReview: number;
  verifiedNotApproved: number;

  attendanceAuditLogs: number;

  absentTotal: number;
  automaticAbsent: number;
  manualAbsent: number;
  generatedAbsentAuditLogs: number;
  rollbackEligibleAbsent: number;
  absentRollbackAuditLogs: number;

  excusedTotal: number;
  automaticExcused: number;
  manualExcused: number;
  generatedExcusedAuditLogs: number;

  excusedAutomaticChecked: number;
  excusedProtectedByApprovedLeave: number;
  excusedReconciliationEligible: number;
  excusedMissingGenerationProvenance: number;
  excusedRollbackAuditLogs: number;

  activeAttendanceExceptions: number;
  absenceBlockingExceptions: number;
  todayBlockingExceptions: number;

  exceptionAuditLogs: number;
  exceptionCreatedAuditLogs: number;
  exceptionUpdatedAuditLogs: number;
  exceptionArchivedAuditLogs: number;
};