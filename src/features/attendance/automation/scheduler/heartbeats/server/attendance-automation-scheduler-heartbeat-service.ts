import {
  createHash,
} from "node:crypto";
import type {
  Prisma,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import {
  ATTENDANCE_AUTOMATION_SCHEDULER_HEARTBEAT_ACTION,
  ATTENDANCE_AUTOMATION_SCHEDULER_HEARTBEAT_ENTITY_TYPE,
  type AttendanceAutomationSchedulerHeartbeatOutcome,
  type AttendanceAutomationSchedulerHeartbeatTask,
} from "../types/attendance-automation-scheduler-heartbeat-types";

const MAXIMUM_HEARTBEAT_DURATION_MS =
  24 * 60 * 60 * 1000;

const RECEIPT_LOCK_WAIT_SECONDS = 5;

const RECEIPT_TRANSACTION_MAX_WAIT_MS =
  10_000;

const RECEIPT_TRANSACTION_TIMEOUT_MS =
  15_000;

type RawNumericValue =
  | number
  | bigint
  | string
  | null;

type AcquireLockRow = {
  acquired: RawNumericValue;
};

export type RecordAttendanceAutomationSchedulerHeartbeatInput = {
  executionId: string;

  task:
    AttendanceAutomationSchedulerHeartbeatTask;

  outcome:
    AttendanceAutomationSchedulerHeartbeatOutcome;

  httpStatus: number | null;

  startedAt: Date;
  finishedAt: Date;

  message: string | null;
};

export type RecordAttendanceAutomationSchedulerHeartbeatResult = {
  activityLogId: number;
  receiptKey: string;
  durationMs: number;

  duplicate: boolean;
};

function normalizeRawInteger(
  value:
    | RawNumericValue
    | undefined,
): number | null {
  if (
    value === null ||
    value === undefined
  ) {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value)
      ? Math.trunc(value)
      : null;
  }

  if (typeof value === "bigint") {
    const converted = Number(value);

    return Number.isSafeInteger(
      converted,
    )
      ? converted
      : null;
  }

  const converted = Number(value);

  return Number.isSafeInteger(
    converted,
  )
    ? converted
    : null;
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

function buildReceiptKey(input: {
  executionId: string;

  task:
    AttendanceAutomationSchedulerHeartbeatTask;
}): string {
  return [
    "HOSTINGER_CRON",
    input.task,
    input.executionId,
  ].join(":");
}

function buildReceiptLockName(
  receiptKey: string,
): string {
  const hash = createHash("sha256")
    .update(receiptKey)
    .digest("hex")
    .slice(0, 32);

  return `starland.cron.receipt.${hash}`;
}

async function acquireReceiptLock(
  tx: Prisma.TransactionClient,
  lockName: string,
): Promise<void> {
  const rows =
    await tx.$queryRaw<
      AcquireLockRow[]
    >`
      SELECT
        GET_LOCK(
          ${lockName},
          ${RECEIPT_LOCK_WAIT_SECONDS}
        ) AS acquired
    `;

  const acquired =
    normalizeRawInteger(
      rows[0]?.acquired,
    );

  if (acquired !== 1) {
    throw new Error(
      "The scheduler receipt idempotency lock could not be acquired.",
    );
  }
}

async function releaseReceiptLock(
  tx: Prisma.TransactionClient,
  lockName: string,
): Promise<void> {
  try {
    await tx.$queryRaw`
      SELECT
        RELEASE_LOCK(
          ${lockName}
        ) AS released
    `;
  } catch (error) {
    console.error(
      "Unable to release scheduler receipt lock:",
      error,
    );
  }
}

export async function recordAttendanceAutomationSchedulerHeartbeat(
  input: RecordAttendanceAutomationSchedulerHeartbeatInput,
): Promise<RecordAttendanceAutomationSchedulerHeartbeatResult> {
  const durationMs =
    getDurationMs({
      startedAt:
        input.startedAt,

      finishedAt:
        input.finishedAt,
    });

  const receiptKey =
    buildReceiptKey({
      executionId:
        input.executionId,

      task:
        input.task,
    });

  const lockName =
    buildReceiptLockName(
      receiptKey,
    );

  return prisma.$transaction(
    async (tx) => {
      await acquireReceiptLock(
        tx,
        lockName,
      );

      try {
        const existingRecord =
          await tx.activityLog.findFirst({
            where: {
              action:
                ATTENDANCE_AUTOMATION_SCHEDULER_HEARTBEAT_ACTION,

              entityType:
                ATTENDANCE_AUTOMATION_SCHEDULER_HEARTBEAT_ENTITY_TYPE,

              entityId:
                receiptKey,
            },

            select: {
              activityLogId: true,
            },

            orderBy: {
              activityLogId: "asc",
            },
          });

        if (existingRecord) {
          return {
            activityLogId:
              existingRecord.activityLogId,

            receiptKey,
            durationMs,

            duplicate: true,
          };
        }

        const record =
          await tx.activityLog.create({
            data: {
              actorUserId: null,

              action:
                ATTENDANCE_AUTOMATION_SCHEDULER_HEARTBEAT_ACTION,

              entityType:
                ATTENDANCE_AUTOMATION_SCHEDULER_HEARTBEAT_ENTITY_TYPE,

              entityId:
                receiptKey,

              oldValue: {
                recorded: false,
              },

              newValue: {
                recorded: true,

                receiptVersion: 2,

                executionId:
                  input.executionId,

                receiptKey,

                task:
                  input.task,

                outcome:
                  input.outcome,

                source:
                  "HOSTINGER_CRON",

                httpStatus:
                  input.httpStatus,

                startedAt:
                  input.startedAt.toISOString(),

                finishedAt:
                  input.finishedAt.toISOString(),

                durationMs,

                message:
                  input.message,
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

          duplicate: false,
        };
      } finally {
        await releaseReceiptLock(
          tx,
          lockName,
        );
      }
    },
    {
      maxWait:
        RECEIPT_TRANSACTION_MAX_WAIT_MS,

      timeout:
        RECEIPT_TRANSACTION_TIMEOUT_MS,
    },
  );
}