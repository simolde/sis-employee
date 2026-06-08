import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/db/prisma";
import {
  ATTENDANCE_AUTOMATION_SCHEDULER_HEARTBEAT_ACTION,
  ATTENDANCE_AUTOMATION_SCHEDULER_HEARTBEAT_ENTITY_TYPE,
  type AttendanceAutomationSchedulerHeartbeatOutcome,
  type AttendanceAutomationSchedulerHeartbeatTask,
} from "../types/attendance-automation-scheduler-heartbeat-types";

const MAXIMUM_HEARTBEAT_DURATION_MS =
  24 * 60 * 60 * 1000;

const MAXIMUM_MESSAGE_LENGTH = 500;

export type RecordAttendanceAutomationSchedulerHeartbeatInput = {
  task:
    AttendanceAutomationSchedulerHeartbeatTask;

  outcome:
    AttendanceAutomationSchedulerHeartbeatOutcome;

  httpStatus: number | null;

  startedAt: Date;
  finishedAt: Date;

  message: string | null;
};

function normalizeMessage(
  value: string | null,
): string | null {
  if (!value) {
    return null;
  }

  const normalized = value
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAXIMUM_MESSAGE_LENGTH);

  return normalized || null;
}

function getDurationMs(input: {
  startedAt: Date;
  finishedAt: Date;
}): number {
  const durationMs =
    input.finishedAt.getTime() -
    input.startedAt.getTime();

  if (
    !Number.isFinite(durationMs) ||
    durationMs < 0 ||
    durationMs >
      MAXIMUM_HEARTBEAT_DURATION_MS
  ) {
    throw new Error(
      "The scheduler heartbeat duration is invalid.",
    );
  }

  return durationMs;
}

export async function recordAttendanceAutomationSchedulerHeartbeat(
  input: RecordAttendanceAutomationSchedulerHeartbeatInput,
): Promise<{
  activityLogId: number;
  receiptKey: string;
  durationMs: number;
}> {
  const durationMs = getDurationMs({
    startedAt: input.startedAt,
    finishedAt: input.finishedAt,
  });

  const receiptKey = [
    "HOSTINGER_CRON",
    input.task,
    randomUUID(),
  ].join(":");

  const record =
    await prisma.activityLog.create({
      data: {
        actorUserId: null,

        action:
          ATTENDANCE_AUTOMATION_SCHEDULER_HEARTBEAT_ACTION,

        entityType:
          ATTENDANCE_AUTOMATION_SCHEDULER_HEARTBEAT_ENTITY_TYPE,

        entityId: receiptKey,

        oldValue: {
          recorded: false,
        },

        newValue: {
          recorded: true,

          receiptKey,

          task: input.task,
          outcome: input.outcome,
          source: "HOSTINGER_CRON",

          httpStatus:
            input.httpStatus,

          startedAt:
            input.startedAt.toISOString(),

          finishedAt:
            input.finishedAt.toISOString(),

          durationMs,

          message:
            normalizeMessage(
              input.message,
            ),
        },
      },

      select: {
        activityLogId: true,
      },
    });

  return {
    activityLogId:
      record.activityLogId,

    receiptKey,
    durationMs,
  };
}