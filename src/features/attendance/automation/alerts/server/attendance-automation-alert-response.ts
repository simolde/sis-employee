import { getAttendanceAutomationAlertCenterData } from "./attendance-automation-alert-queries";
import type {
  AttendanceAutomationAlertApiResponse,
} from "../types/attendance-automation-alert-api-types";
import type {
  AttendanceAutomationAlertOverallStatus,
} from "../types/attendance-automation-alert-types";

export function getAttendanceAutomationAlertHttpStatus(
  status: AttendanceAutomationAlertOverallStatus,
): number {
  return status === "CRITICAL"
    ? 503
    : 200;
}

export async function buildAttendanceAutomationAlertApiResponse(): Promise<AttendanceAutomationAlertApiResponse> {
  const alertCenter =
    await getAttendanceAutomationAlertCenterData();

  return {
    ok:
      alertCenter.overallStatus !==
      "CRITICAL",

    requiresAttention:
      alertCenter.overallStatus !==
      "HEALTHY",

    checkedAt:
      new Date().toISOString(),

    status:
      alertCenter.overallStatus,

    message:
      alertCenter.overallDescription,

    data: {
      generatedAt:
        alertCenter.generatedAt,

      summary:
        alertCenter.summary,

      signals:
        alertCenter.signals,

      alerts:
        alertCenter.alerts,
    },
  };
}