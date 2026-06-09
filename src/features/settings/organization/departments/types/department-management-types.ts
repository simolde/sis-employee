export const DEPARTMENT_STATUSES = [
  "ACTIVE",
  "INACTIVE",
  "ARCHIVED",
] as const;

export const DEPARTMENT_PAGE_SIZES = [
  10,
  25,
  50,
  100,
] as const;

export type DepartmentStatus =
  (typeof DEPARTMENT_STATUSES)[number];

export type DepartmentStatusFilter =
  | ""
  | DepartmentStatus;

export type DepartmentPageSize =
  (typeof DEPARTMENT_PAGE_SIZES)[number];

export type DepartmentRecord = {
  departmentId: number;

  departmentCode: string;
  name: string;

  status: DepartmentStatus;

  createdAt: string;
  createdAtIso: string;

  updatedAt: string;
  updatedAtIso: string;
};

export type DepartmentListRawFilters = {
  q?: string | string[];
  status?: string | string[];

  page?: string | string[];
  pageSize?: string | string[];
};

export type DepartmentListFilters = {
  q: string;

  status: DepartmentStatusFilter;

  page: number;
  pageSize: DepartmentPageSize;
};

export type DepartmentListData = {
  filters: DepartmentListFilters;

  departments: DepartmentRecord[];

  summary: {
    totalDepartments: number;
    activeDepartments: number;
    inactiveDepartments: number;
    archivedDepartments: number;
  };

  pagination: {
    page: number;
    pageSize: DepartmentPageSize;

    totalRecords: number;
    totalPages: number;

    firstRecord: number;
    lastRecord: number;

    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
};

export type DepartmentDependencyRecord = {
  constraintName: string;

  tableName: string;
  columnName: string;

  recordCount: number;
};

export type DepartmentDependencySummary = {
  totalReferences: number;

  dependencies: DepartmentDependencyRecord[];

  canDelete: boolean;
};

export type DepartmentDetailData = {
  department: DepartmentRecord;

  dependencySummary: DepartmentDependencySummary;
};

export type DepartmentFormInput = {
  departmentCode: string;
  name: string;

  status: DepartmentStatus;
};

export type DepartmentFormField =
  keyof DepartmentFormInput;

export type DepartmentFormActionStatus =
  | "IDLE"
  | "SUCCESS"
  | "ERROR";

export type DepartmentFormActionState = {
  status: DepartmentFormActionStatus;

  message: string;

  fieldErrors: Partial<
    Record<DepartmentFormField, string[]>
  >;

  departmentId: number | null;
};