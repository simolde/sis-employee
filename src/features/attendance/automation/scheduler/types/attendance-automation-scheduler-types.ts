export type AttendanceAutomationSchedulerTaskKind =
  | "AUTOMATION"
  | "HEALTH";

export type AttendanceAutomationSchedulerTask = {
  kind: AttendanceAutomationSchedulerTaskKind;

  title: string;
  description: string;

  scriptFileName: string;
  projectScriptPath: string;
  hostingerScriptPathExample: string;

  manilaHour: number;
  manilaMinute: number;
  manilaTimeLabel: string;

  utcHour: number;
  utcMinute: number;
  utcTimeLabel: string;

  cronExpression: string;
  cronCommandExample: string;
};

export type AttendanceAutomationSchedulerData = {
  applicationBaseUrl: string;
  usesLocalBaseUrl: boolean;

  secretConfigured: boolean;
  secretSource: string;

  timeZone: "Asia/Manila";
  hostingerTimeZone: "UTC";

  expectedHour: number;
  expectedMinute: number;
  graceMinutes: number;

  healthCheckBufferMinutes: number;

  automationTask: AttendanceAutomationSchedulerTask;
  healthTask: AttendanceAutomationSchedulerTask;

  privateEnvironmentPathExample: string;
  environmentTemplate: string;

  warnings: string[];
};