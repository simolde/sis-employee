import type {
  Prisma,
} from "@/generated/prisma/client";
import { calculateAttendanceStatus } from "@/features/attendance/status-calculation/server/attendance-status-calculator";
import {
  getAttendanceEnforcementPolicy,
  getEffectiveLateGraceMinutes,
} from "@/features/attendance/policies/server/attendance-policy-enforcement";
import { prisma } from "@/lib/db/prisma";
import type {
  AttendanceStatusPolicySnapshot,
  AttendanceStatusRecalculationSummary,
} from "../types/attendance-status-recalculation-types";

type AttendanceRecalculationRecord = {
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

  updatedById: number | null;

  schedule: {
    shift: {
      startTime: string;
      endTime: string;
      graceMinutes: number;
      isOvernight: boolean;
    };
  } | null;
};

export type AttendanceStatusRecalculationResult = {
  processedCount: number;
  updatedCount: number;
  skippedCount: number;

  policy:
    AttendanceStatusPolicySnapshot;
};

function createPolicySnapshot(input: {
  lateGraceMinutes: number;
  autoMarkMissingTimeout: boolean;
  missingTimeoutMinutes: number;
}): AttendanceStatusPolicySnapshot {
  return {
    lateGraceMinutes:
      input.lateGraceMinutes,

    autoMarkMissingTimeout:
      input.autoMarkMissingTimeout,

    missingTimeoutMinutes:
      input.missingTimeoutMinutes,
  };
}

function buildAttendanceAuditValue(
  record:
    AttendanceRecalculationRecord,
): Prisma.InputJsonObject {
  return {
    attendanceId:
      record.attendanceId,

    empId:
      record.empId,

    scheduleId:
      record.scheduleId,

    attDate:
      record.attDate.toISOString(),

    timeIn:
      record.timeIn
        ?.toISOString() ??
      null,

    timeOut:
      record.timeOut
        ?.toISOString() ??
      null,

    status:
      record.status,

    totalMinutes:
      record.totalMinutes,

    isManual:
      record.isManual,

    inSource:
      record.inSource,

    outSource:
      record.outSource,

    updatedById:
      record.updatedById,
  };
}

function buildUpdatedAuditValue(input: {
  record:
    AttendanceRecalculationRecord;

  status: string;
  totalMinutes: number | null;

  actorUserId: number;
  reason: string;

  shiftGraceMinutes: number;
  effectiveGraceMinutes: number;

  policy:
    AttendanceStatusPolicySnapshot;
}): Prisma.InputJsonObject {
  return {
    ...buildAttendanceAuditValue(
      input.record,
    ),

    status:
      input.status,

    totalMinutes:
      input.totalMinutes,

    updatedById:
      input.actorUserId,

    recalculationReason:
      input.reason,

    lateGrace: {
      shiftGraceMinutes:
        input.shiftGraceMinutes,

      policyGraceMinutes:
        input.policy
          .lateGraceMinutes,

      effectiveGraceMinutes:
        input.effectiveGraceMinutes,
    },

    missingTimeoutPolicy: {
      autoMarkMissingTimeout:
        input.policy
          .autoMarkMissingTimeout,

      missingTimeoutMinutes:
        input.policy
          .missingTimeoutMinutes,

      handledBy:
        "canonical_missing_timeout_service",

      evaluatedByStatusRecalculation:
        false,
    },
  };
}

function buildEligibleRecalculationWhere(): Prisma.AttendanceWhereInput {
  return {
    isManual:
      false,

    scheduleId: {
      not: null,
    },

    status: {
      notIn: [
        "PENDING_REVIEW",
        "MISSING_TIMEOUT",
      ],
    },
  };
}

export async function getAttendanceStatusRecalculationSummary(): Promise<AttendanceStatusRecalculationSummary> {
  const policy =
    await getAttendanceEnforcementPolicy();

  const [
    totalNormalRecords,
    normalRecordsWithSchedule,
    onTimeRecords,
    lateRecords,
    halfDayRecords,
    missingTimeoutRecords,
    skippedManualRecords,
  ] = await Promise.all([
    prisma.attendance.count({
      where: {
        isManual:
          false,
      },
    }),

    prisma.attendance.count({
      where:
        buildEligibleRecalculationWhere(),
    }),

    prisma.attendance.count({
      where: {
        isManual:
          false,

        status:
          "ON_TIME",
      },
    }),

    prisma.attendance.count({
      where: {
        isManual:
          false,

        status:
          "LATE",
      },
    }),

    prisma.attendance.count({
      where: {
        isManual:
          false,

        status:
          "HALF_DAY",
      },
    }),

    prisma.attendance.count({
      where: {
        isManual:
          false,

        status:
          "MISSING_TIMEOUT",
      },
    }),

    prisma.attendance.count({
      where: {
        isManual:
          true,
      },
    }),
  ]);

  return {
    totalNormalRecords,
    normalRecordsWithSchedule,

    onTimeRecords,
    lateRecords,
    halfDayRecords,
    missingTimeoutRecords,

    skippedManualRecords,

    policyLateGraceMinutes:
      policy.lateGraceMinutes,

    policyAutoMarkMissingTimeout:
      policy.autoMarkMissingTimeout,

    policyMissingTimeoutMinutes:
      policy.missingTimeoutMinutes,
  };
}

export async function recalculateNormalAttendanceStatuses(input: {
  actorUserId: number;
  limit?: number;
}): Promise<AttendanceStatusRecalculationResult> {
  const limit =
    Math.min(
      Math.max(
        input.limit ?? 300,
        1,
      ),
      1000,
    );

  const where =
    buildEligibleRecalculationWhere();

  const policyConfig =
    await getAttendanceEnforcementPolicy();

  const policy =
    createPolicySnapshot({
      lateGraceMinutes:
        policyConfig.lateGraceMinutes,

      autoMarkMissingTimeout:
        policyConfig.autoMarkMissingTimeout,

      missingTimeoutMinutes:
        policyConfig.missingTimeoutMinutes,
    });

  return prisma.$transaction(
    async (tx) => {
      const records =
        await tx.attendance.findMany({
          where,

          select: {
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

            updatedById: true,

            schedule: {
              select: {
                shift: {
                  select: {
                    startTime: true,
                    endTime: true,
                    graceMinutes: true,
                    isOvernight: true,
                  },
                },
              },
            },
          },

          orderBy: [
            {
              attDate:
                "desc",
            },
            {
              attendanceId:
                "desc",
            },
          ],

          take:
            limit,
        });

      let updatedCount =
        0;

      let skippedCount =
        0;

      for (
        const record of records
      ) {
        if (
          !record.schedule
            ?.shift
        ) {
          skippedCount +=
            1;

          continue;
        }

        const shiftGraceMinutes =
          record.schedule.shift
            .graceMinutes;

        const effectiveGraceMinutes =
          getEffectiveLateGraceMinutes({
            shiftGraceMinutes,

            policyGraceMinutes:
              policy.lateGraceMinutes,
          });

        const calculated =
          calculateAttendanceStatus({
            attDate:
              record.attDate,

            timeIn:
              record.timeIn,

            timeOut:
              record.timeOut,

            shiftStartTime:
              record.schedule.shift
                .startTime,

            shiftEndTime:
              record.schedule.shift
                .endTime,

            graceMinutes:
              effectiveGraceMinutes,

            isOvernight:
              record.schedule.shift
                .isOvernight,

            /**
             * MISSING_TIMEOUT is deliberately disabled here.
             * The separate canonical missing-timeout service
             * owns that status and its attendance/activity logs.
             */
            missingTimeoutPolicy: {
              enabled:
                false,

              thresholdMinutes:
                policy.missingTimeoutMinutes,
            },
          });

        const statusChanged =
          record.status !==
          calculated.status;

        const totalMinutesChanged =
          record.totalMinutes !==
          calculated.totalMinutes;

        if (
          !statusChanged &&
          !totalMinutesChanged
        ) {
          skippedCount +=
            1;

          continue;
        }

        await tx.attendance.update({
          where: {
            attendanceId:
              record.attendanceId,
          },

          data: {
            status:
              calculated.status,

            totalMinutes:
              calculated.totalMinutes,

            updatedById:
              input.actorUserId,
          },
        });

        await tx.activityLog.create({
          data: {
            actorUserId:
              input.actorUserId,

            action:
              "ATTENDANCE_STATUS_UPDATED_AUTO_RECALC",

            entityType:
              "attendance",

            entityId:
              String(
                record.attendanceId,
              ),

            oldValue:
              buildAttendanceAuditValue(
                record,
              ),

            newValue:
              buildUpdatedAuditValue({
                record,

                status:
                  calculated.status,

                totalMinutes:
                  calculated.totalMinutes,

                actorUserId:
                  input.actorUserId,

                reason:
                  calculated.reason,

                shiftGraceMinutes,

                effectiveGraceMinutes,

                policy,
              }),
          },
        });

        updatedCount +=
          1;
      }

      return {
        processedCount:
          records.length,

        updatedCount,

        skippedCount,

        policy,
      };
    },
  );
}