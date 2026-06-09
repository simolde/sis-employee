export const EMPLOYEE_TYPE_STATUSES = [
  "ACTIVE",
  "INACTIVE",
  "ARCHIVED",
] as const;

export const EMPLOYEE_TYPE_PAGE_SIZES = [
  10,
  25,
  50,
  100,
] as const;

export type EmployeeTypeStatus =
  (typeof EMPLOYEE_TYPE_STATUSES)[number];

export type EmployeeTypeStatusFilter =
  | ""
  | EmployeeTypeStatus;

export type EmployeeTypePageSize =
  (typeof EMPLOYEE_TYPE_PAGE_SIZES)[number];

export type EmployeeTypeRecord = {
  empTypeId: number;

  empTypeCode: string;
  name: string;

  status: EmployeeTypeStatus;

  createdAt: string;
  createdAtIso: string;

  updatedAt: string;
  updatedAtIso: string;
};

export type EmployeeTypeListRawFilters = {
  q?: string | string[];
  status?: string | string[];

  page?: string | string[];
  pageSize?: string | string[];
};

export type EmployeeTypeListFilters = {
  q: string;

  status: EmployeeTypeStatusFilter;

  page: number;
  pageSize: EmployeeTypePageSize;
};

export type EmployeeTypeListData = {
  filters: EmployeeTypeListFilters;

  employeeTypes: EmployeeTypeRecord[];

  summary: {
    totalEmployeeTypes: number;
    activeEmployeeTypes: number;
    inactiveEmployeeTypes: number;
    archivedEmployeeTypes: number;
  };

  pagination: {
    page: number;
    pageSize: EmployeeTypePageSize;

    totalRecords: number;
    totalPages: number;

    firstRecord: number;
    lastRecord: number;

    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
};

export type EmployeeTypeDependencyRecord = {
  constraintName: string;

  tableName: string;
  columnName: string;

  recordCount: number;
};

export type EmployeeTypeDependencySummary = {
  totalReferences: number;

  dependencies: EmployeeTypeDependencyRecord[];

  canDelete: boolean;
};

export type EmployeeTypeDetailData = {
  employeeType: EmployeeTypeRecord;

  dependencySummary: EmployeeTypeDependencySummary;
};

export type EmployeeTypeFormInput = {
  empTypeCode: string;
  name: string;

  status: EmployeeTypeStatus;
};

export type EmployeeTypeFormField =
  keyof EmployeeTypeFormInput;

export type EmployeeTypeFormActionStatus =
  | "IDLE"
  | "SUCCESS"
  | "ERROR";

export type EmployeeTypeFormActionState = {
  status: EmployeeTypeFormActionStatus;

  message: string;

  fieldErrors: Partial<
    Record<EmployeeTypeFormField, string[]>
  >;

  empTypeId: number | null;
};