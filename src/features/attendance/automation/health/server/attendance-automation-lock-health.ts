import {
  APPROVED_LEAVE_EXCUSED_AUTOMATION_LOCK_NAME,
  getAttendanceAutomationLockState,
} from "@/features/attendance/automation/server/attendance-automation-lock";
import type { AttendanceAutomationLockHealthData } from "../types/attendance-automation-lock-health-types";

export async function getAttendanceAutomationLockHealthData(): Promise<AttendanceAutomationLockHealthData> {
  try {
    const lockState =
      await getAttendanceAutomationLockState();

    if (!lockState.active) {
      return {
        status: "AVAILABLE",
        active: false,

        lockName:
          lockState.lockName,

        source:
          "MYSQL_NAMED_LOCK",

        distributed: true,

        statusLabel:
          "Available",

        statusDescription:
          "No application instance currently holds the MySQL attendance automation lock.",

        ownerConnectionId: null,

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

      source:
        "MYSQL_NAMED_LOCK",

      distributed: true,

      statusLabel:
        "Automation Running",

      statusDescription:
        "A Node.js application instance currently holds the shared MySQL automation lock. Other dashboard, API, or retry executions will receive HTTP 409.",

      ownerConnectionId:
        lockState.ownerConnectionId,

      acquiredAt: null,
      acquiredAtIso: null,

      expiresAt: null,
      expiresAtIso: null,

      retryAfterSeconds:
        lockState.retryAfterSeconds,
    };
  } catch (error) {
    console.error(
      "Unable to read MySQL attendance automation lock health:",
      error,
    );

    return {
      status: "UNAVAILABLE",
      active: false,

      lockName:
        APPROVED_LEAVE_EXCUSED_AUTOMATION_LOCK_NAME,

      source:
        "MYSQL_NAMED_LOCK",

      distributed: true,

      statusLabel:
        "Lock Check Unavailable",

      statusDescription:
        "The application could not verify the shared MySQL automation lock. Review the database connection and MySQL named-lock support.",

      ownerConnectionId: null,

      acquiredAt: null,
      acquiredAtIso: null,

      expiresAt: null,
      expiresAtIso: null,

      retryAfterSeconds: null,
    };
  }
}