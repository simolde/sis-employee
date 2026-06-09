import type {
  AttendanceAutomationSchedulerHeartbeatOutcome,
} from "../../heartbeats/types/attendance-automation-scheduler-heartbeat-types";

export type AttendanceAutomationCronReliabilityStatus =
  | "HEALTHY"
  | "AT_RISK"
  | "BREACHED"
  | "WARMING_UP"
  | "DISABLED";

export type AttendanceAutomationCronReliabilityDayState =
  | "HEALTHY"
  | "WARNING"
  | "CRITICAL"
  | "PENDING"
  | "NOT_MONITORED";

export type AttendanceAutomationCronReliabilityTaskState =
  | "HEALTHY"
  | "WARNING"
  | "CRITICAL"
  | "PENDING";

export type AttendanceAutomationCronReliabilityWindowDays =
  | 7
  | 30
  | 90;

export type AttendanceAutomationCronReliabilityStartDateSource =
  | "ENVIRONMENT"
  | "EARLIEST_V2_RECEIPT"
  | "TODAY_FALLBACK";

export type AttendanceAutomationCronReliabilityWindow = {
  days:
    AttendanceAutomationCronReliabilityWindowDays;

  label: string;

  status:
    AttendanceAutomationCronReliabilityStatus;

  dateFrom: string;
  dateTo: string;

  monitoredDays: number;
  dueDays: number;
  pendingDays: number;

  healthyDays: number;
  warningDays: number;
  criticalDays: number;

  automationCoverageRate: number;
  healthCoverageRate: number;

  automationSuccessRate: number;
  healthSuccessRate: number;

  automationOnTimeRate: number;
  healthOnTimeRate: number;

  healthyDayRate: number;
};

export type AttendanceAutomationCronReliabilityDay = {
  date: string;
  dateLabel: string;

  state:
    AttendanceAutomationCronReliabilityDayState;

  automationState:
    AttendanceAutomationCronReliabilityTaskState;

  healthState:
    AttendanceAutomationCronReliabilityTaskState;

  automationReceiptId: number | null;
  healthReceiptId: number | null;

  automationOutcome:
    AttendanceAutomationSchedulerHeartbeatOutcome | null;

  healthOutcome:
    AttendanceAutomationSchedulerHeartbeatOutcome | null;

  automationExpectedAt: string;
  healthExpectedAt: string;
};

export type AttendanceAutomationCronReliabilityData = {
  overallStatus:
    AttendanceAutomationCronReliabilityStatus;

  overallLabel: string;
  overallDescription: string;

  generatedAt: string;
  generatedAtIso: string;

  monitoring: {
    enabled: boolean;
    valid: boolean;

    variableName: string;

    normalizedValue:
      | "true"
      | "false";
  };

  configuration: {
    monitoringStartedOnConfigured: boolean;
    monitoringStartedOnValid: boolean;

    configuredMonitoringStartedOn:
      string | null;

    effectiveMonitoringStartedOn: string;

    effectiveMonitoringStartedOnSource:
      AttendanceAutomationCronReliabilityStartDateSource;

    targetPercent: number;
    targetPercentValid: boolean;

    pendingToleranceMinutes: number;
  };

  windows: {
    last7Days:
      AttendanceAutomationCronReliabilityWindow;

    last30Days:
      AttendanceAutomationCronReliabilityWindow;

    last90Days:
      AttendanceAutomationCronReliabilityWindow;
  };

  streaks: {
    currentHealthyStreak: number;
    longestHealthyStreak: number;

    latestCriticalDate: string | null;
    latestCriticalDateLabel: string | null;
  };

  recentDays:
    AttendanceAutomationCronReliabilityDay[];

  issues: string[];

  metadata: {
    source:
      "V2_ACTIVITY_LOGS";

    reportPartial: boolean;
    scannedReceipts: number;
  };
};