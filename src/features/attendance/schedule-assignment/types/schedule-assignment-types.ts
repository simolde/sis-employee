export type ScheduleAssignmentFilters = {
  q: string;
  branchId: string;
  departmentId: string;
  designationId: string;
  empTypeId: string;
  currentScheduleId: string;
  activeOnly: boolean;
  targetScheduleId: string;
  validFrom: string;
  remarks: string;
};

export type ScheduleAssignmentOption = {
  id: number;
  label: string;
};

export type ScheduleAssignmentOptions = {
  branches: ScheduleAssignmentOption[];
  departments: ScheduleAssignmentOption[];
  designations: ScheduleAssignmentOption[];
  employeeTypes: ScheduleAssignmentOption[];
  schedules: ScheduleAssignmentOption[];
};

export type ScheduleAssignmentPreview = {
  matchingEmployees: number;
  activeMatchingEmployees: number;
  employeesWithoutSchedule: number;
  alreadyTargetSchedule: number;
  wouldAssignCount: number;
  hasSpecificFilters: boolean;
  targetScheduleLabel: string;
};

export type ScheduleAssignmentActionState = {
  ok: boolean;
  message: string;
  matchedCount?: number;
  updatedCount?: number;
  skippedCount?: number;
  fieldErrors?: Record<string, string[] | undefined>;
};

export const initialScheduleAssignmentActionState: ScheduleAssignmentActionState =
  {
    ok: false,
    message: "",
  };