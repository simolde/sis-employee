export type AttendanceAutomationLockDiagnosticStatus =
  | "PASS"
  | "WARNING"
  | "FAIL";

export type AttendanceAutomationProductionLockDiagnostic = {
  status:
    | "AVAILABLE"
    | "RUNNING"
    | "UNAVAILABLE";

  active: boolean;

  lockName: string;

  ownerConnectionId: number | null;

  source:
    | "MYSQL_NAMED_LOCK"
    | "UNKNOWN";

  distributed: boolean;

  retryAfterSeconds: number | null;
};

export type AttendanceAutomationLockDiagnosticData = {
  overallStatus:
    AttendanceAutomationLockDiagnosticStatus;

  statusLabel: string;
  statusDescription: string;

  checkedAt: string;
  checkedAtIso: string;

  diagnosticLockName: string;

  database: {
    serverVersion: string;
    databaseName: string | null;
    diagnosticConnectionId: number | null;
  };

  capability: {
    getLockSupported: boolean;

    lockAcquired: boolean;
    ownerDetected: boolean;
    ownerMatchedConnection: boolean;

    lockReleased: boolean;
    lockFreeAfterRelease: boolean;
  };

  timing: {
    acquireDurationMs: number;
    releaseDurationMs: number;
    totalDurationMs: number;
  };

  productionLock:
    AttendanceAutomationProductionLockDiagnostic;

  issues: string[];
};