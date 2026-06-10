import {
  ATTENDANCE_POLICY_KEYS,
  type AttendancePolicyConfig,
  type AttendancePolicyKey,
  type AttendancePolicyValueType,
} from "../types/attendance-policy-types";

export type AttendancePolicyDefinition = {
  key: AttendancePolicyKey;

  valueType:
    AttendancePolicyValueType;

  description: string;
};

export const DEFAULT_ATTENDANCE_POLICY_CONFIG: AttendancePolicyConfig =
  {
    defaultBranchId: null,

    allowWebTimeIn: true,
    allowManualTimeIn: false,

    requirePhoto: true,
    requireLocation: true,

    photoDirectory:
      "uploads/attendance",

    maxPhotoSizeMb: 5,

    lateGraceMinutes: 0,

    autoMarkMissingTimeout: true,
    missingTimeoutMinutes: 720,
  };

export const ATTENDANCE_POLICY_DEFINITIONS: readonly AttendancePolicyDefinition[] =
  [
    {
      key:
        ATTENDANCE_POLICY_KEYS.DEFAULT_BRANCH_ID,

      valueType:
        "INTEGER",

      description:
        "Default branch used when an attendance source does not provide a branch.",
    },
    {
      key:
        ATTENDANCE_POLICY_KEYS.ALLOW_WEB_TIME_IN,

      valueType:
        "BOOLEAN",

      description:
        "Allows authorized employees to create attendance punches through the web application.",
    },
    {
      key:
        ATTENDANCE_POLICY_KEYS.ALLOW_MANUAL_TIME_IN,

      valueType:
        "BOOLEAN",

      description:
        "Allows authorized staff to manually create or correct attendance punches.",
    },
    {
      key:
        ATTENDANCE_POLICY_KEYS.REQUIRE_PHOTO,

      valueType:
        "BOOLEAN",

      description:
        "Requires photo evidence for attendance submissions.",
    },
    {
      key:
        ATTENDANCE_POLICY_KEYS.REQUIRE_LOCATION,

      valueType:
        "BOOLEAN",

      description:
        "Requires latitude and longitude for attendance submissions.",
    },
    {
      key:
        ATTENDANCE_POLICY_KEYS.PHOTO_DIRECTORY,

      valueType:
        "TEXT",

      description:
        "Relative local directory used for captured attendance photos.",
    },
    {
      key:
        ATTENDANCE_POLICY_KEYS.MAX_PHOTO_SIZE_MB,

      valueType:
        "INTEGER",

      description:
        "Maximum allowed attendance photo size in megabytes.",
    },
    {
      key:
        ATTENDANCE_POLICY_KEYS.LATE_GRACE_MINUTES,

      valueType:
        "INTEGER",

      description:
        "Number of minutes after the scheduled start before an employee is marked late.",
    },
    {
      key:
        ATTENDANCE_POLICY_KEYS.AUTO_MARK_MISSING_TIMEOUT,

      valueType:
        "BOOLEAN",

      description:
        "Allows automation to mark open attendance records with missing time-out.",
    },
    {
      key:
        ATTENDANCE_POLICY_KEYS.MISSING_TIMEOUT_MINUTES,

      valueType:
        "INTEGER",

      description:
        "Number of minutes after time-in before an open attendance record qualifies as missing time-out.",
    },
  ];