import {
  Prisma,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import {
  EMPLOYEE_TYPE_PAGE_SIZES,
  EMPLOYEE_TYPE_STATUSES,
  type EmployeeTypeDependencyRecord,
  type EmployeeTypeDependencySummary,
  type EmployeeTypeDetailData,
  type EmployeeTypeListData,
  type EmployeeTypeListFilters,
  type EmployeeTypeListRawFilters,
  type EmployeeTypePageSize,
  type EmployeeTypeRecord,
  type EmployeeTypeStatus,
  type EmployeeTypeStatusFilter,
} from "../types/employee-type-management-types";

type EmployeeTypeDatabaseRow = {
  empTypeId:
    | number
    | bigint
    | string;

  empTypeCode: string;
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

function normalizeNonNegativeInteger(
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

function parseEmployeeTypeStatus(
  value: string,
): EmployeeTypeStatus {
  const status =
    EMPLOYEE_TYPE_STATUSES.find(
      (candidate) =>
        candidate === value,
    );

  return status ?? "INACTIVE";
}

function mapEmployeeTypeRow(
  row: EmployeeTypeDatabaseRow,
): EmployeeTypeRecord {
  const createdAt =
    parseDate(row.createdAt);

  const updatedAt =
    parseDate(row.updatedAt);

  return {
    empTypeId:
      normalizeNonNegativeInteger(
        row.empTypeId,
      ),

    empTypeCode:
      row.empTypeCode,

    name:
      row.name,

    status:
      parseEmployeeTypeStatus(
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
): EmployeeTypeStatusFilter {
  const normalized =
    value.trim().toUpperCase();

  const status =
    EMPLOYEE_TYPE_STATUSES.find(
      (candidate) =>
        candidate === normalized,
    );

  return status ?? "";
}

function parsePageSize(
  value: string,
): EmployeeTypePageSize {
  const parsed =
    Number(value);

  return (
    EMPLOYEE_TYPE_PAGE_SIZES.find(
      (pageSize) =>
        pageSize === parsed,
    ) ?? 25
  );
}

function buildWhereSql(
  filters: EmployeeTypeListFilters,
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
          emp_type_code LIKE ${searchTerm}
          OR name LIKE ${searchTerm}
        )
        AND status = ${filters.status}
    `;
  }

  if (hasSearch) {
    return Prisma.sql`
      WHERE
        (
          emp_type_code LIKE ${searchTerm}
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

export function parseEmployeeTypeId(
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

export function parseEmployeeTypeListFilters(
  rawFilters: EmployeeTypeListRawFilters,
): EmployeeTypeListFilters {
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

export async function getEmployeeTypeListData(
  rawFilters: EmployeeTypeListRawFilters,
): Promise<EmployeeTypeListData> {
  const filters =
    parseEmployeeTypeListFilters(
      rawFilters,
    );

  const whereSql =
    buildWhereSql(filters);

  const [
    filteredCountRows,
    statusCountRows,
  ] = await Promise.all([
    prisma.$queryRaw<CountRow[]>(
      Prisma.sql`
        SELECT
          COUNT(*) AS recordCount
        FROM emp_types
        ${whereSql}
      `,
    ),

    prisma.$queryRaw<StatusCountRow[]>`
      SELECT
        status,
        COUNT(*) AS recordCount
      FROM emp_types
      GROUP BY status
    `,
  ]);

  const totalRecords =
    normalizeNonNegativeInteger(
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
    (page - 1) *
    filters.pageSize;

  const employeeTypeRows =
    await prisma.$queryRaw<
      EmployeeTypeDatabaseRow[]
    >(
      Prisma.sql`
        SELECT
          emp_type_id AS empTypeId,
          emp_type_code AS empTypeCode,
          name,
          status,
          created_at AS createdAt,
          updated_at AS updatedAt
        FROM emp_types
        ${whereSql}
        ORDER BY
          CASE status
            WHEN 'ACTIVE' THEN 1
            WHEN 'INACTIVE' THEN 2
            WHEN 'ARCHIVED' THEN 3
            ELSE 4
          END,
          name ASC,
          emp_type_id ASC
        LIMIT ${filters.pageSize}
        OFFSET ${offset}
      `,
    );

  const statusCounts =
    new Map<
      EmployeeTypeStatus,
      number
    >();

  for (
    const statusCount of
    statusCountRows
  ) {
    const status =
      EMPLOYEE_TYPE_STATUSES.find(
        (candidate) =>
          candidate ===
          statusCount.status,
      );

    if (!status) {
      continue;
    }

    statusCounts.set(
      status,
      normalizeNonNegativeInteger(
        statusCount.recordCount,
      ),
    );
  }

  const totalEmployeeTypes =
    EMPLOYEE_TYPE_STATUSES.reduce(
      (total, status) =>
        total +
        (statusCounts.get(status) ?? 0),
      0,
    );

  return {
    filters: {
      ...filters,
      page,
    },

    employeeTypes:
      employeeTypeRows.map(
        mapEmployeeTypeRow,
      ),

    summary: {
      totalEmployeeTypes,

      activeEmployeeTypes:
        statusCounts.get("ACTIVE") ?? 0,

      inactiveEmployeeTypes:
        statusCounts.get("INACTIVE") ?? 0,

      archivedEmployeeTypes:
        statusCounts.get("ARCHIVED") ?? 0,
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
            employeeTypeRows.length,
          totalRecords,
        ),

      hasPreviousPage:
        page > 1,

      hasNextPage:
        page < totalPages,
    },
  };
}

export async function getEmployeeTypeById(
  empTypeId: number,
): Promise<EmployeeTypeRecord | null> {
  const rows =
    await prisma.$queryRaw<
      EmployeeTypeDatabaseRow[]
    >`
      SELECT
        emp_type_id AS empTypeId,
        emp_type_code AS empTypeCode,
        name,
        status,
        created_at AS createdAt,
        updated_at AS updatedAt
      FROM emp_types
      WHERE emp_type_id = ${empTypeId}
      LIMIT 1
    `;

  const row =
    rows[0];

  return row
    ? mapEmployeeTypeRow(row)
    : null;
}

export async function getEmployeeTypeDependencySummary(
  empTypeId: number,
): Promise<EmployeeTypeDependencySummary> {
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
        AND REFERENCED_TABLE_NAME = 'emp_types'
        AND REFERENCED_COLUMN_NAME = 'emp_type_id'
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
    EmployeeTypeDependencyRecord[] = [];

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
        empTypeId,
      );

    const recordCount =
      normalizeNonNegativeInteger(
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

export async function getEmployeeTypeDetailData(
  empTypeId: number,
): Promise<EmployeeTypeDetailData | null> {
  const [
    employeeType,
    dependencySummary,
  ] = await Promise.all([
    getEmployeeTypeById(
      empTypeId,
    ),

    getEmployeeTypeDependencySummary(
      empTypeId,
    ),
  ]);

  if (!employeeType) {
    return null;
  }

  return {
    employeeType,
    dependencySummary,
  };
}