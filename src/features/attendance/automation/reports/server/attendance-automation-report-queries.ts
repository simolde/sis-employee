import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import { APPROVED_LEAVE_EXCUSED_AUTOMATION_RUN_ACTION } from "@/features/attendance/automation/history/types/approved-leave-automation-history-types";
import type {
  AttendanceAutomationDailyTrendItem,
  AttendanceAutomationExecutionBreakdownItem,
  AttendanceAutomationReportData,
  AttendanceAutomationReportExecutionMode,
  AttendanceAutomationReportExecutionModeFilter,
  AttendanceAutomationReportFilters,
  AttendanceAutomationReportRun,
  AttendanceAutomationReportRunStatus,
  AttendanceAutomationReportStatusFilter,
} from "../types/attendance-automation-report-types";

const MAXIMUM_SCANNED_RUNS = 10_000;
const MAXIMUM_REPORT_DAYS = 366;
const SLOWEST_RUN_LIMIT = 10;
const MILLISECONDS_PER_DAY =
  24 * 60 * 60 * 1000;

type AutomationReportLogRecord = {
  activityLogId: number;
  actorUserId: number | null;
  entityId: string | null;
  newValue: Prisma.JsonValue;
  createdAt: Date;
};

type MutableDailyTrend = {
  dateKey: string;
  dateLabel: string;

  totalRuns: number;
  completedRuns: number;
  failedRuns: number;
  unknownRuns: number;

  apiRuns: number;
  dashboardRuns: number;
  retryRuns: number;

  generatedRecords: number;
  totalDurationMs: number;
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

function getManilaDateInputValue(
  offsetDays = 0,
): string {
  const now = new Date();

  const targetDate = new Date(
    now.getTime() +
      offsetDays * MILLISECONDS_PER_DAY,
  );

  const parts = new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    },
  ).formatToParts(targetDate);

  const year =
    parts.find(
      (part) => part.type === "year",
    )?.value ?? "";

  const month =
    parts.find(
      (part) => part.type === "month",
    )?.value ?? "";

  const day =
    parts.find(
      (part) => part.type === "day",
    )?.value ?? "";

  return `${year}-${month}-${day}`;
}

function isValidDateInput(
  value: string,
): boolean {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(value)
  ) {
    return false;
  }

  const parsed = new Date(
    `${value}T00:00:00+08:00`,
  );

  return !Number.isNaN(
    parsed.getTime(),
  );
}

function parseManilaDateStart(
  value: string,
): Date {
  return new Date(
    `${value}T00:00:00+08:00`,
  );
}

function formatManilaDateInput(
  value: Date,
): string {
  const parts = new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    },
  ).formatToParts(value);

  const year =
    parts.find(
      (part) => part.type === "year",
    )?.value ?? "";

  const month =
    parts.find(
      (part) => part.type === "month",
    )?.value ?? "";

  const day =
    parts.find(
      (part) => part.type === "day",
    )?.value ?? "";

  return `${year}-${month}-${day}`;
}

function normalizeDateRange(input: {
  dateFrom: string;
  dateTo: string;
}): {
  dateFrom: string;
  dateTo: string;
} {
  let dateFrom = isValidDateInput(
    input.dateFrom,
  )
    ? input.dateFrom
    : getManilaDateInputValue(-29);

  let dateTo = isValidDateInput(
    input.dateTo,
  )
    ? input.dateTo
    : getManilaDateInputValue();

  let start =
    parseManilaDateStart(dateFrom);

  let end =
    parseManilaDateStart(dateTo);

  if (
    start.getTime() >
    end.getTime()
  ) {
    const originalStart = dateFrom;

    dateFrom = dateTo;
    dateTo = originalStart;

    start =
      parseManilaDateStart(dateFrom);

    end =
      parseManilaDateStart(dateTo);
  }

  const inclusiveDays =
    Math.floor(
      (end.getTime() -
        start.getTime()) /
        MILLISECONDS_PER_DAY,
    ) + 1;

  if (
    inclusiveDays >
    MAXIMUM_REPORT_DAYS
  ) {
    const limitedStart = new Date(
      end.getTime() -
        (MAXIMUM_REPORT_DAYS - 1) *
          MILLISECONDS_PER_DAY,
    );

    dateFrom =
      formatManilaDateInput(
        limitedStart,
      );
  }

  return {
    dateFrom,
    dateTo,
  };
}

function normalizeExecutionMode(
  value: string,
): AttendanceAutomationReportExecutionModeFilter {
  const normalized =
    value.trim().toUpperCase();

  if (
    normalized === "API" ||
    normalized === "DASHBOARD"
  ) {
    return normalized;
  }

  return "";
}

function normalizeStatusFilter(
  value: string,
): AttendanceAutomationReportStatusFilter {
  const normalized =
    value.trim().toUpperCase();

  if (
    normalized === "COMPLETED" ||
    normalized === "FAILED" ||
    normalized === "UNKNOWN"
  ) {
    return normalized;
  }

  return "";
}

function dateInputToStartDate(
  value: string,
): Date {
  return parseManilaDateStart(value);
}

function dateInputToExclusiveEndDate(
  value: string,
): Date {
  const start =
    parseManilaDateStart(value);

  return new Date(
    start.getTime() +
      MILLISECONDS_PER_DAY,
  );
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

  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return fallback;
  }

  return value;
}

function readNullablePositiveInteger(
  object: Prisma.JsonObject,
  key: string,
): number | null {
  const value = object[key];

  if (
    typeof value !== "number" ||
    !Number.isInteger(value) ||
    value <= 0
  ) {
    return null;
  }

  return value;
}

function normalizeExecutionModeFromRun(
  object: Prisma.JsonObject,
  runKey: string,
): AttendanceAutomationReportExecutionMode {
  const value = readString(
    object,
    "executionMode",
  )
    .trim()
    .toUpperCase();

  if (value === "API") {
    return "API";
  }

  if (value === "DASHBOARD") {
    return "DASHBOARD";
  }

  return runKey.startsWith("API:")
    ? "API"
    : "DASHBOARD";
}

function normalizeRunStatus(
  object: Prisma.JsonObject,
  runKey: string,
): AttendanceAutomationReportRunStatus {
  const value = readString(
    object,
    "status",
  )
    .trim()
    .toUpperCase();

  if (value === "COMPLETED") {
    return "COMPLETED";
  }

  if (value === "FAILED") {
    return "FAILED";
  }

  const runKeyStatus =
    runKey
      .split(":")
      .at(1)
      ?.trim()
      .toUpperCase();

  if (runKeyStatus === "COMPLETED") {
    return "COMPLETED";
  }

  if (runKeyStatus === "FAILED") {
    return "FAILED";
  }

  return "UNKNOWN";
}

function formatDuration(
  durationMs: number,
): string {
  const safeDuration = Math.max(
    0,
    Math.round(durationMs),
  );

  if (safeDuration < 1000) {
    return `${safeDuration} ms`;
  }

  const seconds =
    safeDuration / 1000;

  if (seconds < 60) {
    return `${seconds.toFixed(2)} sec`;
  }

  const minutes = Math.floor(
    seconds / 60,
  );

  const remainingSeconds =
    Math.round(seconds % 60);

  return `${minutes} min ${remainingSeconds} sec`;
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

function getDateKey(
  value: Date,
): string {
  return formatManilaDateInput(value);
}

function formatDateLabel(
  dateKey: string,
): string {
  const date = new Date(
    `${dateKey}T00:00:00+08:00`,
  );

  return new Intl.DateTimeFormat(
    "en-PH",
    {
      year: "numeric",
      month: "short",
      day: "2-digit",
      weekday: "short",
      timeZone: "Asia/Manila",
    },
  ).format(date);
}

function calculateSuccessRate(input: {
  completedRuns: number;
  failedRuns: number;
}): number {
  const knownRuns =
    input.completedRuns +
    input.failedRuns;

  if (knownRuns === 0) {
    return 0;
  }

  return Number(
    (
      (input.completedRuns /
        knownRuns) *
      100
    ).toFixed(1),
  );
}

function mapAutomationReportRun(
  input: AutomationReportLogRecord,
): AttendanceAutomationReportRun {
  const runKey =
    input.entityId ?? "UNKNOWN";

  const object = isJsonObject(
    input.newValue,
  )
    ? input.newValue
    : {};

  const durationMs = Math.max(
    0,
    readNumber(
      object,
      "durationMs",
    ),
  );

  const retryOfRunAuditLogId =
    readNullablePositiveInteger(
      object,
      "retryOfRunAuditLogId",
    );

  return {
    activityLogId:
      input.activityLogId,

    runKey,

    executionMode:
      normalizeExecutionModeFromRun(
        object,
        runKey,
      ),

    status:
      normalizeRunStatus(
        object,
        runKey,
      ),

    actorUserId:
      input.actorUserId,

    checkedCount:
      readNumber(
        object,
        "checkedCount",
      ),

    generatedCount:
      readNumber(
        object,
        "generatedCount",
      ),

    existingAttendanceCount:
      readNumber(
        object,
        "existingAttendanceCount",
      ),

    exceptionProtectedCount:
      readNumber(
        object,
        "exceptionProtectedCount",
      ),

    notScheduledCount:
      readNumber(
        object,
        "notScheduledCount",
      ),

    skippedCount:
      readNumber(
        object,
        "skippedCount",
      ),

    durationMs,

    durationLabel:
      formatDuration(durationMs),

    retryOfRunAuditLogId,

    isRetry:
      retryOfRunAuditLogId !== null,

    createdAt:
      formatDateTime(
        input.createdAt,
      ),

    createdAtIso:
      input.createdAt.toISOString(),

    dateKey:
      getDateKey(
        input.createdAt,
      ),
  };
}

function buildDailyTrend(
  runs: AttendanceAutomationReportRun[],
): AttendanceAutomationDailyTrendItem[] {
  const dailyMap =
    new Map<string, MutableDailyTrend>();

  for (const run of runs) {
    const current =
      dailyMap.get(run.dateKey) ?? {
        dateKey: run.dateKey,
        dateLabel:
          formatDateLabel(run.dateKey),

        totalRuns: 0,
        completedRuns: 0,
        failedRuns: 0,
        unknownRuns: 0,

        apiRuns: 0,
        dashboardRuns: 0,
        retryRuns: 0,

        generatedRecords: 0,
        totalDurationMs: 0,
      };

    current.totalRuns += 1;

    current.generatedRecords +=
      run.generatedCount;

    current.totalDurationMs +=
      run.durationMs;

    if (run.status === "COMPLETED") {
      current.completedRuns += 1;
    } else if (
      run.status === "FAILED"
    ) {
      current.failedRuns += 1;
    } else {
      current.unknownRuns += 1;
    }

    if (
      run.executionMode === "API"
    ) {
      current.apiRuns += 1;
    } else {
      current.dashboardRuns += 1;
    }

    if (run.isRetry) {
      current.retryRuns += 1;
    }

    dailyMap.set(
      run.dateKey,
      current,
    );
  }

  return Array.from(
    dailyMap.values(),
  )
    .map((item) => {
      const averageDurationMs =
        item.totalRuns > 0
          ? Math.round(
              item.totalDurationMs /
                item.totalRuns,
            )
          : 0;

      return {
        dateKey: item.dateKey,
        dateLabel: item.dateLabel,

        totalRuns:
          item.totalRuns,

        completedRuns:
          item.completedRuns,

        failedRuns:
          item.failedRuns,

        unknownRuns:
          item.unknownRuns,

        apiRuns:
          item.apiRuns,

        dashboardRuns:
          item.dashboardRuns,

        retryRuns:
          item.retryRuns,

        generatedRecords:
          item.generatedRecords,

        averageDurationMs,

        averageDurationLabel:
          formatDuration(
            averageDurationMs,
          ),

        successRate:
          calculateSuccessRate({
            completedRuns:
              item.completedRuns,

            failedRuns:
              item.failedRuns,
          }),
      };
    })
    .sort((left, right) =>
      right.dateKey.localeCompare(
        left.dateKey,
      ),
    );
}

function buildExecutionBreakdown(
  runs: AttendanceAutomationReportRun[],
): AttendanceAutomationExecutionBreakdownItem[] {
  const executionModes: AttendanceAutomationReportExecutionMode[] =
    ["API", "DASHBOARD"];

  return executionModes.map(
    (executionMode) => {
      const matchingRuns =
        runs.filter(
          (run) =>
            run.executionMode ===
            executionMode,
        );

      const completedRuns =
        matchingRuns.filter(
          (run) =>
            run.status ===
            "COMPLETED",
        ).length;

      const failedRuns =
        matchingRuns.filter(
          (run) =>
            run.status ===
            "FAILED",
        ).length;

      const totalDurationMs =
        matchingRuns.reduce(
          (total, run) =>
            total +
            run.durationMs,
          0,
        );

      const averageDurationMs =
        matchingRuns.length > 0
          ? Math.round(
              totalDurationMs /
                matchingRuns.length,
            )
          : 0;

      return {
        executionMode,

        totalRuns:
          matchingRuns.length,

        completedRuns,
        failedRuns,

        generatedRecords:
          matchingRuns.reduce(
            (total, run) =>
              total +
              run.generatedCount,
            0,
          ),

        retryRuns:
          matchingRuns.filter(
            (run) => run.isRetry,
          ).length,

        averageDurationMs,

        averageDurationLabel:
          formatDuration(
            averageDurationMs,
          ),

        successRate:
          calculateSuccessRate({
            completedRuns,
            failedRuns,
          }),
      };
    },
  );
}

export function parseAttendanceAutomationReportSearchParams(
  searchParams: Record<
    string,
    string | string[] | undefined
  >,
): AttendanceAutomationReportFilters {
  const normalizedDates =
    normalizeDateRange({
      dateFrom:
        singleSearchParam(
          searchParams.dateFrom,
          getManilaDateInputValue(-29),
        ),

      dateTo:
        singleSearchParam(
          searchParams.dateTo,
          getManilaDateInputValue(),
        ),
    });

  return {
    dateFrom:
      normalizedDates.dateFrom,

    dateTo:
      normalizedDates.dateTo,

    executionMode:
      normalizeExecutionMode(
        singleSearchParam(
          searchParams.executionMode,
        ),
      ),

    status:
      normalizeStatusFilter(
        singleSearchParam(
          searchParams.status,
        ),
      ),
  };
}

export async function getAttendanceAutomationReportData(
  filters: AttendanceAutomationReportFilters,
): Promise<AttendanceAutomationReportData> {
  const where: Prisma.ActivityLogWhereInput =
    {
      action:
        APPROVED_LEAVE_EXCUSED_AUTOMATION_RUN_ACTION,

      entityType:
        "attendance_automation_run",

      createdAt: {
        gte: dateInputToStartDate(
          filters.dateFrom,
        ),

        lt: dateInputToExclusiveEndDate(
          filters.dateTo,
        ),
      },
    };

  const [
    databaseRunsInRange,
    records,
  ] = await Promise.all([
    prisma.activityLog.count({
      where,
    }),

    prisma.activityLog.findMany({
      where,

      select: {
        activityLogId: true,
        actorUserId: true,
        entityId: true,
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

      take:
        MAXIMUM_SCANNED_RUNS,
    }),
  ]);

  const scannedRuns =
    records.map(
      mapAutomationReportRun,
    );

  const matchingRuns =
    scannedRuns.filter((run) => {
      if (
        filters.executionMode &&
        run.executionMode !==
          filters.executionMode
      ) {
        return false;
      }

      if (
        filters.status &&
        run.status !== filters.status
      ) {
        return false;
      }

      return true;
    });

  const completedRuns =
    matchingRuns.filter(
      (run) =>
        run.status === "COMPLETED",
    ).length;

  const failedRuns =
    matchingRuns.filter(
      (run) =>
        run.status === "FAILED",
    ).length;

  const unknownRuns =
    matchingRuns.filter(
      (run) =>
        run.status === "UNKNOWN",
    ).length;

  const totalDurationMs =
    matchingRuns.reduce(
      (total, run) =>
        total +
        run.durationMs,
      0,
    );

  const averageDurationMs =
    matchingRuns.length > 0
      ? Math.round(
          totalDurationMs /
            matchingRuns.length,
        )
      : 0;

  const maximumDurationMs =
    matchingRuns.reduce(
      (maximum, run) =>
        Math.max(
          maximum,
          run.durationMs,
        ),
      0,
    );

  const slowestRuns = [
    ...matchingRuns,
  ]
    .sort(
      (left, right) =>
        right.durationMs -
        left.durationMs,
    )
    .slice(0, SLOWEST_RUN_LIMIT);

  return {
    filters,

    summary: {
      totalRuns:
        matchingRuns.length,

      completedRuns,
      failedRuns,
      unknownRuns,

      generatedRecords:
        matchingRuns.reduce(
          (total, run) =>
            total +
            run.generatedCount,
          0,
        ),

      checkedRecords:
        matchingRuns.reduce(
          (total, run) =>
            total +
            run.checkedCount,
          0,
        ),

      retryRuns:
        matchingRuns.filter(
          (run) => run.isRetry,
        ).length,

      successRate:
        calculateSuccessRate({
          completedRuns,
          failedRuns,
        }),

      averageDurationMs,

      averageDurationLabel:
        formatDuration(
          averageDurationMs,
        ),

      maximumDurationMs,

      maximumDurationLabel:
        formatDuration(
          maximumDurationMs,
        ),
    },

    dailyTrend:
      buildDailyTrend(
        matchingRuns,
      ),

    executionBreakdown:
      buildExecutionBreakdown(
        matchingRuns,
      ),

    slowestRuns,

    metadata: {
      databaseRunsInRange,

      scannedRuns:
        scannedRuns.length,

      matchingRuns:
        matchingRuns.length,

      isPartial:
        databaseRunsInRange >
        records.length,

      maximumScannedRuns:
        MAXIMUM_SCANNED_RUNS,
    },
  };
}