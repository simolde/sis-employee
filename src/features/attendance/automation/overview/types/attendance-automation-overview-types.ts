import type {
  AttendanceAutomationAlertItem,
  AttendanceAutomationAlertOverallStatus,
} from "../../alerts/types/attendance-automation-alert-types";
import type {
  AttendanceAutomationHealthStatus,
  AttendanceAutomationScheduleComplianceStatus,
} from "../../health/types/attendance-automation-health-types";
import type { AttendanceAutomationLockHealthStatus } from "../../health/types/attendance-automation-lock-health-types";

export type AttendanceAutomationOverviewData = {
  generatedAt: string;

  overallStatus:
    AttendanceAutomationAlertOverallStatus;

  overallLabel: string;
  overallDescription: string;

  healthStatus:
    AttendanceAutomationHealthStatus;

  scheduleStatus:
    AttendanceAutomationScheduleComplianceStatus;

  lockStatus:
    AttendanceAutomationLockHealthStatus;

  secretConfigured: boolean;

  summary: {
    totalAlerts: number;
    criticalAlerts: number;
    warningAlerts: number;
    informationalAlerts: number;

    totalRuns: number;
    failuresLast24Hours: number;
    successRate: number;
  };

  latestRunId: number | null;
  latestFailedRunId: number | null;

  topAlerts: AttendanceAutomationAlertItem[];
};