import type { ApprovedLeaveExcusedGenerationSource } from "@/features/attendance/absences/server/approved-leave-excused-service";
import { createExcusedAttendanceForApprovedLeave } from "@/features/attendance/absences/server/approved-leave-excused-service";
import { recordApprovedLeaveExcusedAutomationRun } from "@/features/attendance/automation/server/approved-leave-excused-run-audit";
import type { ApprovedLeaveAutomationExecutionMode } from "@/features/attendance/automation/history/types/approved-leave-automation-history-types";
import { prisma } from "@/lib/db/prisma";
import {
  getApprovedLeaveExcusedSyncCandidateSeeds,
  isApprovedLeaveSyncScheduleDay,
  parseApprovedLeaveSyncDate,
} from "./approved-leave-excused-sync-queries";
import type { ApprovedLeaveExcusedSyncFilters } from "../types/approved-leave-excused-sync-types";

export type RunApprovedLeaveExcusedSyncInput = {
  filters: ApprovedLeaveExcusedSyncFilters;
  actorUserId: number | null;
  limit?: number;
  generationSource?: ApprovedLeaveExcusedGenerationSource;
  automationExecutionMode?: ApprovedLeaveAutomationExecutionMode;
};

export type RunApprovedLeaveExcusedSyncResult = {
  checkedCount: number;
  generatedCount: number;
  existingAttendanceCount: number;
  noApprovedLeaveCount: number;
  exceptionProtectedCount: number;
  notScheduledCount: number;
  skippedCount: number;
  runAuditLogId: number | null;
};

type ApprovedLeaveExcusedSyncCounts = Omit<
  RunApprovedLeaveExcusedSyncResult,
  "runAuditLogId"
>;

function normalizeLimit(
  value: number | undefined,
): number {
  if (
    !value ||
    !Number.isInteger(value) ||
    value <= 0
  ) {
    return 500;
  }

  return Math.min(value, 500);
}

export async function runApprovedLeaveExcusedSync({
  filters,
  actorUserId,
  limit: requestedLimit,
  generationSource = "APPROVED_LEAVE_SYNC",
  automationExecutionMode,
}: RunApprovedLeaveExcusedSyncInput): Promise<RunApprovedLeaveExcusedSyncResult> {
  const limit = normalizeLimit(
    requestedLimit,
  );

  const startedAt = new Date();

  const candidateSeeds =
    await getApprovedLeaveExcusedSyncCandidateSeeds(
      filters,
      Math.min(limit * 10, 5000),
    );

  const result =
    await prisma.$transaction(
      async (tx): Promise<ApprovedLeaveExcusedSyncCounts> => {
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
                    branchId: employee.branchId,
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
            await createExcusedAttendanceForApprovedLeave({
              tx,
              employee: {
                empId: employee.empId,
                empNumber: employee.empNumber,
                scheduleId: employee.scheduleId,
              },
              attDate: attendanceDate,
              actorUserId,
              generationSource,
            });

          if (syncResult.created) {
            generatedCount += 1;
            continue;
          }

          switch (syncResult.reason) {
            case "ATTENDANCE_ALREADY_EXISTS":
              existingAttendanceCount += 1;
              break;

            case "NO_APPROVED_LEAVE":
              noApprovedLeaveCount += 1;
              break;

            case "NO_ASSIGNED_SCHEDULE":
              notScheduledCount += 1;
              break;

            default:
              skippedCount += 1;
          }
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

  const completedAt = new Date();

  let runAuditLogId: number | null = null;

  if (
    generationSource ===
    "APPROVED_LEAVE_AUTOMATION"
  ) {
    const executionMode =
      automationExecutionMode ??
      (actorUserId === null
        ? "API"
        : "DASHBOARD");

    const recordedRun =
      await recordApprovedLeaveExcusedAutomationRun({
        actorUserId,
        executionMode,
        filters,
        limit,
        startedAt,
        completedAt,
        result,
      });

    runAuditLogId =
      recordedRun.activityLogId;
  }

  return {
    ...result,
    runAuditLogId,
  };
}