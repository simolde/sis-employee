import { getAttendanceAutomationScheduleConfiguration } from "@/features/attendance/automation/health/server/attendance-automation-schedule";
import type {
  AttendanceAutomationConfigurationData,
  AttendanceAutomationConfigurationWarning,
  AttendanceAutomationSecretSource,
} from "../types/attendance-automation-configuration-types";

const DEFAULT_APPLICATION_URL =
  "http://localhost:3000";

const DEFAULT_LOCK_LEASE_SECONDS =
  15 * 60;

const MINIMUM_LOCK_LEASE_SECONDS = 60;
const MAXIMUM_LOCK_LEASE_SECONDS =
  60 * 60;

const RECOMMENDED_DATE_RANGE_DAYS = 30;
const MAXIMUM_RECORDS_PER_RUN = 500;

type LockConfiguration = {
  leaseSeconds: number;
  source: "DEFAULT" | "ENVIRONMENT";
  valid: boolean;
};

type SecretConfiguration = {
  configured: boolean;
  source: AttendanceAutomationSecretSource;
  environmentVariableName: string;
  requestHeaderName:
    | "X-Attendance-Automation-Secret"
    | "X-Cron-Secret";
  secretLength: number;
};

function normalizeApplicationUrl(
  value: string | undefined,
): string {
  const normalized = value?.trim();

  if (!normalized) {
    return DEFAULT_APPLICATION_URL;
  }

  return normalized.replace(/\/+$/, "");
}

function getEnvironment():
  | "development"
  | "production"
  | "test" {
  switch (process.env.NODE_ENV) {
    case "production":
      return "production";

    case "test":
      return "test";

    default:
      return "development";
  }
}

function getSecretConfiguration(): SecretConfiguration {
  const attendanceSecret =
    process.env
      .ATTENDANCE_AUTOMATION_SECRET?.trim();

  if (attendanceSecret) {
    return {
      configured: true,
      source:
        "ATTENDANCE_AUTOMATION_SECRET",

      environmentVariableName:
        "ATTENDANCE_AUTOMATION_SECRET",

      requestHeaderName:
        "X-Attendance-Automation-Secret",

      secretLength:
        attendanceSecret.length,
    };
  }

  const cronSecret =
    process.env.CRON_SECRET?.trim();

  if (cronSecret) {
    return {
      configured: true,
      source: "CRON_SECRET",

      environmentVariableName:
        "CRON_SECRET",

      requestHeaderName:
        "X-Cron-Secret",

      secretLength:
        cronSecret.length,
    };
  }

  return {
    configured: false,
    source: "NOT_CONFIGURED",

    environmentVariableName:
      "ATTENDANCE_AUTOMATION_SECRET",

    requestHeaderName:
      "X-Attendance-Automation-Secret",

    secretLength: 0,
  };
}

function getLockConfiguration(): LockConfiguration {
  const rawValue =
    process.env
      .ATTENDANCE_AUTOMATION_LOCK_LEASE_SECONDS
      ?.trim();

  if (!rawValue) {
    return {
      leaseSeconds:
        DEFAULT_LOCK_LEASE_SECONDS,

      source: "DEFAULT",
      valid: true,
    };
  }

  const parsed = Number(rawValue);

  if (
    !Number.isInteger(parsed) ||
    parsed <
      MINIMUM_LOCK_LEASE_SECONDS ||
    parsed >
      MAXIMUM_LOCK_LEASE_SECONDS
  ) {
    return {
      leaseSeconds:
        DEFAULT_LOCK_LEASE_SECONDS,

      source: "ENVIRONMENT",
      valid: false,
    };
  }

  return {
    leaseSeconds: parsed,
    source: "ENVIRONMENT",
    valid: true,
  };
}

function buildWarnings(input: {
  secret: SecretConfiguration;
  applicationBaseUrl: string;
  environment: AttendanceAutomationConfigurationData["environment"];
  scheduleInvalidVariables: string[];
  lock: LockConfiguration;
}): AttendanceAutomationConfigurationWarning[] {
  const warnings: AttendanceAutomationConfigurationWarning[] =
    [];

  if (!input.secret.configured) {
    warnings.push({
      code: "SECRET_NOT_CONFIGURED",

      title:
        "Automation secret is missing",

      message:
        "Configure ATTENDANCE_AUTOMATION_SECRET or CRON_SECRET before allowing an external scheduler to call the protected endpoints.",
    });
  }

  if (
    input.applicationBaseUrl.startsWith(
      "http://localhost",
    ) &&
    input.environment === "production"
  ) {
    warnings.push({
      code: "LOCAL_BASE_URL",

      title:
        "Production URL is still local",

      message:
        "NEXT_PUBLIC_APP_URL should use the deployed HTTPS domain before configuring the production scheduler.",
    });
  }

  if (!input.lock.valid) {
    warnings.push({
      code: "INVALID_LOCK_LEASE",

      title:
        "Invalid lock lease configuration",

      message:
        "ATTENDANCE_AUTOMATION_LOCK_LEASE_SECONDS must be an integer from 60 through 3600. The application is using the 900-second fallback.",
    });
  }

  if (
    input.scheduleInvalidVariables.length >
    0
  ) {
    warnings.push({
      code:
        "INVALID_SCHEDULE_CONFIGURATION",

      title:
        "Invalid scheduler configuration",

      message:
        `Safe defaults are being used for: ${input.scheduleInvalidVariables.join(", ")}.`,
    });
  }

  return warnings;
}

export function getAttendanceAutomationConfigurationData(): AttendanceAutomationConfigurationData {
  const environment = getEnvironment();

  const applicationBaseUrl =
    normalizeApplicationUrl(
      process.env.NEXT_PUBLIC_APP_URL,
    );

  const secret =
    getSecretConfiguration();

  const schedule =
    getAttendanceAutomationScheduleConfiguration();

  const lock =
    getLockConfiguration();

  const automationEndpointUrl =
    `${applicationBaseUrl}/api/automation/attendance/approved-leave-excused`;

  const healthEndpointUrl =
    `${applicationBaseUrl}/api/automation/attendance/health`;

  const warnings = buildWarnings({
    secret,
    applicationBaseUrl,
    environment,

    scheduleInvalidVariables:
      schedule.invalidVariables,

    lock,
  });

  return {
    environment,

    applicationBaseUrl,

    usesLocalBaseUrl:
      applicationBaseUrl.startsWith(
        "http://localhost",
      ),

    automationEndpointUrl,
    healthEndpointUrl,

    secret,

    schedule: {
      timeZone:
        schedule.timeZone,

      expectedHour:
        schedule.expectedHour,

      expectedMinute:
        schedule.expectedMinute,

      graceMinutes:
        schedule.graceMinutes,

      scheduleLabel:
        schedule.scheduleLabel,

      source:
        schedule.source,

      invalidVariables:
        schedule.invalidVariables,
    },

    lock: {
      leaseSeconds:
        lock.leaseSeconds,

      leaseMinutes:
        Number(
          (
            lock.leaseSeconds / 60
          ).toFixed(1),
        ),

      source: lock.source,
      valid: lock.valid,
    },

    recommendedDateRangeDays:
      RECOMMENDED_DATE_RANGE_DAYS,

    maximumRecordsPerRun:
      MAXIMUM_RECORDS_PER_RUN,

    warnings,
  };
}