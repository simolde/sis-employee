export type AbsenceRecordFilters = {
  q: string;
  branchId: string;
  departmentId: string;
  scheduleId: string;
  dateFrom: string;
  dateTo: string;
  page: number;
  pageSize: number;
};

export type AbsenceRecordOption = {
  id: number;
  label: string;
};

export type AbsenceRecordOptions = {
  branches: AbsenceRecordOption[];
  departments: AbsenceRecordOption[];
  schedules: AbsenceRecordOption[];
};

export type AbsenceRecordItem = {
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
  status: string;
  isManual: boolean;
  createdAt: string;
};

export type AbsenceRecordResult = {
  filters: AbsenceRecordFilters;
  options: AbsenceRecordOptions;
  records: AbsenceRecordItem[];
  summary: {
    totalAbsences: number;
    currentPageRecords: number;
    manualAbsences: number;
    automaticAbsences: number;
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