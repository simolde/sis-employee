import type {
  AttendanceAutomationHealthData,
  AttendanceAutomationHealthRun,
  AttendanceAutomationHealthStatus,
} from "./attendance-automation-health-types";

export type AttendanceAutomationHealthApiData = {
  secretConfigured: boolean;
  monitoringWindowDays: number;
  isPartial: boolean;

  scheduleConfiguration:
    AttendanceAutomationHealthData["scheduleConfiguration"];

  scheduleCompliance:
    AttendanceAutomationHealthData["scheduleCompliance"];

  summary:
    AttendanceAutomationHealthData["summary"];

  latestRun:
    AttendanceAutomationHealthRun | null;

  latestApiRun:
    AttendanceAutomationHealthRun | null;

  latestCompletedRun:
    AttendanceAutomationHealthRun | null;

  latestFailedRun:
    AttendanceAutomationHealthRun | null;
};

export type AttendanceAutomationHealthApiResponse = {
  ok: boolean;
  checkedAt: string;
  status: AttendanceAutomationHealthStatus;
  message: string;
  data: AttendanceAutomationHealthApiData;
};