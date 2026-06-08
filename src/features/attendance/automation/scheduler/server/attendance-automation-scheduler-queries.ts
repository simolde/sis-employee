import { getAttendanceAutomationConfigurationData } from "@/features/attendance/automation/configuration/server/attendance-automation-configuration-queries";
import type {
  AttendanceAutomationSchedulerData,
  AttendanceAutomationSchedulerTask,
  AttendanceAutomationSchedulerTaskKind,
} from "../types/attendance-automation-scheduler-types";

const MINUTES_PER_DAY = 24 * 60;
const MANILA_UTC_OFFSET_MINUTES = 8 * 60;

const HEALTH_CHECK_BUFFER_MINUTES = 5;

const HOSTINGER_PRIVATE_DIRECTORY =
  "/home/ACCOUNT_USERNAME/private/starland-attendance";

const AUTOMATION_SCRIPT_FILE_NAME =
  "hostinger-attendance-automation-cron.sh";

const HEALTH_SCRIPT_FILE_NAME =
  "hostinger-attendance-health-cron.sh";

function normalizeDailyMinutes(
  value: number,
): number {
  return (
    ((value % MINUTES_PER_DAY) +
      MINUTES_PER_DAY) %
    MINUTES_PER_DAY
  );
}

function splitDailyMinutes(
  value: number,
): {
  hour: number;
  minute: number;
} {
  const normalized =
    normalizeDailyMinutes(value);

  return {
    hour: Math.floor(normalized / 60),
    minute: normalized % 60,
  };
}

function convertManilaMinutesToUtc(
  manilaMinutes: number,
): {
  hour: number;
  minute: number;
} {
  return splitDailyMinutes(
    manilaMinutes -
      MANILA_UTC_OFFSET_MINUTES,
  );
}

function formatTwoDigits(
  value: number,
): string {
  return String(value).padStart(2, "0");
}

function format24HourTime(
  hour: number,
  minute: number,
): string {
  return `${formatTwoDigits(hour)}:${formatTwoDigits(minute)}`;
}

function format12HourTime(
  hour: number,
  minute: number,
): string {
  const normalizedHour =
    normalizeDailyMinutes(hour * 60) / 60;

  const wholeHour =
    Math.floor(normalizedHour);

  const displayHour =
    wholeHour % 12 || 12;

  const period =
    wholeHour < 12 ? "AM" : "PM";

  return `${displayHour}:${formatTwoDigits(minute)} ${period}`;
}

function buildCronExpression(
  hour: number,
  minute: number,
): string {
  return `${minute} ${hour} * * *`;
}

function buildSchedulerTask(input: {
  kind: AttendanceAutomationSchedulerTaskKind;

  title: string;
  description: string;

  scriptFileName: string;

  manilaMinutes: number;
}): AttendanceAutomationSchedulerTask {
  const manilaTime =
    splitDailyMinutes(
      input.manilaMinutes,
    );

  const utcTime =
    convertManilaMinutesToUtc(
      input.manilaMinutes,
    );

  const hostingerScriptPathExample =
    `${HOSTINGER_PRIVATE_DIRECTORY}/${input.scriptFileName}`;

  return {
    kind: input.kind,

    title: input.title,
    description: input.description,

    scriptFileName:
      input.scriptFileName,

    projectScriptPath:
      `scripts/${input.scriptFileName}`,

    hostingerScriptPathExample,

    manilaHour:
      manilaTime.hour,

    manilaMinute:
      manilaTime.minute,

    manilaTimeLabel:
      `${format12HourTime(
        manilaTime.hour,
        manilaTime.minute,
      )} Asia/Manila`,

    utcHour:
      utcTime.hour,

    utcMinute:
      utcTime.minute,

    utcTimeLabel:
      `${format24HourTime(
        utcTime.hour,
        utcTime.minute,
      )} UTC`,

    cronExpression:
      buildCronExpression(
        utcTime.hour,
        utcTime.minute,
      ),

    cronCommandExample:
      `/bin/sh ${hostingerScriptPathExample}`,
  };
}

export function getAttendanceAutomationSchedulerData(): AttendanceAutomationSchedulerData {
  const configuration =
    getAttendanceAutomationConfigurationData();

  const expectedManilaMinutes =
    configuration.schedule.expectedHour *
      60 +
    configuration.schedule.expectedMinute;

  const healthCheckManilaMinutes =
    expectedManilaMinutes +
    configuration.schedule.graceMinutes +
    HEALTH_CHECK_BUFFER_MINUTES;

  const automationTask =
    buildSchedulerTask({
      kind: "AUTOMATION",

      title:
        "Run Approved-Leave Automation",

      description:
        "Calls the protected approved-leave endpoint once per day at the configured attendance automation time.",

      scriptFileName:
        AUTOMATION_SCRIPT_FILE_NAME,

      manilaMinutes:
        expectedManilaMinutes,
    });

  const healthTask =
    buildSchedulerTask({
      kind: "HEALTH",

      title:
        "Check Automation Health",

      description:
        "Runs shortly after the scheduler grace deadline and records warning or failure output in the Hostinger cron logs.",

      scriptFileName:
        HEALTH_SCRIPT_FILE_NAME,

      manilaMinutes:
        healthCheckManilaMinutes,
    });

  const privateEnvironmentPathExample =
    `${HOSTINGER_PRIVATE_DIRECTORY}/.attendance-automation-cron.env`;

  const environmentTemplate = [
    `ATTENDANCE_AUTOMATION_BASE_URL="${configuration.applicationBaseUrl}"`,
    'ATTENDANCE_AUTOMATION_SECRET="replace-with-the-same-64-character-secret"',
    'ATTENDANCE_AUTOMATION_LIMIT="100"',
    'ATTENDANCE_AUTOMATION_HEALTH_MODE="strict"',
  ].join("\n");

  const warnings: string[] = [];

  if (!configuration.secret.configured) {
    warnings.push(
      "The attendance automation secret is not configured.",
    );
  }

  if (configuration.usesLocalBaseUrl) {
    warnings.push(
      "The application base URL still points to localhost. Replace it with the deployed HTTPS domain before enabling Hostinger cron jobs.",
    );
  }

  if (
    configuration.schedule.invalidVariables
      .length > 0
  ) {
    warnings.push(
      `Invalid scheduler variables are using fallback values: ${configuration.schedule.invalidVariables.join(", ")}.`,
    );
  }

  return {
    applicationBaseUrl:
      configuration.applicationBaseUrl,

    usesLocalBaseUrl:
      configuration.usesLocalBaseUrl,

    secretConfigured:
      configuration.secret.configured,

    secretSource:
      configuration.secret.source,

    timeZone: "Asia/Manila",
    hostingerTimeZone: "UTC",

    expectedHour:
      configuration.schedule.expectedHour,

    expectedMinute:
      configuration.schedule.expectedMinute,

    graceMinutes:
      configuration.schedule.graceMinutes,

    healthCheckBufferMinutes:
      HEALTH_CHECK_BUFFER_MINUTES,

    automationTask,
    healthTask,

    privateEnvironmentPathExample,
    environmentTemplate,

    warnings,
  };
}