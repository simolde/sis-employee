import { runApprovedLeaveExcusedSync } from "@/features/attendance/excused/sync/server/approved-leave-excused-sync-service";
import type { ApprovedLeaveExcusedSyncFilters } from "@/features/attendance/excused/sync/types/approved-leave-excused-sync-types";

export type ApprovedLeaveExcusedAutomationOptions = {
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
};

export type ApprovedLeaveExcusedAutomationResult = {
  startedAt: string;
  completedAt: string;
  dateFrom: string;
  dateTo: string;
  checkedCount: number;
  generatedCount: number;
  existingAttendanceCount: number;
  noApprovedLeaveCount: number;
  exceptionProtectedCount: number;
  notScheduledCount: number;
  skippedCount: number;
};

function getManilaDateInputValue(
  offsetDays = 0,
): string {
  const now = new Date();

  const targetDate = new Date(
    now.getTime() +
      offsetDays * 24 * 60 * 60 * 1000,
  );

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(targetDate);

  const year =
    parts.find((part) => part.type === "year")
      ?.value ?? "";

  const month =
    parts.find((part) => part.type === "month")
      ?.value ?? "";

  const day =
    parts.find((part) => part.type === "day")
      ?.value ?? "";

  return `${year}-${month}-${day}`;
}

function validDateInput(
  value: string | undefined,
): value is string {
  return Boolean(
    value &&
      /^\d{4}-\d{2}-\d{2}$/.test(value),
  );
}

function normalizeLimit(
  value: number | undefined,
): number {
  if (!value || !Number.isInteger(value) || value <= 0) {
    return 500;
  }

  return Math.min(value, 500);
}

export async function runApprovedLeaveExcusedAutomation(
  options: ApprovedLeaveExcusedAutomationOptions = {},
): Promise<ApprovedLeaveExcusedAutomationResult> {
  const startedAt = new Date();

  const dateFrom = validDateInput(options.dateFrom)
    ? options.dateFrom
    : getManilaDateInputValue(-30);

  const dateTo = validDateInput(options.dateTo)
    ? options.dateTo
    : getManilaDateInputValue();

  const filters: ApprovedLeaveExcusedSyncFilters = {
    q: "",
    branchId: "",
    departmentId: "",
    dateFrom,
    dateTo,
    page: 1,
    pageSize: 20,
  };

  const result = await runApprovedLeaveExcusedSync({
    filters,
    actorUserId: null,
    limit: normalizeLimit(options.limit),
    generationSource:
      "APPROVED_LEAVE_AUTOMATION",
  });

  return {
    startedAt: startedAt.toISOString(),
    completedAt: new Date().toISOString(),
    dateFrom,
    dateTo,
    ...result,
  };
}