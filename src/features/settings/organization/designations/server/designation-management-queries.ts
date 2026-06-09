import {
  Prisma,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import {
  DESIGNATION_PAGE_SIZES,
  DESIGNATION_STATUSES,
  type DesignationDependencyRecord,
  type DesignationDependencySummary,
  type DesignationDetailData,
  type DesignationListData,
  type DesignationListFilters,
  type DesignationListRawFilters,
  type DesignationPageSize,
  type DesignationRecord,
  type DesignationStatus,
  type DesignationStatusFilter,
} from "../types/designation-management-types";

type DesignationDatabaseRow = {
  designationId:
    | number
    | bigint
    | string;

  designationCode: string;
  name: string;

  status: string;

  createdAt:
    | Date
    | string;

  updatedAt:
    | Date
    | string;
};

type CountRow = {
  recordCount:
    | number
    | bigint
    | string;
};

type StatusCountRow = {
  status: string;

  recordCount:
    | number
    | bigint
    | string;
};

type IncomingForeignKeyRow = {
  constraintName: string;

  tableName: string;
  columnName: string;
};

type DependencyCountRow = {
  recordCount:
    | number
    | bigint
    | string;
};

function firstQueryValue(
  value:
    | string
    | string[]
    | undefined,
): string {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function normalizePositiveInteger(
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
    !Number.isSafeInteger(
      converted,
    ) ||
    converted < 0
  ) {
    return fallback;
  }

  return converted;
}

function parseDate(
  value:
    | Date
    | string,
): Date {
  if (value instanceof Date) {
    return value;
  }

  const parsed =
    new Date(value);

  return Number.isNaN(
    parsed.getTime(),
  )
    ? new Date(0)
    : parsed;
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

function parseDesignationStatus(
  value: string,
): DesignationStatus {
  const status =
    DESIGNATION_STATUSES.find(
      (candidate) =>
        candidate === value,
    );

  return status ?? "INACTIVE";
}

function mapDesignationRow(
  row:
    DesignationDatabaseRow,
): DesignationRecord {
  const createdAt =
    parseDate(
      row.createdAt,
    );

  const updatedAt =
    parseDate(
      row.updatedAt,
    );

  return {
    designationId:
      normalizePositiveInteger(
        row.designationId,
      ),

    designationCode:
      row.designationCode,

    name:
      row.name,

    status:
      parseDesignationStatus(
        row.status,
      ),

    createdAt:
      formatDateTime(
        createdAt,
      ),

    createdAtIso:
      createdAt.toISOString(),

    updatedAt:
      formatDateTime(
        updatedAt,
      ),

    updatedAtIso:
      updatedAt.toISOString(),
  };
}

function parseStatusFilter(
  value: string,
): DesignationStatusFilter {
  const normalized =
    value
      .trim()
      .toUpperCase();

  const status =
    DESIGNATION_STATUSES.find(
      (candidate) =>
        candidate ===
        normalized,
    );

  return status ?? "";
}

function parsePageSize(
  value: string,
): DesignationPageSize {
  const parsed =
    Number(value);

  return (
    DESIGNATION_PAGE_SIZES.find(
      (pageSize) =>
        pageSize === parsed,
    ) ?? 25
  );
}

function buildWhereSql(
  filters:
    DesignationListFilters,
): Prisma.Sql {
  const hasSearch =
    filters.q.length > 0;

  const hasStatus =
    filters.status !== "";

  const searchTerm =
    `%${filters.q}%`;

  if (
    hasSearch &&
    hasStatus
  ) {
    return Prisma.sql`
      WHERE
        (
          designation_code LIKE ${searchTerm}
          OR name LIKE ${searchTerm}
        )
        AND status = ${filters.status}
    `;
  }

  if (hasSearch) {
    return Prisma.sql`
      WHERE
        (
          designation_code LIKE ${searchTerm}
          OR name LIKE ${searchTerm}
        )
    `;
  }

  if (hasStatus) {
    return Prisma.sql`
      WHERE status = ${filters.status}
    `;
  }

  return Prisma.sql``;
}

function escapeMySqlIdentifier(
  value: string,
): string {
  return `\`${value.replaceAll(
    "`",
    "``",
  )}\``;
}

export function parseDesignationId(
  value: string,
): number | null {
  const parsed =
    Number(value);

  if (
    !Number.isSafeInteger(
      parsed,
    ) ||
    parsed < 1
  ) {
    return null;
  }

  return parsed;
}

export function parseDesignationListFilters(
  rawFilters:
    DesignationListRawFilters,
): DesignationListFilters {
  const requestedPage =
    Number(
      firstQueryValue(
        rawFilters.page,
      ),
    );

  return {
    q:
      firstQueryValue(
        rawFilters.q,
      )
        .trim()
        .slice(
          0,
          191,
        ),

    status:
      parseStatusFilter(
        firstQueryValue(
          rawFilters.status,
        ),
      ),

    page:
      Number.isSafeInteger(
        requestedPage,
      ) &&
      requestedPage > 0
        ? requestedPage
        : 1,

    pageSize:
      parsePageSize(
        firstQueryValue(
          rawFilters.pageSize,
        ),
      ),
  };
}

export async function getDesignationListData(
  rawFilters:
    DesignationListRawFilters,
): Promise<DesignationListData> {
  const filters =
    parseDesignationListFilters(
      rawFilters,
    );

  const whereSql =
    buildWhereSql(
      filters,
    );

  const [
    filteredCountRows,
    statusCountRows,
  ] = await Promise.all([
    prisma.$queryRaw<
      CountRow[]
    >(
      Prisma.sql`
        SELECT
          COUNT(*) AS recordCount
        FROM designations
        ${whereSql}
      `,
    ),

    prisma.$queryRaw<
      StatusCountRow[]
    >`
      SELECT
        status,
        COUNT(*) AS recordCount
      FROM designations
      GROUP BY status
    `,
  ]);

  const totalRecords =
    normalizePositiveInteger(
      filteredCountRows[0]
        ?.recordCount,
    );

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        totalRecords /
          filters.pageSize,
      ),
    );

  const page =
    Math.min(
      filters.page,
      totalPages,
    );

  const offset =
    (
      page - 1
    ) *
    filters.pageSize;

  const designationRows =
    await prisma.$queryRaw<
      DesignationDatabaseRow[]
    >(
      Prisma.sql`
        SELECT
          designation_id AS designationId,
          designation_code AS designationCode,
          name,
          status,
          created_at AS createdAt,
          updated_at AS updatedAt
        FROM designations
        ${whereSql}
        ORDER BY
          CASE status
            WHEN 'ACTIVE' THEN 1
            WHEN 'INACTIVE' THEN 2
            WHEN 'ARCHIVED' THEN 3
            ELSE 4
          END,
          name ASC,
          designation_id ASC
        LIMIT ${filters.pageSize}
        OFFSET ${offset}
      `,
    );

  const statusCounts =
    new Map<
      DesignationStatus,
      number
    >();

  for (
    const statusCount of
    statusCountRows
  ) {
    const status =
      DESIGNATION_STATUSES.find(
        (candidate) =>
          candidate ===
          statusCount.status,
      );

    if (!status) {
      continue;
    }

    statusCounts.set(
      status,
      normalizePositiveInteger(
        statusCount.recordCount,
      ),
    );
  }

  const totalDesignations =
    DESIGNATION_STATUSES.reduce(
      (
        total,
        status,
      ) =>
        total +
        (
          statusCounts.get(
            status,
          ) ?? 0
        ),
      0,
    );

  return {
    filters: {
      ...filters,
      page,
    },

    designations:
      designationRows.map(
        mapDesignationRow,
      ),

    summary: {
      totalDesignations,

      activeDesignations:
        statusCounts.get(
          "ACTIVE",
        ) ?? 0,

      inactiveDesignations:
        statusCounts.get(
          "INACTIVE",
        ) ?? 0,

      archivedDesignations:
        statusCounts.get(
          "ARCHIVED",
        ) ?? 0,
    },

    pagination: {
      page,

      pageSize:
        filters.pageSize,

      totalRecords,
      totalPages,

      firstRecord:
        totalRecords === 0
          ? 0
          : offset + 1,

      lastRecord:
        Math.min(
          offset +
            designationRows.length,
          totalRecords,
        ),

      hasPreviousPage:
        page > 1,

      hasNextPage:
        page < totalPages,
    },
  };
}

export async function getDesignationById(
  designationId: number,
): Promise<DesignationRecord | null> {
  const rows =
    await prisma.$queryRaw<
      DesignationDatabaseRow[]
    >`
      SELECT
        designation_id AS designationId,
        designation_code AS designationCode,
        name,
        status,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM designations
      WHERE designation_id = ${designationId}
      LIMIT 1
    `;

  const row =
    rows[0];

  return row
    ? mapDesignationRow(row)
    : null;
}

export async function getDesignationDependencySummary(
  designationId: number,
): Promise<DesignationDependencySummary> {
  const foreignKeys =
    await prisma.$queryRaw<
      IncomingForeignKeyRow[]
    >`
      SELECT
        CONSTRAINT_NAME AS constraintName,
        TABLE_NAME AS tableName,
        COLUMN_NAME AS columnName
      FROM information_schema.KEY_COLUMN_USAGE
      WHERE
        REFERENCED_TABLE_SCHEMA = DATABASE()
        AND REFERENCED_TABLE_NAME = 'designations'
        AND REFERENCED_COLUMN_NAME = 'designation_id'
      ORDER BY
        TABLE_NAME ASC,
        COLUMN_NAME ASC
    `;

  const uniqueForeignKeys =
    Array.from(
      new Map(
        foreignKeys.map(
          (foreignKey) => [
            [
              foreignKey.tableName,
              foreignKey.columnName,
            ].join(":"),
            foreignKey,
          ],
        ),
      ).values(),
    );

  const dependencies:
    DesignationDependencyRecord[] =
    [];

  for (
    const foreignKey of
    uniqueForeignKeys
  ) {
    const tableIdentifier =
      escapeMySqlIdentifier(
        foreignKey.tableName,
      );

    const columnIdentifier =
      escapeMySqlIdentifier(
        foreignKey.columnName,
      );

    const rows =
      await prisma.$queryRawUnsafe<
        DependencyCountRow[]
      >(
        `
          SELECT
            COUNT(*) AS recordCount
          FROM ${tableIdentifier}
          WHERE ${columnIdentifier} = ?
        `,
        designationId,
      );

    const recordCount =
      normalizePositiveInteger(
        rows[0]?.recordCount,
      );

    if (
      recordCount === 0
    ) {
      continue;
    }

    dependencies.push({
      constraintName:
        foreignKey.constraintName,

      tableName:
        foreignKey.tableName,

      columnName:
        foreignKey.columnName,

      recordCount,
    });
  }

  const totalReferences =
    dependencies.reduce(
      (
        total,
        dependency,
      ) =>
        total +
        dependency.recordCount,
      0,
    );

  return {
    totalReferences,

    dependencies,

    canDelete:
      totalReferences === 0,
  };
}

export async function getDesignationDetailData(
  designationId: number,
): Promise<DesignationDetailData | null> {
  const [
    designation,
    dependencySummary,
  ] = await Promise.all([
    getDesignationById(
      designationId,
    ),

    getDesignationDependencySummary(
      designationId,
    ),
  ]);

  if (!designation) {
    return null;
  }

  return {
    designation,
    dependencySummary,
  };
}