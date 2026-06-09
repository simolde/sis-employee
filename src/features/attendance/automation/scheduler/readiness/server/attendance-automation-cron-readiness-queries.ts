import { getAttendanceAutomationConfigurationData } from "@/features/attendance/automation/configuration/server/attendance-automation-configuration-queries";
import { getAttendanceAutomationSchedulerHeartbeatData } from "@/features/attendance/automation/scheduler/heartbeats/server/attendance-automation-scheduler-heartbeat-queries";
import type {
  AttendanceAutomationSchedulerHeartbeatOutcome,
  AttendanceAutomationSchedulerTaskHeartbeatStatus,
} from "@/features/attendance/automation/scheduler/heartbeats/types/attendance-automation-scheduler-heartbeat-types";
import type {
  AttendanceAutomationCronReadinessCheck,
  AttendanceAutomationCronReadinessCheckStatus,
  AttendanceAutomationCronReadinessData,
  AttendanceAutomationCronReadinessStatus,
} from "../types/attendance-automation-cron-readiness-types";

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

function addCheck(
  checks:
    AttendanceAutomationCronReadinessCheck[],

  input: {
    code:
      AttendanceAutomationCronReadinessCheck["code"];

    status:
      AttendanceAutomationCronReadinessCheckStatus;

    title: string;
    message: string;

    details?: string[];
  },
): void {
  checks.push({
    code: input.code,
    status: input.status,

    title: input.title,
    message: input.message,

    details:
      input.details ?? [],
  });
}

function getOverallStatus(input: {
  monitoringEnabled: boolean;
  monitoringValid: boolean;

  checks:
    AttendanceAutomationCronReadinessCheck[];
}): AttendanceAutomationCronReadinessStatus {
  if (
    !input.monitoringValid ||
    input.checks.some(
      (check) =>
        check.status === "FAIL",
    )
  ) {
    return "BLOCKED";
  }

  if (!input.monitoringEnabled) {
    return "DISABLED";
  }

  if (
    input.checks.some(
      (check) =>
        check.status === "WARNING",
    )
  ) {
    return "READY_WITH_WARNINGS";
  }

  return "READY";
}

function getOverallCopy(
  status:
    AttendanceAutomationCronReadinessStatus,
): {
  label: string;
  description: string;
} {
  switch (status) {
    case "READY":
      return {
        label:
          "Hostinger Cron Monitoring Ready",

        description:
          "Cron monitoring is enabled and both expected Hostinger execution receipts are healthy for their current scheduling windows.",
      };

    case "READY_WITH_WARNINGS":
      return {
        label:
          "Cron Monitoring Ready with Warnings",

        description:
          "Hostinger cron monitoring can operate, but one or more warning-level conditions should be reviewed.",
      };

    case "BLOCKED":
      return {
        label:
          "Cron Monitoring Activation Blocked",

        description:
          "One or more required configuration or receipt checks failed. Resolve them before relying on production cron monitoring.",
      };

    case "DISABLED":
      return {
        label:
          "Hostinger Cron Monitoring Disabled",

        description:
          "The cron configuration can remain disabled during development. Enable it only after both Hostinger cron jobs are deployed.",
      };
  }
}

function addMonitoringConfigurationCheck(
  checks:
    AttendanceAutomationCronReadinessCheck[],

  input: {
    enabled: boolean;
    valid: boolean;

    variableName: string;
    rawValue: string | null;
    normalizedValue: string;
  },
): void {
  if (!input.valid) {
    addCheck(checks, {
      code:
        "MONITORING_CONFIGURATION",

      status: "FAIL",

      title:
        "Cron monitoring configuration is invalid",

      message:
        `${input.variableName} contains an unsupported value.`,

      details: [
        `Current raw value: ${input.rawValue ?? "Not configured"}.`,
        'Use "true" to enable monitoring.',
        'Use "false" to disable monitoring.',
        "Restart the Node.js application after correcting the environment.",
      ],
    });

    return;
  }

  if (!input.enabled) {
    addCheck(checks, {
      code:
        "MONITORING_CONFIGURATION",

      status: "SKIPPED",

      title:
        "Cron monitoring is disabled",

      message:
        "Daily Hostinger receipts are not currently required.",

      details: [
        `${input.variableName}="${input.normalizedValue}".`,
        "Receipt history remains available.",
        "Enable monitoring only after both Hostinger cron jobs are installed.",
      ],
    });

    return;
  }

  addCheck(checks, {
    code:
      "MONITORING_CONFIGURATION",

    status: "PASS",

    title:
      "Cron monitoring is enabled",

    message:
      "The application requires current automation and health receipts from Hostinger.",

    details: [
      `${input.variableName}="${input.normalizedValue}".`,
    ],
  });
}

function addApplicationUrlCheck(
  checks:
    AttendanceAutomationCronReadinessCheck[],

  input: {
    environment:
      AttendanceAutomationCronReadinessData["environment"];

    applicationBaseUrl: string;
    usesLocalBaseUrl: boolean;
  },
): void {
  if (
    input.environment === "production" &&
    input.usesLocalBaseUrl
  ) {
    addCheck(checks, {
      code: "APPLICATION_URL",
      status: "FAIL",

      title:
        "Production application URL is local",

      message:
        "Hostinger cron cannot call a localhost-only application URL.",

      details: [
        `Current URL: ${input.applicationBaseUrl}.`,
        "Set NEXT_PUBLIC_APP_URL to the deployed HTTPS domain.",
        "Restart the application after updating the environment.",
      ],
    });

    return;
  }

  if (input.usesLocalBaseUrl) {
    addCheck(checks, {
      code: "APPLICATION_URL",
      status: "WARNING",

      title:
        "Application URL uses localhost",

      message:
        "This is acceptable for local testing but cannot be used by Hostinger cron.",

      details: [
        `Current URL: ${input.applicationBaseUrl}.`,
      ],
    });

    return;
  }

  addCheck(checks, {
    code: "APPLICATION_URL",
    status: "PASS",

    title:
      "Application URL is externally addressable",

    message:
      "The scheduler configuration uses a non-local application URL.",

    details: [
      `Current URL: ${input.applicationBaseUrl}.`,
    ],
  });
}

function addSecretCheck(
  checks:
    AttendanceAutomationCronReadinessCheck[],

  input: {
    configured: boolean;
    source: string;
  },
): void {
  if (!input.configured) {
    addCheck(checks, {
      code: "AUTOMATION_SECRET",
      status: "FAIL",

      title:
        "Automation secret is missing",

      message:
        "Hostinger cannot authenticate automation, health, or heartbeat requests.",

      details: [
        "Configure ATTENDANCE_AUTOMATION_SECRET or CRON_SECRET.",
        "Use the same secret in the private Hostinger cron environment file.",
      ],
    });

    return;
  }

  addCheck(checks, {
    code: "AUTOMATION_SECRET",
    status: "PASS",

    title:
      "Automation secret is configured",

    message:
      "Protected scheduler endpoints have an authentication secret.",

    details: [
      `Configured source: ${input.source}.`,
      "The secret value is not included in this report.",
    ],
  });
}

function addScheduleCheck(
  checks:
    AttendanceAutomationCronReadinessCheck[],

  input: {
    invalidVariables: string[];
    scheduleLabel: string;
    graceMinutes: number;
  },
): void {
  if (input.invalidVariables.length > 0) {
    addCheck(checks, {
      code:
        "SCHEDULE_CONFIGURATION",

      status: "FAIL",

      title:
        "Scheduler configuration is invalid",

      message:
        "One or more scheduler variables are invalid and fallback values are being used.",

      details: [
        `Invalid variables: ${input.invalidVariables.join(", ")}.`,
        `Effective schedule: ${input.scheduleLabel}.`,
        `Effective grace period: ${input.graceMinutes} minutes.`,
      ],
    });

    return;
  }

  addCheck(checks, {
    code:
      "SCHEDULE_CONFIGURATION",

    status: "PASS",

    title:
      "Scheduler configuration is valid",

    message:
      "The expected run time and grace period were parsed successfully.",

    details: [
      `Schedule: ${input.scheduleLabel}.`,
      `Grace period: ${input.graceMinutes} minutes.`,
    ],
  });
}

function outcomeNeedsFailure(
  outcome:
    AttendanceAutomationSchedulerHeartbeatOutcome | null,
): boolean {
  return outcome === "FAILED";
}

function receiptDetails(
  status:
    AttendanceAutomationSchedulerTaskHeartbeatStatus,
): string[] {
  const receipt =
    status.latestReceipt;

  const details = [
    `Expected window: ${status.expectedAt}.`,
  ];

  if (!receipt) {
    details.push(
      "No receipt is currently available.",
    );

    return details;
  }

  details.push(
    `Latest receipt: #${receipt.activityLogId}.`,
  );

  details.push(
    `Recorded: ${receipt.createdAt}.`,
  );

  details.push(
    `Outcome: ${receipt.outcome}.`,
  );

  details.push(
    receipt.httpStatus !== null
      ? `HTTP status: ${receipt.httpStatus}.`
      : "No HTTP status was recorded.",
  );

  details.push(
    `Duration: ${receipt.durationLabel}.`,
  );

  if (receipt.message) {
    details.push(
      `Message: ${receipt.message}`,
    );
  }

  return details;
}

function addReceiptCheck(
  checks:
    AttendanceAutomationCronReadinessCheck[],

  input: {
    monitoringEnabled: boolean;

    code:
      | "AUTOMATION_RECEIPT"
      | "HEALTH_RECEIPT";

    taskLabel: string;

    status:
      AttendanceAutomationSchedulerTaskHeartbeatStatus;
  },
): void {
  if (!input.monitoringEnabled) {
    addCheck(checks, {
      code: input.code,
      status: "SKIPPED",

      title:
        `${input.taskLabel} receipt check skipped`,

      message:
        "Cron monitoring is disabled, so this receipt is not currently required.",

      details:
        receiptDetails(
          input.status,
        ),
    });

    return;
  }

  if (
    input.status.state === "HEALTHY"
  ) {
    addCheck(checks, {
      code: input.code,
      status: "PASS",

      title:
        `${input.taskLabel} receipt confirmed`,

      message:
        input.status.stateDescription,

      details:
        receiptDetails(
          input.status,
        ),
    });

    return;
  }

  if (
    input.status.state === "MISSING"
  ) {
    addCheck(checks, {
      code: input.code,
      status: "FAIL",

      title:
        `${input.taskLabel} receipt is missing`,

      message:
        input.status.stateDescription,

      details:
        receiptDetails(
          input.status,
        ),
    });

    return;
  }

  if (
    input.status.state === "DISABLED"
  ) {
    addCheck(checks, {
      code: input.code,
      status: "SKIPPED",

      title:
        `${input.taskLabel} receipt monitoring is disabled`,

      message:
        input.status.stateDescription,

      details:
        receiptDetails(
          input.status,
        ),
    });

    return;
  }

  const latestOutcome =
    input.status.latestReceipt
      ?.outcome ?? null;

  addCheck(checks, {
    code: input.code,

    status:
      outcomeNeedsFailure(
        latestOutcome,
      )
        ? "FAIL"
        : "WARNING",

    title:
      `${input.taskLabel} receipt requires review`,

    message:
      input.status.stateDescription,

    details:
      receiptDetails(
        input.status,
      ),
  });
}

function addReceiptHistoryCheck(
  checks:
    AttendanceAutomationCronReadinessCheck[],

  input: {
    monitoringEnabled: boolean;
    totalReceipts: number;
    monitoringWindowDays: number;
  },
): void {
  if (input.totalReceipts > 0) {
    addCheck(checks, {
      code: "RECEIPT_HISTORY",
      status: "PASS",

      title:
        "Cron receipt history is available",

      message:
        `${input.totalReceipts} Hostinger cron receipt(s) exist in the current monitoring window.`,

      details: [
        `Monitoring window: ${input.monitoringWindowDays} days.`,
      ],
    });

    return;
  }

  if (!input.monitoringEnabled) {
    addCheck(checks, {
      code: "RECEIPT_HISTORY",
      status: "SKIPPED",

      title:
        "No cron receipt history yet",

      message:
        "No receipt history exists, but monitoring is currently disabled.",

      details: [
        "Run a manual heartbeat test before enabling production monitoring.",
      ],
    });

    return;
  }

  addCheck(checks, {
    code: "RECEIPT_HISTORY",
    status: "FAIL",

    title:
      "Cron receipt history is empty",

    message:
      "Monitoring is enabled, but no Hostinger heartbeat receipts have been recorded.",

    details: [
      `Monitoring window: ${input.monitoringWindowDays} days.`,
      "Confirm that the updated Hostinger shell scripts are deployed.",
    ],
  });
}

export async function getAttendanceAutomationCronReadinessData(): Promise<AttendanceAutomationCronReadinessData> {
  const checkedAt = new Date();

  const configuration =
    getAttendanceAutomationConfigurationData();

  const heartbeatData =
    await getAttendanceAutomationSchedulerHeartbeatData();

  const checks:
    AttendanceAutomationCronReadinessCheck[] =
    [];

  addMonitoringConfigurationCheck(
    checks,
    {
      enabled:
        heartbeatData.monitoring.enabled,

      valid:
        heartbeatData.monitoring.valid,

      variableName:
        heartbeatData.monitoring
          .variableName,

      rawValue:
        heartbeatData.monitoring
          .rawValue,

      normalizedValue:
        heartbeatData.monitoring
          .normalizedValue,
    },
  );

  addApplicationUrlCheck(checks, {
    environment:
      configuration.environment,

    applicationBaseUrl:
      configuration.applicationBaseUrl,

    usesLocalBaseUrl:
      configuration.usesLocalBaseUrl,
  });

  addSecretCheck(checks, {
    configured:
      configuration.secret.configured,

    source:
      configuration.secret.source,
  });

  addScheduleCheck(checks, {
    invalidVariables:
      configuration.schedule
        .invalidVariables,

    scheduleLabel:
      configuration.schedule
        .scheduleLabel,

    graceMinutes:
      configuration.schedule
        .graceMinutes,
  });

  addReceiptCheck(checks, {
    monitoringEnabled:
      heartbeatData.monitoring.enabled,

    code:
      "AUTOMATION_RECEIPT",

    taskLabel:
      "Automation cron",

    status:
      heartbeatData.taskStatus
        .automation,
  });

  addReceiptCheck(checks, {
    monitoringEnabled:
      heartbeatData.monitoring.enabled,

    code:
      "HEALTH_RECEIPT",

    taskLabel:
      "Health cron",

    status:
      heartbeatData.taskStatus.health,
  });

  addReceiptHistoryCheck(checks, {
    monitoringEnabled:
      heartbeatData.monitoring.enabled,

    totalReceipts:
      heartbeatData.summary
        .totalReceipts,

    monitoringWindowDays:
      heartbeatData
        .monitoringWindowDays,
  });

  const overallStatus =
    getOverallStatus({
      monitoringEnabled:
        heartbeatData.monitoring.enabled,

      monitoringValid:
        heartbeatData.monitoring.valid,

      checks,
    });

  const overallCopy =
    getOverallCopy(
      overallStatus,
    );

  return {
    overallStatus,

    overallLabel:
      overallCopy.label,

    overallDescription:
      overallCopy.description,

    checkedAt:
      formatDateTime(checkedAt),

    checkedAtIso:
      checkedAt.toISOString(),

    environment:
      configuration.environment,

    monitoring: {
      enabled:
        heartbeatData.monitoring.enabled,

      valid:
        heartbeatData.monitoring.valid,

      source:
        heartbeatData.monitoring.source,

      variableName:
        heartbeatData.monitoring
          .variableName,

      rawValue:
        heartbeatData.monitoring
          .rawValue,

      normalizedValue:
        heartbeatData.monitoring
          .normalizedValue,
    },

    summary: {
      totalChecks:
        checks.length,

      passedChecks:
        checks.filter(
          (check) =>
            check.status === "PASS",
        ).length,

      warningChecks:
        checks.filter(
          (check) =>
            check.status === "WARNING",
        ).length,

      failedChecks:
        checks.filter(
          (check) =>
            check.status === "FAIL",
        ).length,

      skippedChecks:
        checks.filter(
          (check) =>
            check.status === "SKIPPED",
        ).length,
    },

    checks,

    signals: {
      applicationBaseUrl:
        configuration.applicationBaseUrl,

      secretConfigured:
        configuration.secret.configured,

      scheduleLabel:
        configuration.schedule
          .scheduleLabel,

      graceMinutes:
        configuration.schedule
          .graceMinutes,

      schedulerHeartbeatState:
        heartbeatData.overallState,

      automationReceiptState:
        heartbeatData.taskStatus
          .automation.state,

      healthReceiptState:
        heartbeatData.taskStatus
          .health.state,

      latestAutomationReceiptId:
        heartbeatData.taskStatus
          .automation
          .latestReceipt
          ?.activityLogId ?? null,

      latestAutomationOutcome:
        heartbeatData.taskStatus
          .automation
          .latestReceipt
          ?.outcome ?? null,

      latestHealthReceiptId:
        heartbeatData.taskStatus
          .health
          .latestReceipt
          ?.activityLogId ?? null,

      latestHealthOutcome:
        heartbeatData.taskStatus
          .health
          .latestReceipt
          ?.outcome ?? null,

      totalReceipts:
        heartbeatData.summary
          .totalReceipts,
    },
  };
}