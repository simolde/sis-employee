import {
  Prisma,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import {
  DEPARTMENT_PAGE_SIZES,
  DEPARTMENT_STATUSES,
  type DepartmentDependencyRecord,
  type DepartmentDependencySummary,
  type DepartmentDetailData,
  type DepartmentListData,
  type DepartmentListFilters,
  type DepartmentListRawFilters,
  type DepartmentPageSize,
  type DepartmentRecord,
  type DepartmentStatus,
  type DepartmentStatusFilter,
} from "../types/department-management-types";

type DepartmentDatabaseRow = {
  departmentId:
    | number
    | bigint
    | string;

  departmentCode: string;
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
    !Number.isSafeInteger(converted) ||
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

function parseDepartmentStatus(
  value: string,
): DepartmentStatus {
  const status =
    DEPARTMENT_STATUSES.find(
      (candidate) =>
        candidate === value,
    );

  return status ?? "INACTIVE";
}

function mapDepartmentRow(
  row: DepartmentDatabaseRow,
): DepartmentRecord {
  const createdAt =
    parseDate(row.createdAt);

  const updatedAt =
    parseDate(row.updatedAt);

  return {
    departmentId:
      normalizePositiveInteger(
        row.departmentId,
      ),

    departmentCode:
      row.departmentCode,

    name:
      row.name,

    status:
      parseDepartmentStatus(
        row.status,
      ),

    createdAt:
      formatDateTime(createdAt),

    createdAtIso:
      createdAt.toISOString(),

    updatedAt:
      formatDateTime(updatedAt),

    updatedAtIso:
      updatedAt.toISOString(),
  };
}

function parseStatusFilter(
  value: string,
): DepartmentStatusFilter {
  const normalized =
    value.trim().toUpperCase();

  const matchingStatus =
    DEPARTMENT_STATUSES.find(
      (status) =>
        status === normalized,
    );

  return matchingStatus ?? "";
}

function parsePageSize(
  value: string,
): DepartmentPageSize {
  const parsed =
    Number(value);

  return (
    DEPARTMENT_PAGE_SIZES.find(
      (pageSize) =>
        pageSize === parsed,
    ) ?? 25
  );
}

function buildWhereSql(
  filters: DepartmentListFilters,
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
          department_code LIKE ${searchTerm}
          OR name LIKE ${searchTerm}
        )
        AND status = ${filters.status}
    `;
  }

  if (hasSearch) {
    return Prisma.sql`
      WHERE
        (
          department_code LIKE ${searchTerm}
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

export function parseDepartmentId(
  value: string,
): number | null {
  const parsed =
    Number(value);

  if (
    !Number.isSafeInteger(parsed) ||
    parsed < 1
  ) {
    return null;
  }

  return parsed;
}

export function parseDepartmentListFilters(
  rawFilters: DepartmentListRawFilters,
): DepartmentListFilters {
  const requestedPage =
    Number(
      firstQueryValue(
        rawFilters.page,
      ),
    );

  return {
    q: firstQueryValue(
      rawFilters.q,
    )
      .trim()
      .slice(0, 191),

    status: parseStatusFilter(
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

    pageSize: parsePageSize(
      firstQueryValue(
        rawFilters.pageSize,
      ),
    ),
  };
}

export async function getDepartmentListData(
  rawFilters: DepartmentListRawFilters,
): Promise<DepartmentListData> {
  const parsedFilters =
    parseDepartmentListFilters(
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
    prisma.$queryRaw<CountRow[]>(
      Prisma.sql`
        SELECT
          COUNT(*) AS recordCount
        FROM departments
        ${whereSql}
      `,
    ),

    prisma.$queryRaw<StatusCountRow[]>`
      SELECT
        status,
        COUNT(*) AS recordCount
      FROM departments
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
    (page - 1) *
    parsedFilters.pageSize;

  const departmentRows =
    await prisma.$queryRaw<
      DepartmentDatabaseRow[]
    >(
      Prisma.sql`
        SELECT
          department_id AS departmentId,
          department_code AS departmentCode,
          name,
          status,
          created_at AS createdAt,
          updated_at AS updatedAt
        FROM departments
        ${whereSql}
        ORDER BY
          CASE status
            WHEN 'ACTIVE' THEN 1
            WHEN 'INACTIVE' THEN 2
            WHEN 'ARCHIVED' THEN 3
            ELSE 4
          END,
          name ASC,
          department_id ASC
        LIMIT ${parsedFilters.pageSize}
        OFFSET ${offset}
      `,
    );

  const statusCounts =
    new Map<
      DepartmentStatus,
      number
    >();

  for (
    const statusCount of
    statusCountRows
  ) {
    const status =
      DEPARTMENT_STATUSES.find(
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

  const totalDepartments =
    DEPARTMENT_STATUSES.reduce(
      (total, status) =>
        total +
        (statusCounts.get(status) ?? 0),
      0,
    );

  return {
    filters: {
      ...parsedFilters,
      page,
    },

    departments:
      departmentRows.map(
        mapDepartmentRow,
      ),

    summary: {
      totalDepartments,

      activeDepartments:
        statusCounts.get("ACTIVE") ??
        0,

      inactiveDepartments:
        statusCounts.get("INACTIVE") ??
        0,

      archivedDepartments:
        statusCounts.get("ARCHIVED") ??
        0,
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
            departmentRows.length,
          totalRecords,
        ),

      hasPreviousPage:
        page > 1,

      hasNextPage:
        page < totalPages,
    },
  };
}

export async function getDepartmentById(
  departmentId: number,
): Promise<DepartmentRecord | null> {
  const rows =
    await prisma.$queryRaw<
      DepartmentDatabaseRow[]
    >`
      SELECT
        department_id AS departmentId,
        department_code AS departmentCode,
        name,
        status,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM departments
      WHERE department_id = ${departmentId}
      LIMIT 1
    `;

  const row =
    rows[0];

  return row
    ? mapDepartmentRow(row)
    : null;
}

export async function getDepartmentDependencySummary(
  departmentId: number,
): Promise<DepartmentDependencySummary> {
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
        AND REFERENCED_TABLE_NAME = 'departments'
        AND REFERENCED_COLUMN_NAME = 'department_id'
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
    DepartmentDependencyRecord[] = [];

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
        departmentId,
      );

    const recordCount =
      normalizePositiveInteger(
        rows[0]?.recordCount,
      );

    if (recordCount === 0) {
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
      (total, dependency) =>
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

export async function getDepartmentDetailData(
  departmentId: number,
): Promise<DepartmentDetailData | null> {
  const [
    department,
    dependencySummary,
  ] = await Promise.all([
    getDepartmentById(
      departmentId,
    ),

    getDepartmentDependencySummary(
      departmentId,
    ),
  ]);

  if (!department) {
    return null;
  }

  return {
    department,
    dependencySummary,
  };
}