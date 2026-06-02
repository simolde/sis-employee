export type AttendanceAutomationActionState = {
  ok: boolean;
  message: string;
  markedCount?: number;
  remainingEligibleCount?: number;
  fieldErrors?: Record<string, string[] | undefined>;
};

export const initialAttendanceAutomationActionState: AttendanceAutomationActionState =
  {
    ok: false,
    message: "",
  };