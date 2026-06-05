export type ApprovedLeaveExcusedSyncFilters = {
  q: string;
  branchId: string;
  departmentId: string;
  dateFrom: string;
  dateTo: string;
  page: number;
  pageSize: number;
};

export type ApprovedLeaveExcusedSyncOption = {
  id: number;
  label: string;
};

export type ApprovedLeaveExcusedSyncOptions = {
  branches: ApprovedLeaveExcusedSyncOption[];
  departments: ApprovedLeaveExcusedSyncOption[];
};

export type ApprovedLeaveExcusedSyncCandidate = {
  empId: number;
  empNumber: string;
  employeeName: string;
  branchName: string;
  departmentName: string;
  scheduleName: string;
  attendanceDate: string;
  attendanceDateInput: string;
  leaveId: number;
  leaveTypeName: string;
  leaveDateFrom: string;
  leaveDateTo: string;
};

export type ApprovedLeaveExcusedSyncCandidateSeed = {
  empId: number;
  empNumber: string;
  attendanceDateInput: string;
};

export type ApprovedLeaveExcusedSyncResult = {
  filters: ApprovedLeaveExcusedSyncFilters;
  options: ApprovedLeaveExcusedSyncOptions;
  records: ApprovedLeaveExcusedSyncCandidate[];
  summary: {
    matchingApprovedLeaves: number;
    evaluatedLeaveDates: number;
    missingExcusedCandidates: number;
    alreadyHasAttendance: number;
    notScheduled: number;
    exceptionProtected: number;
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

export type ApprovedLeaveExcusedSyncActionState = {
  ok: boolean;
  message: string;
  checkedCount?: number;
  generatedCount?: number;
  existingAttendanceCount?: number;
  noApprovedLeaveCount?: number;
  exceptionProtectedCount?: number;
  notScheduledCount?: number;
  skippedCount?: number;
  fieldErrors?: Record<string, string[] | undefined>;
};

export const initialApprovedLeaveExcusedSyncActionState: ApprovedLeaveExcusedSyncActionState =
  {
    ok: false,
    message: "",
  };