export const ATTENDANCE_AUTOMATION_CRON_ENABLED_VARIABLE =
  "ATTENDANCE_AUTOMATION_CRON_ENABLED";

export type AttendanceAutomationCronProvider =
  "HOSTINGER";

export type AttendanceAutomationSchedulerMonitoringSource =
  | "ENVIRONMENT"
  | "DEFAULT";

export type AttendanceAutomationSchedulerMonitoringConfiguration = {
  enabled: boolean;
  valid: boolean;

  provider:
    AttendanceAutomationCronProvider;

  source:
    AttendanceAutomationSchedulerMonitoringSource;

  variableName:
    typeof ATTENDANCE_AUTOMATION_CRON_ENABLED_VARIABLE;

  rawValue: string | null;

  normalizedValue:
    | "true"
    | "false";

  statusLabel: string;
  statusDescription: string;
};

const ENABLED_VALUES = new Set([
  "1",
  "true",
  "yes",
  "on",
]);

const DISABLED_VALUES = new Set([
  "0",
  "false",
  "no",
  "off",
]);

function getStatusCopy(input: {
  enabled: boolean;
  valid: boolean;
  source:
    AttendanceAutomationSchedulerMonitoringSource;
}): {
  label: string;
  description: string;
} {
  if (!input.valid) {
    return {
      label:
        "Invalid Monitoring Configuration",

      description:
        "The cron-monitoring environment value is invalid. Monitoring remains disabled until the value is corrected.",
    };
  }

  if (input.enabled) {
    return {
      label:
        "Hostinger Cron Monitoring Enabled",

      description:
        "The application expects daily automation and health receipts from the configured Hostinger cron jobs.",
    };
  }

  if (input.source === "DEFAULT") {
    return {
      label:
        "Hostinger Cron Monitoring Disabled by Default",

      description:
        "Cron receipt monitoring has not been enabled. Missing receipt alerts will not be generated.",
    };
  }

  return {
    label:
      "Hostinger Cron Monitoring Disabled",

    description:
      "Cron execution receipts may still be recorded, but missing receipts will not create automation alerts.",
  };
}

export function getAttendanceAutomationSchedulerMonitoringConfiguration(): AttendanceAutomationSchedulerMonitoringConfiguration {
  const rawEnvironmentValue =
    process.env[
      ATTENDANCE_AUTOMATION_CRON_ENABLED_VARIABLE
    ];

  const rawValue =
    rawEnvironmentValue?.trim() || null;

  if (!rawValue) {
    const statusCopy =
      getStatusCopy({
        enabled: false,
        valid: true,
        source: "DEFAULT",
      });

    return {
      enabled: false,
      valid: true,

      provider: "HOSTINGER",
      source: "DEFAULT",

      variableName:
        ATTENDANCE_AUTOMATION_CRON_ENABLED_VARIABLE,

      rawValue: null,
      normalizedValue: "false",

      statusLabel:
        statusCopy.label,

      statusDescription:
        statusCopy.description,
    };
  }

  const normalized =
    rawValue.toLowerCase();

  if (ENABLED_VALUES.has(normalized)) {
    const statusCopy =
      getStatusCopy({
        enabled: true,
        valid: true,
        source: "ENVIRONMENT",
      });

    return {
      enabled: true,
      valid: true,

      provider: "HOSTINGER",
      source: "ENVIRONMENT",

      variableName:
        ATTENDANCE_AUTOMATION_CRON_ENABLED_VARIABLE,

      rawValue,
      normalizedValue: "true",

      statusLabel:
        statusCopy.label,

      statusDescription:
        statusCopy.description,
    };
  }

  if (DISABLED_VALUES.has(normalized)) {
    const statusCopy =
      getStatusCopy({
        enabled: false,
        valid: true,
        source: "ENVIRONMENT",
      });

    return {
      enabled: false,
      valid: true,

      provider: "HOSTINGER",
      source: "ENVIRONMENT",

      variableName:
        ATTENDANCE_AUTOMATION_CRON_ENABLED_VARIABLE,

      rawValue,
      normalizedValue: "false",

      statusLabel:
        statusCopy.label,

      statusDescription:
        statusCopy.description,
    };
  }

  const statusCopy =
    getStatusCopy({
      enabled: false,
      valid: false,
      source: "ENVIRONMENT",
    });

  return {
    enabled: false,
    valid: false,

    provider: "HOSTINGER",
    source: "ENVIRONMENT",

    variableName:
      ATTENDANCE_AUTOMATION_CRON_ENABLED_VARIABLE,

    rawValue,
    normalizedValue: "false",

    statusLabel:
      statusCopy.label,

    statusDescription:
      statusCopy.description,
  };
}