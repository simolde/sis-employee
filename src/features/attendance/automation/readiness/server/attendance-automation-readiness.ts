import { getAttendanceAutomationConfigurationData } from "@/features/attendance/automation/configuration/server/attendance-automation-configuration-queries";
import { getAttendanceAutomationLockDiagnosticData } from "@/features/attendance/automation/diagnostics/server/attendance-automation-lock-diagnostics";
import { getAttendanceAutomationHealthData } from "@/features/attendance/automation/health/server/attendance-automation-health-queries";
import type {
  AttendanceAutomationReadinessCheck,
  AttendanceAutomationReadinessCheckStatus,
  AttendanceAutomationReadinessData,
  AttendanceAutomationReadinessStatus,
} from "../types/attendance-automation-readiness-types";

const DEFAULT_PORT = 3000;

type QueueConfiguration = {
  driver: string;
  redisConfigured: boolean;
};

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

function getQueueConfiguration(): QueueConfiguration {
  const driver =
    process.env.QUEUE_DRIVER
      ?.trim()
      .toLowerCase() || "sync";

  const redisConfigured = Boolean(
    process.env.REDIS_URL?.trim(),
  );

  return {
    driver,
    redisConfigured,
  };
}

function getConfiguredPort(): number {
  const rawPort =
    process.env.PORT?.trim();

  if (!rawPort) {
    return DEFAULT_PORT;
  }

  const parsed = Number(rawPort);

  if (
    !Number.isInteger(parsed) ||
    parsed < 1 ||
    parsed > 65_535
  ) {
    return DEFAULT_PORT;
  }

  return parsed;
}

function isConfiguredPortValid(): boolean {
  const rawPort =
    process.env.PORT?.trim();

  if (!rawPort) {
    return true;
  }

  const parsed = Number(rawPort);

  return (
    Number.isInteger(parsed) &&
    parsed >= 1 &&
    parsed <= 65_535
  );
}

function getOverallStatus(
  checks: AttendanceAutomationReadinessCheck[],
): AttendanceAutomationReadinessStatus {
  const hasFailure = checks.some(
    (check) => check.status === "FAIL",
  );

  if (hasFailure) {
    return "BLOCKED";
  }

  const hasWarning = checks.some(
    (check) =>
      check.status === "WARNING",
  );

  if (hasWarning) {
    return "READY_WITH_WARNINGS";
  }

  return "READY";
}

function getOverallCopy(
  status: AttendanceAutomationReadinessStatus,
): {
  label: string;
  description: string;
} {
  switch (status) {
    case "READY":
      return {
        label:
          "Ready for Production Automation",

        description:
          "All required automation, database, scheduler, queue, and environment checks passed.",
      };

    case "READY_WITH_WARNINGS":
      return {
        label:
          "Ready with Operational Warnings",

        description:
          "The automation can operate, but one or more warning-level conditions should be reviewed.",
      };

    case "BLOCKED":
      return {
        label:
          "Production Readiness Blocked",

        description:
          "One or more required checks failed. Resolve the failed checks before relying on scheduled automation.",
      };
  }
}

function addCheck(
  checks: AttendanceAutomationReadinessCheck[],
  input: {
    code:
      AttendanceAutomationReadinessCheck["code"];

    status:
      AttendanceAutomationReadinessCheckStatus;

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

    details: input.details ?? [],
  });
}

function addSecretCheck(
  checks: AttendanceAutomationReadinessCheck[],
  configured: boolean,
  source: string,
): void {
  if (configured) {
    addCheck(checks, {
      code: "AUTOMATION_SECRET",
      status: "PASS",

      title:
        "Automation secret configured",

      message:
        "Protected scheduler and monitoring endpoints have a configured authentication secret.",

      details: [
        `Configured source: ${source}.`,
        "The secret value is not exposed by the readiness report.",
      ],
    });

    return;
  }

  addCheck(checks, {
    code: "AUTOMATION_SECRET",
    status: "FAIL",

    title:
      "Automation secret is missing",

    message:
      "External schedulers cannot securely call protected automation endpoints.",

    details: [
      "Configure ATTENDANCE_AUTOMATION_SECRET or CRON_SECRET.",
      "Restart the Node.js application after changing the environment.",
    ],
  });
}

function addApplicationUrlCheck(
  checks: AttendanceAutomationReadinessCheck[],
  input: {
    environment:
      AttendanceAutomationReadinessData["environment"];

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
        "An external scheduler cannot access a localhost-only endpoint.",

      details: [
        `Current URL: ${input.applicationBaseUrl}.`,
        "Set NEXT_PUBLIC_APP_URL to the deployed HTTPS domain.",
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
        "This is acceptable during development but must be changed before production deployment.",

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
      "Application URL configured",

    message:
      "Automation endpoint commands use a non-local application URL.",

    details: [
      `Current URL: ${input.applicationBaseUrl}.`,
    ],
  });
}

function addScheduleConfigurationCheck(
  checks: AttendanceAutomationReadinessCheck[],
  input: {
    invalidVariables: string[];
    scheduleLabel: string;
    graceMinutes: number;
  },
): void {
  if (input.invalidVariables.length > 0) {
    addCheck(checks, {
      code: "SCHEDULE_CONFIGURATION",
      status: "FAIL",

      title:
        "Scheduler configuration is invalid",

      message:
        "One or more scheduler environment variables are invalid and safe fallbacks are being used.",

      details: [
        `Invalid variables: ${input.invalidVariables.join(", ")}.`,
        `Effective schedule: ${input.scheduleLabel}.`,
      ],
    });

    return;
  }

  addCheck(checks, {
    code: "SCHEDULE_CONFIGURATION",
    status: "PASS",

    title:
      "Scheduler configuration valid",

    message:
      "The expected execution time and grace period were parsed successfully.",

    details: [
      `Expected execution: ${input.scheduleLabel}.`,
      `Grace period: ${input.graceMinutes} minutes.`,
    ],
  });
}

function addLockConfigurationCheck(
  checks: AttendanceAutomationReadinessCheck[],
  input: {
    valid: boolean;
    leaseSeconds: number;
  },
): void {
  if (!input.valid) {
    addCheck(checks, {
      code:
        "LOCK_TIMEOUT_CONFIGURATION",

      status: "WARNING",

      title:
        "Automation lock timeout is invalid",

      message:
        "The application is using the safe default transaction timeout.",

      details: [
        `Effective timeout: ${input.leaseSeconds} seconds.`,
        "Use an integer from 60 through 3600.",
      ],
    });

    return;
  }

  addCheck(checks, {
    code:
      "LOCK_TIMEOUT_CONFIGURATION",

    status: "PASS",

    title:
      "Automation lock timeout valid",

    message:
      "The MySQL lock transaction safety timeout is within the accepted range.",

    details: [
      `Configured timeout: ${input.leaseSeconds} seconds.`,
    ],
  });
}

function addMySqlDiagnosticCheck(
  checks: AttendanceAutomationReadinessCheck[],
  input: {
    status: string;
    serverVersion: string;
    issues: string[];
  },
): void {
  if (input.status === "FAIL") {
    addCheck(checks, {
      code: "MYSQL_NAMED_LOCK",
      status: "FAIL",

      title:
        "MySQL distributed-lock diagnostic failed",

      message:
        "The application cannot safely rely on MySQL named locks for cross-process automation coordination.",

      details: [
        `Database server: ${input.serverVersion}.`,
        ...input.issues,
      ],
    });

    return;
  }

  if (input.status === "WARNING") {
    addCheck(checks, {
      code: "MYSQL_NAMED_LOCK",
      status: "WARNING",

      title:
        "MySQL lock diagnostic passed with warnings",

      message:
        "Named-lock capability passed, but the production lock or diagnostic environment requires review.",

      details: [
        `Database server: ${input.serverVersion}.`,
        ...input.issues,
      ],
    });

    return;
  }

  addCheck(checks, {
    code: "MYSQL_NAMED_LOCK",
    status: "PASS",

    title:
      "MySQL distributed lock supported",

    message:
      "The database acquired, identified, released, and verified a temporary named lock.",

    details: [
      `Database server: ${input.serverVersion}.`,
    ],
  });
}

function addProductionLockCheck(
  checks: AttendanceAutomationReadinessCheck[],
  status: string,
  ownerConnectionId: number | null,
): void {
  if (status === "UNAVAILABLE") {
    addCheck(checks, {
      code: "PRODUCTION_LOCK",
      status: "FAIL",

      title:
        "Production lock state unavailable",

      message:
        "The application could not inspect the current production automation lock.",

      details: [
        "Review the database connection and MySQL named-lock support.",
      ],
    });

    return;
  }

  if (status === "RUNNING") {
    addCheck(checks, {
      code: "PRODUCTION_LOCK",
      status: "WARNING",

      title:
        "Automation is currently running",

      message:
        "A production automation execution currently owns the shared MySQL lock.",

      details: [
        ownerConnectionId !== null
          ? `Owner connection: #${ownerConnectionId}.`
          : "Owner connection was not reported.",
        "This is normal while an automation run is active.",
      ],
    });

    return;
  }

  addCheck(checks, {
    code: "PRODUCTION_LOCK",
    status: "PASS",

    title:
      "Production lock available",

    message:
      "No application process currently owns the shared production automation lock.",
  });
}

function addHealthCheck(
  checks: AttendanceAutomationReadinessCheck[],
  status: string,
  description: string,
): void {
  if (status === "HEALTHY") {
    addCheck(checks, {
      code: "AUTOMATION_HEALTH",
      status: "PASS",

      title:
        "Automation health is healthy",

      message: description,
    });

    return;
  }

  if (status === "DEGRADED") {
    addCheck(checks, {
      code: "AUTOMATION_HEALTH",
      status: "WARNING",

      title:
        "Automation health is degraded",

      message: description,

      details: [
        "The automation remains operational, but the health warning should be reviewed.",
      ],
    });

    return;
  }

  addCheck(checks, {
    code: "AUTOMATION_HEALTH",
    status: "FAIL",

    title:
      "Automation health requires attention",

    message: description,

    details: [
      `Health status: ${status}.`,
    ],
  });
}

function addSchedulerComplianceCheck(
  checks: AttendanceAutomationReadinessCheck[],
  input: {
    status: string;
    description: string;
    expectedRunAt: string;
    graceDeadline: string;
  },
): void {
  const passingStatuses = new Set([
    "ON_SCHEDULE",
    "ON_TIME",
    "COMPLETED_ON_TIME",
  ]);

  const warningStatuses = new Set([
    "LATE_COMPLETED",
    "WAITING",
    "WITHIN_GRACE",
    "BEFORE_WINDOW",
    "NOT_DUE",
  ]);

  if (passingStatuses.has(input.status)) {
    addCheck(checks, {
      code: "SCHEDULER_COMPLIANCE",
      status: "PASS",

      title:
        "Scheduler is compliant",

      message: input.description,

      details: [
        `Expected run: ${input.expectedRunAt}.`,
        `Grace deadline: ${input.graceDeadline}.`,
      ],
    });

    return;
  }

  if (warningStatuses.has(input.status)) {
    addCheck(checks, {
      code: "SCHEDULER_COMPLIANCE",
      status: "WARNING",

      title:
        "Scheduler requires review",

      message: input.description,

      details: [
        `Expected run: ${input.expectedRunAt}.`,
        `Grace deadline: ${input.graceDeadline}.`,
      ],
    });

    return;
  }

  addCheck(checks, {
    code: "SCHEDULER_COMPLIANCE",
    status: "FAIL",

    title:
      "Scheduler is not compliant",

    message: input.description,

    details: [
      `Scheduler status: ${input.status}.`,
      `Expected run: ${input.expectedRunAt}.`,
      `Grace deadline: ${input.graceDeadline}.`,
    ],
  });
}

function addRecentFailuresCheck(
  checks: AttendanceAutomationReadinessCheck[],
  failuresLast24Hours: number,
): void {
  if (failuresLast24Hours === 0) {
    addCheck(checks, {
      code: "RECENT_FAILURES",
      status: "PASS",

      title:
        "No recent automation failures",

      message:
        "No failed automation executions were recorded during the last 24 hours.",
    });

    return;
  }

  addCheck(checks, {
    code: "RECENT_FAILURES",
    status: "WARNING",

    title:
      "Recent automation failures detected",

    message:
      `${failuresLast24Hours} failed automation run(s) were recorded during the last 24 hours.`,

    details: [
      "Review the failed run history before production scheduling is considered stable.",
    ],
  });
}

function addQueueChecks(
  checks: AttendanceAutomationReadinessCheck[],
  queue: QueueConfiguration,
): void {
  if (queue.driver === "sync") {
    addCheck(checks, {
      code: "QUEUE_DRIVER",
      status: "PASS",

      title:
        "Synchronous queue driver selected",

      message:
        "Automation jobs run inside the current HTTP request, which is supported for the present Hostinger setup.",

      details: [
        'QUEUE_DRIVER="sync".',
        "Redis is not required for synchronous processing.",
      ],
    });

    addCheck(checks, {
      code: "REDIS_CONFIGURATION",
      status: "PASS",

      title:
        "Redis is optional",

      message:
        "REDIS_URL may remain empty because the current queue driver does not use Redis.",

      details: [
        queue.redisConfigured
          ? "A Redis URL is present but is not used by the sync driver."
          : "No Redis URL is configured.",
      ],
    });

    return;
  }

  if (queue.driver === "redis") {
    addCheck(checks, {
      code: "QUEUE_DRIVER",
      status: queue.redisConfigured
        ? "PASS"
        : "FAIL",

      title:
        "Redis queue driver selected",

      message:
        queue.redisConfigured
          ? "The Redis queue driver has a configured Redis connection URL."
          : "The Redis queue driver cannot start without REDIS_URL.",

      details: [
        'QUEUE_DRIVER="redis".',
      ],
    });

    addCheck(checks, {
      code: "REDIS_CONFIGURATION",
      status: queue.redisConfigured
        ? "PASS"
        : "FAIL",

      title:
        queue.redisConfigured
          ? "Redis connection configured"
          : "Redis connection missing",

      message:
        queue.redisConfigured
          ? "REDIS_URL is configured for background queue processing."
          : "Set REDIS_URL or return QUEUE_DRIVER to sync.",
    });

    return;
  }

  addCheck(checks, {
    code: "QUEUE_DRIVER",
    status: "FAIL",

    title:
      "Unsupported queue driver",

    message:
      `QUEUE_DRIVER="${queue.driver}" is not supported.`,

    details: [
      'Use QUEUE_DRIVER="sync" for the current Hostinger setup.',
      'Use QUEUE_DRIVER="redis" only when a Redis service and worker are configured.',
    ],
  });

  addCheck(checks, {
    code: "REDIS_CONFIGURATION",
    status: "WARNING",

    title:
      "Redis configuration was not evaluated",

    message:
      "Correct the queue driver before evaluating whether Redis is required.",
  });
}

function addPortCheck(
  checks: AttendanceAutomationReadinessCheck[],
  port: number,
  valid: boolean,
): void {
  if (!valid) {
    addCheck(checks, {
      code: "PORT_CONFIGURATION",
      status: "WARNING",

      title:
        "Invalid application port",

      message:
        `The configured PORT is invalid, so the application falls back to ${DEFAULT_PORT}.`,

      details: [
        "Use an integer from 1 through 65535.",
      ],
    });

    return;
  }

  addCheck(checks, {
    code: "PORT_CONFIGURATION",
    status: "PASS",

    title:
      "Application port valid",

    message:
      `The Node.js application port is configured as ${port}.`,
  });
}

export async function getAttendanceAutomationReadinessData(): Promise<AttendanceAutomationReadinessData> {
  const checkedAt = new Date();

  const configuration =
    getAttendanceAutomationConfigurationData();

  const [health, diagnostic] =
    await Promise.all([
      getAttendanceAutomationHealthData(),

      getAttendanceAutomationLockDiagnosticData(),
    ]);

  const queue =
    getQueueConfiguration();

  const port =
    getConfiguredPort();

  const portValid =
    isConfiguredPortValid();

  const checks:
    AttendanceAutomationReadinessCheck[] =
    [];

  addSecretCheck(
    checks,
    configuration.secret.configured,
    configuration.secret.source,
  );

  addApplicationUrlCheck(checks, {
    environment:
      configuration.environment,

    applicationBaseUrl:
      configuration.applicationBaseUrl,

    usesLocalBaseUrl:
      configuration.usesLocalBaseUrl,
  });

  addScheduleConfigurationCheck(
    checks,
    {
      invalidVariables:
        configuration.schedule
          .invalidVariables,

      scheduleLabel:
        configuration.schedule
          .scheduleLabel,

      graceMinutes:
        configuration.schedule
          .graceMinutes,
    },
  );

  addLockConfigurationCheck(checks, {
    valid:
      configuration.lock.valid,

    leaseSeconds:
      configuration.lock.leaseSeconds,
  });

  addMySqlDiagnosticCheck(checks, {
    status:
      diagnostic.overallStatus,

    serverVersion:
      diagnostic.database.serverVersion,

    issues:
      diagnostic.issues,
  });

  addProductionLockCheck(
    checks,

    diagnostic.productionLock.status,

    diagnostic.productionLock
      .ownerConnectionId,
  );

  addHealthCheck(
    checks,
    health.status,
    health.statusDescription,
  );

  addSchedulerComplianceCheck(
    checks,
    {
      status:
        String(
          health.scheduleCompliance
            .status,
        ),

      description:
        health.scheduleCompliance
          .statusDescription,

      expectedRunAt:
        health.scheduleCompliance
          .expectedRunAt,

      graceDeadline:
        health.scheduleCompliance
          .graceDeadline,
    },
  );

  addRecentFailuresCheck(
    checks,
    health.summary
      .failuresLast24Hours,
  );

  addQueueChecks(checks, queue);

  addPortCheck(
    checks,
    port,
    portValid,
  );

  const overallStatus =
    getOverallStatus(checks);

  const overallCopy =
    getOverallCopy(overallStatus);

  const passedChecks =
    checks.filter(
      (check) =>
        check.status === "PASS",
    ).length;

  const warningChecks =
    checks.filter(
      (check) =>
        check.status === "WARNING",
    ).length;

  const failedChecks =
    checks.filter(
      (check) =>
        check.status === "FAIL",
    ).length;

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

    summary: {
      totalChecks:
        checks.length,

      passedChecks,
      warningChecks,
      failedChecks,
    },

    checks,

    signals: {
      applicationBaseUrl:
        configuration.applicationBaseUrl,

      secretConfigured:
        configuration.secret.configured,

      healthStatus:
        health.status,

      schedulerStatus:
        String(
          health.scheduleCompliance
            .status,
        ),

      mysqlDiagnosticStatus:
        diagnostic.overallStatus,

      productionLockStatus:
        diagnostic.productionLock.status,

      queueDriver:
        queue.driver,

      redisConfigured:
        queue.redisConfigured,

      port,
    },
  };
}