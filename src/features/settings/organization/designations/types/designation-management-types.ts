export const DESIGNATION_STATUSES = [
  "ACTIVE",
  "INACTIVE",
  "ARCHIVED",
] as const;

export const DESIGNATION_PAGE_SIZES = [
  10,
  25,
  50,
  100,
] as const;

export type DesignationStatus =
  (typeof DESIGNATION_STATUSES)[number];

export type DesignationStatusFilter =
  | ""
  | DesignationStatus;

export type DesignationPageSize =
  (typeof DESIGNATION_PAGE_SIZES)[number];

export type DesignationRecord = {
  designationId: number;

  designationCode: string;
  name: string;

  status: DesignationStatus;

  createdAt: string;
  createdAtIso: string;

  updatedAt: string;
  updatedAtIso: string;
};

export type DesignationListRawFilters = {
  q?: string | string[];
  status?: string | string[];

  page?: string | string[];
  pageSize?: string | string[];
};

export type DesignationListFilters = {
  q: string;

  status: DesignationStatusFilter;

  page: number;
  pageSize: DesignationPageSize;
};

export type DesignationListData = {
  filters: DesignationListFilters;

  designations: DesignationRecord[];

  summary: {
    totalDesignations: number;
    activeDesignations: number;
    inactiveDesignations: number;
    archivedDesignations: number;
  };

  pagination: {
    page: number;
    pageSize: DesignationPageSize;

    totalRecords: number;
    totalPages: number;

    firstRecord: number;
    lastRecord: number;

    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
};

export type DesignationDependencyRecord = {
  constraintName: string;

  tableName: string;
  columnName: string;

  recordCount: number;
};

export type DesignationDependencySummary = {
  totalReferences: number;

  dependencies: DesignationDependencyRecord[];

  canDelete: boolean;
};

export type DesignationDetailData = {
  designation: DesignationRecord;

  dependencySummary: DesignationDependencySummary;
};

export type DesignationFormInput = {
  designationCode: string;
  name: string;

  status: DesignationStatus;
};

export type DesignationFormField =
  keyof DesignationFormInput;

export type DesignationFormActionStatus =
  | "IDLE"
  | "SUCCESS"
  | "ERROR";

export type DesignationFormActionState = {
  status: DesignationFormActionStatus;

  message: string;

  fieldErrors: Partial<
    Record<
      DesignationFormField,
      string[]
    >
  >;

  designationId: number | null;
};