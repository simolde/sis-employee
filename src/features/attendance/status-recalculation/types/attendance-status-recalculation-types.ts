export type AttendanceStatusRecalculationSummary = {
  totalNormalRecords: number;
  normalRecordsWithSchedule: number;
  onTimeRecords: number;
  lateRecords: number;
  halfDayRecords: number;
  missingTimeoutRecords: number;
  skippedManualRecords: number;
};

export type AttendanceStatusRecalculationActionState = {
  ok: boolean;
  message: string;
  processedCount?: number;
  updatedCount?: number;
  skippedCount?: number;
  fieldErrors?: Record<string, string[] | undefined>;
};

export const initialAttendanceStatusRecalculationActionState: AttendanceStatusRecalculationActionState =
  {
    ok: false,
    message: "",
  };