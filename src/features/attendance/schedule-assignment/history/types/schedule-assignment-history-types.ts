export type ScheduleAssignmentHistoryStateFilter =
  | "ALL"
  | "ACTIVE"
  | "INACTIVE";

export type ScheduleAssignmentHistoryFilters = {
  q: string;
  state: ScheduleAssignmentHistoryStateFilter;
  dateFrom: string;
  dateTo: string;
  page: number;
  pageSize: number;
};

export type ScheduleAssignmentHistoryItem = {
  assignmentId: number;
  empId: number;
  empNumber: string;
  employeeName: string;
  employeeStatus: string;
  branchName: string;
  departmentName: string;
  scheduleName: string;
  shiftTime: string;
  validFrom: string;
  validTo: string;
  isActive: boolean;
  remarks: string;
  assignedByName: string;
  assignedByEmail: string;
  createdAt: string;
};

export type ScheduleAssignmentHistoryResult = {
  filters: ScheduleAssignmentHistoryFilters;
  records: ScheduleAssignmentHistoryItem[];
  summary: {
    totalMatchingAssignments: number;
    activeAssignments: number;
    inactiveAssignments: number;
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