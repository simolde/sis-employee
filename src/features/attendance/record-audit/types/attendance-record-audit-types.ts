export type AttendanceRecordAuditItem = {
  activityLogId: number;
  actorUserId: number | null;
  actorName: string;
  actorEmail: string;
  actorStatus: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValue: string;
  newValue: string;
  ipAddress: string;
  userAgent: string;
  createdAt: string;
};

export type AttendanceRecordAuditHeader = {
  attendanceId: number;
  empNumber: string;
  employeeName: string;
  departmentName: string;
  branchName: string;
  attDate: string;
  status: string;
  source: string;
};

export type AttendanceRecordAuditResult = {
  header: AttendanceRecordAuditHeader;
  records: AttendanceRecordAuditItem[];
  summary: {
    totalLogs: number;
    manualCreated: number;
    manualCorrected: number;
    missingTimeout: number;
    verified: number;
    approved: number;
    statusUpdated: number;
  };
};