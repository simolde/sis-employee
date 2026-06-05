export type ExcusedReconciliationFilters = {
  q: string;
  branchId: string;
  departmentId: string;
  scheduleId: string;
  dateFrom: string;
  dateTo: string;
  page: number;
  pageSize: number;
};

export type ExcusedReconciliationOption = {
  id: number;
  label: string;
};

export type ExcusedReconciliationOptions = {
  branches: ExcusedReconciliationOption[];
  departments: ExcusedReconciliationOption[];
  schedules: ExcusedReconciliationOption[];
};

export type ExcusedReconciliationItem = {
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
  generationLogFound: boolean;
  rollbackEligible: boolean;
  issueLabel: string;
};

export type ExcusedReconciliationResult = {
  filters: ExcusedReconciliationFilters;
  options: ExcusedReconciliationOptions;
  records: ExcusedReconciliationItem[];
  summary: {
    automaticExcusedChecked: number;
    rollbackEligible: number;
    protectedByApprovedLeave: number;
    missingGenerationProvenance: number;
    manualExcusedProtected: number;
    punchedExcusedProtected: number;
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

export type ExcusedReconciliationActionState = {
  ok: boolean;
  message: string;
  checkedCount?: number;
  rolledBackCount?: number;
  protectedByLeaveCount?: number;
  missingProvenanceCount?: number;
  skippedCount?: number;
  fieldErrors?: Record<string, string[] | undefined>;
};

export const initialExcusedReconciliationActionState: ExcusedReconciliationActionState =
  {
    ok: false,
    message: "",
  };