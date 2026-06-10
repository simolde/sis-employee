import { prisma } from "@/lib/db/prisma";
import {
  ATTENDANCE_POLICY_KEYS,
  type AttendancePolicyBranchOption,
  type AttendancePolicyConfig,
  type AttendancePolicyDatabaseRow,
  type AttendancePolicyKey,
  type AttendancePolicyResolvedConfig,
  type AttendancePolicySettingsPageData,
  type AttendancePolicySourceMap,
  type AttendancePolicyValueSource,
} from "../types/attendance-policy-types";
import { DEFAULT_ATTENDANCE_POLICY_CONFIG } from "./attendance-policy-definitions";

type TableCountRow = {
  tableCount:
    | number
    | bigint
    | string;
};

type BranchDatabaseRow = {
  branchId:
    | number
    | bigint
    | string;

  branchCode: string;
  name: string;

  status: string;
};

type ResolvedValue<TValue> = {
  value: TValue;

  source:
    AttendancePolicyValueSource;
};

const TRUE_VALUES =
  new Set([
    "true",
    "1",
    "yes",
    "on",
  ]);

const FALSE_VALUES =
  new Set([
    "false",
    "0",
    "no",
    "off",
  ]);

function normalizeNonNegativeInteger(
  value:
    | number
    | bigint
    | string
    | undefined,

  fallback = 0,
): number {
  if (value === undefined) {
    return fallback;
  }

  const converted =
    Number(value);

  if (
    !Number.isSafeInteger(converted) ||
    converted < 0
  ) {
    return fallback;
  }

  return converted;
}

function parseBoolean(
  value:
    string | undefined,
): boolean | null {
  if (value === undefined) {
    return null;
  }

  const normalized =
    value.trim().toLowerCase();

  if (TRUE_VALUES.has(normalized)) {
    return true;
  }

  if (FALSE_VALUES.has(normalized)) {
    return false;
  }

  return null;
}

function parseInteger(
  value:
    string | undefined,

  minimum: number,
  maximum: number,
): number | null {
  if (value === undefined) {
    return null;
  }

  const converted =
    Number(value);

  if (
    !Number.isSafeInteger(converted) ||
    converted < minimum ||
    converted > maximum
  ) {
    return null;
  }

  return converted;
}

function databaseValue(
  values:
    ReadonlyMap<string, string>,

  key:
    AttendancePolicyKey,
): string | undefined {
  return values.get(key);
}

function resolveBoolean(input: {
  databaseValues:
    ReadonlyMap<string, string>;

  key:
    AttendancePolicyKey;

  environmentName: string;

  defaultValue: boolean;

  warnings: string[];
}): ResolvedValue<boolean> {
  const databaseRaw =
    databaseValue(
      input.databaseValues,
      input.key,
    );

  if (databaseRaw !== undefined) {
    const parsed =
      parseBoolean(databaseRaw);

    if (parsed !== null) {
      return {
        value: parsed,
        source: "DATABASE",
      };
    }

    input.warnings.push(
      `${input.key} has an invalid database boolean value. The fallback value was used.`,
    );
  }

  const environmentRaw =
    process.env[
      input.environmentName
    ];

  const environmentValue =
    parseBoolean(
      environmentRaw,
    );

  if (environmentValue !== null) {
    return {
      value:
        environmentValue,

      source:
        "ENVIRONMENT",
    };
  }

  if (
    environmentRaw !== undefined &&
    environmentRaw.trim().length > 0
  ) {
    input.warnings.push(
      `${input.environmentName} has an invalid boolean value.`,
    );
  }

  return {
    value:
      input.defaultValue,

    source:
      "DEFAULT",
  };
}

function resolveInteger(input: {
  databaseValues:
    ReadonlyMap<string, string>;

  key:
    AttendancePolicyKey;

  environmentName: string;

  defaultValue: number;

  minimum: number;
  maximum: number;

  warnings: string[];
}): ResolvedValue<number> {
  const databaseRaw =
    databaseValue(
      input.databaseValues,
      input.key,
    );

  if (databaseRaw !== undefined) {
    const parsed =
      parseInteger(
        databaseRaw,
        input.minimum,
        input.maximum,
      );

    if (parsed !== null) {
      return {
        value: parsed,
        source: "DATABASE",
      };
    }

    input.warnings.push(
      `${input.key} has an invalid database integer value. The fallback value was used.`,
    );
  }

  const environmentRaw =
    process.env[
      input.environmentName
    ];

  const environmentValue =
    parseInteger(
      environmentRaw,
      input.minimum,
      input.maximum,
    );

  if (environmentValue !== null) {
    return {
      value:
        environmentValue,

      source:
        "ENVIRONMENT",
    };
  }

  if (
    environmentRaw !== undefined &&
    environmentRaw.trim().length > 0
  ) {
    input.warnings.push(
      `${input.environmentName} has an invalid integer value.`,
    );
  }

  return {
    value:
      input.defaultValue,

    source:
      "DEFAULT",
  };
}

function resolveNullablePositiveInteger(input: {
  databaseValues:
    ReadonlyMap<string, string>;

  key:
    AttendancePolicyKey;

  environmentName: string;

  warnings: string[];
}): ResolvedValue<number | null> {
  const databaseRaw =
    databaseValue(
      input.databaseValues,
      input.key,
    );

  if (databaseRaw !== undefined) {
    const parsed =
      parseInteger(
        databaseRaw,
        1,
        Number.MAX_SAFE_INTEGER,
      );

    if (parsed !== null) {
      return {
        value: parsed,
        source: "DATABASE",
      };
    }

    input.warnings.push(
      `${input.key} does not contain a valid positive branch ID.`,
    );
  }

  const environmentRaw =
    process.env[
      input.environmentName
    ];

  const environmentValue =
    parseInteger(
      environmentRaw,
      1,
      Number.MAX_SAFE_INTEGER,
    );

  if (environmentValue !== null) {
    return {
      value:
        environmentValue,

      source:
        "ENVIRONMENT",
    };
  }

  return {
    value: null,
    source: "DEFAULT",
  };
}

function resolveText(input: {
  databaseValues:
    ReadonlyMap<string, string>;

  key:
    AttendancePolicyKey;

  environmentName: string;

  defaultValue: string;

  warnings: string[];
}): ResolvedValue<string> {
  const databaseRaw =
    databaseValue(
      input.databaseValues,
      input.key,
    )?.trim();

  if (
    databaseRaw !== undefined &&
    databaseRaw.length > 0
  ) {
    return {
      value: databaseRaw,
      source: "DATABASE",
    };
  }

  if (databaseRaw !== undefined) {
    input.warnings.push(
      `${input.key} is empty. The fallback value was used.`,
    );
  }

  const environmentRaw =
    process.env[
      input.environmentName
    ]?.trim();

  if (
    environmentRaw !== undefined &&
    environmentRaw.length > 0
  ) {
    return {
      value:
        environmentRaw,

      source:
        "ENVIRONMENT",
    };
  }

  return {
    value:
      input.defaultValue,

    source:
      "DEFAULT",
  };
}

async function attendancePolicyTableExists(): Promise<boolean> {
  const rows =
    await prisma.$queryRaw<
      TableCountRow[]
    >`
      SELECT
        COUNT(*) AS tableCount
      FROM information_schema.TABLES
      WHERE
        TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME =
          'attendance_policy_settings'
    `;

  return (
    normalizeNonNegativeInteger(
      rows[0]?.tableCount,
    ) > 0
  );
}

async function getDatabaseRows(): Promise<AttendancePolicyDatabaseRow[]> {
  return prisma.$queryRaw<
    AttendancePolicyDatabaseRow[]
  >`
    SELECT
      setting_key AS settingKey,
      setting_value AS settingValue,
      value_type AS valueType
    FROM attendance_policy_settings
    ORDER BY setting_key ASC
  `;
}

export async function getAttendancePolicyRuntimeConfig(): Promise<AttendancePolicyResolvedConfig> {
  const warnings:
    string[] = [];

  const tableExists =
    await attendancePolicyTableExists();

  const rows =
    tableExists
      ? await getDatabaseRows()
      : [];

  if (!tableExists) {
    warnings.push(
      "The attendance_policy_settings table does not exist. Environment variables and application defaults are being used.",
    );
  }

  const databaseValues =
    new Map(
      rows.map(
        (row) => [
          row.settingKey,
          row.settingValue,
        ],
      ),
    );

  const defaultBranchId =
    resolveNullablePositiveInteger({
      databaseValues,

      key:
        ATTENDANCE_POLICY_KEYS.DEFAULT_BRANCH_ID,

      environmentName:
        "ATTENDANCE_DEFAULT_BRANCH_ID",

      warnings,
    });

  const allowWebTimeIn =
    resolveBoolean({
      databaseValues,

      key:
        ATTENDANCE_POLICY_KEYS.ALLOW_WEB_TIME_IN,

      environmentName:
        "ATTENDANCE_ALLOW_WEB_TIME_IN",

      defaultValue:
        DEFAULT_ATTENDANCE_POLICY_CONFIG.allowWebTimeIn,

      warnings,
    });

  const allowManualTimeIn =
    resolveBoolean({
      databaseValues,

      key:
        ATTENDANCE_POLICY_KEYS.ALLOW_MANUAL_TIME_IN,

      environmentName:
        "ATTENDANCE_ALLOW_MANUAL_TIME_IN",

      defaultValue:
        DEFAULT_ATTENDANCE_POLICY_CONFIG.allowManualTimeIn,

      warnings,
    });

  const requirePhoto =
    resolveBoolean({
      databaseValues,

      key:
        ATTENDANCE_POLICY_KEYS.REQUIRE_PHOTO,

      environmentName:
        "ATTENDANCE_REQUIRE_PHOTO",

      defaultValue:
        DEFAULT_ATTENDANCE_POLICY_CONFIG.requirePhoto,

      warnings,
    });

  const requireLocation =
    resolveBoolean({
      databaseValues,

      key:
        ATTENDANCE_POLICY_KEYS.REQUIRE_LOCATION,

      environmentName:
        "ATTENDANCE_REQUIRE_LOCATION",

      defaultValue:
        DEFAULT_ATTENDANCE_POLICY_CONFIG.requireLocation,

      warnings,
    });

  const photoDirectory =
    resolveText({
      databaseValues,

      key:
        ATTENDANCE_POLICY_KEYS.PHOTO_DIRECTORY,

      environmentName:
        "ATTENDANCE_PHOTO_DIR",

      defaultValue:
        DEFAULT_ATTENDANCE_POLICY_CONFIG.photoDirectory,

      warnings,
    });

  const maxPhotoSizeMb =
    resolveInteger({
      databaseValues,

      key:
        ATTENDANCE_POLICY_KEYS.MAX_PHOTO_SIZE_MB,

      environmentName:
        "ATTENDANCE_MAX_FILE_SIZE_MB",

      defaultValue:
        DEFAULT_ATTENDANCE_POLICY_CONFIG.maxPhotoSizeMb,

      minimum: 1,
      maximum: 25,

      warnings,
    });

  const lateGraceMinutes =
    resolveInteger({
      databaseValues,

      key:
        ATTENDANCE_POLICY_KEYS.LATE_GRACE_MINUTES,

      environmentName:
        "ATTENDANCE_LATE_GRACE_MINUTES",

      defaultValue:
        DEFAULT_ATTENDANCE_POLICY_CONFIG.lateGraceMinutes,

      minimum: 0,
      maximum: 180,

      warnings,
    });

  const autoMarkMissingTimeout =
    resolveBoolean({
      databaseValues,

      key:
        ATTENDANCE_POLICY_KEYS.AUTO_MARK_MISSING_TIMEOUT,

      environmentName:
        "ATTENDANCE_AUTO_MARK_MISSING_TIMEOUT",

      defaultValue:
        DEFAULT_ATTENDANCE_POLICY_CONFIG.autoMarkMissingTimeout,

      warnings,
    });

  const missingTimeoutMinutes =
    resolveInteger({
      databaseValues,

      key:
        ATTENDANCE_POLICY_KEYS.MISSING_TIMEOUT_MINUTES,

      environmentName:
        "ATTENDANCE_MISSING_TIMEOUT_MINUTES",

      defaultValue:
        DEFAULT_ATTENDANCE_POLICY_CONFIG.missingTimeoutMinutes,

      minimum: 60,
      maximum: 2880,

      warnings,
    });

  const config:
    AttendancePolicyConfig = {
      defaultBranchId:
        defaultBranchId.value,

      allowWebTimeIn:
        allowWebTimeIn.value,

      allowManualTimeIn:
        allowManualTimeIn.value,

      requirePhoto:
        requirePhoto.value,

      requireLocation:
        requireLocation.value,

      photoDirectory:
        photoDirectory.value,

      maxPhotoSizeMb:
        maxPhotoSizeMb.value,

      lateGraceMinutes:
        lateGraceMinutes.value,

      autoMarkMissingTimeout:
        autoMarkMissingTimeout.value,

      missingTimeoutMinutes:
        missingTimeoutMinutes.value,
    };

  const sourceMap:
    AttendancePolicySourceMap = {
      defaultBranchId:
        defaultBranchId.source,

      allowWebTimeIn:
        allowWebTimeIn.source,

      allowManualTimeIn:
        allowManualTimeIn.source,

      requirePhoto:
        requirePhoto.source,

      requireLocation:
        requireLocation.source,

      photoDirectory:
        photoDirectory.source,

      maxPhotoSizeMb:
        maxPhotoSizeMb.source,

      lateGraceMinutes:
        lateGraceMinutes.source,

      autoMarkMissingTimeout:
        autoMarkMissingTimeout.source,

      missingTimeoutMinutes:
        missingTimeoutMinutes.source,
    };

  return {
    tableExists,

    databaseRowCount:
      rows.length,

    config,

    sourceMap,

    warnings,
  };
}

export async function getAttendancePolicySettingsPageData(): Promise<AttendancePolicySettingsPageData> {
  const [
    resolved,
    branchRows,
  ] = await Promise.all([
    getAttendancePolicyRuntimeConfig(),

    prisma.$queryRaw<
      BranchDatabaseRow[]
    >`
      SELECT
        branch_id AS branchId,
        branch_code AS branchCode,
        name,
        status
      FROM branches
      WHERE status = 'ACTIVE'
      ORDER BY name ASC
    `,
  ]);

  const branches:
    AttendancePolicyBranchOption[] =
    branchRows.map(
      (row) => ({
        branchId:
          normalizeNonNegativeInteger(
            row.branchId,
          ),

        branchCode:
          row.branchCode,

        name:
          row.name,

        status:
          row.status,
      }),
    );

  return {
    resolved,
    branches,
  };
}