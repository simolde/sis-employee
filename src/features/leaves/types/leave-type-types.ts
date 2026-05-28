export type LeaveTypeActionState = {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export const initialLeaveTypeActionState: LeaveTypeActionState = {
  ok: false,
  message: "",
};

export type LeaveTypeStatusValue = "ACTIVE" | "INACTIVE" | "ARCHIVED";

export type LeaveTypeListItem = {
  leaveTypeId: number;
  name: string;
  code: string;
  isPaid: boolean;
  requiresAttachment: boolean;
  status: LeaveTypeStatusValue;
  createdAt: string;
  updatedAt: string;
};

export type LeaveTypePageData = {
  leaveTypes: LeaveTypeListItem[];
  summary: {
    total: number;
    active: number;
    inactive: number;
    archived: number;
    paid: number;
    requiresAttachment: number;
  };
};