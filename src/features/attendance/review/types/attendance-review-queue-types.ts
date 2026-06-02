export const attendanceReviewQueueStatusValues = [
  "OPEN",
  "VERIFIED",
  "APPROVED",
  "ALL",
] as const;

export type AttendanceReviewQueueStatusValue =
  (typeof attendanceReviewQueueStatusValues)[number];

export type AttendanceReviewQueueFilters = {
  q: string;
  dateFrom: string;
  dateTo: string;
  reviewStatus: AttendanceReviewQueueStatusValue;
  page: number;
  pageSize: number;
};

export type AttendanceReviewQueueItem = {
  attendanceId: number;
  empNumber: string;
  employeeName: string;
  branchName: string;
  departmentName: string;
  scheduleName: string;
  attDate: string;
  timeIn: string;
  timeOut: string;
  source: string;
  attendanceStatus: string;
  totalHours: string;
  reviewReason: string;
  isManual: boolean;
  verifiedBy: string;
  verifiedAt: string;
  approvedBy: string;
  approvedAt: string;
  latestReviewLog: string;
};

export type AttendanceReviewQueueSummary = {
  totalReviewRequired: number;
  openReview: number;
  verifiedNotApproved: number;
  approved: number;
};

export type AttendanceReviewQueueResult = {
  filters: AttendanceReviewQueueFilters;
  records: AttendanceReviewQueueItem[];
  summary: AttendanceReviewQueueSummary;
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
};