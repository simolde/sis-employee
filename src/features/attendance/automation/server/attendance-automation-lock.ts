import { randomUUID } from "node:crypto";

const DEFAULT_LOCK_LEASE_SECONDS = 15 * 60;
const MINIMUM_LOCK_LEASE_SECONDS = 60;
const MAXIMUM_LOCK_LEASE_SECONDS = 60 * 60;

export const APPROVED_LEAVE_EXCUSED_AUTOMATION_LOCK_NAME =
  "approved-leave-excused-automation";

export type AttendanceAutomationLockHandle = {
  lockName: string;
  ownerToken: string;
  acquiredAt: Date;
  expiresAt: Date;
};

export type AttendanceAutomationLockBusyState = {
  lockName: string;
  acquiredAt: Date;
  expiresAt: Date;
  retryAfterSeconds: number;
};

export type AttendanceAutomationLockResult =
  | {
      acquired: true;
      handle: AttendanceAutomationLockHandle;
    }
  | {
      acquired: false;
      busy: AttendanceAutomationLockBusyState;
    };

type AttendanceAutomationLockEntry = {
  ownerToken: string;
  acquiredAt: Date;
  expiresAt: Date;
};

declare global {
  var starlandAttendanceAutomationLocks:
    | Map<string, AttendanceAutomationLockEntry>
    | undefined;
}

function getLockStore(): Map<
  string,
  AttendanceAutomationLockEntry
> {
  if (
    !globalThis.starlandAttendanceAutomationLocks
  ) {
    globalThis.starlandAttendanceAutomationLocks =
      new Map<
        string,
        AttendanceAutomationLockEntry
      >();
  }

  return globalThis.starlandAttendanceAutomationLocks;
}

function getConfiguredLeaseSeconds(): number {
  const rawValue =
    process.env
      .ATTENDANCE_AUTOMATION_LOCK_LEASE_SECONDS;

  if (!rawValue?.trim()) {
    return DEFAULT_LOCK_LEASE_SECONDS;
  }

  const parsed = Number(rawValue);

  if (
    !Number.isInteger(parsed) ||
    parsed < MINIMUM_LOCK_LEASE_SECONDS ||
    parsed > MAXIMUM_LOCK_LEASE_SECONDS
  ) {
    return DEFAULT_LOCK_LEASE_SECONDS;
  }

  return parsed;
}

function getRetryAfterSeconds(
  expiresAt: Date,
  now: Date,
): number {
  return Math.max(
    1,
    Math.ceil(
      (expiresAt.getTime() - now.getTime()) /
        1000,
    ),
  );
}

function removeExpiredLock(
  lockName: string,
  now: Date,
): void {
  const store = getLockStore();
  const currentLock = store.get(lockName);

  if (
    currentLock &&
    currentLock.expiresAt.getTime() <=
      now.getTime()
  ) {
    store.delete(lockName);
  }
}

export function acquireAttendanceAutomationLock(
  lockName: string,
): AttendanceAutomationLockResult {
  const now = new Date();

  removeExpiredLock(lockName, now);

  const store = getLockStore();
  const currentLock = store.get(lockName);

  if (currentLock) {
    return {
      acquired: false,
      busy: {
        lockName,
        acquiredAt:
          currentLock.acquiredAt,
        expiresAt:
          currentLock.expiresAt,
        retryAfterSeconds:
          getRetryAfterSeconds(
            currentLock.expiresAt,
            now,
          ),
      },
    };
  }

  const leaseSeconds =
    getConfiguredLeaseSeconds();

  const handle: AttendanceAutomationLockHandle =
    {
      lockName,
      ownerToken: randomUUID(),
      acquiredAt: now,
      expiresAt: new Date(
        now.getTime() +
          leaseSeconds * 1000,
      ),
    };

  store.set(lockName, {
    ownerToken: handle.ownerToken,
    acquiredAt: handle.acquiredAt,
    expiresAt: handle.expiresAt,
  });

  return {
    acquired: true,
    handle,
  };
}

export function releaseAttendanceAutomationLock(
  handle: AttendanceAutomationLockHandle,
): boolean {
  const store = getLockStore();

  const currentLock = store.get(
    handle.lockName,
  );

  if (
    !currentLock ||
    currentLock.ownerToken !==
      handle.ownerToken
  ) {
    return false;
  }

  store.delete(handle.lockName);

  return true;
}

export function getAttendanceAutomationLockState(
  lockName: string,
): AttendanceAutomationLockBusyState | null {
  const now = new Date();

  removeExpiredLock(lockName, now);

  const currentLock =
    getLockStore().get(lockName);

  if (!currentLock) {
    return null;
  }

  return {
    lockName,
    acquiredAt:
      currentLock.acquiredAt,
    expiresAt:
      currentLock.expiresAt,
    retryAfterSeconds:
      getRetryAfterSeconds(
        currentLock.expiresAt,
        now,
      ),
  };
}