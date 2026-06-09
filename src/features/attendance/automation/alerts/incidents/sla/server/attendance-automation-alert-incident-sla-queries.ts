import { getAttendanceAutomationAlertIncidentLifecycleData } from "../../lifecycle/server/attendance-automation-alert-incident-lifecycle-queries";
import type {
  AttendanceAutomationAlertIncidentLifecycleRecord,
} from "../../lifecycle/types/attendance-automation-alert-incident-lifecycle-types";
import type {
  AttendanceAutomationAlertSeverity,
} from "../../../types/attendance-automation-alert-types";
import { getAttendanceAutomationAlertIncidentSlaConfiguration } from "./attendance-automation-alert-incident-sla-config";
import type {
  AttendanceAutomationAlertIncidentSlaData,
  AttendanceAutomationAlertIncidentSlaOverallStatus,
  AttendanceAutomationAlertIncidentSlaRecord,
  AttendanceAutomationAlertIncidentSlaState,
  AttendanceAutomationAlertIncidentSlaThreshold,
} from "../types/attendance-automation-alert-incident-sla-types";

const MILLISECONDS_PER_HOUR =
  60 * 60 * 1000;

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

function formatDurationHours(
  hours: number,
): string {
  const safeHours =
    Math.max(
      0,
      hours,
    );

  if (safeHours < 1) {
    return `${Math.round(safeHours * 60)} min`;
  }

  if (safeHours < 24) {
    return `${safeHours.toFixed(2)} hr`;
  }

  const days =
    Math.floor(
      safeHours / 24,
    );

  const remainingHours =
    Number(
      (
        safeHours -
        days * 24
      ).toFixed(2),
    );

  if (remainingHours <= 0) {
    return `${days} day${days === 1 ? "" : "s"}`;
  }

  return `${days} day${days === 1 ? "" : "s"} ${remainingHours} hr`;
}

function thresholdForSeverity(
  severity:
    AttendanceAutomationAlertSeverity,

  configuration:
    ReturnType<
      typeof getAttendanceAutomationAlertIncidentSlaConfiguration
    >,
): AttendanceAutomationAlertIncidentSlaThreshold {
  switch (severity) {
    case "CRITICAL":
      return configuration.critical;

    case "WARNING":
      return configuration.warning;

    case "INFO":
      return configuration.informational;
  }
}

function classifySlaState(input: {
  elapsedHours: number;

  targetHours: number;

  warningPercent: number;
}): AttendanceAutomationAlertIncidentSlaState {
  if (
    input.elapsedHours >=
    input.targetHours
  ) {
    return "BREACHED";
  }

  const warningThresholdHours =
    input.targetHours *
    (
      input.warningPercent /
      100
    );

  if (
    input.elapsedHours >=
    warningThresholdHours
  ) {
    return "AT_RISK";
  }

  return "WITHIN_TARGET";
}

function mapIncident(input: {
  incident:
    AttendanceAutomationAlertIncidentLifecycleRecord;

  generatedAt: Date;

  warningPercent: number;

  configuration:
    ReturnType<
      typeof getAttendanceAutomationAlertIncidentSlaConfiguration
    >;
}): AttendanceAutomationAlertIncidentSlaRecord {
  const threshold =
    thresholdForSeverity(
      input.incident
        .currentSeverity,

      input.configuration,
    );

  const openedAt =
    new Date(
      input.incident.openedAtIso,
    );

  const deadlineAt =
    new Date(
      openedAt.getTime() +
        threshold.targetHours *
          MILLISECONDS_PER_HOUR,
    );

  const elapsedHours =
    Number(
      Math.max(
        0,
        (
          input.generatedAt.getTime() -
          openedAt.getTime()
        ) /
          MILLISECONDS_PER_HOUR,
      ).toFixed(2),
    );

  const slaState =
    classifySlaState({
      elapsedHours,

      targetHours:
        threshold.targetHours,

      warningPercent:
        input.warningPercent,
    });

  const remainingHours =
    slaState === "BREACHED"
      ? null
      : Number(
          Math.max(
            0,
            threshold.targetHours -
              elapsedHours,
          ).toFixed(2),
        );

  const overdueHours =
    slaState === "BREACHED"
      ? Number(
          Math.max(
            0,
            elapsedHours -
              threshold.targetHours,
          ).toFixed(2),
        )
      : null;

  const progressPercent =
    Number(
      Math.min(
        100,
        (
          elapsedHours /
          threshold.targetHours
        ) *
          100,
      ).toFixed(2),
    );

  return {
    incidentKey:
      input.incident.incidentKey,

    alertCode:
      input.incident.alertCode,

    title:
      input.incident.title,

    severity:
      input.incident.currentSeverity,

    peakSeverity:
      input.incident.peakSeverity,

    slaState,

    targetHours:
      threshold.targetHours,

    elapsedHours,

    elapsedLabel:
      formatDurationHours(
        elapsedHours,
      ),

    progressPercent,

    remainingHours,

    remainingLabel:
      remainingHours !== null
        ? formatDurationHours(
            remainingHours,
          )
        : null,

    overdueHours,

    overdueLabel:
      overdueHours !== null
        ? formatDurationHours(
            overdueHours,
          )
        : null,

    openedAt:
      input.incident.openedAt,

    openedAtIso:
      input.incident.openedAtIso,

    deadlineAt:
      formatDateTime(
        deadlineAt,
      ),

    deadlineAtIso:
      deadlineAt.toISOString(),

    lastObservedAt:
      input.incident.lastObservedAt,

    lastObservedAtIso:
      input.incident.lastObservedAtIso,

    openedSnapshotActivityLogId:
      input.incident
        .openedSnapshotActivityLogId,

    lastObservedSnapshotActivityLogId:
      input.incident
        .lastObservedSnapshotActivityLogId,

    observationCount:
      input.incident.observationCount,

    severityChangeCount:
      input.incident
        .severityChangeCount,
  };
}

function getOverallStatus(input: {
  hasLifecycleData: boolean;

  configurationValid: boolean;

  atRiskIncidents: number;

  breachedIncidents: number;
}): AttendanceAutomationAlertIncidentSlaOverallStatus {
  if (!input.hasLifecycleData) {
    return "NO_DATA";
  }

  if (
    input.breachedIncidents > 0
  ) {
    return "BREACHED";
  }

  if (
    !input.configurationValid ||
    input.atRiskIncidents > 0
  ) {
    return "WARNING";
  }

  return "HEALTHY";
}

function getOverallCopy(
  status:
    AttendanceAutomationAlertIncidentSlaOverallStatus,
): {
  label: string;
  description: string;
} {
  switch (status) {
    case "HEALTHY":
      return {
        label:
          "All Open Incidents Are Within SLA",

        description:
          "No open automation-alert incident has reached its warning threshold or exceeded its configured resolution target.",
      };

    case "WARNING":
      return {
        label:
          "Incident SLA Requires Attention",

        description:
          "One or more open incidents are approaching their resolution deadline, or the SLA configuration contains an invalid value.",
      };

    case "BREACHED":
      return {
        label:
          "Automation Incident SLA Breached",

        description:
          "One or more open automation-alert incidents exceeded their configured resolution target.",
      };

    case "NO_DATA":
      return {
        label:
          "No Incident SLA Data",

        description:
          "No immutable automation-alert lifecycle data is available for SLA evaluation.",
      };
  }
}

function maximumOrNull(
  values: number[],
): number | null {
  if (values.length === 0) {
    return null;
  }

  return Math.max(...values);
}

function minimumOrNull(
  values: number[],
): number | null {
  if (values.length === 0) {
    return null;
  }

  return Math.min(...values);
}

export async function getAttendanceAutomationAlertIncidentSlaData(): Promise<AttendanceAutomationAlertIncidentSlaData> {
  const generatedAt =
    new Date();

  const [
    lifecycle,
    configuration,
  ] = await Promise.all([
    getAttendanceAutomationAlertIncidentLifecycleData(),

    Promise.resolve(
      getAttendanceAutomationAlertIncidentSlaConfiguration(),
    ),
  ]);

  const incidents =
    lifecycle.openIncidents
      .map(
        (incident) =>
          mapIncident({
            incident,

            generatedAt,

            warningPercent:
              configuration
                .warningPercent
                .value,

            configuration,
          }),
      )
      .sort(
        (left, right) => {
          const stateWeight = {
            BREACHED: 3,
            AT_RISK: 2,
            WITHIN_TARGET: 1,
          } as const;

          const stateDifference =
            stateWeight[
              right.slaState
            ] -
            stateWeight[
              left.slaState
            ];

          if (
            stateDifference !== 0
          ) {
            return stateDifference;
          }

          return (
            right.elapsedHours -
            left.elapsedHours
          );
        },
      );

  const withinTargetIncidents =
    incidents.filter(
      (incident) =>
        incident.slaState ===
        "WITHIN_TARGET",
    ).length;

  const atRiskIncidents =
    incidents.filter(
      (incident) =>
        incident.slaState ===
        "AT_RISK",
    ).length;

  const breachedIncidentRecords =
    incidents.filter(
      (incident) =>
        incident.slaState ===
        "BREACHED",
    );

  const breachedIncidents =
    breachedIncidentRecords.length;

  const configurationValid =
    configuration.critical.valid &&
    configuration.warning.valid &&
    configuration
      .informational.valid &&
    configuration
      .warningPercent.valid;

  const overallStatus =
    getOverallStatus({
      hasLifecycleData:
        lifecycle.overallStatus !==
        "NO_DATA",

      configurationValid,

      atRiskIncidents,
      breachedIncidents,
    });

  const overallCopy =
    getOverallCopy(
      overallStatus,
    );

  const issues: string[] = [];

  const thresholds = [
    configuration.critical,
    configuration.warning,
    configuration.informational,
  ];

  for (
    const threshold of
    thresholds
  ) {
    if (threshold.valid) {
      continue;
    }

    issues.push(
      `${threshold.variableName} must be a number from 0.25 through 720. The ${threshold.targetHours}-hour fallback is being used.`,
    );
  }

  if (
    !configuration
      .warningPercent.valid
  ) {
    issues.push(
      `${configuration.warningPercent.variableName} must be a number from 1 through 99. The ${configuration.warningPercent.value}% fallback is being used.`,
    );
  }

  const remainingHours =
    incidents
      .map(
        (incident) =>
          incident.remainingHours,
      )
      .filter(
        (
          value,
        ): value is number =>
          value !== null,
      );

  const overdueHours =
    breachedIncidentRecords
      .map(
        (incident) =>
          incident.overdueHours,
      )
      .filter(
        (
          value,
        ): value is number =>
          value !== null,
      );

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

    configuration: {
      warningPercent:
        configuration
          .warningPercent.value,

      warningPercentValid:
        configuration
          .warningPercent.valid,

      critical:
        configuration.critical,

      warning:
        configuration.warning,

      informational:
        configuration.informational,
    },

    summary: {
      totalOpenIncidents:
        incidents.length,

      withinTargetIncidents,
      atRiskIncidents,
      breachedIncidents,

      criticalBreaches:
        breachedIncidentRecords.filter(
          (incident) =>
            incident.severity ===
            "CRITICAL",
        ).length,

      warningBreaches:
        breachedIncidentRecords.filter(
          (incident) =>
            incident.severity ===
            "WARNING",
        ).length,

      informationalBreaches:
        breachedIncidentRecords.filter(
          (incident) =>
            incident.severity ===
            "INFO",
        ).length,

      breachRate:
        calculateRate(
          breachedIncidents,
          incidents.length,
        ),

      maximumOverdueHours:
        maximumOrNull(
          overdueHours,
        ),

      nearestDeadlineHours:
        minimumOrNull(
          remainingHours,
        ),
    },

    incidents,

    issues,

    metadata: {
      source:
        "ALERT_INCIDENT_LIFECYCLE",

      lifecycleStatus:
        lifecycle.overallStatus,

      lifecycleSnapshotCount:
        lifecycle.metadata
          .snapshotCount,

      monitoringWindowDays:
        lifecycle.monitoringWindowDays,
    },
  };
}