export type OdlAccessFilterValue = "ALL" | "ENABLED" | "DISABLED";

export type OdlAccessFilters = {
  q: string;
  access: OdlAccessFilterValue;
  page: number;
  pageSize: number;
};

export type OdlAccessEmployeeItem = {
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

export type OdlAccessResult = {
  filters: OdlAccessFilters;
  records: OdlAccessEmployeeItem[];
  summary: {
    totalEmployees: number;
    enabledOdlEmployees: number;
    disabledOdlEmployees: number;
    activeEnabledOdlEmployees: number;
  };
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
};

export type OdlAccessActionState = {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export const initialOdlAccessActionState: OdlAccessActionState = {
  ok: false,
  message: "",
};