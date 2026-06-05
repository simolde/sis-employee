import type {
  AttendanceAutomationScheduleCompliance,
  AttendanceAutomationScheduleComplianceStatus,
  AttendanceAutomationScheduleConfiguration,
} from "../types/attendance-automation-health-types";

const DEFAULT_EXPECTED_HOUR = 2;
const DEFAULT_EXPECTED_MINUTE = 0;
const DEFAULT_GRACE_MINUTES = 120;

const MINUTES_PER_HOUR = 60;
const MILLISECONDS_PER_MINUTE = 60 * 1000;

type ScheduleEnvironmentVariable =
  | "ATTENDANCE_AUTOMATION_EXPECTED_HOUR"
  | "ATTENDANCE_AUTOMATION_EXPECTED_MINUTE"
  | "ATTENDANCE_AUTOMATION_GRACE_MINUTES";

type BuildComplianceInput = {
  now: Date;
  latestApiRunAt: Date | null;
  configuration: AttendanceAutomationScheduleConfiguration;
};

function readIntegerEnvironmentValue(input: {
  name: ScheduleEnvironmentVariable;
  fallback: number;
  minimum: number;
  maximum: number;
  invalidVariables: string[];
}): number {
  const rawValue = process.env[input.name]?.trim();

  if (!rawValue) {
    return input.fallback;
  }

  const parsed = Number(rawValue);

  if (
    !Number.isInteger(parsed) ||
    parsed < input.minimum ||
    parsed > input.maximum
  ) {
    input.invalidVariables.push(input.name);

    return input.fallback;
  }

  return parsed;
}

function hasScheduleEnvironmentConfiguration(): boolean {
  return Boolean(
    process.env.ATTENDANCE_AUTOMATION_EXPECTED_HOUR?.trim() ||
      process.env.ATTENDANCE_AUTOMATION_EXPECTED_MINUTE?.trim() ||
      process.env.ATTENDANCE_AUTOMATION_GRACE_MINUTES?.trim(),
  );
}

function formatScheduleTime(
  hour: number,
  minute: number,
): string {
  const period = hour >= 12 ? "PM" : "AM";

  const displayHour = hour % 12 || 12;

  return `${displayHour}:${String(minute).padStart(2, "0")} ${period}`;
}

function getManilaDateParts(date: Date): {
  year: string;
  month: string;
  day: string;
} {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  return {
    year:
      parts.find((part) => part.type === "year")
        ?.value ?? "",

    month:
      parts.find((part) => part.type === "month")
        ?.value ?? "",

    day:
      parts.find((part) => part.type === "day")
        ?.value ?? "",
  };
}

function buildManilaScheduleDate(input: {
  now: Date;
  hour: number;
  minute: number;
}): Date {
  const dateParts = getManilaDateParts(input.now);

  const hour = String(input.hour).padStart(
    2,
    "0",
  );

  const minute = String(input.minute).padStart(
    2,
    "0",
  );

  return new Date(
    `${dateParts.year}-${dateParts.month}-${dateParts.day}T${hour}:${minute}:00+08:00`,
  );
}

function formatDateTime(value: Date): string {
  return new Intl.DateTimeFormat("en-PH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "Asia/Manila",
  }).format(value);
}

function differenceInMinutes(
  laterDate: Date,
  earlierDate: Date,
): number {
  return Math.max(
    0,
    Math.ceil(
      (laterDate.getTime() -
        earlierDate.getTime()) /
        MILLISECONDS_PER_MINUTE,
    ),
  );
}

function getComplianceCopy(
  status: AttendanceAutomationScheduleComplianceStatus,
): {
  label: string;
  description: string;
} {
  switch (status) {
    case "ON_SCHEDULE":
      return {
        label: "On Schedule",
        description:
          "An API/system automation run was recorded within today's expected schedule and grace period.",
      };

    case "NOT_DUE":
      return {
        label: "Not Due Yet",
        description:
          "Today's scheduled API/system execution time has not arrived.",
      };

    case "GRACE_PERIOD":
      return {
        label: "Within Grace Period",
        description:
          "The expected execution time has passed, but the configured grace period has not expired.",
      };

    case "LATE_COMPLETED":
      return {
        label: "Completed Late",
        description:
          "Today's API/system automation completed after the configured grace deadline.",
      };

    case "OVERDUE":
      return {
        label: "Overdue",
        description:
          "No API/system automation run was recorded for today's schedule before the grace deadline.",
      };

    case "NO_API_RUNS":
      return {
        label: "No API Runs",
        description:
          "No API/system automation run exists in the monitoring history, and today's grace deadline has passed.",
      };
  }
}

export function getAttendanceAutomationScheduleConfiguration(): AttendanceAutomationScheduleConfiguration {
  const invalidVariables: string[] = [];

  const expectedHour =
    readIntegerEnvironmentValue({
      name: "ATTENDANCE_AUTOMATION_EXPECTED_HOUR",
      fallback: DEFAULT_EXPECTED_HOUR,
      minimum: 0,
      maximum: 23,
      invalidVariables,
    });

  const expectedMinute =
    readIntegerEnvironmentValue({
      name: "ATTENDANCE_AUTOMATION_EXPECTED_MINUTE",
      fallback: DEFAULT_EXPECTED_MINUTE,
      minimum: 0,
      maximum: 59,
      invalidVariables,
    });

  const graceMinutes =
    readIntegerEnvironmentValue({
      name: "ATTENDANCE_AUTOMATION_GRACE_MINUTES",
      fallback: DEFAULT_GRACE_MINUTES,
      minimum: 0,
      maximum: 24 * MINUTES_PER_HOUR,
      invalidVariables,
    });

  return {
    timeZone: "Asia/Manila",
    expectedHour,
    expectedMinute,
    graceMinutes,

    source: hasScheduleEnvironmentConfiguration()
      ? "ENVIRONMENT"
      : "DEFAULTS",

    scheduleLabel: `${formatScheduleTime(
      expectedHour,
      expectedMinute,
    )} Asia/Manila`,

    invalidVariables,
  };
}

export function getAttendanceAutomationScheduleCompliance({
  now,
  latestApiRunAt,
  configuration,
}: BuildComplianceInput): AttendanceAutomationScheduleCompliance {
  const expectedRunAt =
    buildManilaScheduleDate({
      now,
      hour: configuration.expectedHour,
      minute: configuration.expectedMinute,
    });

  const graceDeadline = new Date(
    expectedRunAt.getTime() +
      configuration.graceMinutes *
        MILLISECONDS_PER_MINUTE,
  );

  const hasApiRunForCurrentWindow = Boolean(
    latestApiRunAt &&
      latestApiRunAt.getTime() >=
        expectedRunAt.getTime(),
  );

  let status: AttendanceAutomationScheduleComplianceStatus;

  if (hasApiRunForCurrentWindow && latestApiRunAt) {
    status =
      latestApiRunAt.getTime() <=
      graceDeadline.getTime()
        ? "ON_SCHEDULE"
        : "LATE_COMPLETED";
  } else if (
    now.getTime() <
    expectedRunAt.getTime()
  ) {
    status = "NOT_DUE";
  } else if (
    now.getTime() <=
    graceDeadline.getTime()
  ) {
    status = "GRACE_PERIOD";
  } else if (!latestApiRunAt) {
    status = "NO_API_RUNS";
  } else {
    status = "OVERDUE";
  }

  const copy = getComplianceCopy(status);

  return {
    status,
    statusLabel: copy.label,
    statusDescription: copy.description,

    expectedRunAt:
      formatDateTime(expectedRunAt),

    expectedRunAtIso:
      expectedRunAt.toISOString(),

    graceDeadline:
      formatDateTime(graceDeadline),

    graceDeadlineIso:
      graceDeadline.toISOString(),

    latestApiRunAt: latestApiRunAt
      ? formatDateTime(latestApiRunAt)
      : null,

    latestApiRunAtIso:
      latestApiRunAt?.toISOString() ?? null,

    hasApiRunForCurrentWindow,

    minutesUntilExpectedRun:
      now.getTime() <
      expectedRunAt.getTime()
        ? differenceInMinutes(
            expectedRunAt,
            now,
          )
        : null,

    minutesUntilGraceDeadline:
      now.getTime() >=
        expectedRunAt.getTime() &&
      now.getTime() <
        graceDeadline.getTime()
        ? differenceInMinutes(
            graceDeadline,
            now,
          )
        : null,

    minutesLate:
      status === "LATE_COMPLETED" &&
      latestApiRunAt
        ? differenceInMinutes(
            latestApiRunAt,
            graceDeadline,
          )
        : null,

    minutesOverdue:
      status === "OVERDUE" ||
      status === "NO_API_RUNS"
        ? differenceInMinutes(
            now,
            graceDeadline,
          )
        : null,
  };
}