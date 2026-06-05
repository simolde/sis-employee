import type { ApprovedLeaveExcusedGenerationSource } from "@/features/attendance/absences/server/approved-leave-excused-service";
import { createExcusedAttendanceForApprovedLeave } from "@/features/attendance/absences/server/approved-leave-excused-service";
import type { ApprovedLeaveAutomationExecutionMode } from "@/features/attendance/automation/history/types/approved-leave-automation-history-types";
import {
  recordApprovedLeaveExcusedAutomationRun,
  type ApprovedLeaveExcusedAutomationRunCounts,
} from "@/features/attendance/automation/server/approved-leave-excused-run-audit";
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

export type RunApprovedLeaveExcusedSyncResult =
  ApprovedLeaveExcusedAutomationRunCounts & {
    runAuditLogId: number | null;
  };

export class ApprovedLeaveExcusedAutomationExecutionError extends Error {
  readonly runAuditLogId: number | null;

  constructor(
    message: string,
    runAuditLogId: number | null,
    cause?: unknown,
  ) {
    super(message);

    this.name =
      "ApprovedLeaveExcusedAutomationExecutionError";

    this.runAuditLogId = runAuditLogId;

    if (cause !== undefined) {
      (
        this as Error & {
          cause?: unknown;
        }
      ).cause = cause;
    }
  }
}

function createEmptyCounts(): ApprovedLeaveExcusedAutomationRunCounts {
  return {
    checkedCount: 0,
    generatedCount: 0,
    existingAttendanceCount: 0,
    noApprovedLeaveCount: 0,
    exceptionProtectedCount: 0,
    notScheduledCount: 0,
    skippedCount: 0,
  };
}

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

function getExecutionMode(input: {
  actorUserId: number | null;
  automationExecutionMode:
    | ApprovedLeaveAutomationExecutionMode
    | undefined;
}): ApprovedLeaveAutomationExecutionMode {
  if (input.automationExecutionMode) {
    return input.automationExecutionMode;
  }

  return input.actorUserId === null
    ? "API"
    : "DASHBOARD";
}

function getFailureMessage(
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

  return "Unexpected approved-leave automation error.";
}

async function recordFailedRun(input: {
  actorUserId: number | null;
  executionMode: ApprovedLeaveAutomationExecutionMode;
  filters: ApprovedLeaveExcusedSyncFilters;
  limit: number;
  startedAt: Date;
  progress: ApprovedLeaveExcusedAutomationRunCounts;
  error: unknown;
}): Promise<number | null> {
  try {
    const record =
      await recordApprovedLeaveExcusedAutomationRun({
        actorUserId: input.actorUserId,
        executionMode:
          input.executionMode,
        status: "FAILED",
        filters: input.filters,
        limit: input.limit,
        startedAt: input.startedAt,
        completedAt: new Date(),

        /*
         * The main transaction was rolled back.
         * Therefore, committed generated records
         * must be reported as zero.
         */
        result: {
          ...input.progress,
          generatedCount: 0,
        },

        attemptedGeneratedCount:
          input.progress.generatedCount,

        failureMessage:
          getFailureMessage(input.error),
      });

    return record.activityLogId;
  } catch (auditError) {
    console.error(
      "Unable to record failed approved-leave automation run:",
      auditError,
    );

    return null;
  }
}

async function recordCompletedRun(input: {
  actorUserId: number | null;
  executionMode: ApprovedLeaveAutomationExecutionMode;
  filters: ApprovedLeaveExcusedSyncFilters;
  limit: number;
  startedAt: Date;
  result: ApprovedLeaveExcusedAutomationRunCounts;
}): Promise<number | null> {
  try {
    const record =
      await recordApprovedLeaveExcusedAutomationRun({
        actorUserId: input.actorUserId,
        executionMode:
          input.executionMode,
        status: "COMPLETED",
        filters: input.filters,
        limit: input.limit,
        startedAt: input.startedAt,
        completedAt: new Date(),
        result: input.result,
        attemptedGeneratedCount:
          input.result.generatedCount,
        failureMessage: null,
      });

    return record.activityLogId;
  } catch (auditError) {
    /*
     * The attendance transaction already committed.
     * A run-history logging failure must not report
     * the attendance operation itself as failed.
     */
    console.error(
      "Unable to record completed approved-leave automation run:",
      auditError,
    );

    return null;
  }
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

  const progress = createEmptyCounts();

  const isAutomationRun =
    generationSource ===
    "APPROVED_LEAVE_AUTOMATION";

  const executionMode = getExecutionMode({
    actorUserId,
    automationExecutionMode,
  });

  let result: ApprovedLeaveExcusedAutomationRunCounts;

  try {
    const candidateSeeds =
      await getApprovedLeaveExcusedSyncCandidateSeeds(
        filters,
        Math.min(limit * 10, 5000),
      );

    result = await prisma.$transaction(
      async (tx) => {
        for (const candidate of candidateSeeds) {
          if (
            progress.generatedCount >= limit
          ) {
            break;
          }

          progress.checkedCount += 1;

          const attendanceDate =
            parseApprovedLeaveSyncDate(
              candidate.attendanceDateInput,
            );

          if (!attendanceDate) {
            progress.skippedCount += 1;
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
            progress.notScheduledCount += 1;
            continue;
          }

          const blockingException =
            await tx.attendanceExceptionDate.findFirst({
              where: {
                exceptionDate:
                  attendanceDate,
                status: "ACTIVE",
                affectsAbsenceGeneration:
                  true,
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
            progress.exceptionProtectedCount +=
              1;

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
                attDate:
                  attendanceDate,
                actorUserId,
                generationSource,
              },
            );

          if (syncResult.created) {
            progress.generatedCount += 1;
            continue;
          }

          switch (syncResult.reason) {
            case "ATTENDANCE_ALREADY_EXISTS":
              progress.existingAttendanceCount +=
                1;
              break;

            case "NO_APPROVED_LEAVE":
              progress.noApprovedLeaveCount +=
                1;
              break;

            case "NO_ASSIGNED_SCHEDULE":
              progress.notScheduledCount += 1;
              break;

            default:
              progress.skippedCount += 1;
          }
        }

        return {
          ...progress,
        };
      },
      {
        maxWait: 10_000,
        timeout: 60_000,
      },
    );
  } catch (error) {
    const failedRunAuditLogId =
      isAutomationRun
        ? await recordFailedRun({
            actorUserId,
            executionMode,
            filters,
            limit,
            startedAt,
            progress,
            error,
          })
        : null;

    if (isAutomationRun) {
      throw new ApprovedLeaveExcusedAutomationExecutionError(
        failedRunAuditLogId
          ? `Approved-leave EXCUSED automation failed. Failed run #${failedRunAuditLogId} was recorded.`
          : "Approved-leave EXCUSED automation failed. The failed run log could not be recorded.",
        failedRunAuditLogId,
        error,
      );
    }

    throw error;
  }

  const runAuditLogId =
    isAutomationRun
      ? await recordCompletedRun({
          actorUserId,
          executionMode,
          filters,
          limit,
          startedAt,
          result,
        })
      : null;

  return {
    ...result,
    runAuditLogId,
  };
}