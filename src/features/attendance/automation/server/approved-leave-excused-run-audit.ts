import { randomUUID } from "node:crypto";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import type { ApprovedLeaveExcusedSyncFilters } from "@/features/attendance/excused/sync/types/approved-leave-excused-sync-types";
import {
  APPROVED_LEAVE_EXCUSED_AUTOMATION_RUN_ACTION,
  type ApprovedLeaveAutomationExecutionMode,
} from "../history/types/approved-leave-automation-history-types";

export type ApprovedLeaveExcusedAutomationRunStatus =
  | "COMPLETED"
  | "FAILED";

export type ApprovedLeaveExcusedAutomationRunCounts = {
  checkedCount: number;
  generatedCount: number;
  existingAttendanceCount: number;
  noApprovedLeaveCount: number;
  exceptionProtectedCount: number;
  notScheduledCount: number;
  skippedCount: number;
};

type RecordApprovedLeaveExcusedAutomationRunInput = {
  actorUserId: number | null;
  executionMode: ApprovedLeaveAutomationExecutionMode;
  status: ApprovedLeaveExcusedAutomationRunStatus;
  filters: ApprovedLeaveExcusedSyncFilters;
  limit: number;
  startedAt: Date;
  completedAt: Date;
  result: ApprovedLeaveExcusedAutomationRunCounts;
  attemptedGeneratedCount?: number;
  failureMessage?: string | null;
  retryOfRunAuditLogId?: number | null;
};

export type RecordedApprovedLeaveExcusedAutomationRun = {
  activityLogId: number;
  runKey: string;
};

function normalizeFailureMessage(
  value: string | null | undefined,
): string | null {
  const normalized = value?.trim();

  if (!normalized) {
    return null;
  }

  return normalized.slice(0, 1000);
}

function normalizeRetryRunId(
  value: number | null | undefined,
): number | null {
  if (
    typeof value !== "number" ||
    !Number.isInteger(value) ||
    value <= 0
  ) {
    return null;
  }

  return value;
}

function buildAutomationRunValue(
  input: RecordApprovedLeaveExcusedAutomationRunInput & {
    runKey: string;
  },
): Prisma.InputJsonObject {
  const durationMs = Math.max(
    0,
    input.completedAt.getTime() -
      input.startedAt.getTime(),
  );

  return {
    runKey: input.runKey,
    executionMode: input.executionMode,
    status: input.status,
    actorUserId: input.actorUserId,

    retryOfRunAuditLogId: normalizeRetryRunId(
      input.retryOfRunAuditLogId,
    ),

    attendanceDateFrom: input.filters.dateFrom,
    attendanceDateTo: input.filters.dateTo,
    employeeSearch: input.filters.q,
    branchId: input.filters.branchId,
    departmentId: input.filters.departmentId,

    limit: input.limit,

    checkedCount: input.result.checkedCount,
    generatedCount: input.result.generatedCount,

    attemptedGeneratedCount:
      input.attemptedGeneratedCount ??
      input.result.generatedCount,

    existingAttendanceCount:
      input.result.existingAttendanceCount,

    noApprovedLeaveCount:
      input.result.noApprovedLeaveCount,

    exceptionProtectedCount:
      input.result.exceptionProtectedCount,

    notScheduledCount:
      input.result.notScheduledCount,

    skippedCount: input.result.skippedCount,

    startedAt: input.startedAt.toISOString(),
    completedAt: input.completedAt.toISOString(),
    durationMs,

    committedChanges:
      input.status === "COMPLETED",

    failureMessage: normalizeFailureMessage(
      input.failureMessage,
    ),
  };
}

export async function recordApprovedLeaveExcusedAutomationRun(
  input: RecordApprovedLeaveExcusedAutomationRunInput,
): Promise<RecordedApprovedLeaveExcusedAutomationRun> {
  const runKey = [
    input.executionMode,
    input.status,
    randomUUID(),
  ].join(":");

  const activityLog =
    await prisma.activityLog.create({
      data: {
        actorUserId: input.actorUserId,
        action:
          APPROVED_LEAVE_EXCUSED_AUTOMATION_RUN_ACTION,
        entityType: "attendance_automation_run",
        entityId: runKey,
        oldValue: {
          runExisted: false,
        },
        newValue: buildAutomationRunValue({
          ...input,
          runKey,
        }),
      },
      select: {
        activityLogId: true,
      },
    });

  return {
    activityLogId:
      activityLog.activityLogId,
    runKey,
  };
}