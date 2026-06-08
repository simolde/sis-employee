import type { Prisma } from "@/generated/prisma/client";
import { getAttendanceAutomationConfigurationData } from "@/features/attendance/automation/configuration/server/attendance-automation-configuration-queries";
import { getAttendanceAutomationSchedulerMonitoringConfiguration } from "@/features/attendance/automation/scheduler/server/attendance-automation-scheduler-monitoring-config";
import { prisma } from "@/lib/db/prisma";
import {
  ATTENDANCE_AUTOMATION_SCHEDULER_HEARTBEAT_ACTION,
  ATTENDANCE_AUTOMATION_SCHEDULER_HEARTBEAT_ENTITY_TYPE,
  type AttendanceAutomationSchedulerHeartbeatData,
  type AttendanceAutomationSchedulerHeartbeatOutcome,
  type AttendanceAutomationSchedulerHeartbeatRecord,
  type AttendanceAutomationSchedulerHeartbeatState,
  type AttendanceAutomationSchedulerHeartbeatTask,
  type AttendanceAutomationSchedulerTaskHeartbeatStatus,
} from "../types/attendance-automation-scheduler-heartbeat-types";

const MONITORING_WINDOW_DAYS = 30;
const MAXIMUM_RECENT_RECEIPTS = 200;

const MILLISECONDS_PER_MINUTE =
  60 * 1000;

const MILLISECONDS_PER_DAY =
  24 * 60 * 60 * 1000;

const HEALTH_CHECK_BUFFER_MINUTES = 5;

type SchedulerHeartbeatActivityLogRecord = {
  activityLogId: number;
  entityId: string | null;
  newValue: Prisma.JsonValue | null;
  createdAt: Date;
};

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
): AttendanceAutomationSchedulerHeartbeatOutcome {
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

  return "FAILED";
}

function parseDate(
  value: string,
  fallback: Date,
): Date {
  const parsed = new Date(value);

  return Number.isNaN(
    parsed.getTime(),
  )
    ? fallback
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

  const minutes =
    Math.floor(seconds / 60);

  const remainingSeconds =
    Math.round(seconds % 60);

  return `${minutes} min ${remainingSeconds} sec`;
}

function mapHeartbeatRecord(
  record: SchedulerHeartbeatActivityLogRecord,
): AttendanceAutomationSchedulerHeartbeatRecord | null {
  const object = isJsonObject(
    record.newValue,
  )
    ? record.newValue
    : {};

  const task = parseTask(
    readString(object, "task"),
  );

  if (!task) {
    return null;
  }

  const startedAt = parseDate(
    readString(
      object,
      "startedAt",
    ),
    record.createdAt,
  );

  const finishedAt = parseDate(
    readString(
      object,
      "finishedAt",
    ),
    record.createdAt,
  );

  const durationMs = Math.max(
    0,
    readNumber(
      object,
      "durationMs",
    ) ??
      finishedAt.getTime() -
        startedAt.getTime(),
  );

  const message = readString(
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

    outcome:
      parseOutcome(
        readString(
          object,
          "outcome",
        ),
      ),

    source:
      "HOSTINGER_CRON",

    httpStatus:
      readNumber(
        object,
        "httpStatus",
      ),

    startedAt:
      formatDateTime(startedAt),

    startedAtIso:
      startedAt.toISOString(),

    finishedAt:
      formatDateTime(finishedAt),

    finishedAtIso:
      finishedAt.toISOString(),

    durationMs,

    durationLabel:
      formatDuration(durationMs),

    message:
      message || null,

    createdAt:
      formatDateTime(
        record.createdAt,
      ),

    createdAtIso:
      record.createdAt.toISOString(),
  };
}

function getManilaDateParts(
  value: Date,
): {
  year: number;
  month: number;
  day: number;
} {
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

  return {
    year: Number(
      parts.find(
        (part) =>
          part.type === "year",
      )?.value,
    ),

    month: Number(
      parts.find(
        (part) =>
          part.type === "month",
      )?.value,
    ),

    day: Number(
      parts.find(
        (part) =>
          part.type === "day",
      )?.value,
    ),
  };
}

function getCurrentExpectedExecution(input: {
  now: Date;

  scheduledMinutesFromManilaMidnight:
    number;
}): Date {
  const manilaDate =
    getManilaDateParts(input.now);

  const manilaMidnightUtc =
    new Date(
      Date.UTC(
        manilaDate.year,
        manilaDate.month - 1,
        manilaDate.day,
        -8,
        0,
        0,
        0,
      ),
    );

  let expectedAt = new Date(
    manilaMidnightUtc.getTime() +
      input
        .scheduledMinutesFromManilaMidnight *
        MILLISECONDS_PER_MINUTE,
  );

  if (
    input.now.getTime() <
    expectedAt.getTime()
  ) {
    expectedAt = new Date(
      expectedAt.getTime() -
        MILLISECONDS_PER_DAY,
    );
  }

  return expectedAt;
}

function buildDisabledTaskStatus(input: {
  task:
    AttendanceAutomationSchedulerHeartbeatTask;

  expectedAt: Date;

  latestReceipt:
    AttendanceAutomationSchedulerHeartbeatRecord | null;
}): AttendanceAutomationSchedulerTaskHeartbeatStatus {
  return {
    task: input.task,

    state: "DISABLED",

    stateLabel:
      "Receipt Monitoring Disabled",

    stateDescription:
      `The application is not currently requiring ${input.task.toLowerCase()} cron receipts.`,

    expectedAt:
      formatDateTime(
        input.expectedAt,
      ),

    expectedAtIso:
      input.expectedAt.toISOString(),

    latestReceipt:
      input.latestReceipt,
  };
}

function buildEnabledTaskStatus(input: {
  task:
    AttendanceAutomationSchedulerHeartbeatTask;

  expectedAt: Date;

  latestReceipt:
    AttendanceAutomationSchedulerHeartbeatRecord | null;
}): AttendanceAutomationSchedulerTaskHeartbeatStatus {
  if (!input.latestReceipt) {
    return {
      task: input.task,

      state: "MISSING",

      stateLabel:
        "No Receipt Recorded",

      stateDescription:
        `No ${input.task.toLowerCase()} cron receipt exists in the current monitoring window.`,

      expectedAt:
        formatDateTime(
          input.expectedAt,
        ),

      expectedAtIso:
        input.expectedAt.toISOString(),

      latestReceipt: null,
    };
  }

  const latestReceiptDate =
    new Date(
      input.latestReceipt.createdAtIso,
    );

  if (
    latestReceiptDate.getTime() <
    input.expectedAt.getTime()
  ) {
    return {
      task: input.task,

      state: "MISSING",

      stateLabel:
        "Current Receipt Missing",

      stateDescription:
        `The latest ${input.task.toLowerCase()} cron receipt belongs to an earlier scheduling window.`,

      expectedAt:
        formatDateTime(
          input.expectedAt,
        ),

      expectedAtIso:
        input.expectedAt.toISOString(),

      latestReceipt:
        input.latestReceipt,
    };
  }

  if (
    input.latestReceipt.outcome ===
    "SUCCESS"
  ) {
    return {
      task: input.task,

      state: "HEALTHY",

      stateLabel:
        "Receipt Confirmed",

      stateDescription:
        `Hostinger recorded a successful ${input.task.toLowerCase()} cron receipt for the current scheduling window.`,

      expectedAt:
        formatDateTime(
          input.expectedAt,
        ),

      expectedAtIso:
        input.expectedAt.toISOString(),

      latestReceipt:
        input.latestReceipt,
    };
  }

  return {
    task: input.task,

    state: "ATTENTION",

    stateLabel:
      "Receipt Requires Review",

    stateDescription:
      `The latest ${input.task.toLowerCase()} cron receipt was recorded as ${input.latestReceipt.outcome}.`,

    expectedAt:
      formatDateTime(
        input.expectedAt,
      ),

    expectedAtIso:
      input.expectedAt.toISOString(),

    latestReceipt:
      input.latestReceipt,
  };
}

function buildTaskStatus(input: {
  monitoringEnabled: boolean;

  task:
    AttendanceAutomationSchedulerHeartbeatTask;

  expectedAt: Date;

  latestReceipt:
    AttendanceAutomationSchedulerHeartbeatRecord | null;
}): AttendanceAutomationSchedulerTaskHeartbeatStatus {
  if (!input.monitoringEnabled) {
    return buildDisabledTaskStatus({
      task: input.task,
      expectedAt: input.expectedAt,
      latestReceipt:
        input.latestReceipt,
    });
  }

  return buildEnabledTaskStatus({
    task: input.task,
    expectedAt: input.expectedAt,
    latestReceipt:
      input.latestReceipt,
  });
}

function getOverallState(input: {
  monitoringEnabled: boolean;

  automation:
    AttendanceAutomationSchedulerTaskHeartbeatStatus;

  health:
    AttendanceAutomationSchedulerTaskHeartbeatStatus;
}): AttendanceAutomationSchedulerHeartbeatState {
  if (!input.monitoringEnabled) {
    return "DISABLED";
  }

  if (
    input.automation.state ===
      "MISSING" ||
    input.health.state === "MISSING"
  ) {
    return "MISSING";
  }

  if (
    input.automation.state ===
      "ATTENTION" ||
    input.health.state ===
      "ATTENTION"
  ) {
    return "ATTENTION";
  }

  return "HEALTHY";
}

function getOverallCopy(
  state:
    AttendanceAutomationSchedulerHeartbeatState,
): {
  label: string;
  description: string;
} {
  switch (state) {
    case "HEALTHY":
      return {
        label:
          "Hostinger Cron Receipts Confirmed",

        description:
          "Both the automation and post-grace health cron jobs recorded successful receipts for their current scheduling windows.",
      };

    case "ATTENTION":
      return {
        label:
          "Cron Receipts Require Review",

        description:
          "Both scheduled jobs were detected, but at least one receipt reported an attention, skipped, or failed result.",
      };

    case "MISSING":
      return {
        label:
          "Scheduled Cron Receipt Missing",

        description:
          "At least one expected Hostinger cron receipt has not been recorded for the current scheduling window.",
      };

    case "DISABLED":
      return {
        label:
          "Hostinger Cron Monitoring Disabled",

        description:
          "Receipt history remains available, but the application is not currently requiring daily Hostinger cron receipts.",
      };
  }
}

export async function getAttendanceAutomationSchedulerHeartbeatData(): Promise<AttendanceAutomationSchedulerHeartbeatData> {
  const now = new Date();

  const configuration =
    getAttendanceAutomationConfigurationData();

  const monitoring =
    getAttendanceAutomationSchedulerMonitoringConfiguration();

  const monitoringStart =
    new Date(
      now.getTime() -
        MONITORING_WINDOW_DAYS *
          MILLISECONDS_PER_DAY,
    );

  const activityLogs =
    await prisma.activityLog.findMany({
      where: {
        action:
          ATTENDANCE_AUTOMATION_SCHEDULER_HEARTBEAT_ACTION,

        entityType:
          ATTENDANCE_AUTOMATION_SCHEDULER_HEARTBEAT_ENTITY_TYPE,

        createdAt: {
          gte: monitoringStart,
        },
      },

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
        MAXIMUM_RECENT_RECEIPTS,
    });

  const receipts =
    activityLogs
      .map(mapHeartbeatRecord)
      .filter(
        (
          receipt,
        ): receipt is AttendanceAutomationSchedulerHeartbeatRecord =>
          receipt !== null,
      );

  const latestAutomation =
    receipts.find(
      (receipt) =>
        receipt.task ===
        "AUTOMATION",
    ) ?? null;

  const latestHealth =
    receipts.find(
      (receipt) =>
        receipt.task === "HEALTH",
    ) ?? null;

  const automationMinutes =
    configuration.schedule.expectedHour *
      60 +
    configuration.schedule.expectedMinute;

  const healthMinutes =
    automationMinutes +
    configuration.schedule.graceMinutes +
    HEALTH_CHECK_BUFFER_MINUTES;

  const automationExpectedAt =
    getCurrentExpectedExecution({
      now,

      scheduledMinutesFromManilaMidnight:
        automationMinutes,
    });

  const healthExpectedAt =
    getCurrentExpectedExecution({
      now,

      scheduledMinutesFromManilaMidnight:
        healthMinutes,
    });

  const automationStatus =
    buildTaskStatus({
      monitoringEnabled:
        monitoring.enabled,

      task: "AUTOMATION",

      expectedAt:
        automationExpectedAt,

      latestReceipt:
        latestAutomation,
    });

  const healthStatus =
    buildTaskStatus({
      monitoringEnabled:
        monitoring.enabled,

      task: "HEALTH",

      expectedAt:
        healthExpectedAt,

      latestReceipt:
        latestHealth,
    });

  const overallState =
    getOverallState({
      monitoringEnabled:
        monitoring.enabled,

      automation:
        automationStatus,

      health:
        healthStatus,
    });

  const overallCopy =
    getOverallCopy(
      overallState,
    );

  return {
    overallState,

    overallLabel:
      overallCopy.label,

    overallDescription:
      overallCopy.description,

    generatedAt:
      formatDateTime(now),

    generatedAtIso:
      now.toISOString(),

    monitoringWindowDays:
      MONITORING_WINDOW_DAYS,

    monitoring: {
      enabled:
        monitoring.enabled,

      valid:
        monitoring.valid,

      provider:
        monitoring.provider,

      source:
        monitoring.source,

      variableName:
        monitoring.variableName,

      rawValue:
        monitoring.rawValue,

      normalizedValue:
        monitoring.normalizedValue,

      statusLabel:
        monitoring.statusLabel,

      statusDescription:
        monitoring.statusDescription,
    },

    taskStatus: {
      automation:
        automationStatus,

      health:
        healthStatus,
    },

    summary: {
      totalReceipts:
        receipts.length,

      successfulReceipts:
        receipts.filter(
          (receipt) =>
            receipt.outcome ===
            "SUCCESS",
        ).length,

      attentionReceipts:
        receipts.filter(
          (receipt) =>
            receipt.outcome ===
            "ATTENTION",
        ).length,

      skippedReceipts:
        receipts.filter(
          (receipt) =>
            receipt.outcome ===
            "SKIPPED",
        ).length,

      failedReceipts:
        receipts.filter(
          (receipt) =>
            receipt.outcome ===
            "FAILED",
        ).length,

      automationReceipts:
        receipts.filter(
          (receipt) =>
            receipt.task ===
            "AUTOMATION",
        ).length,

      healthReceipts:
        receipts.filter(
          (receipt) =>
            receipt.task ===
            "HEALTH",
        ).length,
    },

    recentReceipts:
      receipts,
  };
}