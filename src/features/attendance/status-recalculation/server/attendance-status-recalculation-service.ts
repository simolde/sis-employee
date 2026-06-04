import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import { calculateAttendanceStatus } from "@/features/attendance/status-calculation/server/attendance-status-calculator";
import type { AttendanceStatusRecalculationSummary } from "../types/attendance-status-recalculation-types";

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
};

function buildAttendanceAuditValue(
  record: AttendanceRecalculationRecord,
): Prisma.InputJsonObject {
  return {
    attendanceId: record.attendanceId,
    empId: record.empId,
    scheduleId: record.scheduleId,
    attDate: record.attDate.toISOString(),
    timeIn: record.timeIn?.toISOString() ?? null,
    timeOut: record.timeOut?.toISOString() ?? null,
    status: record.status,
    totalMinutes: record.totalMinutes,
    isManual: record.isManual,
    inSource: record.inSource,
    outSource: record.outSource,
    updatedById: record.updatedById,
  };
}

function buildUpdatedAuditValue(input: {
  record: AttendanceRecalculationRecord;
  status: string;
  totalMinutes: number | null;
  actorUserId: number;
  reason: string;
}): Prisma.InputJsonObject {
  return {
    ...buildAttendanceAuditValue(input.record),
    status: input.status,
    totalMinutes: input.totalMinutes,
    updatedById: input.actorUserId,
    recalculationReason: input.reason,
  };
}

function buildEligibleRecalculationWhere(): Prisma.AttendanceWhereInput {
  return {
    isManual: false,
    scheduleId: {
      not: null,
    },
    status: {
      not: "PENDING_REVIEW",
    },
  };
}

export async function getAttendanceStatusRecalculationSummary(): Promise<AttendanceStatusRecalculationSummary> {
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
        isManual: false,
      },
    }),

    prisma.attendance.count({
      where: buildEligibleRecalculationWhere(),
    }),

    prisma.attendance.count({
      where: {
        isManual: false,
        status: "ON_TIME",
      },
    }),

    prisma.attendance.count({
      where: {
        isManual: false,
        status: "LATE",
      },
    }),

    prisma.attendance.count({
      where: {
        isManual: false,
        status: "HALF_DAY",
      },
    }),

    prisma.attendance.count({
      where: {
        isManual: false,
        status: "MISSING_TIMEOUT",
      },
    }),

    prisma.attendance.count({
      where: {
        isManual: true,
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
  };
}

export async function recalculateNormalAttendanceStatuses(input: {
  actorUserId: number;
  limit?: number;
}): Promise<AttendanceStatusRecalculationResult> {
  const limit = input.limit ?? 300;
  const where = buildEligibleRecalculationWhere();

  return prisma.$transaction(async (tx) => {
    const records = await tx.attendance.findMany({
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
          attDate: "desc",
        },
        {
          attendanceId: "desc",
        },
      ],
      take: limit,
    });

    let updatedCount = 0;
    let skippedCount = 0;

    for (const record of records) {
      if (!record.schedule?.shift) {
        skippedCount += 1;
        continue;
      }

      const calculated = calculateAttendanceStatus({
        attDate: record.attDate,
        timeIn: record.timeIn,
        timeOut: record.timeOut,
        shiftStartTime: record.schedule.shift.startTime,
        shiftEndTime: record.schedule.shift.endTime,
        graceMinutes: record.schedule.shift.graceMinutes,
        isOvernight: record.schedule.shift.isOvernight,
      });

      const statusChanged = record.status !== calculated.status;
      const totalMinutesChanged = record.totalMinutes !== calculated.totalMinutes;

      if (!statusChanged && !totalMinutesChanged) {
        skippedCount += 1;
        continue;
      }

      await tx.attendance.update({
        where: {
          attendanceId: record.attendanceId,
        },
        data: {
          status: calculated.status,
          totalMinutes: calculated.totalMinutes,
          updatedById: input.actorUserId,
        },
      });

      await tx.activityLog.create({
        data: {
          actorUserId: input.actorUserId,
          action: "ATTENDANCE_STATUS_UPDATED_AUTO_RECALC",
          entityType: "attendance",
          entityId: String(record.attendanceId),
          oldValue: buildAttendanceAuditValue(record),
          newValue: buildUpdatedAuditValue({
            record,
            status: calculated.status,
            totalMinutes: calculated.totalMinutes,
            actorUserId: input.actorUserId,
            reason: calculated.reason,
          }),
        },
      });

      updatedCount += 1;
    }

    return {
      processedCount: records.length,
      updatedCount,
      skippedCount,
    };
  });
}