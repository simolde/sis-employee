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
  branches:
    ScheduleAssignmentOption[];

  departments:
    ScheduleAssignmentOption[];

  designations:
    ScheduleAssignmentOption[];

  employeeTypes:
    ScheduleAssignmentOption[];

  /**
   * Only ACTIVE schedules connected to ACTIVE shifts
   * are available as assignment targets.
   */
  schedules:
    ScheduleAssignmentOption[];
};

export type ScheduleAssignmentPreview = {
  matchingEmployees: number;
  activeMatchingEmployees: number;
  employeesWithoutSchedule: number;
  alreadyTargetSchedule: number;

  /**
   * Employees whose current schedule pointer must change.
   */
  scheduleChangeCount: number;

  /**
   * Employees already pointing to the target schedule but
   * missing a matching active assignment-history row.
   */
  historyRepairCount: number;

  /**
   * Total schedule changes plus history repairs.
   */
  wouldAssignCount: number;

  hasSpecificFilters: boolean;

  targetScheduleLabel: string;
  targetScheduleAvailable: boolean;
  targetScheduleIssue: string | null;
};

export type ScheduleAssignmentActionState = {
  ok: boolean;
  message: string;

  matchedCount?: number;

  /**
   * Total records successfully processed.
   */
  updatedCount?: number;

  scheduleChangedCount?: number;
  historyRepairedCount?: number;
  invalidEffectiveDateCount?: number;
  skippedCount?: number;

  fieldErrors?: Record<
    string,
    string[] | undefined
  >;
};

export const initialScheduleAssignmentActionState:
  ScheduleAssignmentActionState =
  {
    ok: false,
    message: "",
  };