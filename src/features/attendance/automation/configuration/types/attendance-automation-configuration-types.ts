export type AttendanceAutomationSecretSource =
  | "ATTENDANCE_AUTOMATION_SECRET"
  | "CRON_SECRET"
  | "NOT_CONFIGURED";

export type AttendanceAutomationConfigurationWarning = {
  code:
    | "SECRET_NOT_CONFIGURED"
    | "LOCAL_BASE_URL"
    | "INVALID_LOCK_LEASE"
    | "INVALID_SCHEDULE_CONFIGURATION";

  title: string;
  message: string;
};

export type AttendanceAutomationConfigurationData = {
  environment: "development" | "production" | "test";

  applicationBaseUrl: string;
  usesLocalBaseUrl: boolean;

  automationEndpointUrl: string;
  healthEndpointUrl: string;

  secret: {
    configured: boolean;
    source: AttendanceAutomationSecretSource;
    environmentVariableName: string;
    requestHeaderName:
      | "X-Attendance-Automation-Secret"
      | "X-Cron-Secret";
    secretLength: number;
  };

  schedule: {
    timeZone: "Asia/Manila";
    expectedHour: number;
    expectedMinute: number;
    graceMinutes: number;
    scheduleLabel: string;
    source: "DEFAULTS" | "ENVIRONMENT";
    invalidVariables: string[];
  };

  lock: {
    leaseSeconds: number;
    leaseMinutes: number;
    source: "DEFAULT" | "ENVIRONMENT";
    valid: boolean;
  };

  recommendedDateRangeDays: number;
  maximumRecordsPerRun: number;

  warnings: AttendanceAutomationConfigurationWarning[];
};