import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import {
  ATTENDANCE_AUTOMATION_ALERT_ACKNOWLEDGED_ACTION,
  ATTENDANCE_AUTOMATION_ALERT_ACKNOWLEDGEMENT_CLEARED_ACTION,
  ATTENDANCE_AUTOMATION_ALERT_ENTITY_TYPE,
  type AttendanceAutomationAlertAcknowledgement,
} from "../types/attendance-automation-alert-acknowledgement-types";
import type { AttendanceAutomationAlertCode } from "../types/attendance-automation-alert-types";

type AcknowledgementLogRecord = {
  activityLogId: number;
  actorUserId: number | null;
  action: string;
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

  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return fallback;
  }

  return value;
}

function parseDate(
  value: string,
): Date | null {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
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

function remainingMinutes(
  acknowledgedUntil: Date,
  now: Date,
): number {
  return Math.max(
    1,
    Math.ceil(
      (acknowledgedUntil.getTime() -
        now.getTime()) /
        (60 * 1000),
    ),
  );
}

function mapAcknowledgement(input: {
  record: AcknowledgementLogRecord;
  alertCode: AttendanceAutomationAlertCode;
  now: Date;
}): AttendanceAutomationAlertAcknowledgement | null {
  if (
    input.record.action !==
    ATTENDANCE_AUTOMATION_ALERT_ACKNOWLEDGED_ACTION
  ) {
    return null;
  }

  const object = isJsonObject(
    input.record.newValue,
  )
    ? input.record.newValue
    : {};

  const acknowledgedAt =
    parseDate(
      readString(
        object,
        "acknowledgedAt",
      ),
    ) ?? input.record.createdAt;

  const acknowledgedUntil =
    parseDate(
      readString(
        object,
        "acknowledgedUntil",
      ),
    );

  if (
    !acknowledgedUntil ||
    acknowledgedUntil.getTime() <=
      input.now.getTime()
  ) {
    return null;
  }

  const noteValue = readString(
    object,
    "note",
  ).trim();

  return {
    activityLogId:
      input.record.activityLogId,

    alertCode:
      input.alertCode,

    actorUserId:
      input.record.actorUserId,

    acknowledgedAt:
      formatDateTime(
        acknowledgedAt,
      ),

    acknowledgedAtIso:
      acknowledgedAt.toISOString(),

    acknowledgedUntil:
      formatDateTime(
        acknowledgedUntil,
      ),

    acknowledgedUntilIso:
      acknowledgedUntil.toISOString(),

    durationHours:
      readNumber(
        object,
        "durationHours",
      ),

    remainingMinutes:
      remainingMinutes(
        acknowledgedUntil,
        input.now,
      ),

    note:
      noteValue || null,
  };
}

export async function getAttendanceAutomationAlertAcknowledgementMap(
  alertCodes: AttendanceAutomationAlertCode[],
): Promise<
  Map<
    AttendanceAutomationAlertCode,
    AttendanceAutomationAlertAcknowledgement
  >
> {
  const uniqueAlertCodes = Array.from(
    new Set(alertCodes),
  );

  const acknowledgements =
    new Map<
      AttendanceAutomationAlertCode,
      AttendanceAutomationAlertAcknowledgement
    >();

  if (uniqueAlertCodes.length === 0) {
    return acknowledgements;
  }

  const validCodes = new Set<string>(
    uniqueAlertCodes,
  );

  const records =
    await prisma.activityLog.findMany({
      where: {
        entityType:
          ATTENDANCE_AUTOMATION_ALERT_ENTITY_TYPE,

        entityId: {
          in: uniqueAlertCodes,
        },

        action: {
          in: [
            ATTENDANCE_AUTOMATION_ALERT_ACKNOWLEDGED_ACTION,
            ATTENDANCE_AUTOMATION_ALERT_ACKNOWLEDGEMENT_CLEARED_ACTION,
          ],
        },
      },

      select: {
        activityLogId: true,
        actorUserId: true,
        action: true,
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
    });

  const resolvedCodes = new Set<string>();
  const now = new Date();

  for (const record of records) {
    if (
      !record.entityId ||
      !validCodes.has(record.entityId) ||
      resolvedCodes.has(record.entityId)
    ) {
      continue;
    }

    resolvedCodes.add(record.entityId);

    const alertCode =
      record.entityId as AttendanceAutomationAlertCode;

    const acknowledgement =
      mapAcknowledgement({
        record,
        alertCode,
        now,
      });

    if (acknowledgement) {
      acknowledgements.set(
        alertCode,
        acknowledgement,
      );
    }
  }

  return acknowledgements;
}