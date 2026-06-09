import { getAttendanceAutomationSchedulerMonitoringConfiguration } from "@/features/attendance/automation/scheduler/server/attendance-automation-scheduler-monitoring-config";
import {
  getAttendanceAutomationCronReceiptReportData,
} from "@/features/attendance/automation/scheduler/heartbeats/report/server/attendance-automation-cron-receipt-report-queries";
import type {
  AttendanceAutomationCronReceiptDailyRow,
  AttendanceAutomationCronReceiptTaskResult,
} from "@/features/attendance/automation/scheduler/heartbeats/report/types/attendance-automation-cron-receipt-report-types";
import { getAttendanceAutomationCronReliabilityConfiguration } from "./attendance-automation-cron-reliability-config";
import type {
  AttendanceAutomationCronReliabilityData,
  AttendanceAutomationCronReliabilityDay,
  AttendanceAutomationCronReliabilityDayState,
  AttendanceAutomationCronReliabilityStartDateSource,
  AttendanceAutomationCronReliabilityStatus,
  AttendanceAutomationCronReliabilityTaskState,
  AttendanceAutomationCronReliabilityWindow,
  AttendanceAutomationCronReliabilityWindowDays,
} from "../types/attendance-automation-cron-reliability-types";

const PENDING_TOLERANCE_MINUTES = 15;

const MILLISECONDS_PER_MINUTE =
  60 * 1000;

const RECENT_DAY_LIMIT = 14;

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

function getManilaDateInput(
  value: Date,
): string {
  const parts =
    new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone: "Asia/Manila",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      },
    ).formatToParts(value);

  const year =
    parts.find(
      (part) =>
        part.type === "year",
    )?.value ?? "";

  const month =
    parts.find(
      (part) =>
        part.type === "month",
    )?.value ?? "";

  const day =
    parts.find(
      (part) =>
        part.type === "day",
    )?.value ?? "";

  return `${year}-${month}-${day}`;
}

function addDaysToDateInput(
  value: string,
  days: number,
): string {
  const [
    year,
    month,
    day,
  ] = value
    .split("-")
    .map(Number);

  const target =
    new Date(
      Date.UTC(
        year,
        month - 1,
        day + days,
      ),
    );

  return [
    target.getUTCFullYear(),
    String(
      target.getUTCMonth() + 1,
    ).padStart(2, "0"),
    String(
      target.getUTCDate(),
    ).padStart(2, "0"),
  ].join("-");
}

function formatDateLabel(
  dateInput: string,
): string {
  return new Intl.DateTimeFormat(
    "en-PH",
    {
      year: "numeric",
      month: "long",
      day: "2-digit",
      weekday: "short",
      timeZone: "Asia/Manila",
    },
  ).format(
    new Date(
      `${dateInput}T12:00:00+08:00`,
    ),
  );
}

function calculateRate(
  count: number,
  total: number,
): number {
  if (total <= 0) {
    return 0;
  }

  return Number(
    (
      (count / total) *
      100
    ).toFixed(2),
  );
}

function classifyTask(input: {
  result:
    AttendanceAutomationCronReceiptTaskResult;

  now: Date;
}): AttendanceAutomationCronReliabilityTaskState {
  const result =
    input.result;

  if (
    result.receiptActivityLogId ===
    null
  ) {
    const expectedAt =
      new Date(
        result.expectedAtIso,
      );

    const pendingUntil =
      expectedAt.getTime() +
      PENDING_TOLERANCE_MINUTES *
        MILLISECONDS_PER_MINUTE;

    return input.now.getTime() <
      pendingUntil
      ? "PENDING"
      : "CRITICAL";
  }

  if (result.outcome === "FAILED") {
    return "CRITICAL";
  }

  if (
    result.outcome === "SUCCESS" &&
    result.timeliness === "ON_TIME"
  ) {
    return "HEALTHY";
  }

  return "WARNING";
}

function classifyDay(input: {
  monitored: boolean;

  automation:
    AttendanceAutomationCronReliabilityTaskState;

  health:
    AttendanceAutomationCronReliabilityTaskState;
}): AttendanceAutomationCronReliabilityDayState {
  if (!input.monitored) {
    return "NOT_MONITORED";
  }

  if (
    input.automation === "CRITICAL" ||
    input.health === "CRITICAL"
  ) {
    return "CRITICAL";
  }

  if (
    input.automation === "WARNING" ||
    input.health === "WARNING"
  ) {
    return "WARNING";
  }

  if (
    input.automation === "PENDING" ||
    input.health === "PENDING"
  ) {
    return "PENDING";
  }

  return "HEALTHY";
}

function evaluateDay(input: {
  row:
    AttendanceAutomationCronReceiptDailyRow;

  now: Date;

  effectiveMonitoringStartedOn:
    string;
}): AttendanceAutomationCronReliabilityDay {
  const monitored =
    input.row.date >=
    input.effectiveMonitoringStartedOn;

  const automationState =
    classifyTask({
      result:
        input.row.automation,

      now:
        input.now,
    });

  const healthState =
    classifyTask({
      result:
        input.row.health,

      now:
        input.now,
    });

  return {
    date:
      input.row.date,

    dateLabel:
      input.row.dateLabel,

    state:
      classifyDay({
        monitored,

        automation:
          automationState,

        health:
          healthState,
      }),

    automationState,
    healthState,

    automationReceiptId:
      input.row.automation
        .receiptActivityLogId,

    healthReceiptId:
      input.row.health
        .receiptActivityLogId,

    automationOutcome:
      input.row.automation.outcome,

    healthOutcome:
      input.row.health.outcome,

    automationExpectedAt:
      input.row.automation
        .expectedAt,

    healthExpectedAt:
      input.row.health.expectedAt,
  };
}

function getEarliestReceiptDate(
  rows:
    AttendanceAutomationCronReceiptDailyRow[],
): string | null {
  const receiptDates =
    rows
      .filter(
        (row) =>
          row.automation
            .receiptActivityLogId !==
            null ||
          row.health
            .receiptActivityLogId !==
            null,
      )
      .map(
        (row) =>
          row.date,
      )
      .sort();

  return receiptDates[0] ?? null;
}

function getWindowStatus(input: {
  monitoringEnabled: boolean;

  dueDays: number;

  targetPercent: number;

  healthyDayRate: number;

  automationCoverageRate: number;
  healthCoverageRate: number;
}): AttendanceAutomationCronReliabilityStatus {
  if (!input.monitoringEnabled) {
    return "DISABLED";
  }

  if (input.dueDays === 0) {
    return "WARMING_UP";
  }

  if (
    input.healthyDayRate >=
      input.targetPercent &&
    input.automationCoverageRate >=
      input.targetPercent &&
    input.healthCoverageRate >=
      input.targetPercent
  ) {
    return "HEALTHY";
  }

  const warningThreshold =
    Math.max(
      0,
      input.targetPercent - 10,
    );

  if (
    input.healthyDayRate >=
      warningThreshold &&
    input.automationCoverageRate >=
      warningThreshold &&
    input.healthCoverageRate >=
      warningThreshold
  ) {
    return "AT_RISK";
  }

  return "BREACHED";
}

function buildWindow(input: {
  days:
    AttendanceAutomationCronReliabilityWindowDays;

  label: string;

  today: string;

  monitoringEnabled: boolean;

  targetPercent: number;

  sourceRows:
    AttendanceAutomationCronReceiptDailyRow[];

  evaluatedDays:
    AttendanceAutomationCronReliabilityDay[];
}): AttendanceAutomationCronReliabilityWindow {
  const dateFrom =
    addDaysToDateInput(
      input.today,
      -(input.days - 1),
    );

  const dateTo =
    input.today;

  const sourceRows =
    input.sourceRows.filter(
      (row) =>
        row.date >= dateFrom &&
        row.date <= dateTo,
    );

  const evaluatedDays =
    input.evaluatedDays.filter(
      (day) =>
        day.date >= dateFrom &&
        day.date <= dateTo,
    );

  const monitoredDays =
    evaluatedDays.filter(
      (day) =>
        day.state !==
        "NOT_MONITORED",
    );

  const dueDays =
    monitoredDays.filter(
      (day) =>
        day.state !== "PENDING",
    );

  const pendingDays =
    monitoredDays.filter(
      (day) =>
        day.state === "PENDING",
    );

  const dueDateSet =
    new Set(
      dueDays.map(
        (day) =>
          day.date,
      ),
    );

  const dueSourceRows =
    sourceRows.filter(
      (row) =>
        dueDateSet.has(
          row.date,
        ),
    );

  const automationReceiptDays =
    dueSourceRows.filter(
      (row) =>
        row.automation
          .receiptActivityLogId !==
        null,
    ).length;

  const healthReceiptDays =
    dueSourceRows.filter(
      (row) =>
        row.health
          .receiptActivityLogId !==
        null,
    ).length;

  const automationSuccessfulDays =
    dueSourceRows.filter(
      (row) =>
        row.automation.outcome ===
        "SUCCESS",
    ).length;

  const healthSuccessfulDays =
    dueSourceRows.filter(
      (row) =>
        row.health.outcome ===
        "SUCCESS",
    ).length;

  const automationOnTimeDays =
    dueSourceRows.filter(
      (row) =>
        row.automation.timeliness ===
        "ON_TIME",
    ).length;

  const healthOnTimeDays =
    dueSourceRows.filter(
      (row) =>
        row.health.timeliness ===
        "ON_TIME",
    ).length;

  const healthyDays =
    dueDays.filter(
      (day) =>
        day.state === "HEALTHY",
    ).length;

  const warningDays =
    dueDays.filter(
      (day) =>
        day.state === "WARNING",
    ).length;

  const criticalDays =
    dueDays.filter(
      (day) =>
        day.state === "CRITICAL",
    ).length;

  const automationCoverageRate =
    calculateRate(
      automationReceiptDays,
      dueDays.length,
    );

  const healthCoverageRate =
    calculateRate(
      healthReceiptDays,
      dueDays.length,
    );

  const healthyDayRate =
    calculateRate(
      healthyDays,
      dueDays.length,
    );

  return {
    days:
      input.days,

    label:
      input.label,

    status:
      getWindowStatus({
        monitoringEnabled:
          input.monitoringEnabled,

        dueDays:
          dueDays.length,

        targetPercent:
          input.targetPercent,

        healthyDayRate,

        automationCoverageRate,
        healthCoverageRate,
      }),

    dateFrom,
    dateTo,

    monitoredDays:
      monitoredDays.length,

    dueDays:
      dueDays.length,

    pendingDays:
      pendingDays.length,

    healthyDays,
    warningDays,
    criticalDays,

    automationCoverageRate,
    healthCoverageRate,

    automationSuccessRate:
      calculateRate(
        automationSuccessfulDays,
        dueDays.length,
      ),

    healthSuccessRate:
      calculateRate(
        healthSuccessfulDays,
        dueDays.length,
      ),

    automationOnTimeRate:
      calculateRate(
        automationOnTimeDays,
        dueDays.length,
      ),

    healthOnTimeRate:
      calculateRate(
        healthOnTimeDays,
        dueDays.length,
      ),

    healthyDayRate,
  };
}

function getCurrentHealthyStreak(
  days:
    AttendanceAutomationCronReliabilityDay[],
): number {
  const dueDays =
    days.filter(
      (day) =>
        day.state !==
          "NOT_MONITORED" &&
        day.state !== "PENDING",
    );

  let streak = 0;

  for (const day of dueDays) {
    if (day.state !== "HEALTHY") {
      break;
    }

    streak += 1;
  }

  return streak;
}

function getLongestHealthyStreak(
  days:
    AttendanceAutomationCronReliabilityDay[],
): number {
  const chronologicalDays =
    [...days]
      .filter(
        (day) =>
          day.state !==
            "NOT_MONITORED" &&
          day.state !== "PENDING",
      )
      .reverse();

  let current = 0;
  let longest = 0;

  for (
    const day of
    chronologicalDays
  ) {
    if (day.state === "HEALTHY") {
      current += 1;

      longest =
        Math.max(
          longest,
          current,
        );
    } else {
      current = 0;
    }
  }

  return longest;
}

function getOverallCopy(
  status:
    AttendanceAutomationCronReliabilityStatus,
): {
  label: string;
  description: string;
} {
  switch (status) {
    case "HEALTHY":
      return {
        label:
          "Cron Reliability Target Met",

        description:
          "Current Hostinger cron coverage, success, timing, and healthy-day performance meet the configured reliability target.",
      };

    case "AT_RISK":
      return {
        label:
          "Cron Reliability Is At Risk",

        description:
          "Cron monitoring is operating, but configuration or recent execution performance requires review.",
      };

    case "BREACHED":
      return {
        label:
          "Cron Reliability Target Breached",

        description:
          "Recent receipt coverage, execution success, or on-time performance is below the configured reliability target.",
      };

    case "WARMING_UP":
      return {
        label:
          "Cron Reliability Is Warming Up",

        description:
          "Monitoring is enabled, but no completed scheduling day is available for reliability evaluation yet.",
      };

    case "DISABLED":
      return {
        label:
          "Cron Reliability Monitoring Disabled",

        description:
          "Historical metrics remain available, but active Hostinger cron receipt monitoring is disabled.",
      };
  }
}

export async function getAttendanceAutomationCronReliabilityData(): Promise<AttendanceAutomationCronReliabilityData> {
  const generatedAt =
    new Date();

  const today =
    getManilaDateInput(
      generatedAt,
    );

  const [
    report,
    monitoring,
  ] = await Promise.all([
    getAttendanceAutomationCronReceiptReportData(
      {
        days: 90,
      },
    ),

    Promise.resolve(
      getAttendanceAutomationSchedulerMonitoringConfiguration(),
    ),
  ]);

  const reliabilityConfiguration =
    getAttendanceAutomationCronReliabilityConfiguration();

  const earliestReceiptDate =
    getEarliestReceiptDate(
      report.rows,
    );

  let effectiveMonitoringStartedOn =
    today;

  let effectiveMonitoringStartedOnSource:
    AttendanceAutomationCronReliabilityStartDateSource =
    "TODAY_FALLBACK";

  if (
    reliabilityConfiguration
      .monitoringStartedOn.valid &&
    reliabilityConfiguration
      .monitoringStartedOn.value
  ) {
    effectiveMonitoringStartedOn =
      reliabilityConfiguration
        .monitoringStartedOn.value;

    effectiveMonitoringStartedOnSource =
      "ENVIRONMENT";
  } else if (earliestReceiptDate) {
    effectiveMonitoringStartedOn =
      earliestReceiptDate;

    effectiveMonitoringStartedOnSource =
      "EARLIEST_V2_RECEIPT";
  }

  const evaluatedDays =
    report.rows.map(
      (row) =>
        evaluateDay({
          row,

          now:
            generatedAt,

          effectiveMonitoringStartedOn,
        }),
    );

  const last7Days =
    buildWindow({
      days: 7,
      label: "Last 7 Days",

      today,

      monitoringEnabled:
        monitoring.enabled,

      targetPercent:
        reliabilityConfiguration
          .targetPercent.value,

      sourceRows:
        report.rows,

      evaluatedDays,
    });

  const last30Days =
    buildWindow({
      days: 30,
      label: "Last 30 Days",

      today,

      monitoringEnabled:
        monitoring.enabled,

      targetPercent:
        reliabilityConfiguration
          .targetPercent.value,

      sourceRows:
        report.rows,

      evaluatedDays,
    });

  const last90Days =
    buildWindow({
      days: 90,
      label: "Last 90 Days",

      today,

      monitoringEnabled:
        monitoring.enabled,

      targetPercent:
        reliabilityConfiguration
          .targetPercent.value,

      sourceRows:
        report.rows,

      evaluatedDays,
    });

  const issues: string[] = [];

  if (!monitoring.valid) {
    issues.push(
      "ATTENDANCE_AUTOMATION_CRON_ENABLED contains an invalid value.",
    );
  }

  if (
    monitoring.enabled &&
    !reliabilityConfiguration
      .monitoringStartedOn.configured
  ) {
    issues.push(
      "ATTENDANCE_AUTOMATION_CRON_MONITORING_STARTED_ON is not configured. The earliest V2 receipt or today's date is being used.",
    );
  }

  if (
    !reliabilityConfiguration
      .monitoringStartedOn.valid
  ) {
    issues.push(
      "ATTENDANCE_AUTOMATION_CRON_MONITORING_STARTED_ON must use YYYY-MM-DD format.",
    );
  }

  if (
    !reliabilityConfiguration
      .targetPercent.valid
  ) {
    issues.push(
      "ATTENDANCE_AUTOMATION_CRON_SLO_TARGET_PERCENT must be a number from 50 through 100. The 95% fallback is being used.",
    );
  }

  if (report.metadata.isPartial) {
    issues.push(
      "The V2 receipt report reached its scan limit. Reliability metrics may be incomplete.",
    );
  }

  let overallStatus:
    AttendanceAutomationCronReliabilityStatus;

  if (!monitoring.enabled) {
    overallStatus = "DISABLED";
  } else if (
    !monitoring.valid ||
    !reliabilityConfiguration
      .monitoringStartedOn.valid ||
    !reliabilityConfiguration
      .monitoringStartedOn.configured ||
    !reliabilityConfiguration
      .targetPercent.valid
  ) {
    overallStatus = "AT_RISK";
  } else {
    overallStatus =
      last7Days.status;
  }

  const overallCopy =
    getOverallCopy(
      overallStatus,
    );

  const latestCriticalDay =
    evaluatedDays.find(
      (day) =>
        day.state === "CRITICAL",
    ) ?? null;

  return {
    overallStatus,

    overallLabel:
      overallCopy.label,

    overallDescription:
      overallCopy.description,

    generatedAt:
      formatDateTime(
        generatedAt,
      ),

    generatedAtIso:
      generatedAt.toISOString(),

    monitoring: {
      enabled:
        monitoring.enabled,

      valid:
        monitoring.valid,

      variableName:
        monitoring.variableName,

      normalizedValue:
        monitoring.normalizedValue,
    },

    configuration: {
      monitoringStartedOnConfigured:
        reliabilityConfiguration
          .monitoringStartedOn
          .configured,

      monitoringStartedOnValid:
        reliabilityConfiguration
          .monitoringStartedOn
          .valid,

      configuredMonitoringStartedOn:
        reliabilityConfiguration
          .monitoringStartedOn
          .value,

      effectiveMonitoringStartedOn,

      effectiveMonitoringStartedOnSource,

      targetPercent:
        reliabilityConfiguration
          .targetPercent.value,

      targetPercentValid:
        reliabilityConfiguration
          .targetPercent.valid,

      pendingToleranceMinutes:
        PENDING_TOLERANCE_MINUTES,
    },

    windows: {
      last7Days,
      last30Days,
      last90Days,
    },

    streaks: {
      currentHealthyStreak:
        getCurrentHealthyStreak(
          evaluatedDays,
        ),

      longestHealthyStreak:
        getLongestHealthyStreak(
          evaluatedDays,
        ),

      latestCriticalDate:
        latestCriticalDay?.date ??
        null,

      latestCriticalDateLabel:
        latestCriticalDay
          ? formatDateLabel(
              latestCriticalDay.date,
            )
          : null,
    },

    recentDays:
      evaluatedDays.slice(
        0,
        RECENT_DAY_LIMIT,
      ),

    issues,

    metadata: {
      source:
        "V2_ACTIVITY_LOGS",

      reportPartial:
        report.metadata.isPartial,

      scannedReceipts:
        report.metadata
          .scannedReceipts,
    },
  };
}