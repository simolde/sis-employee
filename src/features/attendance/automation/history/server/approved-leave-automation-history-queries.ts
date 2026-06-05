import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import {
  APPROVED_LEAVE_EXCUSED_AUTOMATION_RUN_ACTION,
  type ApprovedLeaveAutomationExecutionMode,
  type ApprovedLeaveAutomationExecutionModeFilter,
  type ApprovedLeaveAutomationHistoryDetail,
  type ApprovedLeaveAutomationHistoryFilters,
  type ApprovedLeaveAutomationHistoryItem,
  type ApprovedLeaveAutomationHistoryResult,
  type ApprovedLeaveAutomationRunStatus,
} from "../types/approved-leave-automation-history-types";

const DEFAULT_PAGE_SIZE = 20;

type AutomationRunLogRecord = {
  activityLogId: number;
  actorUserId: number | null;
  action: string;
  entityType: string;
  entityId: string | null;
  oldValue: Prisma.JsonValue;
  newValue: Prisma.JsonValue;
  createdAt: Date;
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

function normalizeExecutionMode(
  value: string,
): ApprovedLeaveAutomationExecutionModeFilter {
  const normalized = value.trim().toUpperCase();

  if (
    normalized === "DASHBOARD" ||
    normalized === "API"
  ) {
    return normalized;
  }

  return "";
}

function getManilaDateInputValue(
  offsetDays = 0,
): string {
  const now = new Date();

  const targetDate = new Date(
    now.getTime() +
      offsetDays * 24 * 60 * 60 * 1000,
  );

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(targetDate);

  const year =
    parts.find((part) => part.type === "year")
      ?.value ?? "";

  const month =
    parts.find((part) => part.type === "month")
      ?.value ?? "";

  const day =
    parts.find((part) => part.type === "day")
      ?.value ?? "";

  return `${year}-${month}-${day}`;
}

function dateInputToStartDate(
  value: string,
): Date | undefined {
  if (!value) {
    return undefined;
  }

  const date = new Date(
    `${value}T00:00:00.000Z`,
  );

  return Number.isNaN(date.getTime())
    ? undefined
    : date;
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

function formatDateTime(
  value: Date | string | null | undefined,
): string {
  if (!value) {
    return "—";
  }

  const date =
    value instanceof Date
      ? value
      : new Date(value);

  if (Number.isNaN(date.getTime())) {
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
  }).format(date);
}

function formatDuration(
  durationMs: number,
): string {
  if (durationMs < 1000) {
    return `${durationMs} ms`;
  }

  const seconds = durationMs / 1000;

  if (seconds < 60) {
    return `${seconds.toFixed(2)} sec`;
  }

  const minutes = Math.floor(
    seconds / 60,
  );

  const remainingSeconds = Math.round(
    seconds % 60,
  );

  return `${minutes} min ${remainingSeconds} sec`;
}

function isJsonObject(
  value: Prisma.JsonValue,
): value is Prisma.JsonObject {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function readString(
  object: Prisma.JsonObject,
  key: string,
  fallback = "",
): string {
  const value = object[key];

  return typeof value === "string"
    ? value
    : fallback;
}

function readNumber(
  object: Prisma.JsonObject,
  key: string,
  fallback = 0,
): number {
  const value = object[key];

  return typeof value === "number" &&
    Number.isFinite(value)
    ? value
    : fallback;
}

function normalizeRunStatus(
  value: string,
): ApprovedLeaveAutomationRunStatus {
  const normalized = value
    .trim()
    .toUpperCase();

  if (normalized === "COMPLETED") {
    return "COMPLETED";
  }

  if (normalized === "FAILED") {
    return "FAILED";
  }

  return "UNKNOWN";
}

function parseExecutionModeFromRunKey(
  runKey: string,
): ApprovedLeaveAutomationExecutionMode {
  return runKey.startsWith("API:")
    ? "API"
    : "DASHBOARD";
}

function safeJsonText(
  value: Prisma.JsonValue,
): string {
  if (value === null) {
    return "null";
  }

  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

function buildHistoryWhere(
  filters: ApprovedLeaveAutomationHistoryFilters,
): Prisma.ActivityLogWhereInput {
  const andConditions: Prisma.ActivityLogWhereInput[] =
    [
      {
        action:
          APPROVED_LEAVE_EXCUSED_AUTOMATION_RUN_ACTION,
        entityType:
          "attendance_automation_run",
      },
    ];

  const dateFrom =
    dateInputToStartDate(filters.dateFrom);

  const dateTo =
    dateInputToEndDate(filters.dateTo);

  if (dateFrom || dateTo) {
    andConditions.push({
      createdAt: {
        ...(dateFrom
          ? {
              gte: dateFrom,
            }
          : {}),
        ...(dateTo
          ? {
              lt: dateTo,
            }
          : {}),
      },
    });
  }

  if (filters.executionMode) {
    andConditions.push({
      entityId: {
        startsWith: `${filters.executionMode}:`,
      },
    });
  }

  if (filters.q) {
    const actorUserId =
      parsePositiveId(filters.q);

    const searchConditions: Prisma.ActivityLogWhereInput[] =
      [
        {
          entityId: {
            contains: filters.q,
          },
        },
        {
          action: {
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

function mapHistoryItem(
  input: AutomationRunLogRecord,
): ApprovedLeaveAutomationHistoryItem {
  const runKey =
    input.entityId ?? "UNKNOWN";

  const object = isJsonObject(
    input.newValue,
  )
    ? input.newValue
    : {};

  const executionModeValue =
    readString(
      object,
      "executionMode",
      parseExecutionModeFromRunKey(
        runKey,
      ),
    );

  const executionMode: ApprovedLeaveAutomationExecutionMode =
    executionModeValue === "API"
      ? "API"
      : "DASHBOARD";

  const durationMs = Math.max(
    0,
    readNumber(object, "durationMs"),
  );

  return {
    activityLogId:
      input.activityLogId,
    runKey,
    executionMode,
    status: normalizeRunStatus(
      readString(
        object,
        "status",
        "UNKNOWN",
      ),
    ),
    actorUserId: input.actorUserId,
    attendanceDateFrom: readString(
      object,
      "attendanceDateFrom",
      "—",
    ),
    attendanceDateTo: readString(
      object,
      "attendanceDateTo",
      "—",
    ),
    employeeSearch: readString(
      object,
      "employeeSearch",
      "",
    ),
    branchId: readString(
      object,
      "branchId",
      "",
    ),
    departmentId: readString(
      object,
      "departmentId",
      "",
    ),
    limit: readNumber(
      object,
      "limit",
    ),
    checkedCount: readNumber(
      object,
      "checkedCount",
    ),
    generatedCount: readNumber(
      object,
      "generatedCount",
    ),
    existingAttendanceCount:
      readNumber(
        object,
        "existingAttendanceCount",
      ),
    noApprovedLeaveCount:
      readNumber(
        object,
        "noApprovedLeaveCount",
      ),
    exceptionProtectedCount:
      readNumber(
        object,
        "exceptionProtectedCount",
      ),
    notScheduledCount: readNumber(
      object,
      "notScheduledCount",
    ),
    skippedCount: readNumber(
      object,
      "skippedCount",
    ),
    startedAt: formatDateTime(
      readString(object, "startedAt"),
    ),
    completedAt: formatDateTime(
      readString(object, "completedAt"),
    ),
    durationMs,
    durationLabel:
      formatDuration(durationMs),
    createdAt: formatDateTime(
      input.createdAt,
    ),
  };
}

export function parseApprovedLeaveAutomationHistorySearchParams(
  searchParams: Record<
    string,
    string | string[] | undefined
  >,
): ApprovedLeaveAutomationHistoryFilters {
  return {
    q: singleSearchParam(
      searchParams.q,
    ).trim(),
    executionMode:
      normalizeExecutionMode(
        singleSearchParam(
          searchParams.executionMode,
        ),
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
      singleSearchParam(
        searchParams.page,
      ),
      1,
    ),
    pageSize: DEFAULT_PAGE_SIZE,
  };
}

export async function getApprovedLeaveAutomationHistory(
  filters: ApprovedLeaveAutomationHistoryFilters,
): Promise<ApprovedLeaveAutomationHistoryResult> {
  const where =
    buildHistoryWhere(filters);

  const [
    totalItems,
    totalRuns,
    dashboardRuns,
    apiRuns,
  ] = await Promise.all([
    prisma.activityLog.count({
      where,
    }),

    prisma.activityLog.count({
      where: {
        action:
          APPROVED_LEAVE_EXCUSED_AUTOMATION_RUN_ACTION,
        entityType:
          "attendance_automation_run",
      },
    }),

    prisma.activityLog.count({
      where: {
        action:
          APPROVED_LEAVE_EXCUSED_AUTOMATION_RUN_ACTION,
        entityType:
          "attendance_automation_run",
        entityId: {
          startsWith: "DASHBOARD:",
        },
      },
    }),

    prisma.activityLog.count({
      where: {
        action:
          APPROVED_LEAVE_EXCUSED_AUTOMATION_RUN_ACTION,
        entityType:
          "attendance_automation_run",
        entityId: {
          startsWith: "API:",
        },
      },
    }),
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(
      totalItems / filters.pageSize,
    ),
  );

  const safePage = Math.min(
    filters.page,
    totalPages,
  );

  const records =
    await prisma.activityLog.findMany({
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
      skip:
        (safePage - 1) *
        filters.pageSize,
      take: filters.pageSize,
    });

  const mappedRecords =
    records.map(mapHistoryItem);

  return {
    filters: {
      ...filters,
      page: safePage,
    },
    records: mappedRecords,
    summary: {
      totalRuns,
      matchingRuns: totalItems,
      dashboardRuns,
      apiRuns,
      completedRunsOnPage:
        mappedRecords.filter(
          (record) =>
            record.status === "COMPLETED",
        ).length,
      failedRunsOnPage:
        mappedRecords.filter(
          (record) =>
            record.status === "FAILED",
        ).length,
      generatedRecordsOnPage:
        mappedRecords.reduce(
          (total, record) =>
            total +
            record.generatedCount,
          0,
        ),
      currentPageRecords:
        mappedRecords.length,
    },
    pagination: {
      page: safePage,
      pageSize: filters.pageSize,
      totalItems,
      totalPages,
      hasPreviousPage: safePage > 1,
      hasNextPage:
        safePage < totalPages,
    },
  };
}

export async function getApprovedLeaveAutomationHistoryDetail(
  activityLogId: number,
): Promise<ApprovedLeaveAutomationHistoryDetail | null> {
  if (
    !Number.isInteger(activityLogId) ||
    activityLogId <= 0
  ) {
    return null;
  }

  const record =
    await prisma.activityLog.findFirst({
      where: {
        activityLogId,
        action:
          APPROVED_LEAVE_EXCUSED_AUTOMATION_RUN_ACTION,
        entityType:
          "attendance_automation_run",
      },
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
    });

  if (!record) {
    return null;
  }

  return {
    ...mapHistoryItem(record),
    action: record.action,
    entityType: record.entityType,
    oldValueText: safeJsonText(
      record.oldValue,
    ),
    newValueText: safeJsonText(
      record.newValue,
    ),
  };
}