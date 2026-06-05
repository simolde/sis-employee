"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/features/auth/server/session";
import { canManageEmployees } from "@/lib/security/roles";
import { runApprovedLeaveExcusedSync } from "./approved-leave-excused-sync-service";
import { parseApprovedLeaveExcusedSyncSearchParams } from "./approved-leave-excused-sync-queries";
import type { ApprovedLeaveExcusedSyncActionState } from "../types/approved-leave-excused-sync-types";

function formDataToSearchParams(
  formData: FormData,
): Record<string, string | string[] | undefined> {
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

  const limit = parseLimit(formData.get("limit"));

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

  const result = await runApprovedLeaveExcusedSync({
    filters,
    actorUserId: session.userId,
    limit,
    generationSource: "APPROVED_LEAVE_SYNC",
  });

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
    notScheduledCount: result.notScheduledCount,
    skippedCount: result.skippedCount,
    message:
      result.generatedCount > 0
        ? `${result.generatedCount} missing EXCUSED record(s) generated. ${result.existingAttendanceCount} already had attendance, ${result.exceptionProtectedCount} were protected by exception dates, and ${result.noApprovedLeaveCount} no longer had approved leave.`
        : "No EXCUSED records were generated. Existing attendance, approved leave, schedules, and exception dates were rechecked.",
  };
}