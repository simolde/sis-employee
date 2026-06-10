import "dotenv/config";
import {
  writeFile,
} from "node:fs/promises";

const {
  prisma,
} = await import(
  "../src/lib/db/prisma"
);

const TABLE_NAMES = [
  "shifts",
  "shift_schedules",
  "employee_schedule_assignments",
] as const;

type DatabaseNameRow = {
  databaseName: string | null;
};

type ColumnRow = {
  columnName: string;
  ordinalPosition: bigint | number;
  columnType: string;
  isNullable: string;
  columnDefault: string | null;
  extra: string;
};

type IndexRow = {
  indexName: string;
  nonUnique: bigint | number;
  sequenceInIndex: bigint | number;
  columnName: string;
  indexType: string;
};

type ForeignKeyRow = {
  constraintName: string;
  columnName: string;
  referencedTableName: string;
  referencedColumnName: string;
  updateRule: string;
  deleteRule: string;
};

type IncomingForeignKeyRow = {
  tableName: string;
  constraintName: string;
  columnName: string;
  referencedColumnName: string;
  updateRule: string;
  deleteRule: string;
};

type CountRow = {
  recordCount: bigint | number;
};

function serializeValue(
  value: unknown,
): unknown {
  if (typeof value === "bigint") {
    return Number(value);
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value.map(
      serializeValue,
    );
  }

  if (
    value &&
    typeof value === "object"
  ) {
    return Object.fromEntries(
      Object.entries(value).map(
        ([key, nestedValue]) => [
          key,
          serializeValue(
            nestedValue,
          ),
        ],
      ),
    );
  }

  return value;
}

async function inspectTable(
  databaseName: string,
  tableName:
    (typeof TABLE_NAMES)[number],
) {
  const columns =
    await prisma.$queryRaw<
      ColumnRow[]
    >`
      SELECT
        COLUMN_NAME AS columnName,
        ORDINAL_POSITION AS ordinalPosition,
        COLUMN_TYPE AS columnType,
        IS_NULLABLE AS isNullable,
        COLUMN_DEFAULT AS columnDefault,
        EXTRA AS extra
      FROM information_schema.COLUMNS
      WHERE
        TABLE_SCHEMA = ${databaseName}
        AND TABLE_NAME = ${tableName}
      ORDER BY ORDINAL_POSITION
    `;

  const indexes =
    await prisma.$queryRaw<
      IndexRow[]
    >`
      SELECT
        INDEX_NAME AS indexName,
        NON_UNIQUE AS nonUnique,
        SEQ_IN_INDEX AS sequenceInIndex,
        COLUMN_NAME AS columnName,
        INDEX_TYPE AS indexType
      FROM information_schema.STATISTICS
      WHERE
        TABLE_SCHEMA = ${databaseName}
        AND TABLE_NAME = ${tableName}
      ORDER BY
        INDEX_NAME,
        SEQ_IN_INDEX
    `;

  const outgoingForeignKeys =
    await prisma.$queryRaw<
      ForeignKeyRow[]
    >`
      SELECT
        kcu.CONSTRAINT_NAME AS constraintName,
        kcu.COLUMN_NAME AS columnName,
        kcu.REFERENCED_TABLE_NAME AS referencedTableName,
        kcu.REFERENCED_COLUMN_NAME AS referencedColumnName,
        rc.UPDATE_RULE AS updateRule,
        rc.DELETE_RULE AS deleteRule
      FROM information_schema.KEY_COLUMN_USAGE kcu
      INNER JOIN information_schema.REFERENTIAL_CONSTRAINTS rc
        ON rc.CONSTRAINT_SCHEMA = kcu.CONSTRAINT_SCHEMA
        AND rc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME
      WHERE
        kcu.TABLE_SCHEMA = ${databaseName}
        AND kcu.TABLE_NAME = ${tableName}
        AND kcu.REFERENCED_TABLE_NAME IS NOT NULL
      ORDER BY
        kcu.CONSTRAINT_NAME,
        kcu.ORDINAL_POSITION
    `;

  const incomingForeignKeys =
    await prisma.$queryRaw<
      IncomingForeignKeyRow[]
    >`
      SELECT
        kcu.TABLE_NAME AS tableName,
        kcu.CONSTRAINT_NAME AS constraintName,
        kcu.COLUMN_NAME AS columnName,
        kcu.REFERENCED_COLUMN_NAME AS referencedColumnName,
        rc.UPDATE_RULE AS updateRule,
        rc.DELETE_RULE AS deleteRule
      FROM information_schema.KEY_COLUMN_USAGE kcu
      INNER JOIN information_schema.REFERENTIAL_CONSTRAINTS rc
        ON rc.CONSTRAINT_SCHEMA = kcu.CONSTRAINT_SCHEMA
        AND rc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME
      WHERE
        kcu.REFERENCED_TABLE_SCHEMA = ${databaseName}
        AND kcu.REFERENCED_TABLE_NAME = ${tableName}
      ORDER BY
        kcu.TABLE_NAME,
        kcu.CONSTRAINT_NAME,
        kcu.ORDINAL_POSITION
    `;

  const countRows =
    await prisma.$queryRawUnsafe<
      CountRow[]
    >(
      `SELECT COUNT(*) AS recordCount FROM \`${tableName}\``,
    );

  const sampleRows =
    await prisma.$queryRawUnsafe<
      Record<string, unknown>[]
    >(
      `SELECT * FROM \`${tableName}\` ORDER BY 1 ASC LIMIT 10`,
    );

  return {
    tableName,
    exists:
      columns.length > 0,

    recordCount:
      Number(
        countRows[0]
          ?.recordCount ?? 0,
      ),

    columns,
    indexes,
    outgoingForeignKeys,
    incomingForeignKeys,
    sampleRows,
  };
}

async function main(): Promise<void> {
  const databaseRows =
    await prisma.$queryRaw<
      DatabaseNameRow[]
    >`
      SELECT
        DATABASE() AS databaseName
    `;

  const databaseName =
    databaseRows[0]
      ?.databaseName;

  if (!databaseName) {
    throw new Error(
      "Unable to determine the selected database.",
    );
  }

  const tables = [];

  for (const tableName of TABLE_NAMES) {
    tables.push(
      await inspectTable(
        databaseName,
        tableName,
      ),
    );
  }

  const report = {
    generatedAt:
      new Date().toISOString(),

    databaseName,
    tables,
  };

  const outputFile =
    "schedule-shift-database-inspection.json";

  await writeFile(
    outputFile,
    JSON.stringify(
      serializeValue(report),
      null,
      2,
    ),
    "utf8",
  );

  console.log(
    `Created: ${outputFile}`,
  );
}

try {
  await main();
} catch (error: unknown) {
  console.error(
    "Schedule and shift inspection failed:",
    error,
  );

  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}