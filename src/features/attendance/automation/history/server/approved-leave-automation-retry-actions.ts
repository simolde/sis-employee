"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/features/auth/server/session";
import {
  ApprovedLeaveExcusedAutomationExecutionError,
  runApprovedLeaveExcusedSync,
} from "@/features/attendance/excused/sync/server/approved-leave-excused-sync-service";
import type { ApprovedLeaveExcusedSyncFilters } from "@/features/attendance/excused/sync/types/approved-leave-excused-sync-types";
import { canManageEmployees } from "@/lib/security/roles";
import { getApprovedLeaveAutomationHistoryDetail } from "./approved-leave-automation-history-queries";
import type { ApprovedLeaveAutomationRetryActionState } from "../types/approved-leave-automation-retry-types";

function parsePositiveInteger(
  value: FormDataEntryValue | null,
): number | null {
  if (typeof value !== "string") {
    return null;
  }

  const parsed = Number(value);

  if (
    !Number.isInteger(parsed) ||
    parsed <= 0
  ) {
    return null;
  }

  return parsed;
}

function normalizeLimit(
  value: number,
): number {
  if (
    !Number.isInteger(value) ||
    value <= 0
  ) {
    return 500;
  }

  return Math.min(value, 500);
}

function revalidateRetryPages(
  originalRunAuditLogId: number,
) {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/attendance");

  revalidatePath(
    "/dashboard/attendance/actions",
  );

  revalidatePath(
    "/dashboard/attendance/automation",
  );

  revalidatePath(
    "/dashboard/attendance/automation/approved-leave-excused",
  );

  revalidatePath(
    "/dashboard/attendance/automation/approved-leave-excused/history",
  );

  revalidatePath(
    `/dashboard/attendance/automation/approved-leave-excused/history/${originalRunAuditLogId}`,
  );

  revalidatePath(
    "/dashboard/attendance/excused",
  );

  revalidatePath(
    "/dashboard/attendance/excused/audit",
  );

  revalidatePath(
    "/dashboard/attendance/audit",
  );
}

export async function retryApprovedLeaveAutomationAction(
  _previousState: ApprovedLeaveAutomationRetryActionState,
  formData: FormData,
): Promise<ApprovedLeaveAutomationRetryActionState> {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  if (!canManageEmployees(session.role)) {
    return {
      ok: false,
      message:
        "You do not have permission to retry attendance automation.",
    };
  }

  const originalRunAuditLogId =
    parsePositiveInteger(
      formData.get(
        "originalRunAuditLogId",
      ),
    );

  const confirmed =
    formData.get("confirmRetry") ===
    "on";

  if (!originalRunAuditLogId) {
    return {
      ok: false,
      message:
        "The original automation run could not be identified.",
    };
  }

  if (!confirmed) {
    return {
      ok: false,
      message:
        "Confirm the retry before continuing.",
      originalRunAuditLogId,
      fieldErrors: {
        confirmRetry: [
          "Retry confirmation is required.",
        ],
      },
    };
  }

  const originalRun =
    await getApprovedLeaveAutomationHistoryDetail(
      originalRunAuditLogId,
    );

  if (!originalRun) {
    return {
      ok: false,
      message:
        "The original automation run no longer exists.",
      originalRunAuditLogId,
    };
  }

  if (
    originalRun.status !== "FAILED"
  ) {
    return {
      ok: false,
      message:
        "Only failed automation runs can be retried from this page.",
      originalRunAuditLogId,
    };
  }

  const filters: ApprovedLeaveExcusedSyncFilters =
    {
      q: originalRun.employeeSearch,
      branchId: originalRun.branchId,
      departmentId:
        originalRun.departmentId,
      dateFrom:
        originalRun.attendanceDateFrom,
      dateTo:
        originalRun.attendanceDateTo,
      page: 1,
      pageSize: 20,
    };

  try {
    const result =
      await runApprovedLeaveExcusedSync({
        filters,
        actorUserId: session.userId,

        limit: normalizeLimit(
          originalRun.limit,
        ),

        generationSource:
          "APPROVED_LEAVE_AUTOMATION",

        automationExecutionMode:
          "DASHBOARD",

        retryOfRunAuditLogId:
          originalRunAuditLogId,
      });

    revalidateRetryPages(
      originalRunAuditLogId,
    );

    if (result.runAuditLogId) {
      revalidatePath(
        `/dashboard/attendance/automation/approved-leave-excused/history/${result.runAuditLogId}`,
      );
    }

    return {
      ok: true,

      message:
        result.generatedCount > 0
          ? `Retry completed and generated ${result.generatedCount} EXCUSED record(s). New run #${result.runAuditLogId ?? "—"} was recorded.`
          : `Retry completed without generating new attendance. New run #${result.runAuditLogId ?? "—"} was recorded.`,

      originalRunAuditLogId,

      runAuditLogId:
        result.runAuditLogId,

      checkedCount:
        result.checkedCount,

      generatedCount:
        result.generatedCount,

      existingAttendanceCount:
        result.existingAttendanceCount,

      exceptionProtectedCount:
        result.exceptionProtectedCount,

      notScheduledCount:
        result.notScheduledCount,
    };
  } catch (error) {
    revalidateRetryPages(
      originalRunAuditLogId,
    );

    if (
      error instanceof
      ApprovedLeaveExcusedAutomationExecutionError
    ) {
      if (error.runAuditLogId) {
        revalidatePath(
          `/dashboard/attendance/automation/approved-leave-excused/history/${error.runAuditLogId}`,
        );
      }

      return {
        ok: false,

        message:
          error.runAuditLogId
            ? `The retry also failed. New failed run #${error.runAuditLogId} was recorded.`
            : error.message,

        originalRunAuditLogId,

        runAuditLogId:
          error.runAuditLogId,
      };
    }

    console.error(
      "Unable to retry approved-leave automation:",
      error,
    );

    return {
      ok: false,
      message:
        "The automation retry failed unexpectedly.",
      originalRunAuditLogId,
    };
  }
}