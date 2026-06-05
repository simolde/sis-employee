export const excusedAutomationAuditActions = [
  "ATTENDANCE_EXCUSED_AUTO_GENERATED",
  "ATTENDANCE_EXCUSED_AUTO_ROLLED_BACK",
] as const;

export type ExcusedAutomationAuditAction =
  (typeof excusedAutomationAuditActions)[number];

export type ExcusedAutomationAuditActionFilter =
  | ""
  | ExcusedAutomationAuditAction;

export type ExcusedAutomationAuditFilters = {
  q: string;
  action: ExcusedAutomationAuditActionFilter;
  dateFrom: string;
  dateTo: string;
  page: number;
  pageSize: number;
};

export type ExcusedAutomationAuditItem = {
  activityLogId: number;
  actorUserId: number | null;
  action: ExcusedAutomationAuditAction;
  entityId: string;
  oldValueText: string;
  newValueText: string;
  createdAt: string;
};

export type ExcusedAutomationAuditResult = {
  filters: ExcusedAutomationAuditFilters;
  records: ExcusedAutomationAuditItem[];
  summary: {
    totalAutomationLogs: number;
    matchingLogs: number;
    generatedLogs: number;
    rollbackLogs: number;
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