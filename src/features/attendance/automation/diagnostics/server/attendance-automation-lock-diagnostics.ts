import { randomUUID } from "node:crypto";
import { performance } from "node:perf_hooks";
import type { Prisma } from "@/generated/prisma/client";
import { getAttendanceAutomationLockState } from "@/features/attendance/automation/server/attendance-automation-lock";
import { prisma } from "@/lib/db/prisma";
import type {
  AttendanceAutomationLockDiagnosticData,
  AttendanceAutomationLockDiagnosticStatus,
  AttendanceAutomationProductionLockDiagnostic,
} from "../types/attendance-automation-lock-diagnostic-types";

const DIAGNOSTIC_TRANSACTION_MAX_WAIT_MS =
  10_000;

const DIAGNOSTIC_TRANSACTION_TIMEOUT_MS =
  15_000;

type RawScalar =
  | number
  | bigint
  | string
  | null;

type AcquireDiagnosticLockRow = {
  acquired: RawScalar;
  connectionId: RawScalar;
  serverVersion: string | null;
  databaseName: string | null;
};

type LockOwnerRow = {
  ownerConnectionId: RawScalar;
};

type ReleaseDiagnosticLockRow = {
  released: RawScalar;
};

type FreeDiagnosticLockRow = {
  isFree: RawScalar;
};

type TransactionDiagnosticResult = {
  acquired: boolean;

  connectionId: number | null;

  serverVersion: string;
  databaseName: string | null;

  ownerConnectionId: number | null;
  ownerDetected: boolean;
  ownerMatchedConnection: boolean;

  released: boolean;

  acquireDurationMs: number;
  releaseDurationMs: number;
};

function normalizeInteger(
  value: RawScalar | undefined,
): number | null {
  if (
    value === null ||
    value === undefined
  ) {
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

function roundDuration(
  value: number,
): number {
  return Math.max(
    0,
    Number(value.toFixed(2)),
  );
}

function formatDateTime(
  value: Date,
): string {
  return new Intl.DateTimeFormat(
    "en-PH",
    {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "Asia/Manila",
    },
  ).format(value);
}

function getErrorMessage(
  error: unknown,
): string {
  if (
    error instanceof Error &&
    error.message.trim()
  ) {
    return error.message
      .trim()
      .slice(0, 1000);
  }

  return "An unexpected MySQL named-lock diagnostic error occurred.";
}

function createDiagnosticLockName(): string {
  const identifier = randomUUID()
    .replaceAll("-", "")
    .slice(0, 16);

  return `starland.attendance.diagnostic.${identifier}`;
}

function createUnavailableProductionLock(): AttendanceAutomationProductionLockDiagnostic {
  return {
    status: "UNAVAILABLE",
    active: false,

    lockName:
      "starland.attendance.approved_leave_excused",

    ownerConnectionId: null,

    source: "UNKNOWN",
    distributed: false,

    retryAfterSeconds: null,
  };
}

function getOverallStatus(input: {
  lockAcquired: boolean;
  ownerMatchedConnection: boolean;
  lockReleased: boolean;
  lockFreeAfterRelease: boolean;
  productionLockStatus:
    AttendanceAutomationProductionLockDiagnostic["status"];
}): AttendanceAutomationLockDiagnosticStatus {
  if (
    !input.lockAcquired ||
    !input.ownerMatchedConnection ||
    !input.lockReleased ||
    !input.lockFreeAfterRelease
  ) {
    return "FAIL";
  }

  if (
    input.productionLockStatus !==
    "AVAILABLE"
  ) {
    return "WARNING";
  }

  return "PASS";
}

function getStatusCopy(
  status: AttendanceAutomationLockDiagnosticStatus,
): {
  label: string;
  description: string;
} {
  switch (status) {
    case "PASS":
      return {
        label:
          "MySQL Lock Diagnostics Passed",

        description:
          "The database acquired, identified, released, and verified the diagnostic named lock successfully.",
      };

    case "WARNING":
      return {
        label:
          "MySQL Lock Diagnostics Passed with Warning",

        description:
          "Named-lock capability passed, but the current production automation lock is active or could not be inspected.",
      };

    case "FAIL":
      return {
        label:
          "MySQL Lock Diagnostics Failed",

        description:
          "One or more named-lock capability checks failed. Do not rely on distributed automation locking until the issue is resolved.",
      };
  }
}

async function runTransactionDiagnostic(
  diagnosticLockName: string,
): Promise<TransactionDiagnosticResult> {
  return prisma.$transaction(
    async (
      tx: Prisma.TransactionClient,
    ) => {
      const acquireStartedAt =
        performance.now();

      const acquireRows =
        await tx.$queryRaw<
          AcquireDiagnosticLockRow[]
        >`
          SELECT
            GET_LOCK(
              ${diagnosticLockName},
              0
            ) AS acquired,

            CONNECTION_ID()
              AS connectionId,

            VERSION()
              AS serverVersion,

            DATABASE()
              AS databaseName
        `;

      const acquireDurationMs =
        roundDuration(
          performance.now() -
            acquireStartedAt,
        );

      const acquireRow =
        acquireRows[0];

      const acquired =
        normalizeInteger(
          acquireRow?.acquired,
        ) === 1;

      const connectionId =
        normalizeInteger(
          acquireRow?.connectionId,
        );

      const serverVersion =
        acquireRow?.serverVersion?.trim() ||
        "Unknown";

      const databaseName =
        acquireRow?.databaseName?.trim() ||
        null;

      let ownerConnectionId:
        | number
        | null = null;

      let ownerDetected = false;

      let ownerMatchedConnection = false;

      let released = false;

      let releaseDurationMs = 0;

      if (!acquired) {
        return {
          acquired: false,

          connectionId,

          serverVersion,
          databaseName,

          ownerConnectionId: null,
          ownerDetected: false,
          ownerMatchedConnection: false,

          released: false,

          acquireDurationMs,
          releaseDurationMs,
        };
      }

      try {
        const ownerRows =
          await tx.$queryRaw<
            LockOwnerRow[]
          >`
            SELECT
              IS_USED_LOCK(
                ${diagnosticLockName}
              ) AS ownerConnectionId
          `;

        ownerConnectionId =
          normalizeInteger(
            ownerRows[0]
              ?.ownerConnectionId,
          );

        ownerDetected =
          ownerConnectionId !== null;

        ownerMatchedConnection =
          connectionId !== null &&
          ownerConnectionId ===
            connectionId;
      } finally {
        const releaseStartedAt =
          performance.now();

        const releaseRows =
          await tx.$queryRaw<
            ReleaseDiagnosticLockRow[]
          >`
            SELECT
              RELEASE_LOCK(
                ${diagnosticLockName}
              ) AS released
          `;

        releaseDurationMs =
          roundDuration(
            performance.now() -
              releaseStartedAt,
          );

        released =
          normalizeInteger(
            releaseRows[0]?.released,
          ) === 1;
      }

      return {
        acquired,

        connectionId,

        serverVersion,
        databaseName,

        ownerConnectionId,
        ownerDetected,
        ownerMatchedConnection,

        released,

        acquireDurationMs,
        releaseDurationMs,
      };
    },
    {
      maxWait:
        DIAGNOSTIC_TRANSACTION_MAX_WAIT_MS,

      timeout:
        DIAGNOSTIC_TRANSACTION_TIMEOUT_MS,
    },
  );
}

async function verifyDiagnosticLockIsFree(
  diagnosticLockName: string,
): Promise<boolean> {
  const rows =
    await prisma.$queryRaw<
      FreeDiagnosticLockRow[]
    >`
      SELECT
        IS_FREE_LOCK(
          ${diagnosticLockName}
        ) AS isFree
    `;

  return (
    normalizeInteger(
      rows[0]?.isFree,
    ) === 1
  );
}

async function getProductionLockDiagnostic(
  issues: string[],
): Promise<AttendanceAutomationProductionLockDiagnostic> {
  try {
    const lockState =
      await getAttendanceAutomationLockState();

    return {
      status: lockState.active
        ? "RUNNING"
        : "AVAILABLE",

      active:
        lockState.active,

      lockName:
        lockState.lockName,

      ownerConnectionId:
        lockState.ownerConnectionId,

      source:
        lockState.source,

      distributed:
        lockState.distributed,

      retryAfterSeconds:
        lockState.retryAfterSeconds,
    };
  } catch (error) {
    issues.push(
      `The production automation lock could not be inspected: ${getErrorMessage(error)}`,
    );

    return createUnavailableProductionLock();
  }
}

export async function getAttendanceAutomationLockDiagnosticData(): Promise<AttendanceAutomationLockDiagnosticData> {
  const checkedAt = new Date();

  const totalStartedAt =
    performance.now();

  const diagnosticLockName =
    createDiagnosticLockName();

  const issues: string[] = [];

  let transactionResult: TransactionDiagnosticResult =
    {
      acquired: false,

      connectionId: null,

      serverVersion: "Unknown",
      databaseName: null,

      ownerConnectionId: null,
      ownerDetected: false,
      ownerMatchedConnection: false,

      released: false,

      acquireDurationMs: 0,
      releaseDurationMs: 0,
    };

  let lockFreeAfterRelease = false;

  try {
    transactionResult =
      await runTransactionDiagnostic(
        diagnosticLockName,
      );

    if (!transactionResult.acquired) {
      issues.push(
        "GET_LOCK() did not acquire the temporary diagnostic lock.",
      );
    }

    if (
      transactionResult.acquired &&
      !transactionResult.ownerDetected
    ) {
      issues.push(
        "IS_USED_LOCK() did not identify an owner for the acquired diagnostic lock.",
      );
    }

    if (
      transactionResult.ownerDetected &&
      !transactionResult
        .ownerMatchedConnection
    ) {
      issues.push(
        "The diagnostic lock owner did not match the transaction connection ID.",
      );
    }

    if (
      transactionResult.acquired &&
      !transactionResult.released
    ) {
      issues.push(
        "RELEASE_LOCK() did not confirm that the diagnostic lock was released.",
      );
    }

    lockFreeAfterRelease =
      await verifyDiagnosticLockIsFree(
        diagnosticLockName,
      );

    if (!lockFreeAfterRelease) {
      issues.push(
        "The diagnostic lock was not reported as free after RELEASE_LOCK().",
      );
    }
  } catch (error) {
    issues.push(
      getErrorMessage(error),
    );

    try {
      lockFreeAfterRelease =
        await verifyDiagnosticLockIsFree(
          diagnosticLockName,
        );
    } catch (verificationError) {
      issues.push(
        `The diagnostic lock release state could not be verified: ${getErrorMessage(verificationError)}`,
      );
    }
  }

  const productionLock =
    await getProductionLockDiagnostic(
      issues,
    );

  if (productionLock.status === "RUNNING") {
    issues.push(
      productionLock.ownerConnectionId !==
      null
        ? `The production automation lock is currently held by MySQL connection #${productionLock.ownerConnectionId}.`
        : "The production automation lock is currently active.",
    );
  }

  const overallStatus =
    getOverallStatus({
      lockAcquired:
        transactionResult.acquired,

      ownerMatchedConnection:
        transactionResult
          .ownerMatchedConnection,

      lockReleased:
        transactionResult.released,

      lockFreeAfterRelease,

      productionLockStatus:
        productionLock.status,
    });

  const statusCopy =
    getStatusCopy(overallStatus);

  return {
    overallStatus,

    statusLabel:
      statusCopy.label,

    statusDescription:
      statusCopy.description,

    checkedAt:
      formatDateTime(checkedAt),

    checkedAtIso:
      checkedAt.toISOString(),

    diagnosticLockName,

    database: {
      serverVersion:
        transactionResult.serverVersion,

      databaseName:
        transactionResult.databaseName,

      diagnosticConnectionId:
        transactionResult.connectionId,
    },

    capability: {
      getLockSupported:
        transactionResult.acquired,

      lockAcquired:
        transactionResult.acquired,

      ownerDetected:
        transactionResult.ownerDetected,

      ownerMatchedConnection:
        transactionResult
          .ownerMatchedConnection,

      lockReleased:
        transactionResult.released,

      lockFreeAfterRelease,
    },

    timing: {
      acquireDurationMs:
        transactionResult
          .acquireDurationMs,

      releaseDurationMs:
        transactionResult
          .releaseDurationMs,

      totalDurationMs:
        roundDuration(
          performance.now() -
            totalStartedAt,
        ),
    },

    productionLock,

    issues,
  };
}