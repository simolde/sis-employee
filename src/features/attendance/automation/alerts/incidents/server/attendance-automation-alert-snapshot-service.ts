import { createHash } from "node:crypto";
import type {
  Prisma,
} from "@/generated/prisma/client";
import type { AttendanceAutomationAlertCenterData } from "../../types/attendance-automation-alert-types";
import {
  ATTENDANCE_AUTOMATION_ALERT_SNAPSHOT_ACTION,
  ATTENDANCE_AUTOMATION_ALERT_SNAPSHOT_ENTITY_TYPE,
  type AttendanceAutomationAlertSnapshotAlert,
  type AttendanceAutomationAlertSnapshotSummary,
} from "../types/attendance-automation-alert-incident-types";
import { prisma } from "@/lib/db/prisma";

const SNAPSHOT_VERSION = 1;

const SNAPSHOT_LOCK_NAME =
  "starland.attendance.alert_snapshot";

const SNAPSHOT_LOCK_WAIT_SECONDS = 5;

const SNAPSHOT_TRANSACTION_MAX_WAIT_MS =
  10_000;

const SNAPSHOT_TRANSACTION_TIMEOUT_MS =
  20_000;

type MySqlNumericValue =
  | number
  | bigint
  | string
  | null;

type AcquireLockRow = {
  acquired: MySqlNumericValue;
};

type PreviousSnapshot = {
  activityLogId: number;
  entityId: string | null;
  newValue: Prisma.JsonValue | null;
};

export type RecordAttendanceAutomationAlertSnapshotResult = {
  activityLogId: number;

  snapshotKey: string;
  fingerprint: string;

  duplicate: boolean;

  overallStatus:
    AttendanceAutomationAlertCenterData["overallStatus"];

  summary:
    AttendanceAutomationAlertSnapshotSummary;
};

function normalizeMySqlInteger(
  value:
    | MySqlNumericValue
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
): string | null {
  const value = object[key];

  return typeof value === "string"
    ? value
    : null;
}

function extractPreviousFingerprint(
  snapshot: PreviousSnapshot | null,
): string | null {
  if (
    !snapshot ||
    !isJsonObject(snapshot.newValue)
  ) {
    return null;
  }

  return readString(
    snapshot.newValue,
    "fingerprint",
  );
}

function extractPreviousOverallStatus(
  snapshot: PreviousSnapshot | null,
): string | null {
  if (
    !snapshot ||
    !isJsonObject(snapshot.newValue)
  ) {
    return null;
  }

  return readString(
    snapshot.newValue,
    "overallStatus",
  );
}

function normalizeAlerts(
  data:
    AttendanceAutomationAlertCenterData,
): AttendanceAutomationAlertSnapshotAlert[] {
  return data.alerts
    .map(
      (
        alert,
      ): AttendanceAutomationAlertSnapshotAlert => ({
        code: alert.code,
        severity: alert.severity,

        title: alert.title,
        message: alert.message,

        details:
          [...alert.details],

        action:
          alert.action
            ? {
                label:
                  alert.action.label,

                href:
                  alert.action.href,
              }
            : null,
      }),
    )
    .sort((left, right) =>
      left.code.localeCompare(
        right.code,
      ),
    );
}

function buildSummary(
  data:
    AttendanceAutomationAlertCenterData,
): AttendanceAutomationAlertSnapshotSummary {
  return {
    totalAlerts:
      data.summary.totalAlerts,

    criticalAlerts:
      data.summary.criticalAlerts,

    warningAlerts:
      data.summary.warningAlerts,

    informationalAlerts:
      data.summary.informationalAlerts,
  };
}

function createFingerprint(input: {
  overallStatus:
    AttendanceAutomationAlertCenterData["overallStatus"];

  summary:
    AttendanceAutomationAlertSnapshotSummary;

  alerts:
    AttendanceAutomationAlertSnapshotAlert[];
}): string {
  const canonicalValue = {
    overallStatus:
      input.overallStatus,

    summary:
      input.summary,

    alerts:
      input.alerts,
  };

  return createHash("sha256")
    .update(
      JSON.stringify(
        canonicalValue,
      ),
    )
    .digest("hex");
}

function createSnapshotKey(input: {
  fingerprint: string;
  evaluatedAt: Date;
}): string {
  return [
    "ALERT_SNAPSHOT",
    input.fingerprint.slice(0, 20),
    input.evaluatedAt.getTime(),
  ].join(":");
}

async function acquireSnapshotLock(
  tx: Prisma.TransactionClient,
): Promise<void> {
  const rows =
    await tx.$queryRaw<
      AcquireLockRow[]
    >`
      SELECT
        GET_LOCK(
          ${SNAPSHOT_LOCK_NAME},
          ${SNAPSHOT_LOCK_WAIT_SECONDS}
        ) AS acquired
    `;

  const acquired =
    normalizeMySqlInteger(
      rows[0]?.acquired,
    );

  if (acquired !== 1) {
    throw new Error(
      "The automation alert snapshot lock could not be acquired.",
    );
  }
}

async function releaseSnapshotLock(
  tx: Prisma.TransactionClient,
): Promise<void> {
  try {
    await tx.$queryRaw`
      SELECT
        RELEASE_LOCK(
          ${SNAPSHOT_LOCK_NAME}
        ) AS released
    `;
  } catch (error) {
    console.error(
      "Unable to release automation alert snapshot lock:",
      error,
    );
  }
}

export async function recordAttendanceAutomationAlertSnapshot(
  data:
    AttendanceAutomationAlertCenterData,
): Promise<RecordAttendanceAutomationAlertSnapshotResult> {
  const evaluatedAt = new Date();

  const alerts =
    normalizeAlerts(data);

  const summary =
    buildSummary(data);

  const fingerprint =
    createFingerprint({
      overallStatus:
        data.overallStatus,

      summary,
      alerts,
    });

  return prisma.$transaction(
    async (tx) => {
      await acquireSnapshotLock(tx);

      try {
        const previousSnapshot =
          await tx.activityLog.findFirst({
            where: {
              action:
                ATTENDANCE_AUTOMATION_ALERT_SNAPSHOT_ACTION,

              entityType:
                ATTENDANCE_AUTOMATION_ALERT_SNAPSHOT_ENTITY_TYPE,
            },

            select: {
              activityLogId: true,
              entityId: true,
              newValue: true,
            },

            orderBy: [
              {
                createdAt: "desc",
              },
              {
                activityLogId: "desc",
              },
            ],
          });

        const previousFingerprint =
          extractPreviousFingerprint(
            previousSnapshot,
          );

        if (
          previousSnapshot &&
          previousFingerprint ===
            fingerprint
        ) {
          return {
            activityLogId:
              previousSnapshot.activityLogId,

            snapshotKey:
              previousSnapshot.entityId ??
              `ALERT_SNAPSHOT:${previousSnapshot.activityLogId}`,

            fingerprint,

            duplicate: true,

            overallStatus:
              data.overallStatus,

            summary,
          };
        }

        const snapshotKey =
          createSnapshotKey({
            fingerprint,
            evaluatedAt,
          });

        const record =
          await tx.activityLog.create({
            data: {
              actorUserId: null,

              action:
                ATTENDANCE_AUTOMATION_ALERT_SNAPSHOT_ACTION,

              entityType:
                ATTENDANCE_AUTOMATION_ALERT_SNAPSHOT_ENTITY_TYPE,

              entityId:
                snapshotKey,

              oldValue: {
                previousSnapshotActivityLogId:
                  previousSnapshot
                    ?.activityLogId ?? null,

                previousFingerprint,

                previousOverallStatus:
                  extractPreviousOverallStatus(
                    previousSnapshot,
                  ),
              },

              newValue: {
                snapshotVersion:
                  SNAPSHOT_VERSION,

                snapshotKey,
                fingerprint,

                overallStatus:
                  data.overallStatus,

                summary,

                alerts,

                evaluatedAt:
                  evaluatedAt.toISOString(),
              },
            },

            select: {
              activityLogId: true,
            },
          });

        return {
          activityLogId:
            record.activityLogId,

          snapshotKey,
          fingerprint,

          duplicate: false,

          overallStatus:
            data.overallStatus,

          summary,
        };
      } finally {
        await releaseSnapshotLock(
          tx,
        );
      }
    },
    {
      maxWait:
        SNAPSHOT_TRANSACTION_MAX_WAIT_MS,

      timeout:
        SNAPSHOT_TRANSACTION_TIMEOUT_MS,
    },
  );
}