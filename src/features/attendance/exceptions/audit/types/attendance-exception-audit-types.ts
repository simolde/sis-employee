export type AttendanceExceptionAuditFilters = {
  q: string;
  action: string;
  dateFrom: string;
  dateTo: string;
  page: number;
  pageSize: number;
};

export type AttendanceExceptionAuditItem = {
  activityLogId: number;
  actorUserId: number | null;
  action: string;
  entityType: string;
  entityId: string;
  oldValueText: string;
  newValueText: string;
  createdAt: string;
};

export type AttendanceExceptionAuditResult = {
  filters: AttendanceExceptionAuditFilters;
  records: AttendanceExceptionAuditItem[];
  summary: {
    totalLogs: number;
    matchingLogs: number;
    createdLogs: number;
    updatedLogs: number;
    archivedLogs: number;
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