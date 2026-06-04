"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/features/auth/server/session";
import { canManageEmployees } from "@/lib/security/roles";
import { recalculateNormalAttendanceStatuses } from "./attendance-status-recalculation-service";
import type { AttendanceStatusRecalculationActionState } from "../types/attendance-status-recalculation-types";

function parseLimit(value: FormDataEntryValue | null): number {
  if (typeof value !== "string") {
    return 300;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return 300;
  }

  return Math.min(parsed, 1000);
}

function revalidateAttendanceStatusPages() {
  revalidatePath("/dashboard/attendance");
  revalidatePath("/dashboard/attendance/actions");
  revalidatePath("/dashboard/attendance/review");
  revalidatePath("/dashboard/attendance/reports");
  revalidatePath("/dashboard/attendance/status-recalculation");
  revalidatePath("/dashboard/attendance/audit");
}

export async function recalculateAttendanceStatusAction(
  _previousState: AttendanceStatusRecalculationActionState,
  formData: FormData,
): Promise<AttendanceStatusRecalculationActionState> {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  if (!canManageEmployees(session.role)) {
    return {
      ok: false,
      message: "You do not have permission to recalculate attendance status.",
    };
  }

  const limit = parseLimit(formData.get("limit"));

  const result = await recalculateNormalAttendanceStatuses({
    actorUserId: session.userId,
    limit,
  });

  revalidateAttendanceStatusPages();

  return {
    ok: true,
    processedCount: result.processedCount,
    updatedCount: result.updatedCount,
    skippedCount: result.skippedCount,
    message:
      result.updatedCount > 0
        ? `${result.updatedCount} attendance record(s) updated. ${result.skippedCount} record(s) were already correct or skipped.`
        : `No status changes needed. ${result.processedCount} record(s) checked.`,
  };
}