export type AttendanceActionHubStats = {
  totalToday: number;
  onTimeToday: number;
  lateToday: number;
  halfDayToday: number;
  absentToday: number;
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
};