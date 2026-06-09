import type {
  Prisma,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import { ATTENDANCE_AUTOMATION_ALERT_CODES } from "../../../types/attendance-automation-alert-filter-types";
import type {
  AttendanceAutomationAlertAction,
  AttendanceAutomationAlertCode,
  AttendanceAutomationAlertOverallStatus,
  AttendanceAutomationAlertSeverity,
} from "../../../types/attendance-automation-alert-types";
import {
  ATTENDANCE_AUTOMATION_ALERT_SNAPSHOT_ACTION,
  ATTENDANCE_AUTOMATION_ALERT_SNAPSHOT_ENTITY_TYPE,
  type AttendanceAutomationAlertSnapshotAlert,
  type AttendanceAutomationAlertSnapshotRecord,
  type AttendanceAutomationAlertSnapshotSummary,
} from "../../types/attendance-automation-alert-incident-types";
import type {
  AttendanceAutomationAlertSnapshotComparisonItem,
  AttendanceAutomationAlertSnapshotDetailData,
  AttendanceAutomationAlertSnapshotNeighbor,
} from "../types/attendance-automation-alert-snapshot-detail-types";

type ActivityLogSnapshotRecord = {
  activityLogId: number;
  entityId: string | null;
  newValue: Prisma.JsonValue | null;
  createdAt: Date;
};

const ALERT_CODE_SET =
  new Set<string>(
    ATTENDANCE_AUTOMATION_ALERT_CODES,
  );

function isJsonObject(
  value:
    | Prisma.JsonValue
    | null
    | undefined,
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

  return (
    typeof value === "number" &&
    Number.isFinite(value)
  )
    ? value
    : fallback;
}

function parseOverallStatus(
  value: string,
): AttendanceAutomationAlertOverallStatus | null {
  if (
    value === "HEALTHY" ||
    value === "ATTENTION" ||
    value === "CRITICAL"
  ) {
    return value;
  }

  return null;
}

function parseSeverity(
  value: string,
): AttendanceAutomationAlertSeverity | null {
  if (
    value === "CRITICAL" ||
    value === "WARNING" ||
    value === "INFO"
  ) {
    return value;
  }

  return null;
}

function parseAlertCode(
  value: string,
): AttendanceAutomationAlertCode | null {
  return ALERT_CODE_SET.has(value)
    ? (value as AttendanceAutomationAlertCode)
    : null;
}

function parseAction(
  value:
    | Prisma.JsonValue
    | undefined,
): AttendanceAutomationAlertAction | null {
  if (!isJsonObject(value)) {
    return null;
  }

  const label =
    readString(
      value,
      "label",
    ).trim();

  const href =
    readString(
      value,
      "href",
    ).trim();

  if (!label || !href) {
    return null;
  }

  return {
    label,
    href,
  };
}

function parseAlert(
  value: Prisma.JsonValue,
): AttendanceAutomationAlertSnapshotAlert | null {
  if (!isJsonObject(value)) {
    return null;
  }

  const code =
    parseAlertCode(
      readString(
        value,
        "code",
      ),
    );

  const severity =
    parseSeverity(
      readString(
        value,
        "severity",
      ),
    );

  const title =
    readString(
      value,
      "title",
    ).trim();

  const message =
    readString(
      value,
      "message",
    ).trim();

  if (
    !code ||
    !severity ||
    !title ||
    !message
  ) {
    return null;
  }

  const detailsValue =
    value.details;

  const details =
    Array.isArray(detailsValue)
      ? detailsValue.filter(
          (
            detail,
          ): detail is string =>
            typeof detail ===
            "string",
        )
      : [];

  return {
    code,
    severity,

    title,
    message,

    details,

    action:
      parseAction(
        value.action,
      ),
  };
}

function parseDate(
  value: string,
  fallback: Date,
): Date {
  const parsed =
    new Date(value);

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

function buildSummary(
  object: Prisma.JsonObject,
  alerts:
    AttendanceAutomationAlertSnapshotAlert[],
): AttendanceAutomationAlertSnapshotSummary {
  const summaryValue =
    object.summary;

  if (isJsonObject(summaryValue)) {
    return {
      totalAlerts:
        readNumber(
          summaryValue,
          "totalAlerts",
          alerts.length,
        ),

      criticalAlerts:
        readNumber(
          summaryValue,
          "criticalAlerts",
        ),

      warningAlerts:
        readNumber(
          summaryValue,
          "warningAlerts",
        ),

      informationalAlerts:
        readNumber(
          summaryValue,
          "informationalAlerts",
        ),
    };
  }

  return {
    totalAlerts:
      alerts.length,

    criticalAlerts:
      alerts.filter(
        (alert) =>
          alert.severity ===
          "CRITICAL",
      ).length,

    warningAlerts:
      alerts.filter(
        (alert) =>
          alert.severity ===
          "WARNING",
      ).length,

    informationalAlerts:
      alerts.filter(
        (alert) =>
          alert.severity === "INFO",
      ).length,
  };
}

function mapSnapshot(
  record:
    ActivityLogSnapshotRecord,
): AttendanceAutomationAlertSnapshotRecord | null {
  if (!isJsonObject(record.newValue)) {
    return null;
  }

  const object =
    record.newValue;

  const overallStatus =
    parseOverallStatus(
      readString(
        object,
        "overallStatus",
      ),
    );

  const fingerprint =
    readString(
      object,
      "fingerprint",
    ).trim();

  if (
    !overallStatus ||
    !fingerprint
  ) {
    return null;
  }

  const alertsValue =
    object.alerts;

  const alerts =
    Array.isArray(alertsValue)
      ? alertsValue
          .map(parseAlert)
          .filter(
            (
              alert,
            ): alert is AttendanceAutomationAlertSnapshotAlert =>
              alert !== null,
          )
      : [];

  const evaluatedAtDate =
    parseDate(
      readString(
        object,
        "evaluatedAt",
      ),
      record.createdAt,
    );

  return {
    activityLogId:
      record.activityLogId,

    snapshotKey:
      readString(
        object,
        "snapshotKey",
        record.entityId ??
          `ALERT_SNAPSHOT:${record.activityLogId}`,
      ),

    fingerprint,

    overallStatus,

    summary:
      buildSummary(
        object,
        alerts,
      ),

    alerts,

    evaluatedAt:
      formatDateTime(
        evaluatedAtDate,
      ),

    evaluatedAtIso:
      evaluatedAtDate.toISOString(),

    createdAt:
      formatDateTime(
        record.createdAt,
      ),

    createdAtIso:
      record.createdAt.toISOString(),
  };
}

function createAlertMap(
  alerts:
    AttendanceAutomationAlertSnapshotAlert[],
): Map<
  AttendanceAutomationAlertCode,
  AttendanceAutomationAlertSnapshotAlert
> {
  return new Map(
    alerts.map(
      (alert) => [
        alert.code,
        alert,
      ],
    ),
  );
}

function haveSameAlertContent(
  previousAlert:
    AttendanceAutomationAlertSnapshotAlert,
  currentAlert:
    AttendanceAutomationAlertSnapshotAlert,
): boolean {
  return JSON.stringify({
    title:
      previousAlert.title,

    message:
      previousAlert.message,

    details:
      previousAlert.details,

    action:
      previousAlert.action,
  }) ===
    JSON.stringify({
      title:
        currentAlert.title,

      message:
        currentAlert.message,

      details:
        currentAlert.details,

      action:
        currentAlert.action,
    });
}

function comparisonWeight(
  item:
    AttendanceAutomationAlertSnapshotComparisonItem,
): number {
  switch (item.kind) {
    case "OPENED":
      return 5;

    case "RESOLVED":
      return 4;

    case "SEVERITY_CHANGED":
      return 3;

    case "CONTENT_CHANGED":
      return 2;

    case "UNCHANGED":
      return 1;
  }
}

function buildComparisonItems(input: {
  previousSnapshot:
    AttendanceAutomationAlertSnapshotRecord | null;

  currentSnapshot:
    AttendanceAutomationAlertSnapshotRecord;
}): AttendanceAutomationAlertSnapshotComparisonItem[] {
  const previousAlerts =
    createAlertMap(
      input.previousSnapshot
        ?.alerts ?? [],
    );

  const currentAlerts =
    createAlertMap(
      input.currentSnapshot.alerts,
    );

  const items:
    AttendanceAutomationAlertSnapshotComparisonItem[] =
    [];

  for (
    const [
      code,
      currentAlert,
    ] of currentAlerts
  ) {
    const previousAlert =
      previousAlerts.get(code) ??
      null;

    if (!previousAlert) {
      items.push({
        comparisonKey:
          `${code}:OPENED`,

        kind: "OPENED",

        code,

        title:
          currentAlert.title,

        previousSeverity:
          null,

        currentSeverity:
          currentAlert.severity,

        previousAlert:
          null,

        currentAlert,
      });

      continue;
    }

    if (
      previousAlert.severity !==
      currentAlert.severity
    ) {
      items.push({
        comparisonKey:
          `${code}:SEVERITY_CHANGED`,

        kind:
          "SEVERITY_CHANGED",

        code,

        title:
          currentAlert.title,

        previousSeverity:
          previousAlert.severity,

        currentSeverity:
          currentAlert.severity,

        previousAlert,
        currentAlert,
      });

      continue;
    }

    if (
      !haveSameAlertContent(
        previousAlert,
        currentAlert,
      )
    ) {
      items.push({
        comparisonKey:
          `${code}:CONTENT_CHANGED`,

        kind:
          "CONTENT_CHANGED",

        code,

        title:
          currentAlert.title,

        previousSeverity:
          previousAlert.severity,

        currentSeverity:
          currentAlert.severity,

        previousAlert,
        currentAlert,
      });

      continue;
    }

    items.push({
      comparisonKey:
        `${code}:UNCHANGED`,

      kind:
        "UNCHANGED",

      code,

      title:
        currentAlert.title,

      previousSeverity:
        previousAlert.severity,

      currentSeverity:
        currentAlert.severity,

      previousAlert,
      currentAlert,
    });
  }

  for (
    const [
      code,
      previousAlert,
    ] of previousAlerts
  ) {
    if (currentAlerts.has(code)) {
      continue;
    }

    items.push({
      comparisonKey:
        `${code}:RESOLVED`,

      kind:
        "RESOLVED",

      code,

      title:
        previousAlert.title,

      previousSeverity:
        previousAlert.severity,

      currentSeverity:
        null,

      previousAlert,

      currentAlert:
        null,
    });
  }

  return items.sort(
    (left, right) => {
      const weightDifference =
        comparisonWeight(right) -
        comparisonWeight(left);

      if (weightDifference !== 0) {
        return weightDifference;
      }

      return left.title.localeCompare(
        right.title,
      );
    },
  );
}

function buildNeighbor(
  snapshot:
    AttendanceAutomationAlertSnapshotRecord | null,
): AttendanceAutomationAlertSnapshotNeighbor | null {
  if (!snapshot) {
    return null;
  }

  return {
    activityLogId:
      snapshot.activityLogId,

    overallStatus:
      snapshot.overallStatus,

    evaluatedAt:
      snapshot.evaluatedAt,

    evaluatedAtIso:
      snapshot.evaluatedAtIso,

    totalAlerts:
      snapshot.summary.totalAlerts,
  };
}

export function parseAttendanceAutomationAlertSnapshotActivityLogId(
  value: string,
): number | null {
  const parsed =
    Number(value);

  if (
    !Number.isSafeInteger(parsed) ||
    parsed < 1
  ) {
    return null;
  }

  return parsed;
}

export async function getAttendanceAutomationAlertSnapshotDetailData(
  activityLogId: number,
): Promise<AttendanceAutomationAlertSnapshotDetailData | null> {
  const generatedAt =
    new Date();

  const currentRecord =
    await prisma.activityLog.findFirst({
      where: {
        activityLogId,

        action:
          ATTENDANCE_AUTOMATION_ALERT_SNAPSHOT_ACTION,

        entityType:
          ATTENDANCE_AUTOMATION_ALERT_SNAPSHOT_ENTITY_TYPE,
      },

      select: {
        activityLogId: true,
        entityId: true,
        newValue: true,
        createdAt: true,
      },
    });

  if (!currentRecord) {
    return null;
  }

  const currentSnapshot =
    mapSnapshot(
      currentRecord,
    );

  if (!currentSnapshot) {
    return null;
  }

  const [
    previousRecord,
    nextRecord,
  ] = await Promise.all([
    prisma.activityLog.findFirst({
      where: {
        action:
          ATTENDANCE_AUTOMATION_ALERT_SNAPSHOT_ACTION,

        entityType:
          ATTENDANCE_AUTOMATION_ALERT_SNAPSHOT_ENTITY_TYPE,

        OR: [
          {
            createdAt: {
              lt:
                currentRecord.createdAt,
            },
          },
          {
            createdAt:
              currentRecord.createdAt,

            activityLogId: {
              lt:
                currentRecord.activityLogId,
            },
          },
        ],
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
    }),

    prisma.activityLog.findFirst({
      where: {
        action:
          ATTENDANCE_AUTOMATION_ALERT_SNAPSHOT_ACTION,

        entityType:
          ATTENDANCE_AUTOMATION_ALERT_SNAPSHOT_ENTITY_TYPE,

        OR: [
          {
            createdAt: {
              gt:
                currentRecord.createdAt,
            },
          },
          {
            createdAt:
              currentRecord.createdAt,

            activityLogId: {
              gt:
                currentRecord.activityLogId,
            },
          },
        ],
      },

      select: {
        activityLogId: true,
        entityId: true,
        newValue: true,
        createdAt: true,
      },

      orderBy: [
        {
          createdAt: "asc",
        },
        {
          activityLogId: "asc",
        },
      ],
    }),
  ]);

  const previousSnapshot =
    previousRecord
      ? mapSnapshot(
          previousRecord,
        )
      : null;

  const nextSnapshot =
    nextRecord
      ? mapSnapshot(
          nextRecord,
        )
      : null;

  const comparisonItems =
    buildComparisonItems({
      previousSnapshot,

      currentSnapshot,
    });

  const changedItems =
    comparisonItems.filter(
      (item) =>
        item.kind !==
        "UNCHANGED",
    );

  return {
    generatedAt:
      formatDateTime(
        generatedAt,
      ),

    generatedAtIso:
      generatedAt.toISOString(),

    snapshot:
      currentSnapshot,

    previousSnapshot:
      buildNeighbor(
        previousSnapshot,
      ),

    nextSnapshot:
      buildNeighbor(
        nextSnapshot,
      ),

    comparison: {
      hasPreviousSnapshot:
        previousSnapshot !==
        null,

      totalChanges:
        changedItems.length,

      openedAlerts:
        comparisonItems.filter(
          (item) =>
            item.kind ===
            "OPENED",
        ).length,

      resolvedAlerts:
        comparisonItems.filter(
          (item) =>
            item.kind ===
            "RESOLVED",
        ).length,

      severityChangedAlerts:
        comparisonItems.filter(
          (item) =>
            item.kind ===
            "SEVERITY_CHANGED",
        ).length,

      contentChangedAlerts:
        comparisonItems.filter(
          (item) =>
            item.kind ===
            "CONTENT_CHANGED",
        ).length,

      unchangedAlerts:
        comparisonItems.filter(
          (item) =>
            item.kind ===
            "UNCHANGED",
        ).length,

      items:
        comparisonItems,
    },
  };
}