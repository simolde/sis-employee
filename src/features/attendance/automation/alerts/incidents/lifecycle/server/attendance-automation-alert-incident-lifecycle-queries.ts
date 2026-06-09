import { getAttendanceAutomationAlertIncidentData } from "../../server/attendance-automation-alert-incident-queries";
import type {
  AttendanceAutomationAlertSnapshotAlert,
  AttendanceAutomationAlertSnapshotRecord,
} from "../../types/attendance-automation-alert-incident-types";
import type {
  AttendanceAutomationAlertCode,
  AttendanceAutomationAlertSeverity,
} from "../../../types/attendance-automation-alert-types";
import type {
  AttendanceAutomationAlertIncidentLifecycleCodeSummary,
  AttendanceAutomationAlertIncidentLifecycleData,
  AttendanceAutomationAlertIncidentLifecycleOverallStatus,
  AttendanceAutomationAlertIncidentLifecycleRecord,
} from "../types/attendance-automation-alert-incident-lifecycle-types";

const MILLISECONDS_PER_HOUR =
  60 * 60 * 1000;

const MAXIMUM_RESOLVED_INCIDENTS = 100;

type ActiveIncident = {
  incidentKey: string;

  alertCode:
    AttendanceAutomationAlertCode;

  title: string;

  openingSeverity:
    AttendanceAutomationAlertSeverity;

  currentSeverity:
    AttendanceAutomationAlertSeverity;

  peakSeverity:
    AttendanceAutomationAlertSeverity;

  openedAt: Date;
  lastObservedAt: Date;

  openedSnapshotActivityLogId: number;

  lastObservedSnapshotActivityLogId: number;

  observationCount: number;
  severityChangeCount: number;
};

function severityWeight(
  severity:
    AttendanceAutomationAlertSeverity,
): number {
  switch (severity) {
    case "CRITICAL":
      return 3;

    case "WARNING":
      return 2;

    case "INFO":
      return 1;
  }
}

function getPeakSeverity(
  left:
    AttendanceAutomationAlertSeverity,

  right:
    AttendanceAutomationAlertSeverity,
): AttendanceAutomationAlertSeverity {
  return severityWeight(left) >=
    severityWeight(right)
    ? left
    : right;
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

function calculateDurationHours(
  startedAt: Date,
  endedAt: Date,
): number {
  const duration =
    Math.max(
      0,
      endedAt.getTime() -
        startedAt.getTime(),
    );

  return Number(
    (
      duration /
      MILLISECONDS_PER_HOUR
    ).toFixed(2),
  );
}

function formatDuration(
  durationHours: number,
): string {
  if (durationHours < 1) {
    const minutes =
      Math.max(
        0,
        Math.round(
          durationHours * 60,
        ),
      );

    return `${minutes} min`;
  }

  if (durationHours < 24) {
    return `${durationHours.toFixed(2)} hr`;
  }

  const days =
    Math.floor(
      durationHours / 24,
    );

  const remainingHours =
    Number(
      (
        durationHours -
        days * 24
      ).toFixed(2),
    );

  if (remainingHours <= 0) {
    return `${days} day${days === 1 ? "" : "s"}`;
  }

  return [
    `${days} day${days === 1 ? "" : "s"}`,
    `${remainingHours} hr`,
  ].join(" ");
}

function createIncidentKey(input: {
  alertCode:
    AttendanceAutomationAlertCode;

  snapshotActivityLogId: number;
}): string {
  return [
    input.alertCode,
    input.snapshotActivityLogId,
  ].join(":");
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

function createActiveIncident(input: {
  alert:
    AttendanceAutomationAlertSnapshotAlert;

  snapshot:
    AttendanceAutomationAlertSnapshotRecord;
}): ActiveIncident {
  const observedAt =
    new Date(
      input.snapshot.evaluatedAtIso,
    );

  return {
    incidentKey:
      createIncidentKey({
        alertCode:
          input.alert.code,

        snapshotActivityLogId:
          input.snapshot.activityLogId,
      }),

    alertCode:
      input.alert.code,

    title:
      input.alert.title,

    openingSeverity:
      input.alert.severity,

    currentSeverity:
      input.alert.severity,

    peakSeverity:
      input.alert.severity,

    openedAt:
      observedAt,

    lastObservedAt:
      observedAt,

    openedSnapshotActivityLogId:
      input.snapshot.activityLogId,

    lastObservedSnapshotActivityLogId:
      input.snapshot.activityLogId,

    observationCount: 1,
    severityChangeCount: 0,
  };
}

function updateActiveIncident(input: {
  activeIncident:
    ActiveIncident;

  alert:
    AttendanceAutomationAlertSnapshotAlert;

  snapshot:
    AttendanceAutomationAlertSnapshotRecord;
}): void {
  const previousSeverity =
    input.activeIncident
      .currentSeverity;

  if (
    previousSeverity !==
    input.alert.severity
  ) {
    input.activeIncident
      .severityChangeCount += 1;
  }

  input.activeIncident.title =
    input.alert.title;

  input.activeIncident.currentSeverity =
    input.alert.severity;

  input.activeIncident.peakSeverity =
    getPeakSeverity(
      input.activeIncident
        .peakSeverity,

      input.alert.severity,
    );

  input.activeIncident.lastObservedAt =
    new Date(
      input.snapshot.evaluatedAtIso,
    );

  input.activeIncident
    .lastObservedSnapshotActivityLogId =
    input.snapshot.activityLogId;

  input.activeIncident
    .observationCount += 1;
}

function buildResolvedIncident(input: {
  activeIncident:
    ActiveIncident;

  resolvedAt: Date;

  resolvedSnapshotActivityLogId: number;
}): AttendanceAutomationAlertIncidentLifecycleRecord {
  const durationHours =
    calculateDurationHours(
      input.activeIncident.openedAt,
      input.resolvedAt,
    );

  return {
    incidentKey:
      input.activeIncident
        .incidentKey,

    alertCode:
      input.activeIncident
        .alertCode,

    title:
      input.activeIncident.title,

    status: "RESOLVED",

    openingSeverity:
      input.activeIncident
        .openingSeverity,

    currentSeverity:
      input.activeIncident
        .currentSeverity,

    peakSeverity:
      input.activeIncident
        .peakSeverity,

    openedAt:
      formatDateTime(
        input.activeIncident
          .openedAt,
      ),

    openedAtIso:
      input.activeIncident
        .openedAt
        .toISOString(),

    lastObservedAt:
      formatDateTime(
        input.activeIncident
          .lastObservedAt,
      ),

    lastObservedAtIso:
      input.activeIncident
        .lastObservedAt
        .toISOString(),

    resolvedAt:
      formatDateTime(
        input.resolvedAt,
      ),

    resolvedAtIso:
      input.resolvedAt
        .toISOString(),

    openedSnapshotActivityLogId:
      input.activeIncident
        .openedSnapshotActivityLogId,

    lastObservedSnapshotActivityLogId:
      input.activeIncident
        .lastObservedSnapshotActivityLogId,

    resolvedSnapshotActivityLogId:
      input.resolvedSnapshotActivityLogId,

    durationHours,

    durationLabel:
      formatDuration(
        durationHours,
      ),

    observationCount:
      input.activeIncident
        .observationCount,

    severityChangeCount:
      input.activeIncident
        .severityChangeCount,
  };
}

function buildOpenIncident(input: {
  activeIncident:
    ActiveIncident;

  generatedAt: Date;
}): AttendanceAutomationAlertIncidentLifecycleRecord {
  const durationHours =
    calculateDurationHours(
      input.activeIncident.openedAt,
      input.generatedAt,
    );

  return {
    incidentKey:
      input.activeIncident
        .incidentKey,

    alertCode:
      input.activeIncident
        .alertCode,

    title:
      input.activeIncident.title,

    status: "OPEN",

    openingSeverity:
      input.activeIncident
        .openingSeverity,

    currentSeverity:
      input.activeIncident
        .currentSeverity,

    peakSeverity:
      input.activeIncident
        .peakSeverity,

    openedAt:
      formatDateTime(
        input.activeIncident
          .openedAt,
      ),

    openedAtIso:
      input.activeIncident
        .openedAt
        .toISOString(),

    lastObservedAt:
      formatDateTime(
        input.activeIncident
          .lastObservedAt,
      ),

    lastObservedAtIso:
      input.activeIncident
        .lastObservedAt
        .toISOString(),

    resolvedAt: null,
    resolvedAtIso: null,

    openedSnapshotActivityLogId:
      input.activeIncident
        .openedSnapshotActivityLogId,

    lastObservedSnapshotActivityLogId:
      input.activeIncident
        .lastObservedSnapshotActivityLogId,

    resolvedSnapshotActivityLogId:
      null,

    durationHours,

    durationLabel:
      formatDuration(
        durationHours,
      ),

    observationCount:
      input.activeIncident
        .observationCount,

    severityChangeCount:
      input.activeIncident
        .severityChangeCount,
  };
}

function calculateAverage(
  values: number[],
): number | null {
  if (values.length === 0) {
    return null;
  }

  return Number(
    (
      values.reduce(
        (total, value) =>
          total + value,
        0,
      ) /
      values.length
    ).toFixed(2),
  );
}

function calculateMedian(
  values: number[],
): number | null {
  if (values.length === 0) {
    return null;
  }

  const sorted =
    [...values].sort(
      (left, right) =>
        left - right,
    );

  const middleIndex =
    Math.floor(
      sorted.length / 2,
    );

  if (
    sorted.length % 2 === 1
  ) {
    return Number(
      sorted[
        middleIndex
      ].toFixed(2),
    );
  }

  const leftValue =
    sorted[middleIndex - 1];

  const rightValue =
    sorted[middleIndex];

  return Number(
    (
      (
        leftValue +
        rightValue
      ) /
      2
    ).toFixed(2),
  );
}

function maximumOrNull(
  values: number[],
): number | null {
  if (values.length === 0) {
    return null;
  }

  return Math.max(...values);
}

function buildCodeSummaries(
  incidents:
    AttendanceAutomationAlertIncidentLifecycleRecord[],
): AttendanceAutomationAlertIncidentLifecycleCodeSummary[] {
  const incidentsByCode =
    new Map<
      AttendanceAutomationAlertCode,
      AttendanceAutomationAlertIncidentLifecycleRecord[]
    >();

  for (const incident of incidents) {
    const existing =
      incidentsByCode.get(
        incident.alertCode,
      ) ?? [];

    existing.push(incident);

    incidentsByCode.set(
      incident.alertCode,
      existing,
    );
  }

  return Array.from(
    incidentsByCode.entries(),
  )
    .map(
      (
        [
          alertCode,
          codeIncidents,
        ],
      ): AttendanceAutomationAlertIncidentLifecycleCodeSummary => {
        const sortedIncidents =
          [...codeIncidents].sort(
            (left, right) =>
              new Date(
                right.openedAtIso,
              ).getTime() -
              new Date(
                left.openedAtIso,
              ).getTime(),
          );

        const latestIncident =
          sortedIncidents[0];

        const resolvedDurations =
          codeIncidents
            .filter(
              (incident) =>
                incident.status ===
                "RESOLVED",
            )
            .map(
              (incident) =>
                incident.durationHours,
            );

        const openIncident =
          sortedIncidents.find(
            (incident) =>
              incident.status ===
              "OPEN",
          ) ?? null;

        return {
          alertCode,

          title:
            latestIncident.title,

          incidentCount:
            codeIncidents.length,

          openIncidentCount:
            codeIncidents.filter(
              (incident) =>
                incident.status ===
                "OPEN",
            ).length,

          resolvedIncidentCount:
            codeIncidents.filter(
              (incident) =>
                incident.status ===
                "RESOLVED",
            ).length,

          criticalIncidentCount:
            codeIncidents.filter(
              (incident) =>
                incident.peakSeverity ===
                "CRITICAL",
            ).length,

          warningIncidentCount:
            codeIncidents.filter(
              (incident) =>
                incident.peakSeverity ===
                "WARNING",
            ).length,

          informationalIncidentCount:
            codeIncidents.filter(
              (incident) =>
                incident.peakSeverity ===
                "INFO",
            ).length,

          averageResolutionHours:
            calculateAverage(
              resolvedDurations,
            ),

          longestResolutionHours:
            maximumOrNull(
              resolvedDurations,
            ),

          currentOpenDurationHours:
            openIncident
              ?.durationHours ?? null,

          latestStatus:
            latestIncident.status,

          latestOpenedAt:
            latestIncident.openedAt,

          latestOpenedAtIso:
            latestIncident.openedAtIso,
        };
      },
    )
    .sort(
      (left, right) => {
        const openDifference =
          right.openIncidentCount -
          left.openIncidentCount;

        if (openDifference !== 0) {
          return openDifference;
        }

        return (
          right.incidentCount -
          left.incidentCount
        );
      },
    );
}

function getOverallStatus(input: {
  snapshotCount: number;

  criticalOpenIncidents: number;
  warningOpenIncidents: number;
  informationalOpenIncidents: number;
}): AttendanceAutomationAlertIncidentLifecycleOverallStatus {
  if (input.snapshotCount === 0) {
    return "NO_DATA";
  }

  if (
    input.criticalOpenIncidents >
    0
  ) {
    return "CRITICAL";
  }

  if (
    input.warningOpenIncidents >
      0 ||
    input.informationalOpenIncidents >
      0
  ) {
    return "ATTENTION";
  }

  return "HEALTHY";
}

function getOverallCopy(
  status:
    AttendanceAutomationAlertIncidentLifecycleOverallStatus,
): {
  label: string;
  description: string;
} {
  switch (status) {
    case "CRITICAL":
      return {
        label:
          "Critical Automation Incidents Are Open",

        description:
          "One or more critical automation-alert incidents remain unresolved and require immediate review.",
      };

    case "ATTENTION":
      return {
        label:
          "Automation Incidents Require Review",

        description:
          "There are unresolved warning or informational automation-alert incidents.",
      };

    case "HEALTHY":
      return {
        label:
          "No Automation Incidents Are Open",

        description:
          "All incidents detected in the available alert-snapshot history have been resolved.",
      };

    case "NO_DATA":
      return {
        label:
          "No Incident Lifecycle Data",

        description:
          "No immutable automation-alert snapshots are available for lifecycle analysis.",
      };
  }
}

export async function getAttendanceAutomationAlertIncidentLifecycleData(): Promise<AttendanceAutomationAlertIncidentLifecycleData> {
  const generatedAt =
    new Date();

  const incidentData =
    await getAttendanceAutomationAlertIncidentData();

  const chronologicalSnapshots =
    [
      ...incidentData
        .recentSnapshots,
    ].sort(
      (left, right) => {
        const timeDifference =
          new Date(
            left.evaluatedAtIso,
          ).getTime() -
          new Date(
            right.evaluatedAtIso,
          ).getTime();

        if (timeDifference !== 0) {
          return timeDifference;
        }

        return (
          left.activityLogId -
          right.activityLogId
        );
      },
    );

  const activeIncidents =
    new Map<
      AttendanceAutomationAlertCode,
      ActiveIncident
    >();

  const resolvedIncidents:
    AttendanceAutomationAlertIncidentLifecycleRecord[] =
    [];

  for (
    const snapshot of
    chronologicalSnapshots
  ) {
    const snapshotAlerts =
      createAlertMap(
        snapshot.alerts,
      );

    for (
      const [
        alertCode,
        alert,
      ] of snapshotAlerts
    ) {
      const activeIncident =
        activeIncidents.get(
          alertCode,
        );

      if (!activeIncident) {
        activeIncidents.set(
          alertCode,
          createActiveIncident({
            alert,
            snapshot,
          }),
        );

        continue;
      }

      updateActiveIncident({
        activeIncident,
        alert,
        snapshot,
      });
    }

    for (
      const [
        alertCode,
        activeIncident,
      ] of activeIncidents
    ) {
      if (
        snapshotAlerts.has(
          alertCode,
        )
      ) {
        continue;
      }

      resolvedIncidents.push(
        buildResolvedIncident({
          activeIncident,

          resolvedAt:
            new Date(
              snapshot.evaluatedAtIso,
            ),

          resolvedSnapshotActivityLogId:
            snapshot.activityLogId,
        }),
      );

      activeIncidents.delete(
        alertCode,
      );
    }
  }

  const openIncidents =
    Array.from(
      activeIncidents.values(),
    )
      .map(
        (activeIncident) =>
          buildOpenIncident({
            activeIncident,
            generatedAt,
          }),
      )
      .sort(
        (left, right) => {
          const severityDifference =
            severityWeight(
              right.currentSeverity,
            ) -
            severityWeight(
              left.currentSeverity,
            );

          if (
            severityDifference !== 0
          ) {
            return severityDifference;
          }

          return (
            right.durationHours -
            left.durationHours
          );
        },
      );

  const sortedResolvedIncidents =
    [...resolvedIncidents].sort(
      (left, right) =>
        new Date(
          right.resolvedAtIso ?? 0,
        ).getTime() -
        new Date(
          left.resolvedAtIso ?? 0,
        ).getTime(),
    );

  const allIncidents = [
    ...openIncidents,
    ...resolvedIncidents,
  ];

  const resolutionDurations =
    resolvedIncidents.map(
      (incident) =>
        incident.durationHours,
    );

  const openDurations =
    openIncidents.map(
      (incident) =>
        incident.durationHours,
    );

  const criticalOpenIncidents =
    openIncidents.filter(
      (incident) =>
        incident.currentSeverity ===
        "CRITICAL",
    ).length;

  const warningOpenIncidents =
    openIncidents.filter(
      (incident) =>
        incident.currentSeverity ===
        "WARNING",
    ).length;

  const informationalOpenIncidents =
    openIncidents.filter(
      (incident) =>
        incident.currentSeverity ===
        "INFO",
    ).length;

  const overallStatus =
    getOverallStatus({
      snapshotCount:
        chronologicalSnapshots.length,

      criticalOpenIncidents,
      warningOpenIncidents,
      informationalOpenIncidents,
    });

  const overallCopy =
    getOverallCopy(
      overallStatus,
    );

  const firstSnapshot =
    chronologicalSnapshots[0] ??
    null;

  const latestSnapshot =
    chronologicalSnapshots.at(-1) ??
    null;

  return {
    overallStatus,

    overallLabel:
      overallCopy.label,

    overallDescription:
      overallCopy.description,

    generatedAt:
      formatDateTime(
        generatedAt,
      ),

    generatedAtIso:
      generatedAt.toISOString(),

    monitoringWindowDays:
      incidentData.monitoringWindowDays,

    summary: {
      totalIncidents:
        allIncidents.length,

      openIncidents:
        openIncidents.length,

      resolvedIncidents:
        resolvedIncidents.length,

      criticalOpenIncidents,
      warningOpenIncidents,
      informationalOpenIncidents,

      averageResolutionHours:
        calculateAverage(
          resolutionDurations,
        ),

      medianResolutionHours:
        calculateMedian(
          resolutionDurations,
        ),

      longestResolvedHours:
        maximumOrNull(
          resolutionDurations,
        ),

      longestOpenHours:
        maximumOrNull(
          openDurations,
        ),

      totalSeverityChanges:
        allIncidents.reduce(
          (
            total,
            incident,
          ) =>
            total +
            incident
              .severityChangeCount,
          0,
        ),
    },

    openIncidents,

    recentResolvedIncidents:
      sortedResolvedIncidents.slice(
        0,
        MAXIMUM_RESOLVED_INCIDENTS,
      ),

    incidentsByCode:
      buildCodeSummaries(
        allIncidents,
      ),

    metadata: {
      source:
        "ALERT_SNAPSHOT_ACTIVITY_LOGS",

      snapshotCount:
        chronologicalSnapshots.length,

      firstSnapshotAt:
        firstSnapshot
          ?.evaluatedAt ?? null,

      firstSnapshotAtIso:
        firstSnapshot
          ?.evaluatedAtIso ?? null,

      latestSnapshotAt:
        latestSnapshot
          ?.evaluatedAt ?? null,

      latestSnapshotAtIso:
        latestSnapshot
          ?.evaluatedAtIso ?? null,

      windowBounded:
        chronologicalSnapshots.length >
        0,
    },
  };
}