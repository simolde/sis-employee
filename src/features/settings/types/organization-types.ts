export type RecordStatusValue = "ACTIVE" | "INACTIVE" | "ARCHIVED";

export type OrganizationActionState = {
  ok: boolean;
  message: string;
  fieldErrors?: Record<string, string[] | undefined>;
};

export const initialOrganizationActionState: OrganizationActionState = {
  ok: false,
  message: "",
};

export type BranchListItem = {
  branchId: number;
  name: string;
  status: RecordStatusValue;
  createdAt: string;
  updatedAt: string;
};

export type DepartmentListItem = {
  departmentId: number;
  name: string;
  status: RecordStatusValue;
  createdAt: string;
  updatedAt: string;
};

export type BranchPageData = {
  branches: BranchListItem[];
  summary: {
    total: number;
    active: number;
    inactive: number;
    archived: number;
  };
};

export type DepartmentPageData = {
  departments: DepartmentListItem[];
  summary: {
    total: number;
    active: number;
    inactive: number;
    archived: number;
  };
};