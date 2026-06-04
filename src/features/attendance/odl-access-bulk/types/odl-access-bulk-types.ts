export type OdlAccessBulkAccessFilter = "ALL" | "ENABLED" | "DISABLED";

export type OdlAccessBulkFilters = {
  q: string;
  branchId: string;
  departmentId: string;
  designationId: string;
  empTypeId: string;
  scheduleId: string;
  access: OdlAccessBulkAccessFilter;
  activeOnly: boolean;
};

export type OdlAccessBulkOption = {
  id: number;
  label: string;
};

export type OdlAccessBulkOptions = {
  branches: OdlAccessBulkOption[];
  departments: OdlAccessBulkOption[];
  designations: OdlAccessBulkOption[];
  employeeTypes: OdlAccessBulkOption[];
  schedules: OdlAccessBulkOption[];
};

export type OdlAccessBulkPreview = {
  matchingEmployees: number;
  matchingEnabled: number;
  matchingDisabled: number;
  activeMatchingEmployees: number;
  wouldEnableCount: number;
  wouldDisableCount: number;
  hasSpecificFilters: boolean;
};

export type OdlAccessBulkActionState = {
  ok: boolean;
  message: string;
  matchedCount?: number;
  updatedCount?: number;
  skippedCount?: number;
  fieldErrors?: Record<string, string[] | undefined>;
};

export const initialOdlAccessBulkActionState: OdlAccessBulkActionState = {
  ok: false,
  message: "",
};