import type {
  AttendanceAutomationAlertSeverity,
} from "../../../types/attendance-automation-alert-types";
import type {
  AttendanceAutomationAlertIncidentSlaThreshold,
} from "../types/attendance-automation-alert-incident-sla-types";

const CRITICAL_HOURS_VARIABLE =
  "ATTENDANCE_AUTOMATION_INCIDENT_SLA_CRITICAL_HOURS";

const WARNING_HOURS_VARIABLE =
  "ATTENDANCE_AUTOMATION_INCIDENT_SLA_WARNING_HOURS";

const INFORMATIONAL_HOURS_VARIABLE =
  "ATTENDANCE_AUTOMATION_INCIDENT_SLA_INFO_HOURS";

const WARNING_PERCENT_VARIABLE =
  "ATTENDANCE_AUTOMATION_INCIDENT_SLA_WARNING_PERCENT";

const DEFAULT_CRITICAL_HOURS = 2;
const DEFAULT_WARNING_HOURS = 8;
const DEFAULT_INFORMATIONAL_HOURS = 24;

const DEFAULT_WARNING_PERCENT = 75;

const MINIMUM_TARGET_HOURS = 0.25;
const MAXIMUM_TARGET_HOURS = 720;

const MINIMUM_WARNING_PERCENT = 1;
const MAXIMUM_WARNING_PERCENT = 99;

export type AttendanceAutomationAlertIncidentSlaConfiguration = {
  critical:
    AttendanceAutomationAlertIncidentSlaThreshold;

  warning:
    AttendanceAutomationAlertIncidentSlaThreshold;

  informational:
    AttendanceAutomationAlertIncidentSlaThreshold;

  warningPercent: {
    variableName:
      typeof WARNING_PERCENT_VARIABLE;

    rawValue: string | null;

    value: number;

    source:
      | "ENVIRONMENT"
      | "DEFAULT";

    valid: boolean;
  };
};

function parseTargetHours(input: {
  severity:
    AttendanceAutomationAlertSeverity;

  variableName: string;

  defaultValue: number;
}): AttendanceAutomationAlertIncidentSlaThreshold {
  const rawValue =
    process.env[
      input.variableName
    ]?.trim() || null;

  if (!rawValue) {
    return {
      severity:
        input.severity,

      targetHours:
        input.defaultValue,

      source:
        "DEFAULT",

      valid: true,

      variableName:
        input.variableName,

      rawValue: null,
    };
  }

  const parsed =
    Number(rawValue);

  if (
    !Number.isFinite(parsed) ||
    parsed <
      MINIMUM_TARGET_HOURS ||
    parsed >
      MAXIMUM_TARGET_HOURS
  ) {
    return {
      severity:
        input.severity,

      targetHours:
        input.defaultValue,

      source:
        "DEFAULT",

      valid: false,

      variableName:
        input.variableName,

      rawValue,
    };
  }

  return {
    severity:
      input.severity,

    targetHours:
      Number(
        parsed.toFixed(2),
      ),

    source:
      "ENVIRONMENT",

    valid: true,

    variableName:
      input.variableName,

    rawValue,
  };
}

function parseWarningPercent(): AttendanceAutomationAlertIncidentSlaConfiguration["warningPercent"] {
  const rawValue =
    process.env[
      WARNING_PERCENT_VARIABLE
    ]?.trim() || null;

  if (!rawValue) {
    return {
      variableName:
        WARNING_PERCENT_VARIABLE,

      rawValue: null,

      value:
        DEFAULT_WARNING_PERCENT,

      source:
        "DEFAULT",

      valid: true,
    };
  }

  const parsed =
    Number(rawValue);

  if (
    !Number.isFinite(parsed) ||
    parsed <
      MINIMUM_WARNING_PERCENT ||
    parsed >
      MAXIMUM_WARNING_PERCENT
  ) {
    return {
      variableName:
        WARNING_PERCENT_VARIABLE,

      rawValue,

      value:
        DEFAULT_WARNING_PERCENT,

      source:
        "DEFAULT",

      valid: false,
    };
  }

  return {
    variableName:
      WARNING_PERCENT_VARIABLE,

    rawValue,

    value:
      Number(
        parsed.toFixed(2),
      ),

    source:
      "ENVIRONMENT",

    valid: true,
  };
}

export function getAttendanceAutomationAlertIncidentSlaConfiguration(): AttendanceAutomationAlertIncidentSlaConfiguration {
  return {
    critical:
      parseTargetHours({
        severity:
          "CRITICAL",

        variableName:
          CRITICAL_HOURS_VARIABLE,

        defaultValue:
          DEFAULT_CRITICAL_HOURS,
      }),

    warning:
      parseTargetHours({
        severity:
          "WARNING",

        variableName:
          WARNING_HOURS_VARIABLE,

        defaultValue:
          DEFAULT_WARNING_HOURS,
      }),

    informational:
      parseTargetHours({
        severity:
          "INFO",

        variableName:
          INFORMATIONAL_HOURS_VARIABLE,

        defaultValue:
          DEFAULT_INFORMATIONAL_HOURS,
      }),

    warningPercent:
      parseWarningPercent(),
  };
}