import { prisma } from "@/lib/db/prisma";
import type {
  BranchSchemaColumn,
  BranchSchemaCopyReport,
  BranchSchemaDetectedFields,
  BranchSchemaForeignKey,
  BranchSchemaIndex,
  BranchSchemaInspectionData,
  BranchSchemaSampleRow,
} from "../types/branch-schema-types";

const BRANCH_TABLE_NAME =
  "branches" as const;

const SAMPLE_ROW_LIMIT = 10;

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

type RawBranchRow = Record<
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
      timeZone: "Asia/Manila",
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
  columns: BranchSchemaColumn[],
  candidates: readonly string[],
): string | null {
  const normalizedCandidates =
    new Set(
      candidates.map(
        normalizeColumnName,
      ),
    );

  const matchingColumn =
    columns.find((column) =>
      normalizedCandidates.has(
        normalizeColumnName(
          column.name,
        ),
      ),
    );

  return matchingColumn?.name ?? null;
}

function detectFields(
  columns: BranchSchemaColumn[],
  indexes: BranchSchemaIndex[],
): BranchSchemaDetectedFields {
  const primaryIndex =
    indexes.find(
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
        columns,
        [
          "branch_id",
          "branchId",
          "id",
        ],
      ),

    nameColumn:
      findColumn(
        columns,
        [
          "branch",
          "branch_name",
          "branchName",
          "name",
          "title",
        ],
      ),

    codeColumn:
      findColumn(
        columns,
        [
          "branch_code",
          "branchCode",
          "code",
          "short_name",
          "shortName",
        ],
      ),

    addressColumn:
      findColumn(
        columns,
        [
          "branch_address",
          "branchAddress",
          "address",
          "location",
        ],
      ),

    statusColumn:
      findColumn(
        columns,
        [
          "is_active",
          "isActive",
          "active",
          "status",
          "branch_status",
          "branchStatus",
        ],
      ),

    createdAtColumn:
      findColumn(
        columns,
        [
          "created_at",
          "createdAt",
          "date_created",
          "dateCreated",
        ],
      ),

    updatedAtColumn:
      findColumn(
        columns,
        [
          "updated_at",
          "updatedAt",
          "date_updated",
          "dateUpdated",
        ],
      ),
  };
}

function mapColumns(
  rows: ColumnMetadataRow[],
): BranchSchemaColumn[] {
  return rows.map((row) => {
    const extra =
      row.extra?.trim() || null;

    const normalizedExtra =
      extra?.toLowerCase() ?? "";

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
  });
}

function mapIndexes(
  rows: IndexMetadataRow[],
): BranchSchemaIndex[] {
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
): BranchSchemaForeignKey[] {
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

function mapSampleRows(
  rows: RawBranchRow[],
): BranchSchemaSampleRow[] {
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
    BranchSchemaColumn[],
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

function getErrorMessage(
  error: unknown,
): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "An unknown database error occurred.";
}

function createCopyReport(
  data:
    BranchSchemaInspectionData,
): BranchSchemaCopyReport {
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

    crudReadiness:
      data.crudReadiness,
  };
}

export function buildBranchSchemaCopyReport(
  data:
    BranchSchemaInspectionData,
): string {
  return JSON.stringify(
    createCopyReport(data),
    null,
    2,
  );
}

export async function getBranchSchemaInspectionData(): Promise<BranchSchemaInspectionData> {
  const generatedAt =
    new Date();

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
          AND TABLE_NAME = 'branches'
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
          "Branches Table Missing",

        statusDescription:
          'The current database does not contain a table named "branches".',

        generatedAt:
          formatDateTime(
            generatedAt,
          ),

        generatedAtIso:
          generatedAt.toISOString(),

        databaseName,

        tableName:
          BRANCH_TABLE_NAME,

        tableExists: false,

        recordCount: 0,

        columns: [],
        indexes: [],
        foreignKeys: [],

        detectedFields: {
          idColumn: null,
          nameColumn: null,
          codeColumn: null,
          addressColumn: null,
          statusColumn: null,
          createdAtColumn: null,
          updatedAtColumn: null,
        },

        requiredInsertColumns: [],

        sampleColumnNames: [],
        sampleRows: [],

        crudReadiness: {
          primaryKeyDetected: false,
          displayNameDetected: false,

          safeForTypedCrud: false,

          blockingReasons: [
            'Database table "branches" was not found.',
          ],
        },

        errorMessage: null,
      };
    }

    const [
      countRows,
      columnRows,
      indexRows,
      foreignKeyRows,
      sampleRows,
    ] = await Promise.all([
      prisma.$queryRaw<
        RecordCountRow[]
      >`
        SELECT
          COUNT(*) AS recordCount
        FROM branches
      `,

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
          AND TABLE_NAME = 'branches'
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
          AND TABLE_NAME = 'branches'
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
          AND kcu.TABLE_NAME = 'branches'
          AND kcu.REFERENCED_TABLE_NAME IS NOT NULL
        ORDER BY
          kcu.CONSTRAINT_NAME ASC,
          kcu.ORDINAL_POSITION ASC
      `,

      prisma.$queryRawUnsafe<
        RawBranchRow[]
      >(
        `SELECT * FROM branches LIMIT ${SAMPLE_ROW_LIMIT}`,
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

    const detectedFields =
      detectFields(
        columns,
        indexes,
      );

    const requiredInsertColumns =
      getRequiredInsertColumns(
        columns,
      );

    const normalizedSampleRows =
      mapSampleRows(
        sampleRows,
      );

    const blockingReasons:
      string[] = [];

    if (
      !detectedFields.idColumn
    ) {
      blockingReasons.push(
        "A single primary-key or branch ID column could not be detected.",
      );
    }

    if (
      !detectedFields.nameColumn
    ) {
      blockingReasons.push(
        "A branch display-name column could not be detected.",
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
          ? "Branch Schema Ready"
          : "Branch Schema Requires Review",

      statusDescription:
        safeForTypedCrud
          ? "The branch table has enough structure for exact typed CRUD development."
          : "The branch table exists, but one or more essential fields require manual confirmation.",

      generatedAt:
        formatDateTime(
          generatedAt,
        ),

      generatedAtIso:
        generatedAt.toISOString(),

      databaseName,

      tableName:
        BRANCH_TABLE_NAME,

      tableExists: true,

      recordCount:
        normalizeInteger(
          countRows[0]
            ?.recordCount,
        ),

      columns,
      indexes,
      foreignKeys,

      detectedFields,

      requiredInsertColumns,

      sampleColumnNames:
        columns.map(
          (column) =>
            column.name,
        ),

      sampleRows:
        normalizedSampleRows,

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
        "Branch Schema Inspection Failed",

      statusDescription:
        "The application could not inspect the current branches table.",

      generatedAt:
        formatDateTime(
          generatedAt,
        ),

      generatedAtIso:
        generatedAt.toISOString(),

      databaseName: null,

      tableName:
        BRANCH_TABLE_NAME,

      tableExists: false,

      recordCount: 0,

      columns: [],
      indexes: [],
      foreignKeys: [],

      detectedFields: {
        idColumn: null,
        nameColumn: null,
        codeColumn: null,
        addressColumn: null,
        statusColumn: null,
        createdAtColumn: null,
        updatedAtColumn: null,
      },

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