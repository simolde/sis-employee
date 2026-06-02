export type MissingTimeoutActionState = {
  ok: boolean;
  message: string;
};

export const initialMissingTimeoutActionState: MissingTimeoutActionState = {
  ok: false,
  message: "",
};

export type MissingTimeoutCandidate = {
  attendanceId: number;
  empNumber: string;
  employeeName: string;
  branchName: string;
  departmentName: string;
  scheduleName: string;
  shiftTime: string;
  attDate: string;
  timeIn: string;
  scheduledEnd: string;
  cutoffAt: string;
  source: string;
  currentStatus: string;
  totalHours: string;
  reason: string;
};

export type MissingTimeoutMaintenanceData = {
  candidates: MissingTimeoutCandidate[];
  summary: {
    candidateCount: number;
    withSchedule: number;
    withoutSchedule: number;
  };
};