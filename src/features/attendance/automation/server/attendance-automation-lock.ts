import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";

const DEFAULT_LOCK_TIMEOUT_SECONDS = 15 * 60;
const MINIMUM_LOCK_TIMEOUT_SECONDS = 60;
const MAXIMUM_LOCK_TIMEOUT_SECONDS = 60 * 60;

const LOCK_TRANSACTION_MAX_WAIT_MS = 10_000;
const LOCK_RETRY_AFTER_SECONDS = 30;
const LOCK_ACQUISITION_WAIT_SECONDS = 0;

export const APPROVED_LEAVE_EXCUSED_AUTOMATION_LOCK_NAME =
  "starland.attendance.approved_leave_excused";

type RawNumericValue =
  | number
  | bigint
  | string
  | null;

type AcquireLockRow = {
  acquired: RawNumericValue;
};

type ReleaseLockRow = {
  released: RawNumericValue;
};

type ReleaseAllLocksRow = {
  releasedCount: RawNumericValue;
};

type UsedLockRow = {
  ownerConnectionId: RawNumericValue;
};

export type AttendanceAutomationLockState = {
  lockName: string;
  active: boolean;

  ownerConnectionId: number | null;

  retryAfterSeconds: number | null;

  source: "MYSQL_NAMED_LOCK";
  distributed: true;
};

export class AttendanceAutomationLockBusyError extends Error {
  readonly lockName: string;
  readonly ownerConnectionId: number | null;
  readonly retryAfterSeconds: number;

  constructor(input: {
    lockName: string;
    ownerConnectionId: number | null;
    retryAfterSeconds: number;
  }) {
    super(
      input.ownerConnectionId !== null
        ? `Attendance automation is already running on database connection #${input.ownerConnectionId}.`
        : "Attendance automation is already running.",
    );

    this.name =
      "AttendanceAutomationLockBusyError";

    this.lockName = input.lockName;

    this.ownerConnectionId =
      input.ownerConnectionId;

    this.retryAfterSeconds =
      input.retryAfterSeconds;
  }
}

export class AttendanceAutomationLockUnavailableError extends Error {
  readonly lockName: string;

  constructor(
    lockName: string,
    message: string,
    cause?: unknown,
  ) {
    super(message);

    this.name =
      "AttendanceAutomationLockUnavailableError";

    this.lockName = lockName;

    if (cause !== undefined) {
      (
        this as Error & {
          cause?: unknown;
        }
      ).cause = cause;
    }
  }
}

function normalizeRawInteger(
  value: RawNumericValue | undefined,
): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value)
      ? Math.trunc(value)
      : null;
  }

  if (typeof value === "bigint") {
    const converted = Number(value);

    return Number.isSafeInteger(converted)
      ? converted
      : null;
  }

  const converted = Number(value);

  return Number.isSafeInteger(converted)
    ? converted
    : null;
}

function getConfiguredLockTimeoutSeconds(): number {
  const rawValue =
    process.env
      .ATTENDANCE_AUTOMATION_LOCK_LEASE_SECONDS
      ?.trim();

  if (!rawValue) {
    return DEFAULT_LOCK_TIMEOUT_SECONDS;
  }

  const parsed = Number(rawValue);

  if (
    !Number.isInteger(parsed) ||
    parsed < MINIMUM_LOCK_TIMEOUT_SECONDS ||
    parsed > MAXIMUM_LOCK_TIMEOUT_SECONDS
  ) {
    return DEFAULT_LOCK_TIMEOUT_SECONDS;
  }

  return parsed;
}

async function getTransactionLockOwner(
  tx: Prisma.TransactionClient,
): Promise<number | null> {
  const rows =
    await tx.$queryRaw<UsedLockRow[]>`
      SELECT
        IS_USED_LOCK(
          ${APPROVED_LEAVE_EXCUSED_AUTOMATION_LOCK_NAME}
        ) AS ownerConnectionId
    `;

  return normalizeRawInteger(
    rows[0]?.ownerConnectionId,
  );
}

async function acquireTransactionLock(
  tx: Prisma.TransactionClient,
): Promise<void> {
  let rows: AcquireLockRow[];

  try {
    rows =
      await tx.$queryRaw<AcquireLockRow[]>`
        SELECT
          GET_LOCK(
            ${APPROVED_LEAVE_EXCUSED_AUTOMATION_LOCK_NAME},
            ${LOCK_ACQUISITION_WAIT_SECONDS}
          ) AS acquired
      `;
  } catch (error) {
    throw new AttendanceAutomationLockUnavailableError(
      APPROVED_LEAVE_EXCUSED_AUTOMATION_LOCK_NAME,
      "MySQL could not evaluate the attendance automation lock.",
      error,
    );
  }

  const acquired = normalizeRawInteger(
    rows[0]?.acquired,
  );

  if (acquired === 1) {
    return;
  }

  if (acquired === 0) {
    const ownerConnectionId =
      await getTransactionLockOwner(tx);

    throw new AttendanceAutomationLockBusyError({
      lockName:
        APPROVED_LEAVE_EXCUSED_AUTOMATION_LOCK_NAME,

      ownerConnectionId,

      retryAfterSeconds:
        LOCK_RETRY_AFTER_SECONDS,
    });
  }

  throw new AttendanceAutomationLockUnavailableError(
    APPROVED_LEAVE_EXCUSED_AUTOMATION_LOCK_NAME,
    "MySQL returned an unexpected result while acquiring the attendance automation lock.",
  );
}

async function releaseTransactionLock(
  tx: Prisma.TransactionClient,
): Promise<void> {
  try {
    const rows =
      await tx.$queryRaw<ReleaseLockRow[]>`
        SELECT
          RELEASE_LOCK(
            ${APPROVED_LEAVE_EXCUSED_AUTOMATION_LOCK_NAME}
          ) AS released
      `;

    const released = normalizeRawInteger(
      rows[0]?.released,
    );

    if (released === 1) {
      return;
    }

    /*
     * This fallback only affects named locks owned
     * by the same database session.
     */
    const fallbackRows =
      await tx.$queryRaw<ReleaseAllLocksRow[]>`
        SELECT
          RELEASE_ALL_LOCKS() AS releasedCount
      `;

    const releasedCount =
      normalizeRawInteger(
        fallbackRows[0]?.releasedCount,
      );

    if (
      releasedCount === null ||
      releasedCount < 1
    ) {
      console.error(
        "The MySQL attendance automation lock could not be confirmed as released.",
      );
    }
  } catch (error) {
    console.error(
      "Unable to release the MySQL attendance automation lock:",
      error,
    );
  }
}

export async function runWithAttendanceAutomationLock<T>(
  operation: (
    tx: Prisma.TransactionClient,
  ) => Promise<T>,
): Promise<T> {
  const timeoutSeconds =
    getConfiguredLockTimeoutSeconds();

  return prisma.$transaction(
    async (tx) => {
      await acquireTransactionLock(tx);

      try {
        return await operation(tx);
      } finally {
        await releaseTransactionLock(tx);
      }
    },
    {
      maxWait:
        LOCK_TRANSACTION_MAX_WAIT_MS,

      timeout:
        timeoutSeconds * 1000,
    },
  );
}

export async function getAttendanceAutomationLockState(): Promise<AttendanceAutomationLockState> {
  try {
    const rows =
      await prisma.$queryRaw<UsedLockRow[]>`
        SELECT
          IS_USED_LOCK(
            ${APPROVED_LEAVE_EXCUSED_AUTOMATION_LOCK_NAME}
          ) AS ownerConnectionId
      `;

    const ownerConnectionId =
      normalizeRawInteger(
        rows[0]?.ownerConnectionId,
      );

    return {
      lockName:
        APPROVED_LEAVE_EXCUSED_AUTOMATION_LOCK_NAME,

      active:
        ownerConnectionId !== null,

      ownerConnectionId,

      retryAfterSeconds:
        ownerConnectionId !== null
          ? LOCK_RETRY_AFTER_SECONDS
          : null,

      source:
        "MYSQL_NAMED_LOCK",

      distributed: true,
    };
  } catch (error) {
    throw new AttendanceAutomationLockUnavailableError(
      APPROVED_LEAVE_EXCUSED_AUTOMATION_LOCK_NAME,
      "The current MySQL automation lock state could not be read.",
      error,
    );
  }
}