import { prisma } from "@/lib/db/prisma";
import {
  ATTENDANCE_POLICY_TABLE_CANDIDATES,
  type AttendancePolicyCandidateTable,
  type AttendancePolicyDefaultBranch,
  type AttendancePolicyDiscoveryCopyReport,
  type AttendancePolicyDiscoveryData,
  type AttendancePolicyDiscoveryStatus,
  type AttendancePolicyEnvironmentSetting,
  type AttendancePolicySchemaColumn,
  type AttendancePolicySchemaForeignKey,
  type AttendancePolicySchemaIncomingForeignKey,
  type AttendancePolicySchemaIndex,
  type AttendancePolicyTableCandidateName,
} from "../types/attendance-policy-discovery-types";

type DatabaseNameRow = {
  databaseName: string | null;
};

type ExistingTableRow = {
  tableName: string;
};

type RelatedTableRow = {
  tableName: string;
};

type CountRow = {
  recordCount:
    | number
    | bigint
    | string;
};

type ColumnMetadataRow = {
  columnName: string;

  ordinalPosition:
    | number
    | bigint
    | string;

  columnDefault: unknown;

  isNullable: string;

  dataType: string;
  columnType: string;

  columnKey:
    | string
    | null;

  extra:
    | string
    | null;

  characterMaximumLength:
    | number
    | bigint
    | string
    | null;
};

type IndexMetadataRow = {
  indexName: string;

  nonUnique:
    | number
    | bigint
    | string;

  sequenceInIndex:
    | number
    | bigint
    | string;

  columnName: string;
};

type ForeignKeyMetadataRow = {
  constraintName: string;

  columnName: string;

  referencedTableName: string;
  referencedColumnName: string;

  updateRule:
    | string
    | null;

  deleteRule:
    | string
    | null;
};

type IncomingForeignKeyMetadataRow = {
  constraintName: string;

  referencingTableName: string;
  referencingColumnName: string;

  referencedColumnName: string;

  updateRule:
    | string
    | null;

  deleteRule:
    | string
    | null;
};

type BranchRow = {
  branchId:
    | number
    | bigint
    | string;

  branchCode: string;
  name: string;

  status: string;
};

const BOOLEAN_TRUE_VALUES =
  new Set([
    "true",
    "1",
    "yes",
    "on",
  ]);

const BOOLEAN_FALSE_VALUES =
  new Set([
    "false",
    "0",
    "no",
    "off",
  ]);

function normalizeInteger(
  value:
    | number
    | bigint
    | string
    | null
    | undefined,

  fallback = 0,
): number {
  if (
    value === null ||
    value === undefined
  ) {
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

function normalizeMetadataValue(
  value: unknown,
): string | null {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === "bigint") {
    return value.toString();
  }

  return String(value);
}

function formatDateTime(
  value: Date,
): string {
  return new Intl.DateTimeFormat(
    "en-PH",
    {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "Asia/Manila",
    },
  ).format(value);
}

function getErrorMessage(
  error: unknown,
): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "An unknown attendance-policy discovery error occurred.";
}

function readBooleanEnvironmentSetting(input: {
  key: string;
  label: string;
  description: string;
}): AttendancePolicyEnvironmentSetting {
  const rawValue =
    process.env[input.key]
      ?.trim() ?? "";

  if (rawValue.length === 0) {
    return {
      ...input,

      valueType: "BOOLEAN",

      configured: false,
      valid: true,

      rawValue: null,
      normalizedValue: null,

      issue: null,
    };
  }

  const normalized =
    rawValue.toLowerCase();

  if (
    BOOLEAN_TRUE_VALUES.has(
      normalized,
    )
  ) {
    return {
      ...input,

      valueType: "BOOLEAN",

      configured: true,
      valid: true,

      rawValue,
      normalizedValue: "true",

      issue: null,
    };
  }

  if (
    BOOLEAN_FALSE_VALUES.has(
      normalized,
    )
  ) {
    return {
      ...input,

      valueType: "BOOLEAN",

      configured: true,
      valid: true,

      rawValue,
      normalizedValue: "false",

      issue: null,
    };
  }

  return {
    ...input,

    valueType: "BOOLEAN",

    configured: true,
    valid: false,

    rawValue,
    normalizedValue: null,

    issue:
      "Use true, false, 1, 0, yes, no, on, or off.",
  };
}

function readPositiveIntegerEnvironmentSetting(input: {
  key: string;
  label: string;
  description: string;
}): AttendancePolicyEnvironmentSetting {
  const rawValue =
    process.env[input.key]
      ?.trim() ?? "";

  if (rawValue.length === 0) {
    return {
      ...input,

      valueType:
        "POSITIVE_INTEGER",

      configured: false,
      valid: true,

      rawValue: null,
      normalizedValue: null,

      issue: null,
    };
  }

  const converted =
    Number(rawValue);

  if (
    !Number.isSafeInteger(converted) ||
    converted < 1
  ) {
    return {
      ...input,

      valueType:
        "POSITIVE_INTEGER",

      configured: true,
      valid: false,

      rawValue,
      normalizedValue: null,

      issue:
        "The value must be a positive whole number.",
    };
  }

  return {
    ...input,

    valueType:
      "POSITIVE_INTEGER",

    configured: true,
    valid: true,

    rawValue,
    normalizedValue:
      String(converted),

    issue: null,
  };
}

function readTextEnvironmentSetting(input: {
  key: string;
  label: string;
  description: string;
}): AttendancePolicyEnvironmentSetting {
  const rawValue =
    process.env[input.key]
      ?.trim() ?? "";

  return {
    ...input,

    valueType: "TEXT",

    configured:
      rawValue.length > 0,

    valid: true,

    rawValue:
      rawValue.length > 0
        ? rawValue
        : null,

    normalizedValue:
      rawValue.length > 0
        ? rawValue
        : null,

    issue: null,
  };
}

function getEnvironmentSettings(): AttendancePolicyEnvironmentSetting[] {
  return [
    readPositiveIntegerEnvironmentSetting({
      key:
        "ATTENDANCE_DEFAULT_BRANCH_ID",

      label:
        "Default Attendance Branch",

      description:
        "Branch used when an attendance source does not explicitly provide a branch.",
    }),

    readBooleanEnvironmentSetting({
      key:
        "ATTENDANCE_ALLOW_WEB_TIME_IN",

      label:
        "Allow Web Time-In",

      description:
        "Controls whether authorized employees can create attendance punches through the web application.",
    }),

    readBooleanEnvironmentSetting({
      key:
        "ATTENDANCE_ALLOW_MANUAL_TIME_IN",

      label:
        "Allow Manual Time-In",

      description:
        "Controls whether authorized staff can manually create or correct attendance punches.",
    }),

    readBooleanEnvironmentSetting({
      key:
        "ATTENDANCE_REQUIRE_PHOTO",

      label:
        "Require Attendance Photo",

      description:
        "Controls whether attendance submissions require photo evidence.",
    }),

    readBooleanEnvironmentSetting({
      key:
        "ATTENDANCE_REQUIRE_LOCATION",

      label:
        "Require Attendance Location",

      description:
        "Controls whether latitude and longitude are required for attendance submissions.",
    }),

    readTextEnvironmentSetting({
      key:
        "ATTENDANCE_PHOTO_DIR",

      label:
        "Attendance Photo Directory",

      description:
        "Local storage directory used for captured attendance photos.",
    }),

    readPositiveIntegerEnvironmentSetting({
      key:
        "ATTENDANCE_MAX_FILE_SIZE_MB",

      label:
        "Maximum Photo Size",

      description:
        "Maximum attendance photo upload size in megabytes.",
    }),
  ];
}

function mapColumns(
  rows:
    ColumnMetadataRow[],
): AttendancePolicySchemaColumn[] {
  return rows.map(
    (row) => {
      const extra =
        row.extra?.trim() ||
        null;

      const normalizedExtra =
        extra?.toLowerCase() ??
        "";

      return {
        name:
          row.columnName,

        ordinalPosition:
          normalizeInteger(
            row.ordinalPosition,
          ),

        dataType:
          row.dataType,

        columnType:
          row.columnType,

        nullable:
          row.isNullable.toUpperCase() ===
          "YES",

        defaultValue:
          normalizeMetadataValue(
            row.columnDefault,
          ),

        keyType:
          row.columnKey?.trim() ||
          null,

        extra,

        maximumLength:
          row.characterMaximumLength ===
          null
            ? null
            : normalizeInteger(
                row.characterMaximumLength,
              ),

        autoIncrement:
          normalizedExtra.includes(
            "auto_increment",
          ),

        generated:
          normalizedExtra.includes(
            "generated",
          ),
      };
    },
  );
}

function mapIndexes(
  rows:
    IndexMetadataRow[],
): AttendancePolicySchemaIndex[] {
  const grouped =
    new Map<
      string,
      {
        unique: boolean;
        primary: boolean;

        columns: Array<{
          sequence: number;
          name: string;
        }>;
      }
    >();

  for (const row of rows) {
    const existing =
      grouped.get(
        row.indexName,
      ) ?? {
        unique:
          normalizeInteger(
            row.nonUnique,
          ) === 0,

        primary:
          row.indexName ===
          "PRIMARY",

        columns: [],
      };

    existing.columns.push({
      sequence:
        normalizeInteger(
          row.sequenceInIndex,
        ),

      name:
        row.columnName,
    });

    grouped.set(
      row.indexName,
      existing,
    );
  }

  return Array.from(
    grouped.entries(),
  ).map(
    ([
      name,
      value,
    ]) => ({
      name,

      unique:
        value.unique,

      primary:
        value.primary,

      columns:
        value.columns
          .sort(
            (
              left,
              right,
            ) =>
              left.sequence -
              right.sequence,
          )
          .map(
            (column) =>
              column.name,
          ),
    }),
  );
}

function mapForeignKeys(
  rows:
    ForeignKeyMetadataRow[],
): AttendancePolicySchemaForeignKey[] {
  return rows.map(
    (row) => ({
      constraintName:
        row.constraintName,

      columnName:
        row.columnName,

      referencedTableName:
        row.referencedTableName,

      referencedColumnName:
        row.referencedColumnName,

      updateRule:
        row.updateRule,

      deleteRule:
        row.deleteRule,
    }),
  );
}

function mapIncomingForeignKeys(
  rows:
    IncomingForeignKeyMetadataRow[],
): AttendancePolicySchemaIncomingForeignKey[] {
  return rows.map(
    (row) => ({
      constraintName:
        row.constraintName,

      referencingTableName:
        row.referencingTableName,

      referencingColumnName:
        row.referencingColumnName,

      referencedColumnName:
        row.referencedColumnName,

      updateRule:
        row.updateRule,

      deleteRule:
        row.deleteRule,
    }),
  );
}

async function getCandidateTableCount(
  tableName:
    AttendancePolicyTableCandidateName,
): Promise<number> {
  let rows:
    CountRow[];

  switch (tableName) {
    case "attendance_policies":
      rows =
        await prisma.$queryRaw<
          CountRow[]
        >`
          SELECT
            COUNT(*) AS recordCount
          FROM attendance_policies
        `;
      break;

    case "attendance_policy_settings":
      rows =
        await prisma.$queryRaw<
          CountRow[]
        >`
          SELECT
            COUNT(*) AS recordCount
          FROM attendance_policy_settings
        `;
      break;

    case "attendance_settings":
      rows =
        await prisma.$queryRaw<
          CountRow[]
        >`
          SELECT
            COUNT(*) AS recordCount
          FROM attendance_settings
        `;
      break;

    case "system_settings":
      rows =
        await prisma.$queryRaw<
          CountRow[]
        >`
          SELECT
            COUNT(*) AS recordCount
          FROM system_settings
        `;
      break;

    case "app_settings":
      rows =
        await prisma.$queryRaw<
          CountRow[]
        >`
          SELECT
            COUNT(*) AS recordCount
          FROM app_settings
        `;
      break;

    case "application_settings":
      rows =
        await prisma.$queryRaw<
          CountRow[]
        >`
          SELECT
            COUNT(*) AS recordCount
          FROM application_settings
        `;
      break;

    case "settings":
      rows =
        await prisma.$queryRaw<
          CountRow[]
        >`
          SELECT
            COUNT(*) AS recordCount
          FROM settings
        `;
      break;
  }

  return normalizeInteger(
    rows[0]?.recordCount,
  );
}

async function inspectCandidateTable(
  tableName:
    AttendancePolicyTableCandidateName,

  exists: boolean,
): Promise<AttendancePolicyCandidateTable> {
  if (!exists) {
    return {
      tableName,

      exists: false,

      recordCount: null,

      columns: [],
      indexes: [],

      foreignKeys: [],

      incomingForeignKeys: [],
    };
  }

  const [
    recordCount,
    columnRows,
    indexRows,
    foreignKeyRows,
    incomingForeignKeyRows,
  ] = await Promise.all([
    getCandidateTableCount(
      tableName,
    ),

    prisma.$queryRaw<
      ColumnMetadataRow[]
    >`
      SELECT
        COLUMN_NAME AS columnName,
        ORDINAL_POSITION AS ordinalPosition,
        COLUMN_DEFAULT AS columnDefault,
        IS_NULLABLE AS isNullable,
        DATA_TYPE AS dataType,
        COLUMN_TYPE AS columnType,
        COLUMN_KEY AS columnKey,
        EXTRA AS extra,
        CHARACTER_MAXIMUM_LENGTH AS characterMaximumLength
      FROM information_schema.COLUMNS
      WHERE
        TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ${tableName}
      ORDER BY
        ORDINAL_POSITION ASC
    `,

    prisma.$queryRaw<
      IndexMetadataRow[]
    >`
      SELECT
        INDEX_NAME AS indexName,
        NON_UNIQUE AS nonUnique,
        SEQ_IN_INDEX AS sequenceInIndex,
        COLUMN_NAME AS columnName
      FROM information_schema.STATISTICS
      WHERE
        TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ${tableName}
      ORDER BY
        INDEX_NAME ASC,
        SEQ_IN_INDEX ASC
    `,

    prisma.$queryRaw<
      ForeignKeyMetadataRow[]
    >`
      SELECT
        kcu.CONSTRAINT_NAME AS constraintName,
        kcu.COLUMN_NAME AS columnName,
        kcu.REFERENCED_TABLE_NAME AS referencedTableName,
        kcu.REFERENCED_COLUMN_NAME AS referencedColumnName,
        rc.UPDATE_RULE AS updateRule,
        rc.DELETE_RULE AS deleteRule
      FROM information_schema.KEY_COLUMN_USAGE kcu
      LEFT JOIN information_schema.REFERENTIAL_CONSTRAINTS rc
        ON rc.CONSTRAINT_SCHEMA =
          kcu.CONSTRAINT_SCHEMA
        AND rc.CONSTRAINT_NAME =
          kcu.CONSTRAINT_NAME
      WHERE
        kcu.TABLE_SCHEMA = DATABASE()
        AND kcu.TABLE_NAME = ${tableName}
        AND kcu.REFERENCED_TABLE_NAME IS NOT NULL
      ORDER BY
        kcu.CONSTRAINT_NAME ASC,
        kcu.ORDINAL_POSITION ASC
    `,

    prisma.$queryRaw<
      IncomingForeignKeyMetadataRow[]
    >`
      SELECT
        kcu.CONSTRAINT_NAME AS constraintName,
        kcu.TABLE_NAME AS referencingTableName,
        kcu.COLUMN_NAME AS referencingColumnName,
        kcu.REFERENCED_COLUMN_NAME AS referencedColumnName,
        rc.UPDATE_RULE AS updateRule,
        rc.DELETE_RULE AS deleteRule
      FROM information_schema.KEY_COLUMN_USAGE kcu
      LEFT JOIN information_schema.REFERENTIAL_CONSTRAINTS rc
        ON rc.CONSTRAINT_SCHEMA =
          kcu.CONSTRAINT_SCHEMA
        AND rc.CONSTRAINT_NAME =
          kcu.CONSTRAINT_NAME
      WHERE
        kcu.REFERENCED_TABLE_SCHEMA = DATABASE()
        AND kcu.REFERENCED_TABLE_NAME = ${tableName}
      ORDER BY
        kcu.TABLE_NAME ASC,
        kcu.COLUMN_NAME ASC
    `,
  ]);

  return {
    tableName,

    exists: true,

    recordCount,

    columns:
      mapColumns(
        columnRows,
      ),

    indexes:
      mapIndexes(
        indexRows,
      ),

    foreignKeys:
      mapForeignKeys(
        foreignKeyRows,
      ),

    incomingForeignKeys:
      mapIncomingForeignKeys(
        incomingForeignKeyRows,
      ),
  };
}

async function getDefaultBranch(
  branchId: number,
): Promise<AttendancePolicyDefaultBranch | null> {
  const rows =
    await prisma.$queryRaw<
      BranchRow[]
    >`
      SELECT
        branch_id AS branchId,
        branch_code AS branchCode,
        name,
        status
      FROM branches
      WHERE branch_id = ${branchId}
      LIMIT 1
    `;

  const row =
    rows[0];

  if (!row) {
    return null;
  }

  return {
    branchId:
      normalizeInteger(
        row.branchId,
      ),

    branchCode:
      row.branchCode,

    name:
      row.name,

    status:
      row.status,
  };
}

function determineStatus(
  existingTables:
    AttendancePolicyCandidateTable[],
): {
  status:
    AttendancePolicyDiscoveryStatus;

  statusLabel: string;
  statusDescription: string;

  selectedTableName:
    AttendancePolicyTableCandidateName | null;

  recommendation: string;
} {
  if (
    existingTables.length === 0
  ) {
    return {
      status:
        "NEEDS_DATABASE_STORAGE",

      statusLabel:
        "Persistent Attendance Policy Storage Not Found",

      statusDescription:
        "Attendance behavior currently appears to depend on environment variables or hard-coded application defaults.",

      selectedTableName:
        null,

      recommendation:
        "Create a dedicated attendance_policy_settings table before adding editable policy controls.",
    };
  }

  if (
    existingTables.length === 1
  ) {
    return {
      status:
        "EXISTING_TABLE_FOUND",

      statusLabel:
        "Existing Attendance Policy Storage Found",

      statusDescription:
        `The ${existingTables[0].tableName} table can be reviewed for exact typed Attendance Policy management.`,

      selectedTableName:
        existingTables[0]
          .tableName,

      recommendation:
        "Use the discovered table schema for exact policy CRUD only after confirming its records and intended key structure.",
    };
  }

  return {
    status:
      "MULTIPLE_TABLES_FOUND",

    statusLabel:
      "Multiple Possible Settings Tables Found",

    statusDescription:
      "More than one existing database table may contain attendance or application settings.",

    selectedTableName:
      null,

    recommendation:
      "Confirm which existing settings table owns attendance policies before implementing editable controls.",
  };
}

export function buildAttendancePolicyDiscoveryCopyReport(
  data:
    AttendancePolicyDiscoveryData,
): string {
  const report:
    AttendancePolicyDiscoveryCopyReport =
    {
      databaseName:
        data.databaseName,

      status:
        data.status,

      environmentSettings:
        data.environmentSettings,

      candidateTables:
        data.candidateTables,

      relatedTableNames:
        data.relatedTableNames,

      selectedTableName:
        data.selectedTableName,

      defaultBranchId:
        data.defaultBranchId,

      defaultBranch:
        data.defaultBranch,

      warnings:
        data.warnings,

      recommendation:
        data.recommendation,
    };

  return JSON.stringify(
    report,
    null,
    2,
  );
}

export async function getAttendancePolicyDiscoveryData(): Promise<AttendancePolicyDiscoveryData> {
  const generatedAt =
    new Date();

  const environmentSettings =
    getEnvironmentSettings();

  try {
    const [
      databaseRows,
      existingTableRows,
      relatedTableRows,
    ] = await Promise.all([
      prisma.$queryRaw<
        DatabaseNameRow[]
      >`
        SELECT
          DATABASE() AS databaseName
      `,

      prisma.$queryRaw<
        ExistingTableRow[]
      >`
        SELECT
          TABLE_NAME AS tableName
        FROM information_schema.TABLES
        WHERE
          TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME IN (
            'attendance_policies',
            'attendance_policy_settings',
            'attendance_settings',
            'system_settings',
            'app_settings',
            'application_settings',
            'settings'
          )
        ORDER BY
          TABLE_NAME ASC
      `,

      prisma.$queryRaw<
        RelatedTableRow[]
      >`
        SELECT
          TABLE_NAME AS tableName
        FROM information_schema.TABLES
        WHERE
          TABLE_SCHEMA = DATABASE()
          AND (
            TABLE_NAME LIKE '%setting%'
            OR TABLE_NAME LIKE '%policy%'
            OR TABLE_NAME LIKE '%config%'
          )
        ORDER BY
          TABLE_NAME ASC
      `,
    ]);

    const existingTableNames =
      new Set(
        existingTableRows.map(
          (row) =>
            row.tableName,
        ),
      );

    const candidateTables =
      await Promise.all(
        ATTENDANCE_POLICY_TABLE_CANDIDATES.map(
          (tableName) =>
            inspectCandidateTable(
              tableName,
              existingTableNames.has(
                tableName,
              ),
            ),
        ),
      );

    const existingTables =
      candidateTables.filter(
        (candidateTable) =>
          candidateTable.exists,
      );

    const statusResult =
      determineStatus(
        existingTables,
      );

    const warnings:
      string[] = [];

    for (
      const setting of
      environmentSettings
    ) {
      if (!setting.valid) {
        warnings.push(
          `${setting.key}: ${setting.issue ?? "Invalid configuration value."}`,
        );
      }
    }

    const defaultBranchSetting =
      environmentSettings.find(
        (setting) =>
          setting.key ===
          "ATTENDANCE_DEFAULT_BRANCH_ID",
      );

    const defaultBranchId =
      defaultBranchSetting
        ?.valid &&
      defaultBranchSetting.normalizedValue
        ? Number(
            defaultBranchSetting.normalizedValue,
          )
        : null;

    let defaultBranch:
      AttendancePolicyDefaultBranch | null =
      null;

    if (defaultBranchId !== null) {
      defaultBranch =
        await getDefaultBranch(
          defaultBranchId,
        );

      if (!defaultBranch) {
        warnings.push(
          `ATTENDANCE_DEFAULT_BRANCH_ID references branch ID ${defaultBranchId}, but that branch was not found.`,
        );
      } else if (
        defaultBranch.status !==
        "ACTIVE"
      ) {
        warnings.push(
          `The configured default branch "${defaultBranch.name}" has status ${defaultBranch.status}.`,
        );
      }
    }

    const requirePhotoSetting =
      environmentSettings.find(
        (setting) =>
          setting.key ===
          "ATTENDANCE_REQUIRE_PHOTO",
      );

    const photoDirectorySetting =
      environmentSettings.find(
        (setting) =>
          setting.key ===
          "ATTENDANCE_PHOTO_DIR",
      );

    if (
      requirePhotoSetting
        ?.normalizedValue ===
        "true" &&
      !photoDirectorySetting
        ?.configured
    ) {
      warnings.push(
        "Attendance photos are required, but ATTENDANCE_PHOTO_DIR is not configured.",
      );
    }

    return {
      generatedAt:
        formatDateTime(
          generatedAt,
        ),

      generatedAtIso:
        generatedAt.toISOString(),

      databaseName:
        databaseRows[0]
          ?.databaseName ?? null,

      status:
        statusResult.status,

      statusLabel:
        statusResult.statusLabel,

      statusDescription:
        statusResult.statusDescription,

      environmentSettings,

      candidateTables,

      relatedTableNames:
        relatedTableRows.map(
          (row) =>
            row.tableName,
        ),

      selectedTableName:
        statusResult.selectedTableName,

      defaultBranchId,

      defaultBranch,

      warnings,

      recommendation:
        statusResult.recommendation,

      errorMessage: null,
    };
  } catch (error) {
    return {
      generatedAt:
        formatDateTime(
          generatedAt,
        ),

      generatedAtIso:
        generatedAt.toISOString(),

      databaseName: null,

      status: "ERROR",

      statusLabel:
        "Attendance Policy Discovery Failed",

      statusDescription:
        "The application could not inspect attendance-policy configuration or database storage.",

      environmentSettings,

      candidateTables:
        ATTENDANCE_POLICY_TABLE_CANDIDATES.map(
          (tableName) => ({
            tableName,

            exists: false,

            recordCount: null,

            columns: [],
            indexes: [],

            foreignKeys: [],

            incomingForeignKeys: [],
          }),
        ),

      relatedTableNames: [],

      selectedTableName: null,

      defaultBranchId: null,

      defaultBranch: null,

      warnings: [],

      recommendation:
        "Resolve the database inspection error before creating editable Attendance Policy settings.",

      errorMessage:
        getErrorMessage(
          error,
        ),
    };
  }
}