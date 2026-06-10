export const ATTENDANCE_POLICY_TABLE_CANDIDATES = [
  "attendance_policies",
  "attendance_policy_settings",
  "attendance_settings",
  "system_settings",
  "app_settings",
  "application_settings",
  "settings",
] as const;

export type AttendancePolicyTableCandidateName =
  (typeof ATTENDANCE_POLICY_TABLE_CANDIDATES)[number];

export type AttendancePolicyDiscoveryStatus =
  | "EXISTING_TABLE_FOUND"
  | "NEEDS_DATABASE_STORAGE"
  | "MULTIPLE_TABLES_FOUND"
  | "ERROR";

export type AttendancePolicyEnvironmentValueType =
  | "BOOLEAN"
  | "POSITIVE_INTEGER"
  | "TEXT";

export type AttendancePolicyEnvironmentSetting = {
  key: string;
  label: string;
  description: string;

  valueType: AttendancePolicyEnvironmentValueType;

  configured: boolean;
  valid: boolean;

  rawValue: string | null;
  normalizedValue: string | null;

  issue: string | null;
};

export type AttendancePolicySchemaColumn = {
  name: string;

  ordinalPosition: number;

  dataType: string;
  columnType: string;

  nullable: boolean;

  defaultValue: string | null;

  keyType: string | null;
  extra: string | null;

  maximumLength: number | null;

  autoIncrement: boolean;
  generated: boolean;
};

export type AttendancePolicySchemaIndex = {
  name: string;

  unique: boolean;
  primary: boolean;

  columns: string[];
};

export type AttendancePolicySchemaForeignKey = {
  constraintName: string;

  columnName: string;

  referencedTableName: string;
  referencedColumnName: string;

  updateRule: string | null;
  deleteRule: string | null;
};

export type AttendancePolicySchemaIncomingForeignKey = {
  constraintName: string;

  referencingTableName: string;
  referencingColumnName: string;

  referencedColumnName: string;

  updateRule: string | null;
  deleteRule: string | null;
};

export type AttendancePolicyCandidateTable = {
  tableName: AttendancePolicyTableCandidateName;

  exists: boolean;

  recordCount: number | null;

  columns: AttendancePolicySchemaColumn[];
  indexes: AttendancePolicySchemaIndex[];

  foreignKeys: AttendancePolicySchemaForeignKey[];

  incomingForeignKeys:
    AttendancePolicySchemaIncomingForeignKey[];
};

export type AttendancePolicyDefaultBranch = {
  branchId: number;

  branchCode: string;
  name: string;

  status: string;
};

export type AttendancePolicyDiscoveryData = {
  generatedAt: string;
  generatedAtIso: string;

  databaseName: string | null;

  status: AttendancePolicyDiscoveryStatus;

  statusLabel: string;
  statusDescription: string;

  environmentSettings:
    AttendancePolicyEnvironmentSetting[];

  candidateTables:
    AttendancePolicyCandidateTable[];

  relatedTableNames: string[];

  selectedTableName:
    AttendancePolicyTableCandidateName | null;

  defaultBranchId: number | null;

  defaultBranch:
    AttendancePolicyDefaultBranch | null;

  warnings: string[];

  recommendation: string;

  errorMessage: string | null;
};

export type AttendancePolicyDiscoveryCopyReport = {
  databaseName: string | null;

  status: AttendancePolicyDiscoveryStatus;

  environmentSettings:
    AttendancePolicyEnvironmentSetting[];

  candidateTables:
    AttendancePolicyCandidateTable[];

  relatedTableNames: string[];

  selectedTableName:
    AttendancePolicyTableCandidateName | null;

  defaultBranchId: number | null;

  defaultBranch:
    AttendancePolicyDefaultBranch | null;

  warnings: string[];

  recommendation: string;
};