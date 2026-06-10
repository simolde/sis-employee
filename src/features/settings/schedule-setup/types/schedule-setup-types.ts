export type RecordStatusValue =
  | "ACTIVE"
  | "INACTIVE"
  | "ARCHIVED";

export type ScheduleSetupActionState = {
  ok: boolean;
  message: string;

  fieldErrors?: Record<
    string,
    string[] | undefined
  >;
};

export const initialScheduleSetupActionState:
  ScheduleSetupActionState =
  {
    ok: false,
    message: "",
  };

export type ShiftDependencySummary = {
  scheduleCount: number;
  activeScheduleCount: number;
  currentEmployeeCount: number;
  assignmentHistoryCount: number;
  attendanceCount: number;

  ruleEditingLocked: boolean;
  statusChangeLocked: boolean;
};

export type ShiftListItem =
  ShiftDependencySummary & {
    shiftId: number;
    shiftCode: string;
    name: string;
    startTime: string;
    endTime: string;
    graceMinutes: number;
    isOvernight: boolean;
    status: RecordStatusValue;
    createdAt: string;
    updatedAt: string;
  };

export type ShiftOption = {
  shiftId: number;
  shiftCode: string;
  name: string;
  startTime: string;
  endTime: string;
  status: RecordStatusValue;
  label: string;
};

export type ScheduleDependencySummary = {
  currentEmployeeCount: number;
  assignmentHistoryCount: number;
  activeAssignmentCount: number;
  attendanceCount: number;

  coreEditingLocked: boolean;
  statusChangeLocked: boolean;
};

export type ShiftScheduleListItem =
  ScheduleDependencySummary & {
    scheduleId: number;
    scheduleCode: string;
    name: string;

    shiftId: number;
    shiftName: string;
    shiftCode: string;
    shiftStatus:
      RecordStatusValue;

    startTime: string;
    endTime: string;

    daysOfWeek: string;

    effectiveFrom: string;
    effectiveTo: string;

    effectiveFromInput: string;
    effectiveToInput: string;

    status: RecordStatusValue;

    createdAt: string;
    updatedAt: string;
  };

export type ShiftPageData = {
  shifts: ShiftListItem[];

  summary: {
    total: number;
    active: number;
    inactive: number;
    archived: number;
    overnight: number;
    protectedRules: number;
  };
};

export type SchedulePageData = {
  shiftOptions:
    ShiftOption[];

  schedules:
    ShiftScheduleListItem[];

  summary: {
    total: number;
    active: number;
    inactive: number;
    archived: number;
    assigned: number;
    protectedRules: number;
  };
};