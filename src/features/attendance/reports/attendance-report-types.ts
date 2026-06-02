export const attendanceReportStatusValues = [
  "ALL",
  "ON_TIME",
  "LATE",
  "HALF_DAY",
  "ABSENT",
  "EXCUSED",
  "PENDING_REVIEW",
  "MISSING_TIMEOUT",
] as const;

export const attendanceReportSourceValues = [
  "ALL",
  "RFID",
  "WEB",
  "MANUAL",
  "KIOSK",
  "MOBILE",
] as const;

export type AttendanceReportStatusValue =
  (typeof attendanceReportStatusValues)[number];

export type AttendanceReportSourceValue =
  (typeof attendanceReportSourceValues)[number];

export type AttendanceReportFilters = {
  q: string;
  dateFrom: string;
  dateTo: string;
  status: AttendanceReportStatusValue;
  source: AttendanceReportSourceValue;
};

export type AttendanceReportRow = {
  attendanceId: number;
  empNumber: string;
  employeeName: string;
  departmentName: string;
  branchName: string;
  scheduleName: string;
  shiftName: string;
  shiftTime: string;
  attDate: string;
  timeIn: string;
  timeOut: string;
  source: string;
  status: string;
  totalHours: string;
  totalMinutes: number;
  inAddress: string;
  outAddress: string;
  verifiedBy: string;
  approvedBy: string;
};

export type AttendanceReportData = {
  filters: AttendanceReportFilters;
  rows: AttendanceReportRow[];
  summary: {
    totalRecords: number;
    onTime: number;
    late: number;
    halfDay: number;
    absent: number;
    excused: number;
    pendingReview: number;
    missingTimeout: number;
    totalMinutes: number;
    totalHours: string;
  };
};