import type {
  Prisma,
} from "@/generated/prisma/client";
import { getAttendanceEnforcementPolicy } from "@/features/attendance/policies/server/attendance-policy-enforcement";
import { prisma } from "@/lib/db/prisma";

export type MissingTimeoutEnforcementMode =
  | "AUTOMATION"
  | "MANUAL_ADMIN";

export type MissingTimeoutPolicySnapshot = {
  autoMarkMissingTimeout: boolean;
  missingTimeoutMinutes: number;
};

export type AttendanceMissingTimeoutAuditSource = {
  attendanceId: number;
  empId: number;
  scheduleId: number | null;
  attDate: Date;
  timeIn: Date | null;
  timeOut: Date | null;
  status: string;
  totalMinutes: number | null;
  isManual: boolean;
  inSource: string | null;
  outSource: string | null;
  verifiedById: number | null;
  verifiedAt: Date | null;
  approvedById: number | null;
  approvedAt: Date | null;
  updatedById: number | null;
};

export type MarkMissingTimeoutResult = {
  markedCount: number;
  remainingEligibleCount: number;
  blockedByPolicy: boolean;
  policy: MissingTimeoutPolicySnapshot;
};

export const attendanceMissingTimeoutAuditSelect = {
  attendanceId: true,
  empId: true,
  scheduleId: true,
  attDate: true,
  timeIn: true,
  timeOut: true,
  status: true,
  totalMinutes: true,
  isManual: true,
  inSource: true,
  outSource: true,
  verifiedById: true,
  verifiedAt: true,
  approvedById: true,
  approvedAt: true,
  updatedById: true,
} satisfies Prisma.AttendanceSelect;

const LEGACY_COMPATIBILITY_TIMEOUT_MINUTES =
  18 * 60;

function normalizeMissingTimeoutMinutes(
  value: number,
): number {
  if (
    !Number.isSafeInteger(value) ||
    value < 60
  ) {
    return LEGACY_COMPATIBILITY_TIMEOUT_MINUTES;
  }

  return Math.min(value, 2880);
}

export async function getMissingTimeoutPolicySnapshot(): Promise<MissingTimeoutPolicySnapshot> {
  const policy =
    await getAttendanceEnforcementPolicy();

  return {
    autoMarkMissingTimeout:
      policy.autoMarkMissingTimeout,

    missingTimeoutMinutes:
      normalizeMissingTimeoutMinutes(
        policy.missingTimeoutMinutes,
      ),
  };
}

/**
 * The optional argument preserves compatibility with older callers.
 * New callers should always provide missingTimeoutMinutes explicitly.
 */
export function buildEligibleMissingTimeoutWhere(
  input?: {
    missingTimeoutMinutes?: number;
    now?: Date;
  },
): Prisma.AttendanceWhereInput {
  const now =
    input?.now ??
    new Date();

  const missingTimeoutMinutes =
    normalizeMissingTimeoutMinutes(
      input?.missingTimeoutMinutes ??
        LEGACY_COMPATIBILITY_TIMEOUT_MINUTES,
    );

  const cutoffDate =
    new Date(
      now.getTime() -
        missingTimeoutMinutes *
          60_000,
    );

  return {
    timeIn: {
      not: null,
      lte: cutoffDate,
    },

    timeOut:
      null,

    isManual:
      false,

    status: {
      notIn: [
        "MISSING_TIMEOUT",
        "PENDING_REVIEW",
      ],
    },
  };
}

export function buildAttendanceAuditValue(
  input:
    AttendanceMissingTimeoutAuditSource,
): Prisma.InputJsonObject {
  return {
    attendanceId:
      input.attendanceId,

    empId:
      input.empId,

    scheduleId:
      input.scheduleId,

    attDate:
      input.attDate.toISOString(),

    timeIn:
      input.timeIn
        ?.toISOString() ??
      null,

    timeOut:
      input.timeOut
        ?.toISOString() ??
      null,

    status:
      input.status,

    totalMinutes:
      input.totalMinutes,

    isManual:
      input.isManual,

    inSource:
      input.inSource,

    outSource:
      input.outSource,

    verifiedById:
      input.verifiedById,

    verifiedAt:
      input.verifiedAt
        ?.toISOString() ??
      null,

    approvedById:
      input.approvedById,

    approvedAt:
      input.approvedAt
        ?.toISOString() ??
      null,

    updatedById:
      input.updatedById,
  };
}

export async function markRecordAsMissingTimeout(
  input: {
    tx:
      Prisma.TransactionClient;

    record:
      AttendanceMissingTimeoutAuditSource;

    actorUserId: number;

    mode:
      MissingTimeoutEnforcementMode;

    policy:
      MissingTimeoutPolicySnapshot;
  },
) {
  const updatedRecord =
    await input.tx.attendance.update({
      where: {
        attendanceId:
          input.record.attendanceId,
      },

      data: {
        status:
          "MISSING_TIMEOUT",

        updatedById:
          input.actorUserId,
      },

      select:
        attendanceMissingTimeoutAuditSelect,
    });

  const isAutomatic =
    input.mode ===
    "AUTOMATION";

  await input.tx.attendanceLog.create({
    data: {
      attendanceId:
        updatedRecord.attendanceId,

      empId:
        updatedRecord.empId,

      punchType:
        "CORRECTION",

      punchedAt:
        new Date(),

      source:
        updatedRecord.inSource ??
        "KIOSK",

      remarks:
        isAutomatic
          ? "Automatically marked as MISSING_TIMEOUT because no time-out was recorded."
          : "Manually marked as MISSING_TIMEOUT by an authorized administrator.",

      reason:
        `No time-out was recorded within ${input.policy.missingTimeoutMinutes} minutes after time-in.`,
    },
  });

  await input.tx.activityLog.create({
    data: {
      actorUserId:
        input.actorUserId,

      action:
        "ATTENDANCE_MARKED_MISSING_TIMEOUT",

      entityType:
        "attendance",

      entityId:
        String(
          updatedRecord.attendanceId,
        ),

      oldValue:
        buildAttendanceAuditValue(
          input.record,
        ),

      newValue: {
        ...buildAttendanceAuditValue(
          updatedRecord,
        ),

        enforcementMode:
          input.mode,

        missingTimeoutPolicy: {
          autoMarkMissingTimeout:
            input.policy
              .autoMarkMissingTimeout,

          missingTimeoutMinutes:
            input.policy
              .missingTimeoutMinutes,
        },
      },
    },
  });

  return updatedRecord;
}

export async function markSingleMissingTimeout(
  input: {
    attendanceId: number;
    actorUserId: number;
  },
): Promise<MarkMissingTimeoutResult> {
  const policy =
    await getMissingTimeoutPolicySnapshot();

  const eligibleWhere =
    buildEligibleMissingTimeoutWhere({
      missingTimeoutMinutes:
        policy.missingTimeoutMinutes,
    });

  return prisma.$transaction(
    async (tx) => {
      const record =
        await tx.attendance.findFirst({
          where: {
            AND: [
              eligibleWhere,
              {
                attendanceId:
                  input.attendanceId,
              },
            ],
          },

          select:
            attendanceMissingTimeoutAuditSelect,
        });

      if (!record) {
        const remainingEligibleCount =
          await tx.attendance.count({
            where:
              eligibleWhere,
          });

        return {
          markedCount:
            0,

          remainingEligibleCount,

          blockedByPolicy:
            false,

          policy,
        };
      }

      await markRecordAsMissingTimeout({
        tx,
        record,

        actorUserId:
          input.actorUserId,

        mode:
          "MANUAL_ADMIN",

        policy,
      });

      const remainingEligibleCount =
        await tx.attendance.count({
          where:
            eligibleWhere,
        });

      return {
        markedCount:
          1,

        remainingEligibleCount,

        blockedByPolicy:
          false,

        policy,
      };
    },
  );
}

export async function markEligibleMissingTimeouts(
  input: {
    actorUserId: number;
    limit?: number;

    mode?:
      MissingTimeoutEnforcementMode;
  },
): Promise<MarkMissingTimeoutResult> {
  const mode =
    input.mode ??
    "MANUAL_ADMIN";

  const policy =
    await getMissingTimeoutPolicySnapshot();

  const eligibleWhere =
    buildEligibleMissingTimeoutWhere({
      missingTimeoutMinutes:
        policy.missingTimeoutMinutes,
    });

  if (
    mode === "AUTOMATION" &&
    !policy.autoMarkMissingTimeout
  ) {
    const remainingEligibleCount =
      await prisma.attendance.count({
        where:
          eligibleWhere,
      });

    return {
      markedCount:
        0,

      remainingEligibleCount,

      blockedByPolicy:
        true,

      policy,
    };
  }

  const limit =
    Math.min(
      Math.max(
        input.limit ?? 200,
        1,
      ),
      500,
    );

  return prisma.$transaction(
    async (tx) => {
      const records =
        await tx.attendance.findMany({
          where:
            eligibleWhere,

          select:
            attendanceMissingTimeoutAuditSelect,

          orderBy: [
            {
              timeIn:
                "asc",
            },
            {
              attendanceId:
                "asc",
            },
          ],

          take:
            limit,
        });

      for (
        const record of records
      ) {
        await markRecordAsMissingTimeout({
          tx,
          record,

          actorUserId:
            input.actorUserId,

          mode,

          policy,
        });
      }

      const remainingEligibleCount =
        await tx.attendance.count({
          where:
            eligibleWhere,
        });

      return {
        markedCount:
          records.length,

        remainingEligibleCount,

        blockedByPolicy:
          false,

        policy,
      };
    },
  );
}