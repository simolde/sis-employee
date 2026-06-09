export const BRANCH_STATUSES = [
  "ACTIVE",
  "INACTIVE",
  "ARCHIVED",
] as const;

export const BRANCH_PAGE_SIZES = [
  10,
  25,
  50,
  100,
] as const;

export type BranchStatus =
  (typeof BRANCH_STATUSES)[number];

export type BranchStatusFilter =
  | ""
  | BranchStatus;

export type BranchPageSize =
  (typeof BRANCH_PAGE_SIZES)[number];

export type BranchRecord = {
  branchId: number;

  branchCode: string;
  name: string;

  address: string | null;

  latitude: string | null;
  longitude: string | null;

  radiusM: number | null;

  status: BranchStatus;

  createdAt: string;
  createdAtIso: string;

  updatedAt: string;
  updatedAtIso: string;
};

export type BranchListRawFilters = {
  q?: string | string[];
  status?: string | string[];
  page?: string | string[];
  pageSize?: string | string[];
};

export type BranchListFilters = {
  q: string;

  status:
    BranchStatusFilter;

  page: number;

  pageSize:
    BranchPageSize;
};

export type BranchListData = {
  filters:
    BranchListFilters;

  branches:
    BranchRecord[];

  summary: {
    totalBranches: number;
    activeBranches: number;
    inactiveBranches: number;
    archivedBranches: number;
  };

  pagination: {
    page: number;
    pageSize: BranchPageSize;

    totalRecords: number;
    totalPages: number;

    firstRecord: number;
    lastRecord: number;

    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
};

export type BranchDependencyRecord = {
  constraintName: string;

  tableName: string;
  columnName: string;

  recordCount: number;
};

export type BranchDependencySummary = {
  totalReferences: number;

  dependencies:
    BranchDependencyRecord[];

  canDelete: boolean;
};

export type BranchDetailData = {
  branch:
    BranchRecord;

  dependencySummary:
    BranchDependencySummary;
};

export type BranchFormInput = {
  branchCode: string;
  name: string;

  address: string | null;

  latitude: number | null;
  longitude: number | null;

  radiusM: number | null;

  status:
    BranchStatus;
};

export type BranchFormField =
  keyof BranchFormInput;

export type BranchFormActionStatus =
  | "IDLE"
  | "ERROR"
  | "SUCCESS";

export type BranchFormActionState = {
  status:
    BranchFormActionStatus;

  message: string;

  fieldErrors: Partial<
    Record<
      BranchFormField,
      string[]
    >
  >;

  branchId: number | null;
};