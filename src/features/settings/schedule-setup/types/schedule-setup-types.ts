export type RecordStatusValue = "ACTIVE" | "INACTIVE" | "ARCHIVED";

export type ScheduleSetupActionState = {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export const initialScheduleSetupActionState: ScheduleSetupActionState = {
  ok: false,
  message: "",
};

export type ShiftListItem = {
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
  label: string;
};

export type ShiftScheduleListItem = {
  scheduleId: number;
  scheduleCode: string;
  name: string;
  shiftId: number;
  shiftName: string;
  shiftCode: string;
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
  };
};

export type SchedulePageData = {
  shiftOptions: ShiftOption[];
  schedules: ShiftScheduleListItem[];
  summary: {
    total: number;
    active: number;
    inactive: number;
    archived: number;
  };
};