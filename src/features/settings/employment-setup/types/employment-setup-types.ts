export type RecordStatusValue = "ACTIVE" | "INACTIVE" | "ARCHIVED";

export type EmploymentSetupActionState = {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export const initialEmploymentSetupActionState: EmploymentSetupActionState = {
  ok: false,
  message: "",
};

export type DesignationListItem = {
  designationId: number;
  designationCode: string;
  name: string;
  status: RecordStatusValue;
  createdAt: string;
  updatedAt: string;
};

export type EmployeeTypeListItem = {
  empTypeId: number;
  empTypeCode: string;
  name: string;
  status: RecordStatusValue;
  createdAt: string;
  updatedAt: string;
};

export type DesignationPageData = {
  designations: DesignationListItem[];
  summary: {
    total: number;
    active: number;
    inactive: number;
    archived: number;
  };
};

export type EmployeeTypePageData = {
  employeeTypes: EmployeeTypeListItem[];
  summary: {
    total: number;
    active: number;
    inactive: number;
    archived: number;
  };
};