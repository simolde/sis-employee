export type AbsenceRollbackFilters = {
  q: string;
  branchId: string;
  departmentId: string;
  scheduleId: string;
  dateFrom: string;
  dateTo: string;
  page: number;
  pageSize: number;
};

export type AbsenceRollbackOption = {
  id: number;
  label: string;
};

export type AbsenceRollbackOptions = {
  branches: AbsenceRollbackOption[];
  departments: AbsenceRollbackOption[];
  schedules: AbsenceRollbackOption[];
};

export type AbsenceRollbackItem = {
  attendanceId: number;
  empId: number;
  empNumber: string;
  employeeName: string;
  employeeStatus: string;
  branchName: string;
  departmentName: string;
  scheduleName: string;
  attDate: string;
  createdAt: string;
};

export type AbsenceRollbackResult = {
  filters: AbsenceRollbackFilters;
  options: AbsenceRollbackOptions;
  records: AbsenceRollbackItem[];
  summary: {
    rollbackEligibleRecords: number;
    currentPageRecords: number;
    protectedManualAbsences: number;
    protectedAbsencesWithPunches: number;
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

export type AbsenceRollbackActionState = {
  ok: boolean;
  message: string;
  deletedCount?: number;
  checkedCount?: number;
  skippedCount?: number;
  fieldErrors?: Record<string, string[] | undefined>;
};

export const initialAbsenceRollbackActionState: AbsenceRollbackActionState = {
  ok: false,
  message: "",
};