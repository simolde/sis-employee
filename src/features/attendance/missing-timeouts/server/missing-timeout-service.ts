import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";

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

function getManilaDateOnly(date = new Date()): Date {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  const day = Number(parts.find((part) => part.type === "day")?.value);

  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
}

function getCutoffDate(hoursAgo: number): Date {
  return new Date(Date.now() - hoursAgo * 60 * 60 * 1000);
}

export function buildEligibleMissingTimeoutWhere(): Prisma.AttendanceWhereInput {
  const today = getManilaDateOnly();
  const cutoffDate = getCutoffDate(18);

  return {
    timeIn: {
      not: null,
    },
    timeOut: null,
    status: {
      not: "MISSING_TIMEOUT",
    },
    OR: [
      {
        attDate: {
          lt: today,
        },
      },
      {
        timeIn: {
          lte: cutoffDate,
        },
      },
    ],
  };
}

export function buildAttendanceAuditValue(
  input: AttendanceMissingTimeoutAuditSource,
): Prisma.InputJsonObject {
  return {
    attendanceId: input.attendanceId,
    empId: input.empId,
    scheduleId: input.scheduleId,
    attDate: input.attDate.toISOString(),
    timeIn: input.timeIn?.toISOString() ?? null,
    timeOut: input.timeOut?.toISOString() ?? null,
    status: input.status,
    totalMinutes: input.totalMinutes,
    isManual: input.isManual,
    inSource: input.inSource,
    outSource: input.outSource,
    verifiedById: input.verifiedById,
    verifiedAt: input.verifiedAt?.toISOString() ?? null,
    approvedById: input.approvedById,
    approvedAt: input.approvedAt?.toISOString() ?? null,
    updatedById: input.updatedById,
  };
}

export async function markRecordAsMissingTimeout(input: {
  tx: Prisma.TransactionClient;
  record: AttendanceMissingTimeoutAuditSource;
  actorUserId: number;
}) {
  const updatedRecord = await input.tx.attendance.update({
    where: {
      attendanceId: input.record.attendanceId,
    },
    data: {
      status: "MISSING_TIMEOUT",
      updatedById: input.actorUserId,
    },
    select: attendanceMissingTimeoutAuditSelect,
  });

  await input.tx.attendanceLog.create({
    data: {
      attendanceId: updatedRecord.attendanceId,
      empId: updatedRecord.empId,
      punchType: "CORRECTION",
      punchedAt: new Date(),
      source: updatedRecord.inSource ?? "KIOSK",
      remarks:
        "Automatically marked as MISSING_TIMEOUT because no time-out was recorded.",
      reason: "Missing time-out detection",
    },
  });

  await input.tx.activityLog.create({
    data: {
      actorUserId: input.actorUserId,
      action: "ATTENDANCE_MARKED_MISSING_TIMEOUT",
      entityType: "attendance",
      entityId: String(updatedRecord.attendanceId),
      oldValue: buildAttendanceAuditValue(input.record),
      newValue: buildAttendanceAuditValue(updatedRecord),
    },
  });

  return updatedRecord;
}

export async function markSingleMissingTimeout(input: {
  attendanceId: number;
  actorUserId: number;
}): Promise<MarkMissingTimeoutResult> {
  const eligibleWhere = buildEligibleMissingTimeoutWhere();

  return prisma.$transaction(async (tx) => {
    const record = await tx.attendance.findFirst({
      where: {
        AND: [
          eligibleWhere,
          {
            attendanceId: input.attendanceId,
          },
        ],
      },
      select: attendanceMissingTimeoutAuditSelect,
    });

    if (!record) {
      const remainingEligibleCount = await tx.attendance.count({
        where: eligibleWhere,
      });

      return {
        markedCount: 0,
        remainingEligibleCount,
      };
    }

    await markRecordAsMissingTimeout({
      tx,
      record,
      actorUserId: input.actorUserId,
    });

    const remainingEligibleCount = await tx.attendance.count({
      where: eligibleWhere,
    });

    return {
      markedCount: 1,
      remainingEligibleCount,
    };
  });
}

export async function markEligibleMissingTimeouts(input: {
  actorUserId: number;
  limit?: number;
}): Promise<MarkMissingTimeoutResult> {
  const eligibleWhere = buildEligibleMissingTimeoutWhere();
  const limit = input.limit ?? 200;

  return prisma.$transaction(async (tx) => {
    const records = await tx.attendance.findMany({
      where: eligibleWhere,
      select: attendanceMissingTimeoutAuditSelect,
      orderBy: [
        {
          attDate: "asc",
        },
        {
          timeIn: "asc",
        },
      ],
      take: limit,
    });

    for (const record of records) {
      await markRecordAsMissingTimeout({
        tx,
        record,
        actorUserId: input.actorUserId,
      });
    }

    const remainingEligibleCount = await tx.attendance.count({
      where: eligibleWhere,
    });

    return {
      markedCount: records.length,
      remainingEligibleCount,
    };
  });
}