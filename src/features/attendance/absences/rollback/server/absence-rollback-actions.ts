"use server";

import type { Prisma } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/features/auth/server/session";
import { prisma } from "@/lib/db/prisma";
import { canManageEmployees } from "@/lib/security/roles";
import {
  buildAbsenceRollbackEligibleWhere,
  parseAbsenceRollbackSearchParams,
} from "./absence-rollback-queries";
import type { AbsenceRollbackActionState } from "../types/absence-rollback-types";

type RollbackAttendanceRecord = {
  attendanceId: number;
  empId: number;
  scheduleId: number | null;
  attDate: Date;
  timeIn: Date | null;
  timeOut: Date | null;
  status: string;
  totalMinutes: number | null;
  isManual: boolean;
  createdAt: Date;
  employee: {
    empNumber: string;
  };
};

function formDataToRecord(
  formData: FormData,
): Record<string, string | string[] | undefined> {
  const output: Record<string, string | string[] | undefined> = {};

  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") {
      output[key] = value;
    }
  }

  return output;
}

function parseLimit(value: FormDataEntryValue | null): number {
  if (typeof value !== "string") {
    return 500;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return 500;
  }

  return Math.min(parsed, 500);
}

function buildRollbackAuditOldValue(
  record: RollbackAttendanceRecord,
): Prisma.InputJsonObject {
  return {
    attendanceId: record.attendanceId,
    empId: record.empId,
    empNumber: record.employee.empNumber,
    scheduleId: record.scheduleId,
    attDate: record.attDate.toISOString(),
    timeIn: record.timeIn?.toISOString() ?? null,
    timeOut: record.timeOut?.toISOString() ?? null,
    status: record.status,
    totalMinutes: record.totalMinutes,
    isManual: record.isManual,
    createdAt: record.createdAt.toISOString(),
  };
}

function buildRollbackAuditNewValue(input: {
  record: RollbackAttendanceRecord;
  actorUserId: number;
}): Prisma.InputJsonObject {
  return {
    attendanceId: input.record.attendanceId,
    empId: input.record.empId,
    empNumber: input.record.employee.empNumber,
    rolledBack: true,
    deletedStatus: input.record.status,
    deletedById: input.actorUserId,
    deletedAt: new Date().toISOString(),
    rollbackSource: "ABSENCE_ROLLBACK_PAGE",
  };
}

function revalidateAbsenceRollbackPages() {
  revalidatePath("/dashboard/attendance");
  revalidatePath("/dashboard/attendance/actions");
  revalidatePath("/dashboard/attendance/absences");
  revalidatePath("/dashboard/attendance/absences/candidates");
  revalidatePath("/dashboard/attendance/absences/rollback");
  revalidatePath("/dashboard/attendance/reports");
  revalidatePath("/dashboard/attendance/audit");
}

export async function rollbackGeneratedAbsentRecordsAction(
  _previousState: AbsenceRollbackActionState,
  formData: FormData,
): Promise<AbsenceRollbackActionState> {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  if (!canManageEmployees(session.role)) {
    return {
      ok: false,
      message: "You do not have permission to rollback ABSENT records.",
    };
  }

  const filters = parseAbsenceRollbackSearchParams(formDataToRecord(formData));
  const limit = parseLimit(formData.get("limit"));
  const confirmRollback = formData.get("confirmRollback") === "on";

  if (!confirmRollback) {
    return {
      ok: false,
      message:
        "Please confirm that you want to rollback eligible automatic ABSENT records.",
      fieldErrors: {
        confirmRollback: ["Confirmation is required."],
      },
    };
  }

  const where = buildAbsenceRollbackEligibleWhere(filters);

  const result = await prisma.$transaction(async (tx) => {
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
        createdAt: true,
        employee: {
          select: {
            empNumber: true,
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

    let deletedCount = 0;
    let skippedCount = 0;

    for (const record of records) {
      if (
        record.status !== "ABSENT" ||
        record.isManual ||
        record.timeIn ||
        record.timeOut
      ) {
        skippedCount += 1;
        continue;
      }

      await tx.activityLog.create({
        data: {
          actorUserId: session.userId,
          action: "ATTENDANCE_ABSENT_AUTO_ROLLED_BACK",
          entityType: "attendance",
          entityId: String(record.attendanceId),
          oldValue: buildRollbackAuditOldValue(record),
          newValue: buildRollbackAuditNewValue({
            record,
            actorUserId: session.userId,
          }),
        },
      });

      await tx.attendance.delete({
        where: {
          attendanceId: record.attendanceId,
        },
      });

      deletedCount += 1;
    }

    return {
      checkedCount: records.length,
      deletedCount,
      skippedCount,
    };
  });

  revalidateAbsenceRollbackPages();

  return {
    ok: true,
    checkedCount: result.checkedCount,
    deletedCount: result.deletedCount,
    skippedCount: result.skippedCount,
    message:
      result.deletedCount > 0
        ? `${result.deletedCount} automatic ABSENT record(s) rolled back. ${result.skippedCount} record(s) skipped.`
        : `No ABSENT records were rolled back. ${result.checkedCount} eligible record(s) checked.`,
  };
}