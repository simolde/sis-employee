"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/features/auth/server/session";
import { createExcusedAttendanceForApprovedLeave } from "@/features/attendance/absences/server/approved-leave-excused-service";
import { prisma } from "@/lib/db/prisma";
import { canManageEmployees } from "@/lib/security/roles";
import {
  getApprovedLeaveExcusedSyncCandidateSeeds,
  isApprovedLeaveSyncScheduleDay,
  parseApprovedLeaveExcusedSyncSearchParams,
  parseApprovedLeaveSyncDate,
} from "./approved-leave-excused-sync-queries";
import type { ApprovedLeaveExcusedSyncActionState } from "../types/approved-leave-excused-sync-types";

function formDataToSearchParams(
  formData: FormData,
): Record<
  string,
  string | string[] | undefined
> {
  const output: Record<
    string,
    string | string[] | undefined
  > = {};

  for (const [key, value] of formData.entries()) {
    if (typeof value === "string") {
      output[key] = value;
    }
  }

  return output;
}

function parseLimit(
  value: FormDataEntryValue | null,
): number {
  if (typeof value !== "string") {
    return 500;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return 500;
  }

  return Math.min(parsed, 500);
}

function revalidateExcusedSyncPages() {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/attendance");
  revalidatePath("/dashboard/attendance/actions");
  revalidatePath("/dashboard/attendance/excused");
  revalidatePath(
    "/dashboard/attendance/excused/sync",
  );
  revalidatePath(
    "/dashboard/attendance/excused/reconciliation",
  );
  revalidatePath(
    "/dashboard/attendance/excused/audit",
  );
  revalidatePath(
    "/dashboard/attendance/absences/candidates",
  );
  revalidatePath(
    "/dashboard/attendance/reports",
  );
  revalidatePath(
    "/dashboard/attendance/audit",
  );
  revalidatePath("/dashboard/leaves");
}

export async function syncApprovedLeaveExcusedRecordsAction(
  _previousState: ApprovedLeaveExcusedSyncActionState,
  formData: FormData,
): Promise<ApprovedLeaveExcusedSyncActionState> {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  if (!canManageEmployees(session.role)) {
    return {
      ok: false,
      message:
        "You do not have permission to synchronize approved-leave attendance.",
    };
  }

  const filters =
    parseApprovedLeaveExcusedSyncSearchParams(
      formDataToSearchParams(formData),
    );

  const limit = parseLimit(
    formData.get("limit"),
  );

  const confirmed =
    formData.get("confirmSync") === "on";

  if (!confirmed) {
    return {
      ok: false,
      message:
        "Please confirm that you reviewed the approved-leave EXCUSED candidates.",
      fieldErrors: {
        confirmSync: [
          "Confirmation is required before generating EXCUSED records.",
        ],
      },
    };
  }

  const candidateSeeds =
    await getApprovedLeaveExcusedSyncCandidateSeeds(
      filters,
      Math.min(limit * 10, 5000),
    );

  const result = await prisma.$transaction(
    async (tx) => {
      let checkedCount = 0;
      let generatedCount = 0;
      let existingAttendanceCount = 0;
      let noApprovedLeaveCount = 0;
      let exceptionProtectedCount = 0;
      let notScheduledCount = 0;
      let skippedCount = 0;

      for (const candidate of candidateSeeds) {
        if (generatedCount >= limit) {
          break;
        }

        checkedCount += 1;

        const attendanceDate =
          parseApprovedLeaveSyncDate(
            candidate.attendanceDateInput,
          );

        if (!attendanceDate) {
          skippedCount += 1;
          continue;
        }

        const employee =
          await tx.employee.findUnique({
            where: {
              empId: candidate.empId,
            },
            select: {
              empId: true,
              empNumber: true,
              status: true,
              branchId: true,
              scheduleId: true,
              schedule: {
                select: {
                  daysOfWeek: true,
                },
              },
            },
          });

        if (
          !employee ||
          employee.status !== "ACTIVE" ||
          !employee.scheduleId ||
          !employee.schedule ||
          !isApprovedLeaveSyncScheduleDay({
            date: attendanceDate,
            daysOfWeek:
              employee.schedule.daysOfWeek,
          })
        ) {
          notScheduledCount += 1;
          continue;
        }

        const blockingException =
          await tx.attendanceExceptionDate.findFirst({
            where: {
              exceptionDate: attendanceDate,
              status: "ACTIVE",
              affectsAbsenceGeneration: true,
              OR: [
                {
                  branchId: null,
                },
                {
                  branchId:
                    employee.branchId,
                },
              ],
            },
            select: {
              exceptionId: true,
            },
          });

        if (blockingException) {
          exceptionProtectedCount += 1;
          continue;
        }

        const syncResult =
          await createExcusedAttendanceForApprovedLeave(
            {
              tx,
              employee: {
                empId: employee.empId,
                empNumber:
                  employee.empNumber,
                scheduleId:
                  employee.scheduleId,
              },
              attDate: attendanceDate,
              actorUserId:
                session.userId,
            },
          );

        if (syncResult.created) {
          generatedCount += 1;
          continue;
        }

        if (
          syncResult.reason ===
          "ATTENDANCE_ALREADY_EXISTS"
        ) {
          existingAttendanceCount += 1;
          continue;
        }

        if (
          syncResult.reason ===
          "NO_APPROVED_LEAVE"
        ) {
          noApprovedLeaveCount += 1;
          continue;
        }

        if (
          syncResult.reason ===
          "NO_ASSIGNED_SCHEDULE"
        ) {
          notScheduledCount += 1;
          continue;
        }

        skippedCount += 1;
      }

      return {
        checkedCount,
        generatedCount,
        existingAttendanceCount,
        noApprovedLeaveCount,
        exceptionProtectedCount,
        notScheduledCount,
        skippedCount,
      };
    },
    {
      maxWait: 10_000,
      timeout: 60_000,
    },
  );

  revalidateExcusedSyncPages();

  return {
    ok: true,
    checkedCount: result.checkedCount,
    generatedCount: result.generatedCount,
    existingAttendanceCount:
      result.existingAttendanceCount,
    noApprovedLeaveCount:
      result.noApprovedLeaveCount,
    exceptionProtectedCount:
      result.exceptionProtectedCount,
    notScheduledCount:
      result.notScheduledCount,
    skippedCount: result.skippedCount,
    message:
      result.generatedCount > 0
        ? `${result.generatedCount} missing EXCUSED record(s) generated from approved leave. ${result.existingAttendanceCount} record(s) already had attendance, ${result.exceptionProtectedCount} were protected by exception dates, and ${result.noApprovedLeaveCount} no longer had approved leave.`
        : `No EXCUSED records were generated. Existing attendance, schedule rules, exception dates, and current leave approval were rechecked before every attempted record.`,
  };
}