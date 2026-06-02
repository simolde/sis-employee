import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import {
  attendanceAuditActionOptions,
  type AttendanceAuditFilters,
  type AttendanceAuditItem,
  type AttendanceAuditResult,
} from "../types/attendance-audit-types";

const DEFAULT_PAGE_SIZE = 20;

type ActorUserMapValue = {
  username: string;
  email: string;
  status: string;
};

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

function dateInputToStartDate(value: string): Date | undefined {
  if (!value) {
    return undefined;
  }

  return new Date(`${value}T00:00:00.000+08:00`);
}

function dateInputToEndDate(value: string): Date | undefined {
  if (!value) {
    return undefined;
  }

  return new Date(`${value}T23:59:59.999+08:00`);
}

function safeJsonString(value: Prisma.JsonValue | null): string {
  if (value === null) {
    return "—";
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return "Unable to display audit JSON.";
  }
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

function normalizeAction(value: string): string {
  const upperValue = value.trim().toUpperCase();

  if (
    attendanceAuditActionOptions.includes(
      upperValue as (typeof attendanceAuditActionOptions)[number],
    )
  ) {
    return upperValue;
  }

  return "ALL";
}

function buildAttendanceAuditWhere(
  filters: AttendanceAuditFilters,
): Prisma.ActivityLogWhereInput {
  const andConditions: Prisma.ActivityLogWhereInput[] = [
    {
      entityType: "attendance",
    },
  ];

  const dateFrom = dateInputToStartDate(filters.dateFrom);
  const dateTo = dateInputToEndDate(filters.dateTo);

  if (dateFrom || dateTo) {
    andConditions.push({
      createdAt: {
        ...(dateFrom ? { gte: dateFrom } : {}),
        ...(dateTo ? { lte: dateTo } : {}),
      },
    });
  }

  if (filters.action !== "ALL") {
    if (filters.action === "ATTENDANCE_STATUS_UPDATED") {
      andConditions.push({
        action: {
          startsWith: "ATTENDANCE_STATUS_UPDATED",
        },
      });
    } else {
      andConditions.push({
        action: filters.action,
      });
    }
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

function getActorDetails(input: {
  actorUserId: number | null;
  actorUsersById: Map<number, ActorUserMapValue>;
}): ActorUserMapValue {
  if (!input.actorUserId) {
    return {
      username: "System",
      email: "—",
      status: "—",
    };
  }

  return (
    input.actorUsersById.get(input.actorUserId) ?? {
      username: "Unknown User",
      email: "—",
      status: "—",
    }
  );
}

function mapAttendanceAuditItem(
  input: {
    activityLogId: number;
    actorUserId: number | null;
    action: string;
    entityType: string;
    entityId: string | null;
    oldValue: Prisma.JsonValue | null;
    newValue: Prisma.JsonValue | null;
    createdAt: Date;
  },
  actorUsersById: Map<number, ActorUserMapValue>,
): AttendanceAuditItem {
  const actor = getActorDetails({
    actorUserId: input.actorUserId,
    actorUsersById,
  });

  return {
    logId: input.activityLogId,
    actorUserId: input.actorUserId,
    actorName: actor.username,
    actorEmail: actor.email,
    actorStatus: actor.status,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId ?? "—",
    oldValue: safeJsonString(input.oldValue),
    newValue: safeJsonString(input.newValue),
    createdAt: formatDateTime(input.createdAt),
  };
}

export function parseAttendanceAuditSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): AttendanceAuditFilters {
  return {
    q: singleSearchParam(searchParams.q).trim(),
    action: normalizeAction(singleSearchParam(searchParams.action, "ALL")),
    dateFrom: singleSearchParam(searchParams.dateFrom),
    dateTo: singleSearchParam(searchParams.dateTo),
    page: parsePositiveInteger(singleSearchParam(searchParams.page), 1),
    pageSize: DEFAULT_PAGE_SIZE,
  };
}

export async function getAttendanceAuditData(
  filters: AttendanceAuditFilters,
): Promise<AttendanceAuditResult> {
  const where = buildAttendanceAuditWhere(filters);
  const skip = (filters.page - 1) * filters.pageSize;

  const [records, totalItems] = await Promise.all([
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
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: filters.pageSize,
    }),

    prisma.activityLog.count({
      where,
    }),
  ]);

  const actorUserIds = Array.from(
    new Set(
      records
        .map((record) => record.actorUserId)
        .filter((actorUserId): actorUserId is number => actorUserId !== null),
    ),
  );

  const actorUsers =
    actorUserIds.length > 0
      ? await prisma.user.findMany({
          where: {
            userId: {
              in: actorUserIds,
            },
          },
          select: {
            userId: true,
            username: true,
            email: true,
            status: true,
          },
        })
      : [];

  const actorUsersById = new Map<number, ActorUserMapValue>(
    actorUsers.map((user) => [
      user.userId,
      {
        username: user.username,
        email: user.email,
        status: user.status,
      },
    ]),
  );

  const totalPages = Math.max(1, Math.ceil(totalItems / filters.pageSize));

  return {
    filters,
    records: records.map((record) =>
      mapAttendanceAuditItem(record, actorUsersById),
    ),
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