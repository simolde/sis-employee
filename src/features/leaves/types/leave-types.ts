export const leaveStatusValues = [
  "PENDING",
  "APPROVED",
  "REJECTED",
  "CANCELLED",
] as const;

export type LeaveStatusValue = (typeof leaveStatusValues)[number];
export type LeaveStatusFilterValue = "ALL" | LeaveStatusValue;

export type LeaveListSearchParams = {
  status: LeaveStatusFilterValue;
  page: number;
  pageSize: number;
};

export type LeaveTypeOption = {
  leaveTypeId: number;
  name: string;
  code: string;
  isPaid: boolean;
};

export type LeaveListItem = {
  leaveId: number;
  employeeName: string;
  empNumber: string;
  departmentName: string;
  leaveTypeName: string;
  dateFrom: string;
  dateTo: string;
  totalDays: string;
  reason: string;
  attachment: string;
  status: LeaveStatusValue;
  rejectionReason: string;
  approvedBy: string;
  approvedAt: string;
  createdAt: string;
};

export type LeaveSummary = {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  cancelled: number;
};

export type LeaveBalanceSummary = {
  availableLeave: string;
  pendingDays: string;
  approvedDaysThisYear: string;
};

export type LeavePageData = {
  canManage: boolean;
  leaveTypes: LeaveTypeOption[];
  leaves: LeaveListItem[];
  summary: LeaveSummary;
  balanceSummary: LeaveBalanceSummary | null;
  filters: LeaveListSearchParams;
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
};