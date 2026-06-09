import { prisma } from "@/lib/db/prisma";
import type {
  OrganizationInspectableTableName,
  OrganizationTableSchemaColumn,
  OrganizationTableSchemaCopyReport,
  OrganizationTableSchemaDetectedFields,
  OrganizationTableSchemaForeignKey,
  OrganizationTableSchemaIncomingForeignKey,
  OrganizationTableSchemaIndex,
  OrganizationTableSchemaInspectionData,
  OrganizationTableSchemaSampleRow,
} from "../types/organization-table-schema-types";

const SAMPLE_ROW_LIMIT = 10;

type OrganizationSchemaProfile = {
  entityLabel: string;
  entityPluralLabel: string;

  idCandidates:
    readonly string[];

  nameCandidates:
    readonly string[];

  codeCandidates:
    readonly string[];
};

const ORGANIZATION_SCHEMA_PROFILES: Record<
  OrganizationInspectableTableName,
  OrganizationSchemaProfile
> = {
  departments: {
    entityLabel:
      "Department",

    entityPluralLabel:
      "Departments",

    idCandidates: [
      "department_id",
      "departmentId",
      "dept_id",
      "deptId",
      "id",
    ],

    nameCandidates: [
      "department",
      "department_name",
      "departmentName",
      "dept_name",
      "deptName",
      "name",
      "title",
    ],

    codeCandidates: [
      "department_code",
      "departmentCode",
      "dept_code",
      "deptCode",
      "code",
      "short_name",
      "shortName",
    ],
  },

  designations: {
    entityLabel:
      "Designation",

    entityPluralLabel:
      "Designations",

    idCandidates: [
      "designation_id",
      "designationId",
      "position_id",
      "positionId",
      "id",
    ],

    nameCandidates: [
      "designation",
      "designation_name",
      "designationName",
      "position",
      "position_name",
      "positionName",
      "name",
      "title",
    ],

    codeCandidates: [
      "designation_code",
      "designationCode",
      "position_code",
      "positionCode",
      "code",
    ],
  },

  emp_types: {
    entityLabel:
      "Employee Type",

    entityPluralLabel:
      "Employee Types",

    idCandidates: [
      "emp_type_id",
      "empTypeId",
      "employee_type_id",
      "employeeTypeId",
      "id",
    ],

    nameCandidates: [
      "emp_type",
      "empType",
      "employee_type",
      "employeeType",
      "type_name",
      "typeName",
      "name",
      "title",
    ],

    codeCandidates: [
      "emp_type_code",
      "empTypeCode",
      "employee_type_code",
      "employeeTypeCode",
      "type_code",
      "typeCode",
      "code",
    ],
  },
};

type DatabaseNameRow = {
  databaseName: string | null;
};

type TableExistsRow = {
  tableCount:
    | number
    | bigint
    | string;
};

type RecordCountRow = {
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

  columnDefault:
    | string
    | number
    | bigint
    | boolean
    | Date
    | null;

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

  columnComment:
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

type RawOrganizationRow = Record<
  string,
  unknown
>;

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
      timeZone:
        "Asia/Manila",
    },
  ).format(value);
}

function normalizeInteger(
  value:
    | number
    | bigint
    | string
    | null
    | undefined,
): number {
  if (
    value === null ||
    value === undefined
  ) {
    return 0;
  }

  if (typeof value === "number") {
    return Number.isFinite(value)
      ? Math.trunc(value)
      : 0;
  }

  if (typeof value === "bigint") {
    const converted =
      Number(value);

    return Number.isSafeInteger(
      converted,
    )
      ? converted
      : 0;
  }

  const converted =
    Number(value);

  return Number.isSafeInteger(
    converted,
  )
    ? converted
    : 0;
}

function normalizeMetadataValue(
  value:
    ColumnMetadataRow["columnDefault"],
): string | null {
  if (value === null) {
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

function normalizeSampleValue(
  value: unknown,
): string | number | boolean | null {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  if (typeof value === "bigint") {
    return value.toString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (value instanceof Uint8Array) {
    return Buffer.from(
      value,
    ).toString("base64");
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function normalizeColumnName(
  value: string,
): string {
  return value
    .trim()
    .toLowerCase()
    .replaceAll("_", "")
    .replaceAll("-", "");
}

function findColumn(
  columns:
    OrganizationTableSchemaColumn[],

  candidates:
    readonly string[],
): string | null {
  const normalizedCandidates =
    new Set(
      candidates.map(
        normalizeColumnName,
      ),
    );

  const matchingColumn =
    columns.find(
      (column) =>
        normalizedCandidates.has(
          normalizeColumnName(
            column.name,
          ),
        ),
    );

  return matchingColumn?.name ??
    null;
}

function mapColumns(
  rows:
    ColumnMetadataRow[],
): OrganizationTableSchemaColumn[] {
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

        comment:
          row.columnComment?.trim() ||
          null,

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
): OrganizationTableSchemaIndex[] {
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
): OrganizationTableSchemaForeignKey[] {
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
): OrganizationTableSchemaIncomingForeignKey[] {
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

function mapSampleRows(
  rows:
    RawOrganizationRow[],
): OrganizationTableSchemaSampleRow[] {
  return rows.map(
    (row) =>
      Object.fromEntries(
        Object.entries(row).map(
          ([
            key,
            value,
          ]) => [
            key,
            normalizeSampleValue(
              value,
            ),
          ],
        ),
      ),
  );
}

function getRequiredInsertColumns(
  columns:
    OrganizationTableSchemaColumn[],
): string[] {
  return columns
    .filter(
      (column) =>
        !column.nullable &&
        column.defaultValue ===
          null &&
        !column.autoIncrement &&
        !column.generated,
    )
    .map(
      (column) =>
        column.name,
    );
}

function detectFields(input: {
  tableName:
    OrganizationInspectableTableName;

  columns:
    OrganizationTableSchemaColumn[];

  indexes:
    OrganizationTableSchemaIndex[];
}): OrganizationTableSchemaDetectedFields {
  const profile =
    ORGANIZATION_SCHEMA_PROFILES[
      input.tableName
    ];

  const primaryIndex =
    input.indexes.find(
      (index) =>
        index.primary,
    );

  const primaryColumn =
    primaryIndex?.columns.length ===
    1
      ? primaryIndex.columns[0]
      : null;

  return {
    idColumn:
      primaryColumn ??
      findColumn(
        input.columns,
        profile.idCandidates,
      ),

    nameColumn:
      findColumn(
        input.columns,
        profile.nameCandidates,
      ),

    codeColumn:
      findColumn(
        input.columns,
        profile.codeCandidates,
      ),

    branchIdColumn:
      findColumn(
        input.columns,
        [
          "branch_id",
          "branchId",
        ],
      ),

    departmentIdColumn:
      findColumn(
        input.columns,
        [
          "department_id",
          "departmentId",
          "dept_id",
          "deptId",
        ],
      ),

    descriptionColumn:
      findColumn(
        input.columns,
        [
          "description",
          "remarks",
          "notes",
          "details",
        ],
      ),

    statusColumn:
      findColumn(
        input.columns,
        [
          "status",
          "is_active",
          "isActive",
          "active",
        ],
      ),

    createdAtColumn:
      findColumn(
        input.columns,
        [
          "created_at",
          "createdAt",
          "date_created",
          "dateCreated",
        ],
      ),

    updatedAtColumn:
      findColumn(
        input.columns,
        [
          "updated_at",
          "updatedAt",
          "date_updated",
          "dateUpdated",
        ],
      ),
  };
}

function getErrorMessage(
  error: unknown,
): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "An unknown database error occurred.";
}

async function getRecordCount(
  tableName:
    OrganizationInspectableTableName,
): Promise<number> {
  let rows:
    RecordCountRow[];

  switch (tableName) {
    case "departments":
      rows =
        await prisma.$queryRaw<
          RecordCountRow[]
        >`
          SELECT
            COUNT(*) AS recordCount
          FROM departments
        `;
      break;

    case "designations":
      rows =
        await prisma.$queryRaw<
          RecordCountRow[]
        >`
          SELECT
            COUNT(*) AS recordCount
          FROM designations
        `;
      break;

    case "emp_types":
      rows =
        await prisma.$queryRaw<
          RecordCountRow[]
        >`
          SELECT
            COUNT(*) AS recordCount
          FROM emp_types
        `;
      break;
  }

  return normalizeInteger(
    rows[0]?.recordCount,
  );
}

async function getSampleRows(
  tableName:
    OrganizationInspectableTableName,
): Promise<RawOrganizationRow[]> {
  switch (tableName) {
    case "departments":
      return prisma.$queryRawUnsafe<
        RawOrganizationRow[]
      >(
        `SELECT * FROM departments LIMIT ${SAMPLE_ROW_LIMIT}`,
      );

    case "designations":
      return prisma.$queryRawUnsafe<
        RawOrganizationRow[]
      >(
        `SELECT * FROM designations LIMIT ${SAMPLE_ROW_LIMIT}`,
      );

    case "emp_types":
      return prisma.$queryRawUnsafe<
        RawOrganizationRow[]
      >(
        `SELECT * FROM emp_types LIMIT ${SAMPLE_ROW_LIMIT}`,
      );
  }
}

function emptyDetectedFields(): OrganizationTableSchemaDetectedFields {
  return {
    idColumn: null,

    nameColumn: null,
    codeColumn: null,

    branchIdColumn: null,
    departmentIdColumn: null,

    descriptionColumn: null,
    statusColumn: null,

    createdAtColumn: null,
    updatedAtColumn: null,
  };
}

function createCopyReport(
  data:
    OrganizationTableSchemaInspectionData,
): OrganizationTableSchemaCopyReport {
  return {
    tableName:
      data.tableName,

    databaseName:
      data.databaseName,

    recordCount:
      data.recordCount,

    detectedFields:
      data.detectedFields,

    requiredInsertColumns:
      data.requiredInsertColumns,

    columns:
      data.columns,

    indexes:
      data.indexes,

    foreignKeys:
      data.foreignKeys,

    incomingForeignKeys:
      data.incomingForeignKeys,

    crudReadiness:
      data.crudReadiness,
  };
}

export function buildOrganizationTableSchemaCopyReport(
  data:
    OrganizationTableSchemaInspectionData,
): string {
  return JSON.stringify(
    createCopyReport(data),
    null,
    2,
  );
}

export async function getOrganizationTableSchemaInspectionData(
  tableName:
    OrganizationInspectableTableName,
): Promise<OrganizationTableSchemaInspectionData> {
  const generatedAt =
    new Date();

  const profile =
    ORGANIZATION_SCHEMA_PROFILES[
      tableName
    ];

  try {
    const [
      databaseRows,
      tableRows,
    ] = await Promise.all([
      prisma.$queryRaw<
        DatabaseNameRow[]
      >`
        SELECT
          DATABASE() AS databaseName
      `,

      prisma.$queryRaw<
        TableExistsRow[]
      >`
        SELECT
          COUNT(*) AS tableCount
        FROM information_schema.TABLES
        WHERE
          TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = ${tableName}
      `,
    ]);

    const databaseName =
      databaseRows[0]
        ?.databaseName ?? null;

    const tableExists =
      normalizeInteger(
        tableRows[0]
          ?.tableCount,
      ) > 0;

    if (!tableExists) {
      return {
        status:
          "MISSING",

        statusLabel:
          `${profile.entityPluralLabel} Table Missing`,

        statusDescription:
          `The current database does not contain a table named "${tableName}".`,

        generatedAt:
          formatDateTime(
            generatedAt,
          ),

        generatedAtIso:
          generatedAt.toISOString(),

        databaseName,

        tableName,

        entityLabel:
          profile.entityLabel,

        entityPluralLabel:
          profile.entityPluralLabel,

        tableExists: false,

        recordCount: 0,

        columns: [],
        indexes: [],

        foreignKeys: [],
        incomingForeignKeys: [],

        detectedFields:
          emptyDetectedFields(),

        requiredInsertColumns: [],

        sampleColumnNames: [],
        sampleRows: [],

        crudReadiness: {
          primaryKeyDetected: false,
          displayNameDetected: false,

          safeForTypedCrud: false,

          blockingReasons: [
            `Database table "${tableName}" was not found.`,
          ],
        },

        errorMessage: null,
      };
    }

    const [
      recordCount,
      columnRows,
      indexRows,
      foreignKeyRows,
      incomingForeignKeyRows,
      rawSampleRows,
    ] = await Promise.all([
      getRecordCount(
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
          CHARACTER_MAXIMUM_LENGTH AS characterMaximumLength,
          COLUMN_COMMENT AS columnComment
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

      getSampleRows(
        tableName,
      ),
    ]);

    const columns =
      mapColumns(
        columnRows,
      );

    const indexes =
      mapIndexes(
        indexRows,
      );

    const foreignKeys =
      mapForeignKeys(
        foreignKeyRows,
      );

    const incomingForeignKeys =
      mapIncomingForeignKeys(
        incomingForeignKeyRows,
      );

    const detectedFields =
      detectFields({
        tableName,
        columns,
        indexes,
      });

    const requiredInsertColumns =
      getRequiredInsertColumns(
        columns,
      );

    const blockingReasons:
      string[] = [];

    if (
      !detectedFields.idColumn
    ) {
      blockingReasons.push(
        `A single primary-key or ${profile.entityLabel.toLowerCase()} ID column could not be detected.`,
      );
    }

    if (
      !detectedFields.nameColumn
    ) {
      blockingReasons.push(
        `A ${profile.entityLabel.toLowerCase()} display-name column could not be detected.`,
      );
    }

    const safeForTypedCrud =
      blockingReasons.length ===
      0;

    return {
      status:
        safeForTypedCrud
          ? "READY"
          : "ERROR",

      statusLabel:
        safeForTypedCrud
          ? `${profile.entityLabel} Schema Ready`
          : `${profile.entityLabel} Schema Requires Review`,

      statusDescription:
        safeForTypedCrud
          ? `The ${tableName} table has enough structure for exact typed CRUD development.`
          : `The ${tableName} table exists, but one or more essential fields require confirmation.`,

      generatedAt:
        formatDateTime(
          generatedAt,
        ),

      generatedAtIso:
        generatedAt.toISOString(),

      databaseName,

      tableName,

      entityLabel:
        profile.entityLabel,

      entityPluralLabel:
        profile.entityPluralLabel,

      tableExists: true,

      recordCount,

      columns,
      indexes,

      foreignKeys,
      incomingForeignKeys,

      detectedFields,

      requiredInsertColumns,

      sampleColumnNames:
        columns.map(
          (column) =>
            column.name,
        ),

      sampleRows:
        mapSampleRows(
          rawSampleRows,
        ),

      crudReadiness: {
        primaryKeyDetected:
          detectedFields.idColumn !==
          null,

        displayNameDetected:
          detectedFields.nameColumn !==
          null,

        safeForTypedCrud,

        blockingReasons,
      },

      errorMessage: null,
    };
  } catch (error) {
    return {
      status:
        "ERROR",

      statusLabel:
        `${profile.entityLabel} Schema Inspection Failed`,

      statusDescription:
        `The application could not inspect the current ${tableName} table.`,

      generatedAt:
        formatDateTime(
          generatedAt,
        ),

      generatedAtIso:
        generatedAt.toISOString(),

      databaseName: null,

      tableName,

      entityLabel:
        profile.entityLabel,

      entityPluralLabel:
        profile.entityPluralLabel,

      tableExists: false,

      recordCount: 0,

      columns: [],
      indexes: [],

      foreignKeys: [],
      incomingForeignKeys: [],

      detectedFields:
        emptyDetectedFields(),

      requiredInsertColumns: [],

      sampleColumnNames: [],
      sampleRows: [],

      crudReadiness: {
        primaryKeyDetected: false,
        displayNameDetected: false,

        safeForTypedCrud: false,

        blockingReasons: [
          "The database schema inspection query failed.",
        ],
      },

      errorMessage:
        getErrorMessage(error),
    };
  }
}