export type ManualAttendanceActionState = {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export const initialManualAttendanceActionState: ManualAttendanceActionState = {
  ok: false,
  message: "",
};

export type ManualAttendanceEmployeeOption = {
  empId: number;
  empNumber: string;
  fullName: string;
  branchName: string;
  departmentName: string;
  scheduleName: string;
  label: string;
};

export type ManualAttendancePageData = {
  employees: ManualAttendanceEmployeeOption[];
};