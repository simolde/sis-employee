export type AttendanceAuditFilters = {
  q: string;
  action: string;
  dateFrom: string;
  dateTo: string;
  page: number;
  pageSize: number;
};

export type AttendanceAuditItem = {
  logId: number;
  actorUserId: number | null;
  actorName: string;
  actorEmail: string;
  actorStatus: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValue: string;
  newValue: string;
  createdAt: string;
};

export type AttendanceAuditSummary = {
  totalLogs: number;
  manualCreated: number;
  manualCorrected: number;
  missingTimeout: number;
  verified: number;
  approved: number;
  statusUpdated: number;
};

export type AttendanceAuditResult = {
  filters: AttendanceAuditFilters;
  summary: AttendanceAuditSummary;
  records: AttendanceAuditItem[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
};

export const attendanceAuditActionOptions = [
  "ALL",
  "MANUAL_ATTENDANCE_CREATED",
  "MANUAL_ATTENDANCE_CORRECTED",
  "ATTENDANCE_MARKED_MISSING_TIMEOUT",
  "ATTENDANCE_VERIFIED",
  "ATTENDANCE_APPROVED",
  "ATTENDANCE_STATUS_UPDATED",
] as const;