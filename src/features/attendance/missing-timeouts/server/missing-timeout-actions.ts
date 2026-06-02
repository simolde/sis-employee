"use server";

import type { Prisma } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { canManageEmployees } from "@/lib/security/roles";
import { getCurrentSession } from "@/features/auth/server/session";
import type { MissingTimeoutActionState } from "../types/missing-timeout-types";

type AttendanceMissingTimeoutAuditSource = {
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

const attendanceAuditSelect = {
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

function buildEligibleMissingTimeoutWhere(): Prisma.AttendanceWhereInput {
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

function parsePositiveId(value: FormDataEntryValue | null): number | null {
  if (typeof value !== "string") {
    return null;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

function buildAttendanceAuditValue(
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

async function markRecordAsMissingTimeout(input: {
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
    select: attendanceAuditSelect,
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
}

export async function markMissingTimeoutAction(
  _previousState: MissingTimeoutActionState,
  formData: FormData,
): Promise<MissingTimeoutActionState> {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  if (!canManageEmployees(session.role)) {
    return {
      ok: false,
      message: "You do not have permission to manage missing timeouts.",
    };
  }

  const mode = String(formData.get("mode") ?? "");
  const eligibleWhere = buildEligibleMissingTimeoutWhere();

  if (mode === "MARK_SINGLE") {
    const attendanceId = parsePositiveId(formData.get("attendanceId"));

    if (!attendanceId) {
      return {
        ok: false,
        message: "Invalid attendance record.",
        fieldErrors: {
          attendanceId: ["Invalid attendance record."],
        },
      };
    }

    const markedCount = await prisma.$transaction(async (tx) => {
      const record = await tx.attendance.findFirst({
        where: {
          AND: [
            eligibleWhere,
            {
              attendanceId,
            },
          ],
        },
        select: attendanceAuditSelect,
      });

      if (!record) {
        return 0;
      }

      await markRecordAsMissingTimeout({
        tx,
        record,
        actorUserId: session.userId,
      });

      return 1;
    });

    revalidatePath("/dashboard/attendance");
    revalidatePath("/dashboard/attendance/actions");
    revalidatePath("/dashboard/attendance/missing-timeouts");

    return {
      ok: markedCount > 0,
      message:
        markedCount > 0
          ? "Attendance record marked as missing timeout."
          : "This record is no longer eligible for missing timeout marking.",
    };
  }

  if (mode === "MARK_ALL") {
    const markedCount = await prisma.$transaction(async (tx) => {
      const records = await tx.attendance.findMany({
        where: eligibleWhere,
        select: attendanceAuditSelect,
        orderBy: [
          {
            attDate: "asc",
          },
          {
            timeIn: "asc",
          },
        ],
        take: 200,
      });

      for (const record of records) {
        await markRecordAsMissingTimeout({
          tx,
          record,
          actorUserId: session.userId,
        });
      }

      return records.length;
    });

    revalidatePath("/dashboard/attendance");
    revalidatePath("/dashboard/attendance/actions");
    revalidatePath("/dashboard/attendance/missing-timeouts");

    return {
      ok: true,
      message:
        markedCount > 0
          ? `${markedCount} attendance record(s) marked as missing timeout. Run again if more records remain.`
          : "No eligible missing timeout records found.",
    };
  }

  return {
    ok: false,
    message: "Invalid missing timeout action.",
  };
}