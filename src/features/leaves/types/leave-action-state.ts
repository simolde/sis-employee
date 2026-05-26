export type LeaveActionState = {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export const initialLeaveActionState: LeaveActionState = {
  ok: false,
  message: "",
};