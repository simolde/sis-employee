export type AttendanceAuditFilters = {
  q: string;
  action: string;
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

export type AttendanceAuditResult = {
  filters: AttendanceAuditFilters;
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