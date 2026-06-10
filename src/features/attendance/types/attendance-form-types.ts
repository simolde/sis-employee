export type OdlPunchState =
  | "TIME_IN"
  | "TIME_OUT"
  | "WAITING"
  | "DONE"
  | "BLOCKED";

export type OdlAttendanceEvidencePolicy = {
  requirePhoto: boolean;
  requireLocation: boolean;
  maxPhotoSizeMb: number;
};

export type OdlAttendanceEmployeeData = {
  empId: number;
  empNumber: string;
  fullName: string;
  departmentName: string;
  designationName: string;
  empTypeName: string;
  branchName: string;
  scheduleName: string;
};

export type OdlAttendancePageData = {
  employee:
    | OdlAttendanceEmployeeData
    | null;

  punchState:
    OdlPunchState;

  message: string;

  timeInAt: string;
  timeOutAt: string;

  minutesUntilTimeout: number;

  evidencePolicy:
    OdlAttendanceEvidencePolicy;
};