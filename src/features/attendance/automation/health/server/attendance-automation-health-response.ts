import { getAttendanceAutomationHealthData } from "./attendance-automation-health-queries";
import { getAttendanceAutomationLockHealthData } from "./attendance-automation-lock-health";
import type { AttendanceAutomationHealthApiResponse } from "../types/attendance-automation-health-api-types";
import type { AttendanceAutomationHealthStatus } from "../types/attendance-automation-health-types";

export type AttendanceAutomationHealthMode =
  | "strict"
  | "operational";

export function normalizeAttendanceAutomationHealthMode(
  value: string | null,
): AttendanceAutomationHealthMode {
  return value === "operational"
    ? "operational"
    : "strict";
}

export function getAttendanceAutomationHealthHttpStatus(
  status: AttendanceAutomationHealthStatus,
  mode: AttendanceAutomationHealthMode = "strict",
): number {
  if (mode === "operational") {
    switch (status) {
      case "HEALTHY":
      case "DEGRADED":
        return 200;

      case "STALE":
      case "NO_RUNS":
      case "NOT_CONFIGURED":
        return 503;
    }
  }

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

export async function buildAttendanceAutomationHealthApiResponse(
  mode: AttendanceAutomationHealthMode = "strict",
): Promise<AttendanceAutomationHealthApiResponse> {
  const [health, lock] =
    await Promise.all([
      getAttendanceAutomationHealthData(),
      getAttendanceAutomationLockHealthData(),
    ]);

  const strictOk =
    health.status === "HEALTHY";

  const operationalOk =
    health.status === "HEALTHY" ||
    health.status === "DEGRADED";

  return {
    ok:
      mode === "operational"
        ? operationalOk
        : strictOk,

    checkedAt:
      new Date().toISOString(),

    status:
      health.status,

    message:
      mode === "operational" &&
      health.status === "DEGRADED"
        ? `${health.statusDescription} Operational mode treats this as warning-level because the endpoint is configured and automation history is available.`
        : health.statusDescription,

    data: {
      secretConfigured:
        health.secretConfigured,

      monitoringWindowDays:
        health.monitoringWindowDays,

      isPartial:
        health.isPartial,

      lock,

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