import {
  Prisma,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import {
  BRANCH_PAGE_SIZES,
  BRANCH_STATUSES,
  type BranchDependencyRecord,
  type BranchDependencySummary,
  type BranchDetailData,
  type BranchListData,
  type BranchListFilters,
  type BranchListRawFilters,
  type BranchPageSize,
  type BranchRecord,
  type BranchStatus,
  type BranchStatusFilter,
} from "../types/branch-management-types";

type BranchDatabaseRow = {
  branchId:
    | number
    | bigint
    | string;

  branchCode: string;
  name: string;

  address:
    | string
    | null;

  latitude:
    | string
    | number
    | null;

  longitude:
    | string
    | number
    | null;

  radiusM:
    | number
    | bigint
    | string
    | null;

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
    typeof value === "bigint"
      ? Number(value)
      : Number(value);

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

function normalizeDecimal(
  value:
    | string
    | number
    | null,
): string | null {
  if (
    value === null ||
    value === ""
  ) {
    return null;
  }

  return String(value);
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

function parseBranchStatus(
  value: string,
): BranchStatus {
  const matchingStatus =
    BRANCH_STATUSES.find(
      (status) =>
        status === value,
    );

  return matchingStatus ??
    "INACTIVE";
}

function mapBranchRow(
  row:
    BranchDatabaseRow,
): BranchRecord {
  const createdAt =
    parseDate(
      row.createdAt,
    );

  const updatedAt =
    parseDate(
      row.updatedAt,
    );

  return {
    branchId:
      normalizePositiveInteger(
        row.branchId,
      ),

    branchCode:
      row.branchCode,

    name:
      row.name,

    address:
      row.address,

    latitude:
      normalizeDecimal(
        row.latitude,
      ),

    longitude:
      normalizeDecimal(
        row.longitude,
      ),

    radiusM:
      row.radiusM === null
        ? null
        : normalizePositiveInteger(
            row.radiusM,
          ),

    status:
      parseBranchStatus(
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
): BranchStatusFilter {
  const normalized =
    value
      .trim()
      .toUpperCase();

  const matchingStatus =
    BRANCH_STATUSES.find(
      (status) =>
        status === normalized,
    );

  return matchingStatus ?? "";
}

function parsePageSize(
  value: string,
): BranchPageSize {
  const parsed =
    Number(value);

  return (
    BRANCH_PAGE_SIZES.find(
      (pageSize) =>
        pageSize === parsed,
    ) ??
    25
  );
}

function buildWhereSql(
  filters:
    BranchListFilters,
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
          branch_code LIKE ${searchTerm}
          OR name LIKE ${searchTerm}
          OR COALESCE(address, '') LIKE ${searchTerm}
        )
        AND status = ${filters.status}
    `;
  }

  if (hasSearch) {
    return Prisma.sql`
      WHERE
        (
          branch_code LIKE ${searchTerm}
          OR name LIKE ${searchTerm}
          OR COALESCE(address, '') LIKE ${searchTerm}
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

export function parseBranchId(
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

export function parseBranchListFilters(
  rawFilters:
    BranchListRawFilters,
): BranchListFilters {
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

export async function getBranchListData(
  rawFilters:
    BranchListRawFilters,
): Promise<BranchListData> {
  const parsedFilters =
    parseBranchListFilters(
      rawFilters,
    );

  const whereSql =
    buildWhereSql(
      parsedFilters,
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
        FROM branches
        ${whereSql}
      `,
    ),

    prisma.$queryRaw<
      StatusCountRow[]
    >`
      SELECT
        status,
        COUNT(*) AS recordCount
      FROM branches
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
          parsedFilters.pageSize,
      ),
    );

  const page =
    Math.min(
      parsedFilters.page,
      totalPages,
    );

  const offset =
    (
      page - 1
    ) *
    parsedFilters.pageSize;

  const branchRows =
    await prisma.$queryRaw<
      BranchDatabaseRow[]
    >(
      Prisma.sql`
        SELECT
          branch_id AS branchId,
          branch_code AS branchCode,
          name,
          address,
          CAST(latitude AS CHAR) AS latitude,
          CAST(longitude AS CHAR) AS longitude,
          radius_m AS radiusM,
          status,
          created_at AS createdAt,
          updated_at AS updatedAt
        FROM branches
        ${whereSql}
        ORDER BY
          CASE status
            WHEN 'ACTIVE' THEN 1
            WHEN 'INACTIVE' THEN 2
            WHEN 'ARCHIVED' THEN 3
            ELSE 4
          END,
          name ASC,
          branch_id ASC
        LIMIT ${parsedFilters.pageSize}
        OFFSET ${offset}
      `,
    );

  const statusCounts =
    new Map<
      BranchStatus,
      number
    >();

  for (
    const statusCount of
    statusCountRows
  ) {
    const status =
      BRANCH_STATUSES.find(
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

  const totalBranches =
    BRANCH_STATUSES.reduce(
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
      ...parsedFilters,
      page,
    },

    branches:
      branchRows.map(
        mapBranchRow,
      ),

    summary: {
      totalBranches,

      activeBranches:
        statusCounts.get(
          "ACTIVE",
        ) ?? 0,

      inactiveBranches:
        statusCounts.get(
          "INACTIVE",
        ) ?? 0,

      archivedBranches:
        statusCounts.get(
          "ARCHIVED",
        ) ?? 0,
    },

    pagination: {
      page,

      pageSize:
        parsedFilters.pageSize,

      totalRecords,
      totalPages,

      firstRecord:
        totalRecords === 0
          ? 0
          : offset + 1,

      lastRecord:
        Math.min(
          offset +
            branchRows.length,
          totalRecords,
        ),

      hasPreviousPage:
        page > 1,

      hasNextPage:
        page < totalPages,
    },
  };
}

export async function getBranchById(
  branchId: number,
): Promise<BranchRecord | null> {
  const rows =
    await prisma.$queryRaw<
      BranchDatabaseRow[]
    >`
      SELECT
        branch_id AS branchId,
        branch_code AS branchCode,
        name,
        address,
        CAST(latitude AS CHAR) AS latitude,
        CAST(longitude AS CHAR) AS longitude,
        radius_m AS radiusM,
        status,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM branches
      WHERE branch_id = ${branchId}
      LIMIT 1
    `;

  const row =
    rows[0];

  return row
    ? mapBranchRow(row)
    : null;
}

export async function getBranchDependencySummary(
  branchId: number,
): Promise<BranchDependencySummary> {
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
        AND REFERENCED_TABLE_NAME = 'branches'
        AND REFERENCED_COLUMN_NAME = 'branch_id'
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
    BranchDependencyRecord[] =
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

    /*
     * Identifiers come from MySQL information_schema
     * and are escaped before being placed in SQL.
     * The branch ID remains a bound query parameter.
     */
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
        branchId,
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

export async function getBranchDetailData(
  branchId: number,
): Promise<BranchDetailData | null> {
  const [
    branch,
    dependencySummary,
  ] = await Promise.all([
    getBranchById(
      branchId,
    ),

    getBranchDependencySummary(
      branchId,
    ),
  ]);

  if (!branch) {
    return null;
  }

  return {
    branch,
    dependencySummary,
  };
}