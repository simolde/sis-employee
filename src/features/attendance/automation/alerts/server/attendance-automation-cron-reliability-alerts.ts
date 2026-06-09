import type { AttendanceAutomationCronReliabilityData } from "@/features/attendance/automation/scheduler/reliability/types/attendance-automation-cron-reliability-types";
import type {
  AttendanceAutomationAlertItem,
  AttendanceAutomationAlertSeverity,
} from "../types/attendance-automation-alert-types";

export type AttendanceAutomationCronReliabilityAlertDraft =
  Omit<
    AttendanceAutomationAlertItem,
    "detectedAt"
  >;

const CRON_RELIABILITY_URL =
  "/dashboard/attendance/automation/scheduler/reliability";

const CRON_RECEIPTS_URL =
  "/dashboard/attendance/automation/scheduler/heartbeats";

const CRON_SCHEDULER_URL =
  "/dashboard/attendance/automation/scheduler";

function getConfigurationSeverity(
  data: AttendanceAutomationCronReliabilityData,
): AttendanceAutomationAlertSeverity {
  if (
    data.monitoring.enabled &&
    (
      !data.monitoring.valid ||
      !data.configuration
        .monitoringStartedOnValid
    )
  ) {
    return "CRITICAL";
  }

  return "WARNING";
}

function buildConfigurationDetails(
  data: AttendanceAutomationCronReliabilityData,
): string[] {
  const details: string[] = [
    `Monitoring enabled: ${data.monitoring.enabled ? "Yes" : "No"}.`,

    `Effective monitoring start: ${data.configuration.effectiveMonitoringStartedOn}.`,

    `Monitoring start source: ${data.configuration.effectiveMonitoringStartedOnSource}.`,

    `Configured reliability target: ${data.configuration.targetPercent}%.`,
  ];

  if (
    data.configuration
      .configuredMonitoringStartedOn
  ) {
    details.push(
      `Configured start date: ${data.configuration.configuredMonitoringStartedOn}.`,
    );
  } else {
    details.push(
      "No explicit cron monitoring start date is configured.",
    );
  }

  details.push(...data.issues);

  return details;
}

function buildWindowDetails(
  data: AttendanceAutomationCronReliabilityData,
): string[] {
  const window =
    data.windows.last7Days;

  const details = [
    `Evaluation window: ${window.dateFrom} through ${window.dateTo}.`,

    `Reliability target: ${data.configuration.targetPercent}%.`,

    `Healthy-day rate: ${window.healthyDayRate}%.`,

    `Automation coverage: ${window.automationCoverageRate}%.`,

    `Health coverage: ${window.healthCoverageRate}%.`,

    `Automation on-time rate: ${window.automationOnTimeRate}%.`,

    `Health on-time rate: ${window.healthOnTimeRate}%.`,

    `Due days: ${window.dueDays}.`,

    `Pending days: ${window.pendingDays}.`,

    `Healthy days: ${window.healthyDays}.`,

    `Warning days: ${window.warningDays}.`,

    `Critical days: ${window.criticalDays}.`,
  ];

  if (
    data.streaks.latestCriticalDate
  ) {
    details.push(
      `Latest critical day: ${data.streaks.latestCriticalDateLabel ?? data.streaks.latestCriticalDate}.`,
    );
  }

  details.push(
    `Current healthy streak: ${data.streaks.currentHealthyStreak} day(s).`,
  );

  details.push(
    `Longest healthy streak: ${data.streaks.longestHealthyStreak} day(s).`,
  );

  return details;
}

function buildConfigurationAlert(
  data: AttendanceAutomationCronReliabilityData,
): AttendanceAutomationCronReliabilityAlertDraft | null {
  if (data.issues.length === 0) {
    return null;
  }

  return {
    code:
      "CRON_RELIABILITY_CONFIGURATION",

    severity:
      getConfigurationSeverity(data),

    title:
      "Cron reliability configuration requires review",

    message:
      "One or more reliability configuration values or report conditions could affect the accuracy of Hostinger cron monitoring.",

    details:
      buildConfigurationDetails(data),

    action: {
      label:
        "Review Scheduler Configuration",

      href:
        CRON_SCHEDULER_URL,
    },
  };
}

function buildStatusAlert(
  data: AttendanceAutomationCronReliabilityData,
): AttendanceAutomationCronReliabilityAlertDraft | null {
  switch (data.overallStatus) {
    case "DISABLED":
      return null;

    case "WARMING_UP":
      return {
        code:
          "CRON_RELIABILITY_WARMING_UP",

        severity: "INFO",

        title:
          "Cron reliability monitoring is warming up",

        message:
          data.overallDescription,

        details:
          buildWindowDetails(data),

        action: {
          label:
            "Open Cron Reliability",

          href:
            CRON_RELIABILITY_URL,
        },
      };

    case "AT_RISK":
      return {
        code:
          "CRON_RELIABILITY_AT_RISK",

        severity: "WARNING",

        title:
          "Hostinger cron reliability is at risk",

        message:
          data.overallDescription,

        details:
          buildWindowDetails(data),

        action: {
          label:
            "Review Cron Reliability",

          href:
            CRON_RELIABILITY_URL,
        },
      };

    case "BREACHED":
      return {
        code:
          "CRON_RELIABILITY_BREACHED",

        severity: "CRITICAL",

        title:
          "Hostinger cron reliability target was breached",

        message:
          data.overallDescription,

        details:
          buildWindowDetails(data),

        action: {
          label:
            "Investigate Cron Receipts",

          href:
            CRON_RECEIPTS_URL,
        },
      };

    case "HEALTHY":
      return null;
  }
}

export function buildAttendanceAutomationCronReliabilityAlerts(
  data: AttendanceAutomationCronReliabilityData,
): AttendanceAutomationCronReliabilityAlertDraft[] {
  const alerts:
    AttendanceAutomationCronReliabilityAlertDraft[] =
    [];

  const configurationAlert =
    buildConfigurationAlert(data);

  if (configurationAlert) {
    alerts.push(
      configurationAlert,
    );
  }

  const statusAlert =
    buildStatusAlert(data);

  if (statusAlert) {
    alerts.push(
      statusAlert,
    );
  }

  return alerts;
}