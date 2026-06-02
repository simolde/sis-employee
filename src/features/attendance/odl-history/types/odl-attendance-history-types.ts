export type OdlAttendanceHistoryFilters = {
  dateFrom: string;
  dateTo: string;
  page: number;
  pageSize: number;
};

export type OdlAttendanceHistoryEmployee = {
  empId: number;
  empNumber: string;
  fullName: string;
  departmentName: string;
  designationName: string;
  branchName: string;
};

export type OdlAttendanceHistoryItem = {
  attendanceId: number;
  attDate: string;
  timeIn: string;
  timeOut: string;
  source: string;
  status: string;
  totalHours: string;
  isManual: boolean;
};

export type OdlAttendanceHistoryResult = {
  employee: OdlAttendanceHistoryEmployee | null;
  filters: OdlAttendanceHistoryFilters;
  records: OdlAttendanceHistoryItem[];
  summary: {
    totalRecords: number;
    completedRecords: number;
    lateRecords: number;
    missingTimeoutRecords: number;
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