import type {
  Prisma,
} from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import { ATTENDANCE_AUTOMATION_ALERT_CODES } from "../../types/attendance-automation-alert-filter-types";
import type {
  AttendanceAutomationAlertAction,
  AttendanceAutomationAlertCode,
  AttendanceAutomationAlertOverallStatus,
  AttendanceAutomationAlertSeverity,
} from "../../types/attendance-automation-alert-types";
import {
  ATTENDANCE_AUTOMATION_ALERT_SNAPSHOT_ACTION,
  ATTENDANCE_AUTOMATION_ALERT_SNAPSHOT_ENTITY_TYPE,
  type AttendanceAutomationAlertIncidentData,
  type AttendanceAutomationAlertIncidentTransition,
  type AttendanceAutomationAlertSnapshotAlert,
  type AttendanceAutomationAlertSnapshotRecord,
  type AttendanceAutomationAlertSnapshotSummary,
} from "../types/attendance-automation-alert-incident-types";

const MONITORING_WINDOW_DAYS = 90;

const MAXIMUM_SNAPSHOTS = 300;
const SNAPSHOT_STALE_HOURS = 26;

const MILLISECONDS_PER_HOUR =
  60 * 60 * 1000;

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
          alert.severity ===
          "INFO",
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
  snapshot:
    AttendanceAutomationAlertSnapshotRecord,
): Map<
  AttendanceAutomationAlertCode,
  AttendanceAutomationAlertSnapshotAlert
> {
  return new Map(
    snapshot.alerts.map(
      (alert) => [
        alert.code,
        alert,
      ],
    ),
  );
}

function buildTransitions(
  snapshots:
    AttendanceAutomationAlertSnapshotRecord[],
): AttendanceAutomationAlertIncidentTransition[] {
  const chronological =
    [...snapshots].reverse();

  const transitions:
    AttendanceAutomationAlertIncidentTransition[] =
    [];

  let previousSnapshot:
    AttendanceAutomationAlertSnapshotRecord | null =
    null;

  for (
    const currentSnapshot of
    chronological
  ) {
    const previousAlerts =
      previousSnapshot
        ? createAlertMap(
            previousSnapshot,
          )
        : new Map<
            AttendanceAutomationAlertCode,
            AttendanceAutomationAlertSnapshotAlert
          >();

    const currentAlerts =
      createAlertMap(
        currentSnapshot,
      );

    for (
      const [
        code,
        currentAlert,
      ] of currentAlerts
    ) {
      const previousAlert =
        previousAlerts.get(code);

      if (!previousAlert) {
        transitions.push({
          transitionKey:
            `${currentSnapshot.activityLogId}:${code}:OPENED`,

          kind:
            "ALERT_OPENED",

          snapshotActivityLogId:
            currentSnapshot.activityLogId,

          alertCode:
            code,

          alertTitle:
            currentAlert.title,

          previousSeverity:
            null,

          currentSeverity:
            currentAlert.severity,

          previousOverallStatus:
            previousSnapshot
              ?.overallStatus ?? null,

          currentOverallStatus:
            currentSnapshot.overallStatus,

          occurredAt:
            currentSnapshot.evaluatedAt,

          occurredAtIso:
            currentSnapshot.evaluatedAtIso,
        });

        continue;
      }

      if (
        previousAlert.severity !==
        currentAlert.severity
      ) {
        transitions.push({
          transitionKey:
            `${currentSnapshot.activityLogId}:${code}:SEVERITY`,

          kind:
            "SEVERITY_CHANGED",

          snapshotActivityLogId:
            currentSnapshot.activityLogId,

          alertCode:
            code,

          alertTitle:
            currentAlert.title,

          previousSeverity:
            previousAlert.severity,

          currentSeverity:
            currentAlert.severity,

          previousOverallStatus:
            previousSnapshot
              ?.overallStatus ?? null,

          currentOverallStatus:
            currentSnapshot.overallStatus,

          occurredAt:
            currentSnapshot.evaluatedAt,

          occurredAtIso:
            currentSnapshot.evaluatedAtIso,
        });
      }
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

      transitions.push({
        transitionKey:
          `${currentSnapshot.activityLogId}:${code}:RESOLVED`,

        kind:
          "ALERT_RESOLVED",

        snapshotActivityLogId:
          currentSnapshot.activityLogId,

        alertCode:
          code,

        alertTitle:
          previousAlert.title,

        previousSeverity:
          previousAlert.severity,

        currentSeverity:
          null,

        previousOverallStatus:
          previousSnapshot
            ?.overallStatus ?? null,

        currentOverallStatus:
          currentSnapshot.overallStatus,

        occurredAt:
          currentSnapshot.evaluatedAt,

        occurredAtIso:
          currentSnapshot.evaluatedAtIso,
      });
    }

    if (
      previousSnapshot &&
      previousSnapshot.overallStatus !==
        currentSnapshot.overallStatus
    ) {
      transitions.push({
        transitionKey:
          `${currentSnapshot.activityLogId}:OVERALL_STATUS`,

        kind:
          "OVERALL_STATUS_CHANGED",

        snapshotActivityLogId:
          currentSnapshot.activityLogId,

        alertCode:
          null,

        alertTitle:
          "Automation alert center status changed",

        previousSeverity:
          null,

        currentSeverity:
          null,

        previousOverallStatus:
          previousSnapshot.overallStatus,

        currentOverallStatus:
          currentSnapshot.overallStatus,

        occurredAt:
          currentSnapshot.evaluatedAt,

        occurredAtIso:
          currentSnapshot.evaluatedAtIso,
      });
    }

    previousSnapshot =
      currentSnapshot;
  }

  return transitions.sort(
    (left, right) =>
      new Date(
        right.occurredAtIso,
      ).getTime() -
      new Date(
        left.occurredAtIso,
      ).getTime(),
  );
}

export async function getAttendanceAutomationAlertIncidentData(): Promise<AttendanceAutomationAlertIncidentData> {
  const generatedAt =
    new Date();

  const monitoringStart =
    new Date(
      generatedAt.getTime() -
        MONITORING_WINDOW_DAYS *
          24 *
          MILLISECONDS_PER_HOUR,
    );

  const records =
    await prisma.activityLog.findMany({
      where: {
        action:
          ATTENDANCE_AUTOMATION_ALERT_SNAPSHOT_ACTION,

        entityType:
          ATTENDANCE_AUTOMATION_ALERT_SNAPSHOT_ENTITY_TYPE,

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
        MAXIMUM_SNAPSHOTS,
    });

  const snapshots =
    records
      .map(mapSnapshot)
      .filter(
        (
          snapshot,
        ): snapshot is AttendanceAutomationAlertSnapshotRecord =>
          snapshot !== null,
      );

  const latestSnapshot =
    snapshots[0] ?? null;

  const transitions =
    buildTransitions(
      snapshots,
    );

  const snapshotAgeHours =
    latestSnapshot
      ? Number(
          (
            (
              generatedAt.getTime() -
              new Date(
                latestSnapshot.evaluatedAtIso,
              ).getTime()
            ) /
            MILLISECONDS_PER_HOUR
          ).toFixed(2),
        )
      : null;

  return {
    generatedAt:
      formatDateTime(
        generatedAt,
      ),

    generatedAtIso:
      generatedAt.toISOString(),

    monitoringWindowDays:
      MONITORING_WINDOW_DAYS,

    latestSnapshot,

    summary: {
      totalSnapshots:
        snapshots.length,

      currentAlertCount:
        latestSnapshot
          ?.summary.totalAlerts ?? 0,

      currentCriticalAlerts:
        latestSnapshot
          ?.summary.criticalAlerts ?? 0,

      currentWarningAlerts:
        latestSnapshot
          ?.summary.warningAlerts ?? 0,

      currentInformationalAlerts:
        latestSnapshot
          ?.summary
          .informationalAlerts ?? 0,

      openedTransitions:
        transitions.filter(
          (transition) =>
            transition.kind ===
            "ALERT_OPENED",
        ).length,

      resolvedTransitions:
        transitions.filter(
          (transition) =>
            transition.kind ===
            "ALERT_RESOLVED",
        ).length,

      severityChangedTransitions:
        transitions.filter(
          (transition) =>
            transition.kind ===
            "SEVERITY_CHANGED",
        ).length,

      overallStatusChangedTransitions:
        transitions.filter(
          (transition) =>
            transition.kind ===
            "OVERALL_STATUS_CHANGED",
        ).length,

      snapshotAgeHours,

      snapshotStale:
        snapshotAgeHours === null ||
        snapshotAgeHours >
          SNAPSHOT_STALE_HOURS,
    },

    currentAlerts:
      latestSnapshot?.alerts ?? [],

    transitions,

    recentSnapshots:
      snapshots,
  };
}