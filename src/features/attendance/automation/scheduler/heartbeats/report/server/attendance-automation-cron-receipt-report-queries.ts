import type { Prisma } from "@/generated/prisma/client";
import { getAttendanceAutomationConfigurationData } from "@/features/attendance/automation/configuration/server/attendance-automation-configuration-queries";
import { getAttendanceAutomationSchedulerMonitoringConfiguration } from "@/features/attendance/automation/scheduler/server/attendance-automation-scheduler-monitoring-config";
import { prisma } from "@/lib/db/prisma";
import {
  ATTENDANCE_AUTOMATION_SCHEDULER_HEARTBEAT_ACTION,
  ATTENDANCE_AUTOMATION_SCHEDULER_HEARTBEAT_ENTITY_TYPE,
  type AttendanceAutomationSchedulerHeartbeatOutcome,
  type AttendanceAutomationSchedulerHeartbeatTask,
} from "../../types/attendance-automation-scheduler-heartbeat-types";
import type {
  AttendanceAutomationCronReceiptDailyRow,
  AttendanceAutomationCronReceiptDailyState,
  AttendanceAutomationCronReceiptReportData,
  AttendanceAutomationCronReceiptReportDays,
  AttendanceAutomationCronReceiptReportFilters,
  AttendanceAutomationCronReceiptTaskResult,
  AttendanceAutomationCronReceiptTimeliness,
} from "../types/attendance-automation-cron-receipt-report-types";

const DEFAULT_REPORT_DAYS:
  AttendanceAutomationCronReceiptReportDays =
  30;

const ALLOWED_REPORT_DAYS =
  new Set<number>([
    7,
    14,
    30,
    60,
    90,
  ]);

const HEALTH_CHECK_BUFFER_MINUTES = 5;
const ON_TIME_TOLERANCE_MINUTES = 15;

const MILLISECONDS_PER_MINUTE =
  60 * 1000;

const MILLISECONDS_PER_DAY =
  24 * 60 * 60 * 1000;

const MAXIMUM_SCANNED_RECEIPTS = 1000;

type SchedulerHeartbeatActivityLogRecord = {
  activityLogId: number;
  entityId: string | null;
  newValue: Prisma.JsonValue | null;
  createdAt: Date;
};

type ParsedSchedulerReceipt = {
  activityLogId: number;
  receiptKey: string;

  task:
    AttendanceAutomationSchedulerHeartbeatTask;

  outcome:
    AttendanceAutomationSchedulerHeartbeatOutcome;

  httpStatus: number | null;

  startedAt: Date;
  finishedAt: Date;

  durationMs: number;

  message: string | null;

  createdAt: Date;
};

function singleSearchParam(
  value:
    | string
    | string[]
    | undefined,
  fallback = "",
): string {
  if (Array.isArray(value)) {
    return value[0] ?? fallback;
  }

  return value ?? fallback;
}

function parseReportDays(
  value: string,
): AttendanceAutomationCronReceiptReportDays {
  const parsed = Number(value);

  if (
    !Number.isInteger(parsed) ||
    !ALLOWED_REPORT_DAYS.has(parsed)
  ) {
    return DEFAULT_REPORT_DAYS;
  }

  return parsed as AttendanceAutomationCronReceiptReportDays;
}

function isJsonObject(
  value: Prisma.JsonValue | null,
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
): number | null {
  const value = object[key];

  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return null;
  }

  return value;
}

function parseTask(
  value: string,
): AttendanceAutomationSchedulerHeartbeatTask | null {
  const normalized =
    value.trim().toUpperCase();

  if (
    normalized === "AUTOMATION" ||
    normalized === "HEALTH"
  ) {
    return normalized;
  }

  return null;
}

function parseOutcome(
  value: string,
): AttendanceAutomationSchedulerHeartbeatOutcome | null {
  const normalized =
    value.trim().toUpperCase();

  if (
    normalized === "SUCCESS" ||
    normalized === "ATTENTION" ||
    normalized === "SKIPPED" ||
    normalized === "FAILED"
  ) {
    return normalized;
  }

  return null;
}

function parseDate(
  value: string,
): Date | null {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);

  return Number.isNaN(
    parsed.getTime(),
  )
    ? null
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

function formatDateLabel(
  dateInput: string,
): string {
  const value = new Date(
    `${dateInput}T12:00:00+08:00`,
  );

  return new Intl.DateTimeFormat(
    "en-PH",
    {
      year: "numeric",
      month: "long",
      day: "2-digit",
      weekday: "short",
      timeZone: "Asia/Manila",
    },
  ).format(value);
}

function formatTimeLabel(
  value: Date,
): string {
  return new Intl.DateTimeFormat(
    "en-PH",
    {
      hour: "numeric",
      minute: "2-digit",
      timeZone: "Asia/Manila",
    },
  ).format(value);
}

function formatDuration(
  durationMs: number,
): string {
  const safeDuration =
    Math.max(
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

  const minutes =
    Math.floor(seconds / 60);

  const remainingSeconds =
    Math.round(seconds % 60);

  return `${minutes} min ${remainingSeconds} sec`;
}

function getManilaDateInput(
  value: Date,
): string {
  const parts =
    new Intl.DateTimeFormat(
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
      (part) =>
        part.type === "year",
    )?.value ?? "";

  const month =
    parts.find(
      (part) =>
        part.type === "month",
    )?.value ?? "";

  const day =
    parts.find(
      (part) =>
        part.type === "day",
    )?.value ?? "";

  return `${year}-${month}-${day}`;
}

function addDaysToDateInput(
  value: string,
  days: number,
): string {
  const [
    year,
    month,
    day,
  ] = value
    .split("-")
    .map(Number);

  const target =
    new Date(
      Date.UTC(
        year,
        month - 1,
        day + days,
      ),
    );

  return [
    target.getUTCFullYear(),
    String(
      target.getUTCMonth() + 1,
    ).padStart(2, "0"),
    String(
      target.getUTCDate(),
    ).padStart(2, "0"),
  ].join("-");
}

function buildDateRange(
  days:
    AttendanceAutomationCronReceiptReportDays,
): string[] {
  const dateTo =
    getManilaDateInput(
      new Date(),
    );

  const dateFrom =
    addDaysToDateInput(
      dateTo,
      -(days - 1),
    );

  const dates: string[] = [];

  for (
    let index = 0;
    index < days;
    index += 1
  ) {
    dates.push(
      addDaysToDateInput(
        dateFrom,
        index,
      ),
    );
  }

  return dates;
}

function buildExpectedAt(
  dateInput: string,
  minutesFromMidnight: number,
): Date {
  const midnight =
    new Date(
      `${dateInput}T00:00:00+08:00`,
    );

  return new Date(
    midnight.getTime() +
      minutesFromMidnight *
        MILLISECONDS_PER_MINUTE,
  );
}

function mapReceipt(
  record:
    SchedulerHeartbeatActivityLogRecord,
): ParsedSchedulerReceipt | null {
  const object = isJsonObject(
    record.newValue,
  )
    ? record.newValue
    : {};

  const task = parseTask(
    readString(
      object,
      "task",
    ),
  );

  const outcome =
    parseOutcome(
      readString(
        object,
        "outcome",
      ),
    );

  const startedAt =
    parseDate(
      readString(
        object,
        "startedAt",
      ),
    );

  const finishedAt =
    parseDate(
      readString(
        object,
        "finishedAt",
      ),
    );

  if (
    !task ||
    !outcome ||
    !startedAt ||
    !finishedAt
  ) {
    return null;
  }

  const durationMs =
    Math.max(
      0,
      readNumber(
        object,
        "durationMs",
      ) ??
        finishedAt.getTime() -
          startedAt.getTime(),
    );

  const message =
    readString(
      object,
      "message",
    ).trim();

  return {
    activityLogId:
      record.activityLogId,

    receiptKey:
      readString(
        object,
        "receiptKey",
        record.entityId ??
          `RECEIPT:${record.activityLogId}`,
      ),

    task,
    outcome,

    httpStatus:
      readNumber(
        object,
        "httpStatus",
      ),

    startedAt,
    finishedAt,

    durationMs,

    message:
      message || null,

    createdAt:
      record.createdAt,
  };
}

function buildReceiptMap(
  receipts:
    ParsedSchedulerReceipt[],
): Map<
  string,
  ParsedSchedulerReceipt
> {
  const map =
    new Map<
      string,
      ParsedSchedulerReceipt
    >();

  for (const receipt of receipts) {
    const date =
      getManilaDateInput(
        receipt.startedAt,
      );

    const key =
      `${date}:${receipt.task}`;

    const current =
      map.get(key);

    if (
      !current ||
      receipt.createdAt.getTime() >
        current.createdAt.getTime() ||
      (
        receipt.createdAt.getTime() ===
          current.createdAt.getTime() &&
        receipt.activityLogId >
          current.activityLogId
      )
    ) {
      map.set(
        key,
        receipt,
      );
    }
  }

  return map;
}

function getTimeliness(input: {
  receipt:
    ParsedSchedulerReceipt | null;

  expectedAt: Date;
}): {
  timeliness:
    AttendanceAutomationCronReceiptTimeliness;

  delayMinutes: number | null;
} {
  if (!input.receipt) {
    return {
      timeliness: "MISSING",
      delayMinutes: null,
    };
  }

  const delayMinutes =
    Math.round(
      (
        input.receipt.startedAt.getTime() -
        input.expectedAt.getTime()
      ) /
        MILLISECONDS_PER_MINUTE,
    );

  if (
    Math.abs(delayMinutes) <=
    ON_TIME_TOLERANCE_MINUTES
  ) {
    return {
      timeliness: "ON_TIME",
      delayMinutes,
    };
  }

  if (delayMinutes < 0) {
    return {
      timeliness: "EARLY",
      delayMinutes,
    };
  }

  return {
    timeliness: "LATE",
    delayMinutes,
  };
}

function buildTaskResult(input: {
  task:
    AttendanceAutomationSchedulerHeartbeatTask;

  expectedAt: Date;

  receipt:
    ParsedSchedulerReceipt | null;
}): AttendanceAutomationCronReceiptTaskResult {
  const timing =
    getTimeliness({
      receipt:
        input.receipt,

      expectedAt:
        input.expectedAt,
    });

  if (!input.receipt) {
    return {
      task:
        input.task,

      expectedAt:
        formatDateTime(
          input.expectedAt,
        ),

      expectedAtIso:
        input.expectedAt.toISOString(),

      timeliness:
        timing.timeliness,

      delayMinutes: null,

      receiptActivityLogId: null,
      receiptKey: null,

      outcome: null,
      httpStatus: null,

      startedAt: null,
      startedAtIso: null,

      finishedAt: null,
      finishedAtIso: null,

      durationMs: null,
      durationLabel: null,

      message: null,

      healthy: false,
    };
  }

  return {
    task:
      input.task,

    expectedAt:
      formatDateTime(
        input.expectedAt,
      ),

    expectedAtIso:
      input.expectedAt.toISOString(),

    timeliness:
      timing.timeliness,

    delayMinutes:
      timing.delayMinutes,

    receiptActivityLogId:
      input.receipt.activityLogId,

    receiptKey:
      input.receipt.receiptKey,

    outcome:
      input.receipt.outcome,

    httpStatus:
      input.receipt.httpStatus,

    startedAt:
      formatDateTime(
        input.receipt.startedAt,
      ),

    startedAtIso:
      input.receipt.startedAt.toISOString(),

    finishedAt:
      formatDateTime(
        input.receipt.finishedAt,
      ),

    finishedAtIso:
      input.receipt.finishedAt.toISOString(),

    durationMs:
      input.receipt.durationMs,

    durationLabel:
      formatDuration(
        input.receipt.durationMs,
      ),

    message:
      input.receipt.message,

    healthy:
      input.receipt.outcome ===
        "SUCCESS" &&
      timing.timeliness ===
        "ON_TIME",
  };
}

function getDailyState(input: {
  automation:
    AttendanceAutomationCronReceiptTaskResult;

  health:
    AttendanceAutomationCronReceiptTaskResult;
}): AttendanceAutomationCronReceiptDailyState {
  const results = [
    input.automation,
    input.health,
  ];

  const hasCritical =
    results.some(
      (result) =>
        result.timeliness ===
          "MISSING" ||
        result.outcome ===
          "FAILED",
    );

  if (hasCritical) {
    return "CRITICAL";
  }

  const hasWarning =
    results.some(
      (result) =>
        result.outcome !==
          "SUCCESS" ||
        result.timeliness !==
          "ON_TIME",
    );

  if (hasWarning) {
    return "WARNING";
  }

  return "HEALTHY";
}

function calculateRate(
  count: number,
  total: number,
): number {
  if (total <= 0) {
    return 0;
  }

  return Number(
    (
      (count / total) *
      100
    ).toFixed(2),
  );
}

function calculateAverageDuration(
  results:
    AttendanceAutomationCronReceiptTaskResult[],
): number | null {
  const durations =
    results
      .map(
        (result) =>
          result.durationMs,
      )
      .filter(
        (
          duration,
        ): duration is number =>
          duration !== null,
      );

  if (durations.length === 0) {
    return null;
  }

  return Math.round(
    durations.reduce(
      (
        total,
        duration,
      ) =>
        total + duration,
      0,
    ) /
      durations.length,
  );
}

export function parseAttendanceAutomationCronReceiptReportSearchParams(
  searchParams: Record<
    string,
    string | string[] | undefined
  >,
): AttendanceAutomationCronReceiptReportFilters {
  return {
    days:
      parseReportDays(
        singleSearchParam(
          searchParams.days,
        ),
      ),
  };
}

export async function getAttendanceAutomationCronReceiptReportData(
  filters:
    AttendanceAutomationCronReceiptReportFilters,
): Promise<AttendanceAutomationCronReceiptReportData> {
  const generatedAt =
    new Date();

  const configuration =
    getAttendanceAutomationConfigurationData();

  const monitoring =
    getAttendanceAutomationSchedulerMonitoringConfiguration();

  const dates =
    buildDateRange(
      filters.days,
    );

  const dateFrom =
    dates[0];

  const dateTo =
    dates.at(-1) ??
    dateFrom;

  const queryStart =
    new Date(
      new Date(
        `${dateFrom}T00:00:00+08:00`,
      ).getTime() -
        MILLISECONDS_PER_DAY,
    );

  const queryEnd =
    new Date(
      new Date(
        `${dateTo}T00:00:00+08:00`,
      ).getTime() +
        2 *
          MILLISECONDS_PER_DAY,
    );

  const where: Prisma.ActivityLogWhereInput =
    {
      action:
        ATTENDANCE_AUTOMATION_SCHEDULER_HEARTBEAT_ACTION,

      entityType:
        ATTENDANCE_AUTOMATION_SCHEDULER_HEARTBEAT_ENTITY_TYPE,

      createdAt: {
        gte: queryStart,
        lt: queryEnd,
      },
    };

  const [
    totalDatabaseReceipts,
    activityLogs,
  ] = await Promise.all([
    prisma.activityLog.count({
      where,
    }),

    prisma.activityLog.findMany({
      where,

      select: {
        activityLogId: true,
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
        MAXIMUM_SCANNED_RECEIPTS,
    }),
  ]);

  const receipts =
    activityLogs
      .map(mapReceipt)
      .filter(
        (
          receipt,
        ): receipt is ParsedSchedulerReceipt =>
          receipt !== null,
      );

  const receiptMap =
    buildReceiptMap(
      receipts,
    );

  const automationMinutes =
    configuration.schedule.expectedHour *
      60 +
    configuration.schedule.expectedMinute;

  const healthMinutes =
    automationMinutes +
    configuration.schedule.graceMinutes +
    HEALTH_CHECK_BUFFER_MINUTES;

  const rows =
    dates
      .map(
        (
          date,
        ): AttendanceAutomationCronReceiptDailyRow => {
          const automationExpectedAt =
            buildExpectedAt(
              date,
              automationMinutes,
            );

          const healthExpectedAt =
            buildExpectedAt(
              date,
              healthMinutes,
            );

          const automation =
            buildTaskResult({
              task:
                "AUTOMATION",

              expectedAt:
                automationExpectedAt,

              receipt:
                receiptMap.get(
                  `${date}:AUTOMATION`,
                ) ?? null,
            });

          const health =
            buildTaskResult({
              task:
                "HEALTH",

              expectedAt:
                healthExpectedAt,

              receipt:
                receiptMap.get(
                  `${date}:HEALTH`,
                ) ?? null,
            });

          return {
            date,

            dateLabel:
              formatDateLabel(
                date,
              ),

            state:
              getDailyState({
                automation,
                health,
              }),

            automation,
            health,
          };
        },
      )
      .reverse();

  const automationResults =
    rows.map(
      (row) =>
        row.automation,
    );

  const healthResults =
    rows.map(
      (row) =>
        row.health,
    );

  const automationReceiptDays =
    automationResults.filter(
      (result) =>
        result.receiptActivityLogId !==
        null,
    ).length;

  const healthReceiptDays =
    healthResults.filter(
      (result) =>
        result.receiptActivityLogId !==
        null,
    ).length;

  const automationSuccessfulDays =
    automationResults.filter(
      (result) =>
        result.outcome ===
        "SUCCESS",
    ).length;

  const healthSuccessfulDays =
    healthResults.filter(
      (result) =>
        result.outcome ===
        "SUCCESS",
    ).length;

  const firstAutomationExpected =
    buildExpectedAt(
      dateFrom,
      automationMinutes,
    );

  const firstHealthExpected =
    buildExpectedAt(
      dateFrom,
      healthMinutes,
    );

  return {
    generatedAt:
      formatDateTime(
        generatedAt,
      ),

    generatedAtIso:
      generatedAt.toISOString(),

    filters,

    range: {
      dateFrom,
      dateTo,

      dateFromLabel:
        formatDateLabel(
          dateFrom,
        ),

      dateToLabel:
        formatDateLabel(
          dateTo,
        ),
    },

    schedule: {
      timeZone:
        "Asia/Manila",

      automationTimeLabel:
        formatTimeLabel(
          firstAutomationExpected,
        ),

      healthTimeLabel:
        formatTimeLabel(
          firstHealthExpected,
        ),

      graceMinutes:
        configuration.schedule
          .graceMinutes,

      healthBufferMinutes:
        HEALTH_CHECK_BUFFER_MINUTES,

      onTimeToleranceMinutes:
        ON_TIME_TOLERANCE_MINUTES,
    },

    monitoring: {
      enabled:
        monitoring.enabled,

      valid:
        monitoring.valid,

      normalizedValue:
        monitoring.normalizedValue,
    },

    summary: {
      totalDays:
        rows.length,

      healthyDays:
        rows.filter(
          (row) =>
            row.state ===
            "HEALTHY",
        ).length,

      warningDays:
        rows.filter(
          (row) =>
            row.state ===
            "WARNING",
        ).length,

      criticalDays:
        rows.filter(
          (row) =>
            row.state ===
            "CRITICAL",
        ).length,

      automationReceiptDays,
      healthReceiptDays,

      automationSuccessfulDays,
      healthSuccessfulDays,

      automationCoverageRate:
        calculateRate(
          automationReceiptDays,
          rows.length,
        ),

      healthCoverageRate:
        calculateRate(
          healthReceiptDays,
          rows.length,
        ),

      automationSuccessRate:
        calculateRate(
          automationSuccessfulDays,
          rows.length,
        ),

      healthSuccessRate:
        calculateRate(
          healthSuccessfulDays,
          rows.length,
        ),

      averageAutomationDurationMs:
        calculateAverageDuration(
          automationResults,
        ),

      averageHealthDurationMs:
        calculateAverageDuration(
          healthResults,
        ),
    },

    rows,

    metadata: {
      source:
        "V2_ACTIVITY_LOGS",

      scannedReceipts:
        activityLogs.length,

      maximumScannedReceipts:
        MAXIMUM_SCANNED_RECEIPTS,

      isPartial:
        totalDatabaseReceipts >
        activityLogs.length,
    },
  };
}