"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/features/auth/server/session";
import { runApprovedLeaveExcusedSync } from "@/features/attendance/excused/sync/server/approved-leave-excused-sync-service";
import { parseApprovedLeaveSyncDate } from "@/features/attendance/excused/sync/server/approved-leave-excused-sync-queries";
import type { ApprovedLeaveExcusedSyncFilters } from "@/features/attendance/excused/sync/types/approved-leave-excused-sync-types";
import { canManageEmployees } from "@/lib/security/roles";
import type { ApprovedLeaveExcusedAutomationActionState } from "../types/approved-leave-excused-automation-types";

const MAXIMUM_DATE_RANGE_DAYS = 366;
const MAXIMUM_RECORDS_PER_RUN = 500;

function formDataString(
  formData: FormData,
  key: string,
): string {
  const value = formData.get(key);

  return typeof value === "string"
    ? value.trim()
    : "";
}

function parseLimit(
  value: string,
): number | null {
  const parsed = Number(value);

  if (
    !Number.isInteger(parsed) ||
    parsed <= 0 ||
    parsed > MAXIMUM_RECORDS_PER_RUN
  ) {
    return null;
  }

  return parsed;
}

function getInclusiveDateRangeDays(
  dateFrom: Date,
  dateTo: Date,
): number {
  const millisecondsPerDay =
    24 * 60 * 60 * 1000;

  return (
    Math.floor(
      (dateTo.getTime() - dateFrom.getTime()) /
        millisecondsPerDay,
    ) + 1
  );
}

function revalidateApprovedLeaveAutomationPages() {
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
    "/dashboard/attendance/excused",
  );
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

export async function runApprovedLeaveExcusedAutomationAction(
  _previousState: ApprovedLeaveExcusedAutomationActionState,
  formData: FormData,
): Promise<ApprovedLeaveExcusedAutomationActionState> {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  if (!canManageEmployees(session.role)) {
    return {
      ok: false,
      message:
        "You do not have permission to run approved-leave attendance automation.",
    };
  }

  const dateFromValue = formDataString(
    formData,
    "dateFrom",
  );

  const dateToValue = formDataString(
    formData,
    "dateTo",
  );

  const limitValue = formDataString(
    formData,
    "limit",
  );

  const confirmed =
    formData.get("confirmRun") === "on";

  const dateFrom =
    parseApprovedLeaveSyncDate(
      dateFromValue,
    );

  const dateTo =
    parseApprovedLeaveSyncDate(
      dateToValue,
    );

  const limit = parseLimit(limitValue);

  const fieldErrors: ApprovedLeaveExcusedAutomationActionState["fieldErrors"] =
    {};

  if (!dateFrom) {
    fieldErrors.dateFrom = [
      "Select a valid start date.",
    ];
  }

  if (!dateTo) {
    fieldErrors.dateTo = [
      "Select a valid end date.",
    ];
  }

  if (
    dateFrom &&
    dateTo &&
    dateFrom.getTime() > dateTo.getTime()
  ) {
    fieldErrors.dateTo = [
      "The end date must be on or after the start date.",
    ];
  }

  if (dateFrom && dateTo) {
    const rangeDays =
      getInclusiveDateRangeDays(
        dateFrom,
        dateTo,
      );

    if (
      rangeDays >
      MAXIMUM_DATE_RANGE_DAYS
    ) {
      fieldErrors.dateTo = [
        `The automation range cannot exceed ${MAXIMUM_DATE_RANGE_DAYS} days.`,
      ];
    }
  }

  if (!limit) {
    fieldErrors.limit = [
      `Enter a value from 1 to ${MAXIMUM_RECORDS_PER_RUN}.`,
    ];
  }

  if (!confirmed) {
    fieldErrors.confirmRun = [
      "Confirm the automation run before continuing.",
    ];
  }

  if (
    Object.keys(fieldErrors).length > 0 ||
    !dateFrom ||
    !dateTo ||
    !limit
  ) {
    return {
      ok: false,
      message:
        "Review the automation settings before running the process.",
      fieldErrors,
    };
  }

  const filters: ApprovedLeaveExcusedSyncFilters =
    {
      q: formDataString(formData, "q"),
      branchId: formDataString(
        formData,
        "branchId",
      ),
      departmentId: formDataString(
        formData,
        "departmentId",
      ),
      dateFrom: dateFromValue,
      dateTo: dateToValue,
      page: 1,
      pageSize: 20,
    };

  const result =
    await runApprovedLeaveExcusedSync({
      filters,
      actorUserId: session.userId,
      limit,
      generationSource:
        "APPROVED_LEAVE_AUTOMATION",
      automationExecutionMode: "DASHBOARD",
    });

  revalidateApprovedLeaveAutomationPages();

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
    runAuditLogId: result.runAuditLogId,
    message:
      result.generatedCount > 0
        ? `${result.generatedCount} missing EXCUSED record(s) were generated. Automation run log #${result.runAuditLogId ?? "—"} was recorded.`
        : `No EXCUSED records were generated. Automation run log #${result.runAuditLogId ?? "—"} was still recorded for traceability.`,
  };
}