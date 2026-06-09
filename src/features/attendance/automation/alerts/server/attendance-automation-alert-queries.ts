import { getAttendanceAutomationConfigurationData } from "@/features/attendance/automation/configuration/server/attendance-automation-configuration-queries";
import { getAttendanceAutomationHealthData } from "@/features/attendance/automation/health/server/attendance-automation-health-queries";
import { getAttendanceAutomationLockHealthData } from "@/features/attendance/automation/health/server/attendance-automation-lock-health";
import { getAttendanceAutomationSchedulerHeartbeatData } from "@/features/attendance/automation/scheduler/heartbeats/server/attendance-automation-scheduler-heartbeat-queries";
import { getAttendanceAutomationCronReliabilityData } from "@/features/attendance/automation/scheduler/reliability/server/attendance-automation-cron-reliability-queries";
import { buildAttendanceAutomationCronReliabilityAlerts } from "./attendance-automation-cron-reliability-alerts";
import { buildAttendanceAutomationSchedulerHeartbeatAlerts } from "./attendance-automation-scheduler-heartbeat-alerts";
import type {
  AttendanceAutomationAlertCenterData,
  AttendanceAutomationAlertCode,
  AttendanceAutomationAlertItem,
  AttendanceAutomationAlertOverallStatus,
  AttendanceAutomationAlertSeverity,
} from "../types/attendance-automation-alert-types";

const LOW_SUCCESS_RATE_THRESHOLD = 90;
const LOW_SUCCESS_RATE_MINIMUM_RUNS = 5;

type AlertDraft = Omit<
  AttendanceAutomationAlertItem,
  "detectedAt"
>;

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

function buildOverallCopy(input: {
  criticalAlerts: number;
  warningAlerts: number;
}): {
  status:
    AttendanceAutomationAlertOverallStatus;

  label: string;
  description: string;
} {
  if (input.criticalAlerts > 0) {
    return {
      status: "CRITICAL",

      label:
        "Immediate Attention Required",

      description:
        "One or more critical automation conditions could prevent reliable scheduled attendance processing.",
    };
  }

  if (input.warningAlerts > 0) {
    return {
      status: "ATTENTION",

      label:
        "Review Recommended",

      description:
        "The automation is available, but one or more operational warnings should be reviewed.",
    };
  }

  return {
    status: "HEALTHY",

    label:
      "No Active Automation Problems",

    description:
      "No critical or warning conditions were detected for the attendance automation.",
  };
}

function createAlertCollector(
  detectedAt: string,
): {
  addAlert: (
    draft: AlertDraft,
  ) => void;

  getAlerts: () =>
    AttendanceAutomationAlertItem[];
} {
  const alerts =
    new Map<
      AttendanceAutomationAlertCode,
      AttendanceAutomationAlertItem
    >();

  function addAlert(
    draft: AlertDraft,
  ): void {
    if (alerts.has(draft.code)) {
      return;
    }

    alerts.set(draft.code, {
      ...draft,
      detectedAt,
    });
  }

  function getAlerts(): AttendanceAutomationAlertItem[] {
    return Array.from(
      alerts.values(),
    ).sort((left, right) => {
      const severityDifference =
        severityWeight(
          right.severity,
        ) -
        severityWeight(
          left.severity,
        );

      if (severityDifference !== 0) {
        return severityDifference;
      }

      return left.title.localeCompare(
        right.title,
      );
    });
  }

  return {
    addAlert,
    getAlerts,
  };
}

export async function getAttendanceAutomationAlertCenterData(): Promise<AttendanceAutomationAlertCenterData> {
  const now = new Date();

  const detectedAt =
    formatDateTime(now);

  const configuration =
    getAttendanceAutomationConfigurationData();

  const [
    health,
    lock,
    schedulerHeartbeats,
    schedulerReliability,
  ] = await Promise.all([
    getAttendanceAutomationHealthData(),

    getAttendanceAutomationLockHealthData(),

    getAttendanceAutomationSchedulerHeartbeatData(),

    getAttendanceAutomationCronReliabilityData(),
  ]);

  const collector =
    createAlertCollector(
      detectedAt,
    );

  if (!configuration.secret.configured) {
    collector.addAlert({
      code:
        "SECRET_NOT_CONFIGURED",

      severity: "CRITICAL",

      title:
        "Automation secret is not configured",

      message:
        "External schedulers cannot securely call the protected attendance automation endpoints.",

      details: [
        "Configure ATTENDANCE_AUTOMATION_SECRET or CRON_SECRET.",
        "Restart the Node.js application after changing the environment.",
        "Retest the protected automation and health endpoints.",
      ],

      action: {
        label:
          "Open Configuration",

        href:
          "/dashboard/attendance/automation/configuration",
      },
    });
  }

  if (
    health.summary.totalRuns === 0
  ) {
    collector.addAlert({
      code:
        "AUTOMATION_RUNS_NOT_FOUND",

      severity: "WARNING",

      title:
        "No automation runs were found",

      message:
        "The monitoring window does not contain any approved-leave automation execution.",

      details: [
        `Monitoring window: ${health.monitoringWindowDays} days.`,
        "Run the protected API endpoint or execute the automation from the dashboard.",
      ],

      action: {
        label:
          "Run Automation",

        href:
          "/dashboard/attendance/automation/approved-leave-excused",
      },
    });
  }

  if (
    health.scheduleCompliance.status ===
      "OVERDUE" ||
    health.scheduleCompliance.status ===
      "NO_API_RUNS"
  ) {
    const minutesOverdue =
      health.scheduleCompliance
        .minutesOverdue;

    collector.addAlert({
      code:
        "SCHEDULE_OVERDUE",

      severity: "CRITICAL",

      title:
        "Scheduled API automation is overdue",

      message:
        health.scheduleCompliance
          .statusDescription,

      details: [
        `Expected run: ${health.scheduleCompliance.expectedRunAt}.`,

        `Grace deadline: ${health.scheduleCompliance.graceDeadline}.`,

        minutesOverdue !== null
          ? `The scheduled run is approximately ${minutesOverdue} minute(s) overdue.`
          : "No compliant API/system run was detected.",
      ],

      action: {
        label:
          "Review Automation Health",

        href:
          "/dashboard/attendance/automation/health",
      },
    });
  }

  if (
    health.scheduleCompliance.status ===
    "LATE_COMPLETED"
  ) {
    collector.addAlert({
      code:
        "SCHEDULE_LATE_COMPLETION",

      severity: "WARNING",

      title:
        "Scheduled automation completed late",

      message:
        "An API/system run was recorded today, but it completed after the configured grace deadline.",

      details: [
        `Expected run: ${health.scheduleCompliance.expectedRunAt}.`,

        `Grace deadline: ${health.scheduleCompliance.graceDeadline}.`,

        `Latest API run: ${health.scheduleCompliance.latestApiRunAt ?? "Unknown"}.`,

        health.scheduleCompliance
          .minutesLate !== null
          ? `Completion was approximately ${health.scheduleCompliance.minutesLate} minute(s) late.`
          : "The scheduler completed outside its expected window.",
      ],

      action: {
        label:
          "View Run History",

        href:
          "/dashboard/attendance/automation/approved-leave-excused/history",
      },
    });
  }

  if (
    health.summary
      .failuresLast24Hours > 0
  ) {
    const latestFailedRun =
      health.latestFailedRun;

    collector.addAlert({
      code:
        "RECENT_AUTOMATION_FAILURE",

      severity: "CRITICAL",

      title:
        "Recent automation failure detected",

      message:
        `${health.summary.failuresLast24Hours} failed automation run(s) were recorded during the last 24 hours.`,

      details: [
        latestFailedRun
          ? `Latest failed run: #${latestFailedRun.activityLogId}.`
          : "The latest failed run could not be identified.",

        latestFailedRun
          ? `Failure recorded: ${latestFailedRun.createdAt}.`
          : "Open Run History for more information.",

        "Review the failed run details before retrying it.",
      ],

      action:
        latestFailedRun
          ? {
              label:
                `Open Failed Run #${latestFailedRun.activityLogId}`,

              href:
                `/dashboard/attendance/automation/approved-leave-excused/history/${latestFailedRun.activityLogId}`,
            }
          : {
              label:
                "Open Run History",

              href:
                "/dashboard/attendance/automation/approved-leave-excused/history",
            },
    });
  }

  if (
    health.summary.totalRuns >=
      LOW_SUCCESS_RATE_MINIMUM_RUNS &&
    health.summary.successRate <
      LOW_SUCCESS_RATE_THRESHOLD
  ) {
    collector.addAlert({
      code:
        "LOW_SUCCESS_RATE",

      severity: "WARNING",

      title:
        "Automation success rate is below target",

      message:
        `The current ${health.monitoringWindowDays}-day success rate is ${health.summary.successRate}%.`,

      details: [
        `Target threshold: ${LOW_SUCCESS_RATE_THRESHOLD}%.`,
        `Completed runs: ${health.summary.completedRuns}.`,
        `Failed runs: ${health.summary.failedRuns}.`,
      ],

      action: {
        label:
          "Open Automation Reports",

        href:
          "/dashboard/attendance/automation/reports",
      },
    });
  }

  if (lock.active) {
    collector.addAlert({
      code:
        "ACTIVE_EXECUTION_LOCK",

      severity: "INFO",

      title:
        "Attendance automation is currently running",

      message:
        "Another dashboard, API, or retry execution cannot start until the active MySQL lock is released.",

      details: [
        lock.ownerConnectionId !==
        null
          ? `MySQL owner connection: #${lock.ownerConnectionId}.`
          : "The MySQL owner connection was not reported.",

        lock.retryAfterSeconds !==
        null
          ? `Recommended retry delay: ${lock.retryAfterSeconds} second(s).`
          : "Wait for the current operation to finish.",

        `Lock provider: ${lock.source}.`,
      ],

      action: {
        label:
          "Open Automation Health",

        href:
          "/dashboard/attendance/automation/health",
      },
    });
  }

  if (
    configuration.schedule
      .invalidVariables.length > 0
  ) {
    collector.addAlert({
      code:
        "INVALID_SCHEDULE_CONFIGURATION",

      severity: "WARNING",

      title:
        "Invalid scheduler environment values",

      message:
        "One or more scheduler variables are invalid, so safe default values are being used.",

      details: [
        `Invalid variables: ${configuration.schedule.invalidVariables.join(", ")}.`,

        `Effective schedule: ${configuration.schedule.scheduleLabel}.`,

        `Effective grace period: ${configuration.schedule.graceMinutes} minutes.`,
      ],

      action: {
        label:
          "Review Configuration",

        href:
          "/dashboard/attendance/automation/configuration",
      },
    });
  }

  if (!configuration.lock.valid) {
    collector.addAlert({
      code:
        "INVALID_LOCK_LEASE",

      severity: "WARNING",

      title:
        "Invalid automation lock timeout",

      message:
        "ATTENDANCE_AUTOMATION_LOCK_LEASE_SECONDS is outside its accepted range.",

      details: [
        "Valid range: 60 through 3600 seconds.",

        `Effective fallback: ${configuration.lock.leaseSeconds} seconds.`,

        "Restart the application after correcting the environment value.",
      ],

      action: {
        label:
          "Review Configuration",

        href:
          "/dashboard/attendance/automation/configuration",
      },
    });
  }

  if (
    configuration.environment ===
      "production" &&
    configuration.usesLocalBaseUrl
  ) {
    collector.addAlert({
      code:
        "LOCAL_PRODUCTION_URL",

      severity: "CRITICAL",

      title:
        "Production application URL points to localhost",

      message:
        "An external scheduler cannot reach a localhost-only automation endpoint.",

      details: [
        `Current base URL: ${configuration.applicationBaseUrl}.`,
        "Set NEXT_PUBLIC_APP_URL to the deployed HTTPS domain.",
        "Restart the Node.js application after updating the environment.",
      ],

      action: {
        label:
          "Open Configuration",

        href:
          "/dashboard/attendance/automation/configuration",
      },
    });
  }

  const heartbeatAlerts =
    buildAttendanceAutomationSchedulerHeartbeatAlerts(
      schedulerHeartbeats,
    );

  for (
    const heartbeatAlert of
    heartbeatAlerts
  ) {
    collector.addAlert(
      heartbeatAlert,
    );
  }

  const reliabilityAlerts =
    buildAttendanceAutomationCronReliabilityAlerts(
      schedulerReliability,
    );

  for (
    const reliabilityAlert of
    reliabilityAlerts
  ) {
    collector.addAlert(
      reliabilityAlert,
    );
  }

  const derivedAlerts =
    collector.getAlerts();

  if (
    health.status === "DEGRADED" &&
    derivedAlerts.length === 0
  ) {
    collector.addAlert({
      code:
        "DEGRADED_HEALTH",

      severity: "WARNING",

      title:
        "Automation health requires review",

      message:
        health.statusDescription,

      details: [
        `Health status: ${health.status}.`,

        `Schedule status: ${health.scheduleCompliance.status}.`,

        `Latest run: ${
          health.latestRun
            ? `#${health.latestRun.activityLogId}`
            : "None"
        }.`,
      ],

      action: {
        label:
          "Open Automation Health",

        href:
          "/dashboard/attendance/automation/health",
      },
    });
  }

  const alerts =
    collector.getAlerts();

  const criticalAlerts =
    alerts.filter(
      (alert) =>
        alert.severity ===
        "CRITICAL",
    ).length;

  const warningAlerts =
    alerts.filter(
      (alert) =>
        alert.severity ===
        "WARNING",
    ).length;

  const informationalAlerts =
    alerts.filter(
      (alert) =>
        alert.severity === "INFO",
    ).length;

  const overallCopy =
    buildOverallCopy({
      criticalAlerts,
      warningAlerts,
    });

  const sevenDayReliability =
    schedulerReliability.windows
      .last7Days;

  return {
    overallStatus:
      overallCopy.status,

    overallLabel:
      overallCopy.label,

    overallDescription:
      overallCopy.description,

    generatedAt:
      detectedAt,

    alerts,

    summary: {
      totalAlerts:
        alerts.length,

      criticalAlerts,
      warningAlerts,
      informationalAlerts,
    },

    signals: {
      healthStatus:
        health.status,

      scheduleStatus:
        health.scheduleCompliance.status,

      lockStatus:
        lock.status,

      schedulerHeartbeatState:
        schedulerHeartbeats
          .overallState,

      automationReceiptState:
        schedulerHeartbeats
          .taskStatus
          .automation
          .state,

      healthReceiptState:
        schedulerHeartbeats
          .taskStatus
          .health
          .state,

      schedulerReliabilityStatus:
        schedulerReliability
          .overallStatus,

      secretConfigured:
        configuration.secret.configured,

      totalRuns:
        health.summary.totalRuns,

      failuresLast24Hours:
        health.summary
          .failuresLast24Hours,

      successRate:
        health.summary.successRate,

      latestRunId:
        health.latestRun
          ?.activityLogId ?? null,

      latestFailedRunId:
        health.latestFailedRun
          ?.activityLogId ?? null,

      latestAutomationReceiptId:
        schedulerHeartbeats
          .taskStatus
          .automation
          .latestReceipt
          ?.activityLogId ?? null,

      latestHealthReceiptId:
        schedulerHeartbeats
          .taskStatus
          .health
          .latestReceipt
          ?.activityLogId ?? null,

      cronReliabilityTargetPercent:
        schedulerReliability
          .configuration
          .targetPercent,

      cronHealthyDayRate7Days:
        sevenDayReliability
          .healthyDayRate,

      cronAutomationCoverageRate7Days:
        sevenDayReliability
          .automationCoverageRate,

      cronHealthCoverageRate7Days:
        sevenDayReliability
          .healthCoverageRate,

      cronCriticalDays7Days:
        sevenDayReliability
          .criticalDays,

      cronEffectiveMonitoringStartedOn:
        schedulerReliability
          .configuration
          .effectiveMonitoringStartedOn,
    },
  };
}