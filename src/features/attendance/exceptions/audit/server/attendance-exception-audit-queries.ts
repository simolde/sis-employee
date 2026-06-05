import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import type {
  AttendanceExceptionAuditFilters,
  AttendanceExceptionAuditItem,
  AttendanceExceptionAuditResult,
} from "../types/attendance-exception-audit-types";

const DEFAULT_PAGE_SIZE = 20;

const exceptionAuditActions = [
  "ATTENDANCE_EXCEPTION_CREATED",
  "ATTENDANCE_EXCEPTION_UPDATED",
  "ATTENDANCE_EXCEPTION_ARCHIVED",
];

function singleSearchParam(
  value: string | string[] | undefined,
  fallback = "",
): string {
  if (Array.isArray(value)) {
    return value[0] ?? fallback;
  }

  return value ?? fallback;
}

function parsePositiveInteger(value: string, fallback: number): number {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

function getManilaDateInputValue(offsetDays = 0): string {
  const now = new Date();
  const targetDate = new Date(now.getTime() + offsetDays * 24 * 60 * 60 * 1000);

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(targetDate);

  const year = parts.find((part) => part.type === "year")?.value ?? "";
  const month = parts.find((part) => part.type === "month")?.value ?? "";
  const day = parts.find((part) => part.type === "day")?.value ?? "";

  return `${year}-${month}-${day}`;
}

function dateInputToStartDate(value: string): Date | undefined {
  if (!value) {
    return undefined;
  }

  return new Date(`${value}T00:00:00.000Z`);
}

function dateInputToEndDate(value: string): Date | undefined {
  if (!value) {
    return undefined;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  date.setUTCDate(date.getUTCDate() + 1);

  return date;
}

function formatDateTime(date: Date | null | undefined): string {
  if (!date) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-PH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Manila",
  }).format(date);
}

function safeJsonText(value: unknown): string {
  if (value === null || value === undefined) {
    return "—";
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function normalizeAction(value: string): string {
  const normalized = value.trim().toUpperCase();

  if (exceptionAuditActions.includes(normalized)) {
    return normalized;
  }

  return "";
}

function buildExceptionAuditWhere(
  filters: AttendanceExceptionAuditFilters,
): Prisma.ActivityLogWhereInput {
  const andConditions: Prisma.ActivityLogWhereInput[] = [
    {
      entityType: "attendance_exception",
    },
  ];

  const action = normalizeAction(filters.action);
  const dateFrom = dateInputToStartDate(filters.dateFrom);
  const dateTo = dateInputToEndDate(filters.dateTo);

  if (action) {
    andConditions.push({
      action,
    });
  } else {
    andConditions.push({
      action: {
        in: exceptionAuditActions,
      },
    });
  }

  if (dateFrom || dateTo) {
    andConditions.push({
      createdAt: {
        ...(dateFrom ? { gte: dateFrom } : {}),
        ...(dateTo ? { lt: dateTo } : {}),
      },
    });
  }

  if (filters.q) {
    andConditions.push({
      OR: [
        {
          action: {
            contains: filters.q,
          },
        },
        {
          entityId: {
            contains: filters.q,
          },
        },
        {
          entityType: {
            contains: filters.q,
          },
        },
      ],
    });
  }

  return {
    AND: andConditions,
  };
}

function mapAuditItem(input: {
  activityLogId: number;
  actorUserId: number | null;
  action: string;
  entityType: string;
  entityId: string | null;
  oldValue: unknown;
  newValue: unknown;
  createdAt: Date;
}): AttendanceExceptionAuditItem {
  return {
    activityLogId: input.activityLogId,
    actorUserId: input.actorUserId,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId ?? "—",
    oldValueText: safeJsonText(input.oldValue),
    newValueText: safeJsonText(input.newValue),
    createdAt: formatDateTime(input.createdAt),
  };
}

export function parseAttendanceExceptionAuditSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): AttendanceExceptionAuditFilters {
  return {
    q: singleSearchParam(searchParams.q).trim(),
    action: singleSearchParam(searchParams.action),
    dateFrom: singleSearchParam(
      searchParams.dateFrom,
      getManilaDateInputValue(-30),
    ),
    dateTo: singleSearchParam(searchParams.dateTo, getManilaDateInputValue()),
    page: parsePositiveInteger(singleSearchParam(searchParams.page), 1),
    pageSize: DEFAULT_PAGE_SIZE,
  };
}

export async function getAttendanceExceptionAuditData(
  filters: AttendanceExceptionAuditFilters,
): Promise<AttendanceExceptionAuditResult> {
  const where = buildExceptionAuditWhere(filters);
  const skip = (filters.page - 1) * filters.pageSize;

  const [
    records,
    totalItems,
    totalLogs,
    createdLogs,
    updatedLogs,
    archivedLogs,
  ] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      select: {
        activityLogId: true,
        actorUserId: true,
        action: true,
        entityType: true,
        entityId: true,
        oldValue: true,
        newValue: true,
        createdAt: true,
      },
      orderBy: [
        {
          createdAt: "desc",
        },
        {
          activityLogId: "desc",
        },
      ],
      skip,
      take: filters.pageSize,
    }),

    prisma.activityLog.count({
      where,
    }),

    prisma.activityLog.count({
      where: {
        entityType: "attendance_exception",
        action: {
          in: exceptionAuditActions,
        },
      },
    }),

    prisma.activityLog.count({
      where: {
        entityType: "attendance_exception",
        action: "ATTENDANCE_EXCEPTION_CREATED",
      },
    }),

    prisma.activityLog.count({
      where: {
        entityType: "attendance_exception",
        action: "ATTENDANCE_EXCEPTION_UPDATED",
      },
    }),

    prisma.activityLog.count({
      where: {
        entityType: "attendance_exception",
        action: "ATTENDANCE_EXCEPTION_ARCHIVED",
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalItems / filters.pageSize));

  return {
    filters,
    records: records.map(mapAuditItem),
    summary: {
      totalLogs,
      matchingLogs: totalItems,
      createdLogs,
      updatedLogs,
      archivedLogs,
      currentPageRecords: records.length,
    },
    pagination: {
      page: filters.page,
      pageSize: filters.pageSize,
      totalItems,
      totalPages,
      hasPreviousPage: filters.page > 1,
      hasNextPage: filters.page < totalPages,
    },
  };
}