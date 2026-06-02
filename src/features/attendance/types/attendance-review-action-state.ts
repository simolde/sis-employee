export type AttendanceReviewActionState = {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export const initialAttendanceReviewActionState: AttendanceReviewActionState = {
  ok: false,
  message: "",
};

export const attendanceReviewStatusValues = [
  "ON_TIME",
  "LATE",
  "HALF_DAY",
  "ABSENT",
  "EXCUSED",
  "PENDING_REVIEW",
  "MISSING_TIMEOUT",
] as const;

export type AttendanceReviewStatusValue =
  (typeof attendanceReviewStatusValues)[number];

export const attendanceReviewModeValues = [
  "STATUS_ONLY",
  "VERIFY",
  "APPROVE",
] as const;

export type AttendanceReviewModeValue =
  (typeof attendanceReviewModeValues)[number];