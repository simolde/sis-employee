export const attendanceStatusValues = [
  "ALL",
  "ON_TIME",
  "LATE",
  "HALF_DAY",
  "ABSENT",
  "EXCUSED",
  "PENDING_REVIEW",
  "MISSING_TIMEOUT",
] as const;

export const attendanceSourceValues = [
  "ALL",
  "RFID",
  "WEB",
  "MANUAL",
  "KIOSK",
  "MOBILE",
] as const;

export type AttendanceStatusValue =
  | "ON_TIME"
  | "LATE"
  | "HALF_DAY"
  | "ABSENT"
  | "EXCUSED"
  | "PENDING_REVIEW"
  | "MISSING_TIMEOUT";

export type AttendanceSourceValue =
  | "RFID"
  | "WEB"
  | "MANUAL"
  | "KIOSK"
  | "MOBILE";

export type AttendanceListStatusFilter =
  (typeof attendanceStatusValues)[number];

export type AttendanceListSourceFilter =
  (typeof attendanceSourceValues)[number];

export type AttendanceStatusFilterValue = AttendanceListStatusFilter;

export type AttendanceSourceFilterValue = AttendanceListSourceFilter;

export type AttendanceListSearchParams = {
  q: string;
  dateFrom: string;
  dateTo: string;
  status: AttendanceListStatusFilter;
  source: AttendanceListSourceFilter;
  detailId: string;
  page: number;
  pageSize: number;
};

export type AttendanceSummary = {
  totalToday: number;
  onTimeToday: number;
  lateToday: number;
  pendingReview: number;
  missingTimeout: number;
};

export type AttendanceListItem = {
  attendanceId: number;
  empNumber: string;
  employeeName: string;
  departmentName: string;
  scheduleName: string;
  attDate: string;
  timeIn: string;
  timeOut: string;
  source: string;
  branchName: string;
  status: AttendanceStatusValue;
  totalHours: string;
  isManual: boolean;
  isSynced: boolean;
};

export type AttendancePagination = {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

export type AttendanceListResult = {
  records: AttendanceListItem[];
  summary: AttendanceSummary;
  filters: AttendanceListSearchParams;
  pagination: AttendancePagination;
};

export type MyAttendanceListItem = AttendanceListItem;

export type MyAttendanceListResult = {
  records: MyAttendanceListItem[];
  summary: AttendanceSummary;
  filters: AttendanceListSearchParams;
  pagination: AttendancePagination;
};

export type AttendanceDetailPunch = {
  time: string;
  source: string;
  branchName: string;
  latitude: string;
  longitude: string;
  address: string;
  photo: string;
  remark: string;
  reason: string;
};

export type AttendanceDetailLog = {
  logId: number;
  punchType: string;
  punchedAt: string;
  source: string;
  branchName: string;
  latitude: string;
  longitude: string;
  remarks: string;
  reason: string;
};

export type AttendanceDetail = {
  attendanceId: number;
  employeeName: string;
  empNumber: string;
  departmentName: string;
  branchName: string;
  scheduleName: string;
  shiftTime: string;
  attDate: string;
  status: AttendanceStatusValue;
  totalHours: string;
  isManual: boolean;
  isSynced: boolean;
  reviewRequired?: boolean;
  verifiedBy: string;
  verifiedAt: string;
  approvedBy: string;
  approvedAt: string;
  createdAt: string;
  updatedAt: string;
  timeIn: AttendanceDetailPunch;
  timeOut: AttendanceDetailPunch;
  logs: AttendanceDetailLog[];
};