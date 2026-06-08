export type AttendanceAutomationReadinessStatus =
  | "READY"
  | "READY_WITH_WARNINGS"
  | "BLOCKED";

export type AttendanceAutomationReadinessCheckStatus =
  | "PASS"
  | "WARNING"
  | "FAIL";

export type AttendanceAutomationReadinessCheckCode =
  | "AUTOMATION_SECRET"
  | "APPLICATION_URL"
  | "SCHEDULE_CONFIGURATION"
  | "LOCK_TIMEOUT_CONFIGURATION"
  | "MYSQL_NAMED_LOCK"
  | "PRODUCTION_LOCK"
  | "AUTOMATION_HEALTH"
  | "SCHEDULER_COMPLIANCE"
  | "RECENT_FAILURES"
  | "QUEUE_DRIVER"
  | "REDIS_CONFIGURATION"
  | "PORT_CONFIGURATION";

export type AttendanceAutomationReadinessCheck = {
  code: AttendanceAutomationReadinessCheckCode;

  status:
    AttendanceAutomationReadinessCheckStatus;

  title: string;
  message: string;

  details: string[];
};

export type AttendanceAutomationReadinessData = {
  overallStatus:
    AttendanceAutomationReadinessStatus;

  overallLabel: string;
  overallDescription: string;

  checkedAt: string;
  checkedAtIso: string;

  environment:
    | "development"
    | "production"
    | "test";

  summary: {
    totalChecks: number;
    passedChecks: number;
    warningChecks: number;
    failedChecks: number;
  };

  checks:
    AttendanceAutomationReadinessCheck[];

  signals: {
    applicationBaseUrl: string;

    secretConfigured: boolean;

    healthStatus: string;
    schedulerStatus: string;

    mysqlDiagnosticStatus: string;
    productionLockStatus: string;

    queueDriver: string;
    redisConfigured: boolean;

    port: number;
  };
};