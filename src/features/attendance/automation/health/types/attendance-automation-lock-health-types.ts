export type AttendanceAutomationLockHealthStatus =
  | "AVAILABLE"
  | "RUNNING"
  | "UNAVAILABLE";

export type AttendanceAutomationLockHealthData = {
  status:
    AttendanceAutomationLockHealthStatus;

  active: boolean;

  lockName: string;

  source: "MYSQL_NAMED_LOCK";
  distributed: true;

  statusLabel: string;
  statusDescription: string;

  ownerConnectionId: number | null;

  /*
   * MySQL named locks do not expose acquisition
   * timestamps or a fixed expiration timestamp.
   * These fields remain for API compatibility.
   */
  acquiredAt: null;
  acquiredAtIso: null;

  expiresAt: null;
  expiresAtIso: null;

  retryAfterSeconds: number | null;
};