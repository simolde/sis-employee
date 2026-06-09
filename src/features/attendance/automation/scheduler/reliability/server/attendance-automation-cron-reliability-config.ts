const MONITORING_STARTED_ON_VARIABLE =
  "ATTENDANCE_AUTOMATION_CRON_MONITORING_STARTED_ON";

const SLO_TARGET_PERCENT_VARIABLE =
  "ATTENDANCE_AUTOMATION_CRON_SLO_TARGET_PERCENT";

const DEFAULT_SLO_TARGET_PERCENT = 95;

const MINIMUM_SLO_TARGET_PERCENT = 50;
const MAXIMUM_SLO_TARGET_PERCENT = 100;

const ISO_DATE_PATTERN =
  /^\d{4}-\d{2}-\d{2}$/;

export type AttendanceAutomationCronReliabilityConfiguration = {
  monitoringStartedOn: {
    variableName:
      typeof MONITORING_STARTED_ON_VARIABLE;

    rawValue: string | null;
    value: string | null;

    configured: boolean;
    valid: boolean;
  };

  targetPercent: {
    variableName:
      typeof SLO_TARGET_PERCENT_VARIABLE;

    rawValue: string | null;
    value: number;

    source:
      | "ENVIRONMENT"
      | "DEFAULT";

    valid: boolean;
  };
};

function isValidIsoDate(
  value: string,
): boolean {
  if (!ISO_DATE_PATTERN.test(value)) {
    return false;
  }

  const [
    year,
    month,
    day,
  ] = value
    .split("-")
    .map(Number);

  const parsed =
    new Date(
      Date.UTC(
        year,
        month - 1,
        day,
      ),
    );

  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() ===
      month - 1 &&
    parsed.getUTCDate() === day
  );
}

function getMonitoringStartedOnConfiguration(): AttendanceAutomationCronReliabilityConfiguration["monitoringStartedOn"] {
  const rawValue =
    process.env[
      MONITORING_STARTED_ON_VARIABLE
    ]?.trim() || null;

  if (!rawValue) {
    return {
      variableName:
        MONITORING_STARTED_ON_VARIABLE,

      rawValue: null,
      value: null,

      configured: false,
      valid: true,
    };
  }

  if (!isValidIsoDate(rawValue)) {
    return {
      variableName:
        MONITORING_STARTED_ON_VARIABLE,

      rawValue,
      value: null,

      configured: true,
      valid: false,
    };
  }

  return {
    variableName:
      MONITORING_STARTED_ON_VARIABLE,

    rawValue,
    value: rawValue,

    configured: true,
    valid: true,
  };
}

function getTargetPercentConfiguration(): AttendanceAutomationCronReliabilityConfiguration["targetPercent"] {
  const rawValue =
    process.env[
      SLO_TARGET_PERCENT_VARIABLE
    ]?.trim() || null;

  if (!rawValue) {
    return {
      variableName:
        SLO_TARGET_PERCENT_VARIABLE,

      rawValue: null,

      value:
        DEFAULT_SLO_TARGET_PERCENT,

      source: "DEFAULT",
      valid: true,
    };
  }

  const parsed =
    Number(rawValue);

  if (
    !Number.isFinite(parsed) ||
    parsed <
      MINIMUM_SLO_TARGET_PERCENT ||
    parsed >
      MAXIMUM_SLO_TARGET_PERCENT
  ) {
    return {
      variableName:
        SLO_TARGET_PERCENT_VARIABLE,

      rawValue,

      value:
        DEFAULT_SLO_TARGET_PERCENT,

      source: "DEFAULT",
      valid: false,
    };
  }

  return {
    variableName:
      SLO_TARGET_PERCENT_VARIABLE,

    rawValue,

    value:
      Number(
        parsed.toFixed(2),
      ),

    source: "ENVIRONMENT",
    valid: true,
  };
}

export function getAttendanceAutomationCronReliabilityConfiguration(): AttendanceAutomationCronReliabilityConfiguration {
  return {
    monitoringStartedOn:
      getMonitoringStartedOnConfiguration(),

    targetPercent:
      getTargetPercentConfiguration(),
  };
}