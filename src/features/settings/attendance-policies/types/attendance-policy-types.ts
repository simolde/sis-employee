export const ATTENDANCE_POLICY_KEYS = {
  DEFAULT_BRANCH_ID:
    "DEFAULT_BRANCH_ID",

  ALLOW_WEB_TIME_IN:
    "ALLOW_WEB_TIME_IN",

  ALLOW_MANUAL_TIME_IN:
    "ALLOW_MANUAL_TIME_IN",

  REQUIRE_PHOTO:
    "REQUIRE_PHOTO",

  REQUIRE_LOCATION:
    "REQUIRE_LOCATION",

  PHOTO_DIRECTORY:
    "PHOTO_DIRECTORY",

  MAX_PHOTO_SIZE_MB:
    "MAX_PHOTO_SIZE_MB",

  LATE_GRACE_MINUTES:
    "LATE_GRACE_MINUTES",

  AUTO_MARK_MISSING_TIMEOUT:
    "AUTO_MARK_MISSING_TIMEOUT",

  MISSING_TIMEOUT_MINUTES:
    "MISSING_TIMEOUT_MINUTES",
} as const;

export type AttendancePolicyKey =
  (typeof ATTENDANCE_POLICY_KEYS)[keyof typeof ATTENDANCE_POLICY_KEYS];

export type AttendancePolicyValueType =
  | "BOOLEAN"
  | "INTEGER"
  | "TEXT";

export type AttendancePolicyValueSource =
  | "DATABASE"
  | "ENVIRONMENT"
  | "DEFAULT";

export type AttendancePolicyConfig = {
  defaultBranchId: number | null;

  allowWebTimeIn: boolean;
  allowManualTimeIn: boolean;

  requirePhoto: boolean;
  requireLocation: boolean;

  photoDirectory: string;
  maxPhotoSizeMb: number;

  lateGraceMinutes: number;

  autoMarkMissingTimeout: boolean;
  missingTimeoutMinutes: number;
};

export type AttendancePolicySourceMap = {
  defaultBranchId:
    AttendancePolicyValueSource;

  allowWebTimeIn:
    AttendancePolicyValueSource;

  allowManualTimeIn:
    AttendancePolicyValueSource;

  requirePhoto:
    AttendancePolicyValueSource;

  requireLocation:
    AttendancePolicyValueSource;

  photoDirectory:
    AttendancePolicyValueSource;

  maxPhotoSizeMb:
    AttendancePolicyValueSource;

  lateGraceMinutes:
    AttendancePolicyValueSource;

  autoMarkMissingTimeout:
    AttendancePolicyValueSource;

  missingTimeoutMinutes:
    AttendancePolicyValueSource;
};

export type AttendancePolicyDatabaseRow = {
  settingKey: string;
  settingValue: string;
  valueType: string;
};

export type AttendancePolicyResolvedConfig = {
  tableExists: boolean;

  databaseRowCount: number;

  config: AttendancePolicyConfig;

  sourceMap: AttendancePolicySourceMap;

  warnings: string[];
};

export type AttendancePolicyBranchOption = {
  branchId: number;

  branchCode: string;
  name: string;

  status: string;
};

export type AttendancePolicySettingsPageData = {
  resolved:
    AttendancePolicyResolvedConfig;

  branches:
    AttendancePolicyBranchOption[];
};

export type AttendancePolicyFormInput = {
  defaultBranchId: number;

  allowWebTimeIn: boolean;
  allowManualTimeIn: boolean;

  requirePhoto: boolean;
  requireLocation: boolean;

  photoDirectory: string;
  maxPhotoSizeMb: number;

  lateGraceMinutes: number;

  autoMarkMissingTimeout: boolean;
  missingTimeoutMinutes: number;
};

export type AttendancePolicyFormField =
  keyof AttendancePolicyFormInput;

export type AttendancePolicyActionState = {
  status:
    | "IDLE"
    | "SUCCESS"
    | "ERROR";

  message: string;

  fieldErrors: Partial<
    Record<
      AttendancePolicyFormField,
      string[]
    >
  >;
};