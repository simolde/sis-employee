export type OdlEligibilityEmployeeProfile = {
  empId: number;
  empNumber: string;
  fullName: string;
  status: string;
  departmentName: string;
  designationName: string;
  employeeTypeName: string;
  branchName: string;
  scheduleName: string;
  isFlexible: boolean;
};

export type OdlEligibilityProfile = {
  userId: number;
  username: string;
  email: string;
  userStatus: string;
  employee: OdlEligibilityEmployeeProfile | null;
};

export type OdlEligibilityCheckItem = {
  label: string;
  ok: boolean;
  value: string;
  helpText: string;
};

export type OdlEligibilityResult = {
  profile: OdlEligibilityProfile | null;
  checks: OdlEligibilityCheckItem[];
};