export type ExcusedRecordSourceFilter =
  | ""
  | "AUTOMATIC"
  | "MANUAL";

export type ExcusedRecordFilters = {
  q: string;
  branchId: string;
  departmentId: string;
  scheduleId: string;
  source: ExcusedRecordSourceFilter;
  dateFrom: string;
  dateTo: string;
  page: number;
  pageSize: number;
};

export type ExcusedRecordOption = {
  id: number;
  label: string;
};

export type ExcusedRecordOptions = {
  branches: ExcusedRecordOption[];
  departments: ExcusedRecordOption[];
  schedules: ExcusedRecordOption[];
};

export type ExcusedRecordLeaveDetails = {
  leaveId: number;
  leaveTypeName: string;
  dateFrom: string;
  dateTo: string;
};

export type ExcusedRecordItem = {
  attendanceId: number;
  empId: number;
  empNumber: string;
  employeeName: string;
  employeeStatus: string;
  branchName: string;
  departmentName: string;
  scheduleName: string;
  shiftTime: string;
  attDate: string;
  status: "EXCUSED";
  isManual: boolean;
  sourceLabel: string;
  createdAt: string;
  leave: ExcusedRecordLeaveDetails | null;
};

export type ExcusedRecordResult = {
  filters: ExcusedRecordFilters;
  options: ExcusedRecordOptions;
  records: ExcusedRecordItem[];
  summary: {
    totalExcused: number;
    matchingExcused: number;
    automaticExcused: number;
    manualExcused: number;
    linkedApprovedLeave: number;
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