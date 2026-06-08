import { getAttendanceAutomationAlertCenterData } from "@/features/attendance/automation/alerts/server/attendance-automation-alert-queries";
import type { AttendanceAutomationOverviewData } from "../types/attendance-automation-overview-types";

const MAXIMUM_OVERVIEW_ALERTS = 4;

export async function getAttendanceAutomationOverviewData(): Promise<AttendanceAutomationOverviewData> {
  const alertCenter =
    await getAttendanceAutomationAlertCenterData();

  return {
    generatedAt:
      alertCenter.generatedAt,

    overallStatus:
      alertCenter.overallStatus,

    overallLabel:
      alertCenter.overallLabel,

    overallDescription:
      alertCenter.overallDescription,

    healthStatus:
      alertCenter.signals.healthStatus,

    scheduleStatus:
      alertCenter.signals.scheduleStatus,

    lockStatus:
      alertCenter.signals.lockStatus,

    secretConfigured:
      alertCenter.signals.secretConfigured,

    summary: {
      totalAlerts:
        alertCenter.summary.totalAlerts,

      criticalAlerts:
        alertCenter.summary.criticalAlerts,

      warningAlerts:
        alertCenter.summary.warningAlerts,

      informationalAlerts:
        alertCenter.summary.informationalAlerts,

      totalRuns:
        alertCenter.signals.totalRuns,

      failuresLast24Hours:
        alertCenter.signals
          .failuresLast24Hours,

      successRate:
        alertCenter.signals.successRate,
    },

    latestRunId:
      alertCenter.signals.latestRunId,

    latestFailedRunId:
      alertCenter.signals.latestFailedRunId,

    topAlerts:
      alertCenter.alerts.slice(
        0,
        MAXIMUM_OVERVIEW_ALERTS,
      ),
  };
}