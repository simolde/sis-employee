"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/features/auth/server/session";
import { canManageEmployees } from "@/lib/security/roles";
import { markEligibleMissingTimeouts } from "@/features/attendance/missing-timeouts/server/missing-timeout-service";
import type { AttendanceAutomationActionState } from "../types/attendance-automation-action-types";

function parseLimit(value: FormDataEntryValue | null): number {
  if (typeof value !== "string") {
    return 200;
  }

  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return 200;
  }

  return Math.min(parsed, 500);
}

function revalidateAttendanceAutomationPages() {
  revalidatePath("/dashboard/attendance");
  revalidatePath("/dashboard/attendance/actions");
  revalidatePath("/dashboard/attendance/automation");
  revalidatePath("/dashboard/attendance/missing-timeouts");
  revalidatePath("/dashboard/attendance/review");
  revalidatePath("/dashboard/attendance/reports");
}

export async function runMissingTimeoutAutomationAction(
  _previousState: AttendanceAutomationActionState,
  formData: FormData,
): Promise<AttendanceAutomationActionState> {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  if (!canManageEmployees(session.role)) {
    return {
      ok: false,
      message: "You do not have permission to run attendance automation.",
    };
  }

  const limit = parseLimit(formData.get("limit"));

  const result = await markEligibleMissingTimeouts({
    actorUserId: session.userId,
    limit,
  });

  revalidateAttendanceAutomationPages();

  return {
    ok: true,
    markedCount: result.markedCount,
    remainingEligibleCount: result.remainingEligibleCount,
    message:
      result.markedCount > 0
        ? `${result.markedCount} attendance record(s) marked as missing timeout. ${
            result.remainingEligibleCount > 0
              ? `${result.remainingEligibleCount} eligible record(s) remain. Run again to continue.`
              : "No eligible records remain."
          }`
        : "No eligible missing timeout records found.",
  };
}
