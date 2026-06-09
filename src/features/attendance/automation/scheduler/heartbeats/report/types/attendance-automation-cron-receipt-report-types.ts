import type {
  AttendanceAutomationSchedulerHeartbeatOutcome,
  AttendanceAutomationSchedulerHeartbeatTask,
} from "../../types/attendance-automation-scheduler-heartbeat-types";

export type AttendanceAutomationCronReceiptReportDays =
  | 7
  | 14
  | 30
  | 60
  | 90;

export type AttendanceAutomationCronReceiptTimeliness =
  | "ON_TIME"
  | "EARLY"
  | "LATE"
  | "MISSING";

export type AttendanceAutomationCronReceiptDailyState =
  | "HEALTHY"
  | "WARNING"
  | "CRITICAL";

export type AttendanceAutomationCronReceiptTaskResult = {
  task:
    AttendanceAutomationSchedulerHeartbeatTask;

  expectedAt: string;
  expectedAtIso: string;

  timeliness:
    AttendanceAutomationCronReceiptTimeliness;

  delayMinutes: number | null;

  receiptActivityLogId: number | null;
  receiptKey: string | null;

  outcome:
    AttendanceAutomationSchedulerHeartbeatOutcome | null;

  httpStatus: number | null;

  startedAt: string | null;
  startedAtIso: string | null;

  finishedAt: string | null;
  finishedAtIso: string | null;

  durationMs: number | null;
  durationLabel: string | null;

  message: string | null;

  healthy: boolean;
};

export type AttendanceAutomationCronReceiptDailyRow = {
  date: string;
  dateLabel: string;

  state:
    AttendanceAutomationCronReceiptDailyState;

  automation:
    AttendanceAutomationCronReceiptTaskResult;

  health:
    AttendanceAutomationCronReceiptTaskResult;
};

export type AttendanceAutomationCronReceiptReportFilters = {
  days:
    AttendanceAutomationCronReceiptReportDays;
};

export type AttendanceAutomationCronReceiptReportData = {
  generatedAt: string;
  generatedAtIso: string;

  filters:
    AttendanceAutomationCronReceiptReportFilters;

  range: {
    dateFrom: string;
    dateTo: string;

    dateFromLabel: string;
    dateToLabel: string;
  };

  schedule: {
    timeZone: "Asia/Manila";

    automationTimeLabel: string;
    healthTimeLabel: string;

    graceMinutes: number;
    healthBufferMinutes: number;

    onTimeToleranceMinutes: number;
  };

  monitoring: {
    enabled: boolean;
    valid: boolean;

    normalizedValue:
      | "true"
      | "false";
  };

  summary: {
    totalDays: number;

    healthyDays: number;
    warningDays: number;
    criticalDays: number;

    automationReceiptDays: number;
    healthReceiptDays: number;

    automationSuccessfulDays: number;
    healthSuccessfulDays: number;

    automationCoverageRate: number;
    healthCoverageRate: number;

    automationSuccessRate: number;
    healthSuccessRate: number;

    averageAutomationDurationMs:
      number | null;

    averageHealthDurationMs:
      number | null;
  };

  rows:
    AttendanceAutomationCronReceiptDailyRow[];

  metadata: {
    source:
      "V2_ACTIVITY_LOGS";

    scannedReceipts: number;
    maximumScannedReceipts: number;

    isPartial: boolean;
  };
};