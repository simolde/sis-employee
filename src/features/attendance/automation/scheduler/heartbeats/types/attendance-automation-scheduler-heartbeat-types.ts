export const ATTENDANCE_AUTOMATION_SCHEDULER_HEARTBEAT_ACTION =
  "ATTENDANCE_AUTOMATION_SCHEDULER_HEARTBEAT";

export const ATTENDANCE_AUTOMATION_SCHEDULER_HEARTBEAT_ENTITY_TYPE =
  "attendance_automation_scheduler_heartbeat";

export type AttendanceAutomationSchedulerHeartbeatTask =
  | "AUTOMATION"
  | "HEALTH";

export type AttendanceAutomationSchedulerHeartbeatOutcome =
  | "SUCCESS"
  | "ATTENTION"
  | "SKIPPED"
  | "FAILED";

export type AttendanceAutomationSchedulerHeartbeatSource =
  "HOSTINGER_CRON";

export type AttendanceAutomationSchedulerHeartbeatState =
  | "HEALTHY"
  | "ATTENTION"
  | "MISSING";

export type AttendanceAutomationSchedulerHeartbeatRecord = {
  activityLogId: number;
  receiptKey: string;

  task:
    AttendanceAutomationSchedulerHeartbeatTask;

  outcome:
    AttendanceAutomationSchedulerHeartbeatOutcome;

  source:
    AttendanceAutomationSchedulerHeartbeatSource;

  httpStatus: number | null;

  startedAt: string;
  startedAtIso: string;

  finishedAt: string;
  finishedAtIso: string;

  durationMs: number;
  durationLabel: string;

  message: string | null;

  createdAt: string;
  createdAtIso: string;
};

export type AttendanceAutomationSchedulerTaskHeartbeatStatus = {
  task:
    AttendanceAutomationSchedulerHeartbeatTask;

  state:
    AttendanceAutomationSchedulerHeartbeatState;

  stateLabel: string;
  stateDescription: string;

  expectedAt: string;
  expectedAtIso: string;

  latestReceipt:
    AttendanceAutomationSchedulerHeartbeatRecord | null;
};

export type AttendanceAutomationSchedulerHeartbeatData = {
  overallState:
    AttendanceAutomationSchedulerHeartbeatState;

  overallLabel: string;
  overallDescription: string;

  generatedAt: string;
  generatedAtIso: string;

  monitoringWindowDays: number;

  taskStatus: {
    automation:
      AttendanceAutomationSchedulerTaskHeartbeatStatus;

    health:
      AttendanceAutomationSchedulerTaskHeartbeatStatus;
  };

  summary: {
    totalReceipts: number;
    successfulReceipts: number;
    attentionReceipts: number;
    skippedReceipts: number;
    failedReceipts: number;

    automationReceipts: number;
    healthReceipts: number;
  };

  recentReceipts:
    AttendanceAutomationSchedulerHeartbeatRecord[];
};