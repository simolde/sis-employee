import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import {
  excusedAutomationAuditActions,
  type ExcusedAutomationAuditAction,
  type ExcusedAutomationAuditActionFilter,
  type ExcusedAutomationAuditFilters,
  type ExcusedAutomationAuditItem,
  type ExcusedAutomationAuditResult,
} from "../types/excused-audit-types";

const DEFAULT_PAGE_SIZE = 20;

function singleSearchParam(
  value: string | string[] | undefined,
  fallback = "",
): string {
  if (Array.isArray(value)) {
    return value[0] ?? fallback;
  }

  return value ?? fallback;
}

function parsePositiveInteger(
  value: string,
  fallback: number,
): number {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

function parsePositiveId(value: string): number | null {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

function getManilaDateInputValue(offsetDays = 0): string {
  const now = new Date();

  const targetDate = new Date(
    now.getTime() + offsetDays * 24 * 60 * 60 * 1000,
  );

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(targetDate);

  const year =
    parts.find((part) => part.type === "year")?.value ?? "";

  const month =
    parts.find((part) => part.type === "month")?.value ?? "";

  const day =
    parts.find((part) => part.type === "day")?.value ?? "";

  return `${year}-${month}-${day}`;
}

function dateInputToStartDate(
  value: string,
): Date | undefined {
  if (!value) {
    return undefined;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return Number.isNaN(date.getTime()) ? undefined : date;
}

function dateInputToEndDate(
  value: string,
): Date | undefined {
  const start = dateInputToStartDate(value);

  if (!start) {
    return undefined;
  }

  const end = new Date(start);

  end.setUTCDate(end.getUTCDate() + 1);

  return end;
}

function normalizeAction(
  value: string,
): ExcusedAutomationAuditActionFilter {
  const normalized = value.trim().toUpperCase();

  if (
    normalized === "ATTENDANCE_EXCUSED_AUTO_GENERATED" ||
    normalized === "ATTENDANCE_EXCUSED_AUTO_ROLLED_BACK"
  ) {
    return normalized;
  }

  return "";
}

function formatDateTime(
  value: Date | null | undefined,
): string {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-PH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "Asia/Manila",
  }).format(value);
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

function buildExcusedAuditWhere(
  filters: ExcusedAutomationAuditFilters,
): Prisma.ActivityLogWhereInput {
  const andConditions: Prisma.ActivityLogWhereInput[] = [
    {
      entityType: "attendance",
    },
  ];

  const dateFrom = dateInputToStartDate(filters.dateFrom);
  const dateTo = dateInputToEndDate(filters.dateTo);

  if (filters.action) {
    andConditions.push({
      action: filters.action,
    });
  } else {
    andConditions.push({
      action: {
        in: [...excusedAutomationAuditActions],
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
    const actorUserId = parsePositiveId(filters.q);

    const searchConditions: Prisma.ActivityLogWhereInput[] = [
      {
        action: {
          contains: filters.q,
        },
      },
      {
        entityType: {
          contains: filters.q,
        },
      },
      {
        entityId: {
          contains: filters.q,
        },
      },
    ];

    if (actorUserId) {
      searchConditions.push({
        actorUserId,
      });
    }

    andConditions.push({
      OR: searchConditions,
    });
  }

  return {
    AND: andConditions,
  };
}

function mapExcusedAuditItem(input: {
  activityLogId: number;
  actorUserId: number | null;
  action: string;
  entityId: string | null;
  oldValue: Prisma.JsonValue;
  newValue: Prisma.JsonValue;
  createdAt: Date;
}): ExcusedAutomationAuditItem {
  return {
    activityLogId: input.activityLogId,
    actorUserId: input.actorUserId,
    action: input.action as ExcusedAutomationAuditAction,
    entityId: input.entityId ?? "—",
    oldValueText: safeJsonText(input.oldValue),
    newValueText: safeJsonText(input.newValue),
    createdAt: formatDateTime(input.createdAt),
  };
}

export function parseExcusedAutomationAuditSearchParams(
  searchParams: Record<
    string,
    string | string[] | undefined
  >,
): ExcusedAutomationAuditFilters {
  return {
    q: singleSearchParam(searchParams.q).trim(),
    action: normalizeAction(
      singleSearchParam(searchParams.action),
    ),
    dateFrom: singleSearchParam(
      searchParams.dateFrom,
      getManilaDateInputValue(-30),
    ),
    dateTo: singleSearchParam(
      searchParams.dateTo,
      getManilaDateInputValue(),
    ),
    page: parsePositiveInteger(
      singleSearchParam(searchParams.page),
      1,
    ),
    pageSize: DEFAULT_PAGE_SIZE,
  };
}

export async function getExcusedAutomationAuditData(
  filters: ExcusedAutomationAuditFilters,
): Promise<ExcusedAutomationAuditResult> {
  const where = buildExcusedAuditWhere(filters);

  const [
    totalItems,
    totalAutomationLogs,
    generatedLogs,
    rollbackLogs,
  ] = await Promise.all([
    prisma.activityLog.count({
      where,
    }),

    prisma.activityLog.count({
      where: {
        entityType: "attendance",
        action: {
          in: [...excusedAutomationAuditActions],
        },
      },
    }),

    prisma.activityLog.count({
      where: {
        entityType: "attendance",
        action: "ATTENDANCE_EXCUSED_AUTO_GENERATED",
      },
    }),

    prisma.activityLog.count({
      where: {
        entityType: "attendance",
        action:
          "ATTENDANCE_EXCUSED_AUTO_ROLLED_BACK",
      },
    }),
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(totalItems / filters.pageSize),
  );

  const safePage = Math.min(filters.page, totalPages);
  const skip = (safePage - 1) * filters.pageSize;

  const records = await prisma.activityLog.findMany({
    where,
    select: {
      activityLogId: true,
      actorUserId: true,
      action: true,
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
  });

  return {
    filters: {
      ...filters,
      page: safePage,
    },
    records: records.map(mapExcusedAuditItem),
    summary: {
      totalAutomationLogs,
      matchingLogs: totalItems,
      generatedLogs,
      rollbackLogs,
      currentPageRecords: records.length,
    },
    pagination: {
      page: safePage,
      pageSize: filters.pageSize,
      totalItems,
      totalPages,
      hasPreviousPage: safePage > 1,
      hasNextPage: safePage < totalPages,
    },
  };
}