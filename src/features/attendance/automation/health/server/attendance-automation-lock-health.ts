import {
  APPROVED_LEAVE_EXCUSED_AUTOMATION_LOCK_NAME,
  getAttendanceAutomationLockState,
} from "@/features/attendance/automation/server/attendance-automation-lock";
import type { AttendanceAutomationLockHealthData } from "../types/attendance-automation-lock-health-types";

function formatDateTime(
  value: Date,
): string {
  return new Intl.DateTimeFormat("en-PH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "Asia/Manila",
  }).format(value);
}

export function getAttendanceAutomationLockHealthData(): AttendanceAutomationLockHealthData {
  const lockState =
    getAttendanceAutomationLockState(
      APPROVED_LEAVE_EXCUSED_AUTOMATION_LOCK_NAME,
    );

  if (!lockState) {
    return {
      status: "AVAILABLE",
      active: false,

      lockName:
        APPROVED_LEAVE_EXCUSED_AUTOMATION_LOCK_NAME,

      statusLabel:
        "Available",

      statusDescription:
        "No approved-leave automation execution currently holds the application lock.",

      acquiredAt: null,
      acquiredAtIso: null,

      expiresAt: null,
      expiresAtIso: null,

      retryAfterSeconds: null,
    };
  }

  return {
    status: "RUNNING",
    active: true,

    lockName:
      lockState.lockName,

    statusLabel:
      "Automation Running",

    statusDescription:
      "An approved-leave automation execution currently holds the application lock. Additional runs will receive HTTP 409 until the lock is released or expires.",

    acquiredAt:
      formatDateTime(
        lockState.acquiredAt,
      ),

    acquiredAtIso:
      lockState.acquiredAt.toISOString(),

    expiresAt:
      formatDateTime(
        lockState.expiresAt,
      ),

    expiresAtIso:
      lockState.expiresAt.toISOString(),

    retryAfterSeconds:
      lockState.retryAfterSeconds,
  };
}