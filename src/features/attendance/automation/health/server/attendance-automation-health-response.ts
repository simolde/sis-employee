import { getAttendanceAutomationHealthData } from "./attendance-automation-health-queries";
import type { AttendanceAutomationHealthApiResponse } from "../types/attendance-automation-health-api-types";
import type { AttendanceAutomationHealthStatus } from "../types/attendance-automation-health-types";

export function getAttendanceAutomationHealthHttpStatus(
  status: AttendanceAutomationHealthStatus,
): number {
  switch (status) {
    case "HEALTHY":
      return 200;

    case "DEGRADED":
    case "STALE":
    case "NO_RUNS":
    case "NOT_CONFIGURED":
      return 503;
  }
}

export async function buildAttendanceAutomationHealthApiResponse(): Promise<AttendanceAutomationHealthApiResponse> {
  const health =
    await getAttendanceAutomationHealthData();

  return {
    ok: health.status === "HEALTHY",

    checkedAt:
      new Date().toISOString(),

    status:
      health.status,

    message:
      health.statusDescription,

    data: {
      secretConfigured:
        health.secretConfigured,

      monitoringWindowDays:
        health.monitoringWindowDays,

      isPartial:
        health.isPartial,

      scheduleConfiguration:
        health.scheduleConfiguration,

      scheduleCompliance:
        health.scheduleCompliance,

      summary:
        health.summary,

      latestRun:
        health.latestRun,

      latestApiRun:
        health.latestApiRun,

      latestCompletedRun:
        health.latestCompletedRun,

      latestFailedRun:
        health.latestFailedRun,
    },
  };
}