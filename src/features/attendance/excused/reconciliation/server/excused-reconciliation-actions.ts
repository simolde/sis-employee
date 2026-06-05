"use server";

import type { Prisma } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/features/auth/server/session";
import { prisma } from "@/lib/db/prisma";
import { canManageEmployees } from "@/lib/security/roles";
import {
  buildAutomaticExcusedReconciliationWhere,
  parseExcusedReconciliationSearchParams,
} from "./excused-reconciliation-queries";
import type { ExcusedReconciliationActionState } from "../types/excused-reconciliation-types";

type RollbackExcusedRecord = {
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
    return 200;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return 200;
  }

  return Math.min(parsed, 200);
}

function buildRollbackOldValue(
  record: RollbackExcusedRecord,
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

function buildRollbackNewValue(input: {
  record: RollbackExcusedRecord;
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
    rollbackReason: "APPROVED_LEAVE_NO_LONGER_FOUND",
    rollbackSource: "EXCUSED_RECONCILIATION",
  };
}

function revalidateExcusedPages() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/attendance");
  revalidatePath("/dashboard/attendance/actions");
  revalidatePath("/dashboard/attendance/excused");
  revalidatePath("/dashboard/attendance/excused/reconciliation");
  revalidatePath("/dashboard/attendance/absences/candidates");
  revalidatePath("/dashboard/attendance/reports");
  revalidatePath("/dashboard/attendance/audit");
  revalidatePath("/dashboard/leaves");
}

export async function rollbackStaleExcusedRecordsAction(
  _previousState: ExcusedReconciliationActionState,
  formData: FormData,
): Promise<ExcusedReconciliationActionState> {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  if (!canManageEmployees(session.role)) {
    return {
      ok: false,
      message:
        "You do not have permission to reconcile automatic EXCUSED records.",
    };
  }

  const filters = parseExcusedReconciliationSearchParams(
    formDataToRecord(formData),
  );

  const limit = parseLimit(formData.get("limit"));
  const confirmed = formData.get("confirmRollback") === "on";

  if (!confirmed) {
    return {
      ok: false,
      message:
        "Please confirm that you want to rollback stale automatic EXCUSED records.",
      fieldErrors: {
        confirmRollback: ["Rollback confirmation is required."],
      },
    };
  }

  const where = buildAutomaticExcusedReconciliationWhere(filters);

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
      take: Math.min(limit * 10, 2000),
    });

    let rolledBackCount = 0;
    let protectedByLeaveCount = 0;
    let missingProvenanceCount = 0;
    let skippedCount = 0;

    for (const record of records) {
      if (rolledBackCount >= limit) {
        break;
      }

      const currentAttendance = await tx.attendance.findUnique({
        where: {
          attendanceId: record.attendanceId,
        },
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
      });

      if (
        !currentAttendance ||
        currentAttendance.status !== "EXCUSED" ||
        currentAttendance.isManual ||
        currentAttendance.timeIn ||
        currentAttendance.timeOut
      ) {
        skippedCount += 1;
        continue;
      }

      const approvedLeave = await tx.leave.findFirst({
        where: {
          empId: currentAttendance.empId,
          status: "APPROVED",
          dateFrom: {
            lte: currentAttendance.attDate,
          },
          dateTo: {
            gte: currentAttendance.attDate,
          },
        },
        select: {
          leaveId: true,
        },
      });

      if (approvedLeave) {
        protectedByLeaveCount += 1;
        continue;
      }

      const generationLog = await tx.activityLog.findFirst({
        where: {
          action: "ATTENDANCE_EXCUSED_AUTO_GENERATED",
          entityType: "attendance",
          entityId: String(currentAttendance.attendanceId),
        },
        select: {
          activityLogId: true,
        },
      });

      if (!generationLog) {
        missingProvenanceCount += 1;
        continue;
      }

      await tx.activityLog.create({
        data: {
          actorUserId: session.userId,
          action: "ATTENDANCE_EXCUSED_AUTO_ROLLED_BACK",
          entityType: "attendance",
          entityId: String(currentAttendance.attendanceId),
          oldValue: buildRollbackOldValue(currentAttendance),
          newValue: buildRollbackNewValue({
            record: currentAttendance,
            actorUserId: session.userId,
          }),
        },
      });

      await tx.attendance.delete({
        where: {
          attendanceId: currentAttendance.attendanceId,
        },
      });

      rolledBackCount += 1;
    }

    return {
      checkedCount: records.length,
      rolledBackCount,
      protectedByLeaveCount,
      missingProvenanceCount,
      skippedCount,
    };
  });

  revalidateExcusedPages();

  return {
    ok: true,
    checkedCount: result.checkedCount,
    rolledBackCount: result.rolledBackCount,
    protectedByLeaveCount: result.protectedByLeaveCount,
    missingProvenanceCount: result.missingProvenanceCount,
    skippedCount: result.skippedCount,
    message:
      result.rolledBackCount > 0
        ? `${result.rolledBackCount} stale automatic EXCUSED record(s) rolled back. ${result.protectedByLeaveCount} record(s) remained protected by approved leave. ${result.missingProvenanceCount} record(s) were protected because generation provenance was not found.`
        : `No EXCUSED records were rolled back. ${result.protectedByLeaveCount} record(s) remain covered by approved leave and ${result.missingProvenanceCount} record(s) require manual investigation.`,
  };
}