export type MissingTimeoutActionState = {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export const initialMissingTimeoutActionState: MissingTimeoutActionState = {
  ok: false,
  message: "",
};

export type MissingTimeoutRecord = {
  attendanceId: number;
  empNumber: string;
  employeeName: string;
  branchName: string;
  departmentName: string;
  scheduleName: string;
  shiftTime: string;
  attDate: string;
  timeIn: string;
  source: string;
  status: string;
  isManual: boolean;
  ageHours: number;
};

export type MissingTimeoutPageData = {
  records: MissingTimeoutRecord[];
  summary: {
    eligibleMissingTimeouts: number;
    alreadyMarkedMissingTimeouts: number;
    manualPendingReview: number;
  };
};