import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import {
  APPROVED_LEAVE_EXCUSED_AUTOMATION_RUN_ACTION,
  type ApprovedLeaveAutomationExecutionMode,
  type ApprovedLeaveAutomationRunStatus,
} from "../../history/types/approved-leave-automation-history-types";
import type {
  AttendanceAutomationHealthData,
  AttendanceAutomationHealthRun,
  AttendanceAutomationHealthStatus,
} from "../types/attendance-automation-health-types";

const MONITORING_WINDOW_DAYS = 30;
const MAXIMUM_SCANNED_RUNS = 5000;
const RECENT_RUN_LIMIT = 12;

type AutomationHealthLogRecord = {
  activityLogId: number;
  actorUserId: number | null;
  entityId: string | null;
  newValue: Prisma.JsonValue;
  createdAt: Date;
};

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

function normalizeExecutionMode(
  value: string,
  runKey: string,
): ApprovedLeaveAutomationExecutionMode {
  return value.trim().toUpperCase() === "API"
    ? "API"
    : parseExecutionModeFromRunKey(runKey);
}

function formatDateTime(
  value: Date,
): string {
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

function formatAge(
  value: Date,
  now: Date,
): string {
  const differenceMs = Math.max(
    0,
    now.getTime() - value.getTime(),
  );

  const differenceMinutes = Math.floor(
    differenceMs / (60 * 1000),
  );

  if (differenceMinutes < 1) {
    return "Just now";
  }

  if (differenceMinutes < 60) {
    return `${differenceMinutes} minute${
      differenceMinutes === 1 ? "" : "s"
    } ago`;
  }

  const differenceHours = Math.floor(
    differenceMinutes / 60,
  );

  if (differenceHours < 24) {
    return `${differenceHours} hour${
      differenceHours === 1 ? "" : "s"
    } ago`;
  }

  const differenceDays = Math.floor(
    differenceHours / 24,
  );

  return `${differenceDays} day${
    differenceDays === 1 ? "" : "s"
  } ago`;
}

function getManilaTodayStart(
  now: Date,
): Date {
  const parts = new Intl.DateTimeFormat(
    "en-CA",
    {
      timeZone: "Asia/Manila",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    },
  ).formatToParts(now);

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

  return new Date(
    `${year}-${month}-${day}T00:00:00+08:00`,
  );
}

function mapAutomationHealthRun(
  input: AutomationHealthLogRecord,
  now: Date,
): AttendanceAutomationHealthRun {
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

  return {
    activityLogId:
      input.activityLogId,

    runKey,

    executionMode:
      normalizeExecutionMode(
        readString(
          object,
          "executionMode",
        ),
        runKey,
      ),

    status:
      normalizeRunStatus(
        readString(
          object,
          "status",
          "UNKNOWN",
        ),
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

    durationMs,

    durationLabel:
      formatDuration(durationMs),

    createdAt:
      formatDateTime(
        input.createdAt,
      ),

    createdAtIso:
      input.createdAt.toISOString(),

    ageLabel:
      formatAge(
        input.createdAt,
        now,
      ),

    retryOfRunAuditLogId:
      readNullablePositiveInteger(
        object,
        "retryOfRunAuditLogId",
      ),
  };
}

function getHealthStatus(input: {
  secretConfigured: boolean;
  totalRuns: number;
  latestRun: AttendanceAutomationHealthRun | null;
  failuresLast24Hours: number;
  latestRunDate: Date | null;
  staleThreshold: Date;
}): AttendanceAutomationHealthStatus {
  if (!input.secretConfigured) {
    return "NOT_CONFIGURED";
  }

  if (
    input.totalRuns === 0 ||
    !input.latestRun ||
    !input.latestRunDate
  ) {
    return "NO_RUNS";
  }

  if (
    input.latestRun.status === "FAILED" ||
    input.failuresLast24Hours > 0
  ) {
    return "DEGRADED";
  }

  if (
    input.latestRunDate.getTime() <
    input.staleThreshold.getTime()
  ) {
    return "STALE";
  }

  return "HEALTHY";
}

function getHealthCopy(
  status: AttendanceAutomationHealthStatus,
): {
  label: string;
  description: string;
} {
  switch (status) {
    case "HEALTHY":
      return {
        label: "Healthy",
        description:
          "The automation secret is configured, a recent run completed, and no failure was recorded during the last 24 hours.",
      };

    case "DEGRADED":
      return {
        label: "Needs Attention",
        description:
          "The latest automation run failed or at least one failure was recorded during the last 24 hours.",
      };

    case "STALE":
      return {
        label: "Stale",
        description:
          "No approved-leave automation run has been recorded during the last 24 hours.",
      };

    case "NO_RUNS":
      return {
        label: "No Runs Recorded",
        description:
          "The endpoint is configured, but there are no approved-leave automation runs in the monitoring window.",
      };

    case "NOT_CONFIGURED":
      return {
        label: "Not Configured",
        description:
          "ATTENDANCE_AUTOMATION_SECRET or CRON_SECRET is not configured for the protected automation endpoint.",
      };
  }
}

export async function getAttendanceAutomationHealthData(): Promise<AttendanceAutomationHealthData> {
  const now = new Date();

  const monitoringWindowStart =
    new Date(
      now.getTime() -
        MONITORING_WINDOW_DAYS *
          24 *
          60 *
          60 *
          1000,
    );

  const last24HoursStart =
    new Date(
      now.getTime() -
        24 *
          60 *
          60 *
          1000,
    );

  const todayStart =
    getManilaTodayStart(now);

  const secretConfigured = Boolean(
    process.env
      .ATTENDANCE_AUTOMATION_SECRET?.trim() ||
      process.env.CRON_SECRET?.trim(),
  );

  const where: Prisma.ActivityLogWhereInput = {
    action:
      APPROVED_LEAVE_EXCUSED_AUTOMATION_RUN_ACTION,

    entityType:
      "attendance_automation_run",

    createdAt: {
      gte: monitoringWindowStart,
    },
  };

  const [totalRuns, logRecords] =
    await Promise.all([
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

  const mappedRuns =
    logRecords.map((record) =>
      mapAutomationHealthRun(
        record,
        now,
      ),
    );

  const completedRuns =
    mappedRuns.filter(
      (run) =>
        run.status === "COMPLETED",
    );

  const failedRuns =
    mappedRuns.filter(
      (run) =>
        run.status === "FAILED",
    );

  const unknownRuns =
    mappedRuns.filter(
      (run) =>
        run.status === "UNKNOWN",
    );

  const failuresLast24Hours =
    failedRuns.filter((run) => {
      const createdAt =
        new Date(run.createdAtIso);

      return (
        createdAt.getTime() >=
        last24HoursStart.getTime()
      );
    }).length;

  const runsToday =
    mappedRuns.filter((run) => {
      const createdAt =
        new Date(run.createdAtIso);

      return (
        createdAt.getTime() >=
        todayStart.getTime()
      );
    }).length;

  const dashboardRuns =
    mappedRuns.filter(
      (run) =>
        run.executionMode ===
        "DASHBOARD",
    ).length;

  const apiRuns =
    mappedRuns.filter(
      (run) =>
        run.executionMode === "API",
    ).length;

  const retries =
    mappedRuns.filter(
      (run) =>
        run.retryOfRunAuditLogId !==
        null,
    ).length;

  const generatedRecords =
    mappedRuns.reduce(
      (total, run) =>
        total +
        run.generatedCount,
      0,
    );

  const knownStatusRuns =
    completedRuns.length +
    failedRuns.length;

  const successRate =
    knownStatusRuns > 0
      ? Number(
          (
            (completedRuns.length /
              knownStatusRuns) *
            100
          ).toFixed(1),
        )
      : 0;

  const latestRun =
    mappedRuns[0] ?? null;

  const latestCompletedRun =
    completedRuns[0] ?? null;

  const latestFailedRun =
    failedRuns[0] ?? null;

  const latestRunDate =
    latestRun
      ? new Date(
          latestRun.createdAtIso,
        )
      : null;

  const status =
    getHealthStatus({
      secretConfigured,
      totalRuns,
      latestRun,
      failuresLast24Hours,
      latestRunDate,
      staleThreshold:
        last24HoursStart,
    });

  const healthCopy =
    getHealthCopy(status);

  return {
    secretConfigured,

    status,

    statusLabel:
      healthCopy.label,

    statusDescription:
      healthCopy.description,

    monitoringWindowDays:
      MONITORING_WINDOW_DAYS,

    isPartial:
      totalRuns >
      logRecords.length,

    summary: {
      totalRuns,
      completedRuns:
        completedRuns.length,
      failedRuns:
        failedRuns.length,
      unknownRuns:
        unknownRuns.length,
      runsToday,
      failuresLast24Hours,
      generatedRecords,
      retries,
      dashboardRuns,
      apiRuns,
      successRate,
    },

    latestRun,

    latestCompletedRun,

    latestFailedRun,

    recentRuns:
      mappedRuns.slice(
        0,
        RECENT_RUN_LIMIT,
      ),
  };
}