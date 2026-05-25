export type AttendanceActionState = {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export const initialAttendanceActionState: AttendanceActionState = {
  ok: false,
  message: "",
};