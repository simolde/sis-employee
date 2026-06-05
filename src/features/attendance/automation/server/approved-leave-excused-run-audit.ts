import { randomUUID } from "node:crypto";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import {
  APPROVED_LEAVE_EXCUSED_AUTOMATION_RUN_ACTION,
  type ApprovedLeaveAutomationExecutionMode,
} from "../history/types/approved-leave-automation-history-types";
import type { ApprovedLeaveExcusedSyncFilters } from "@/features/attendance/excused/sync/types/approved-leave-excused-sync-types";

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
  filters: ApprovedLeaveExcusedSyncFilters;
  limit: number;
  startedAt: Date;
  completedAt: Date;
  result: ApprovedLeaveExcusedAutomationRunCounts;
};

export type RecordedApprovedLeaveExcusedAutomationRun = {
  activityLogId: number;
  runKey: string;
};

function buildAutomationRunValue(
  input: RecordApprovedLeaveExcusedAutomationRunInput & {
    runKey: string;
  },
): Prisma.InputJsonObject {
  return {
    runKey: input.runKey,
    executionMode: input.executionMode,
    actorUserId: input.actorUserId,
    attendanceDateFrom: input.filters.dateFrom,
    attendanceDateTo: input.filters.dateTo,
    employeeSearch: input.filters.q,
    branchId: input.filters.branchId,
    departmentId: input.filters.departmentId,
    limit: input.limit,
    checkedCount: input.result.checkedCount,
    generatedCount: input.result.generatedCount,
    existingAttendanceCount:
      input.result.existingAttendanceCount,
    noApprovedLeaveCount:
      input.result.noApprovedLeaveCount,
    exceptionProtectedCount:
      input.result.exceptionProtectedCount,
    notScheduledCount: input.result.notScheduledCount,
    skippedCount: input.result.skippedCount,
    startedAt: input.startedAt.toISOString(),
    completedAt: input.completedAt.toISOString(),
    durationMs: Math.max(
      0,
      input.completedAt.getTime() -
        input.startedAt.getTime(),
    ),
    status: "COMPLETED",
  };
}

export async function recordApprovedLeaveExcusedAutomationRun(
  input: RecordApprovedLeaveExcusedAutomationRunInput,
): Promise<RecordedApprovedLeaveExcusedAutomationRun> {
  const runKey = `${input.executionMode}:${randomUUID()}`;

  const activityLog = await prisma.activityLog.create({
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
    activityLogId: activityLog.activityLogId,
    runKey,
  };
}