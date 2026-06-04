export type AbsenceCandidateFilters = {
  date: string;
  q: string;
  branchId: string;
  departmentId: string;
  scheduleId: string;
  activeOnly: boolean;
  page: number;
  pageSize: number;
};

export type AbsenceCandidateOption = {
  id: number;
  label: string;
};

export type AbsenceCandidateOptions = {
  branches: AbsenceCandidateOption[];
  departments: AbsenceCandidateOption[];
  schedules: AbsenceCandidateOption[];
};

export type AbsenceCandidateItem = {
  empId: number;
  empNumber: string;
  employeeName: string;
  employeeStatus: string;
  branchName: string;
  departmentName: string;
  scheduleName: string;
  scheduleDays: string;
  shiftTime: string;
  expectedStatus: "ABSENT";
};

export type AbsenceCandidateResult = {
  filters: AbsenceCandidateFilters;
  options: AbsenceCandidateOptions;
  records: AbsenceCandidateItem[];
  summary: {
    selectedDate: string;
    matchingEmployees: number;
    candidateAbsences: number;
    scheduledEmployees: number;
    employeesWithoutAttendance: number;
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