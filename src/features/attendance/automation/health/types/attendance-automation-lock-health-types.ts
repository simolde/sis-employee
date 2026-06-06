export type AttendanceAutomationLockHealthStatus =
  | "AVAILABLE"
  | "RUNNING";

export type AttendanceAutomationLockHealthData = {
  status: AttendanceAutomationLockHealthStatus;
  active: boolean;

  lockName: string;

  statusLabel: string;
  statusDescription: string;

  acquiredAt: string | null;
  acquiredAtIso: string | null;

  expiresAt: string | null;
  expiresAtIso: string | null;

  retryAfterSeconds: number | null;
};