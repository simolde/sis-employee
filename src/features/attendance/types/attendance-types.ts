export const attendanceStatusValues = [
  "ON_TIME",
  "LATE",
  "HALF_DAY",
  "ABSENT",
  "EXCUSED",
  "PENDING_REVIEW",
  "MISSING_TIMEOUT",
] as const;

export const attendanceSourceValues = [
  "RFID",
  "WEB",
  "MANUAL",
  "KIOSK",
  "MOBILE",
] as const;

export type AttendanceStatusValue = (typeof attendanceStatusValues)[number];
export type AttendanceSourceValue = (typeof attendanceSourceValues)[number];

export type AttendanceStatusFilterValue = "ALL" | AttendanceStatusValue;
export type AttendanceSourceFilterValue = "ALL" | AttendanceSourceValue;

export type AttendanceListSearchParams = {
  q: string;
  status: AttendanceStatusFilterValue;
  source: AttendanceSourceFilterValue;
  dateFrom: string;
  dateTo: string;
  page: number;
  pageSize: number;
  detailId: string;
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

export type AttendanceSummary = {
  totalToday: number;
  onTimeToday: number;
  lateToday: number;
  pendingReview: number;
  missingTimeout: number;
};

export type AttendanceListResult = {
  records: AttendanceListItem[];
  summary: AttendanceSummary;
  filters: AttendanceListSearchParams;
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
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