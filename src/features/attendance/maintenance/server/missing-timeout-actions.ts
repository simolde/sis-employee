"use server";

import {
  revalidatePath,
} from "next/cache";
import {
  redirect,
} from "next/navigation";
import { getCurrentSession } from "@/features/auth/server/session";
import { markEligibleMissingTimeouts } from "@/features/attendance/missing-timeouts/server/missing-timeout-service";
import { canManageEmployees } from "@/lib/security/roles";
import type { MissingTimeoutActionState } from "../types/missing-timeout-types";

function revalidateMissingTimeoutMaintenancePages(): void {
  revalidatePath(
    "/dashboard/attendance",
  );

  revalidatePath(
    "/dashboard/attendance/maintenance",
  );

  revalidatePath(
    "/dashboard/attendance/missing-timeouts",
  );

  revalidatePath(
    "/dashboard/attendance/reports",
  );

  revalidatePath(
    "/dashboard/attendance/audit",
  );
}

export async function markMissingTimeoutsAction(): Promise<MissingTimeoutActionState> {
  const session =
    await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  if (
    !canManageEmployees(
      session.role,
    )
  ) {
    return {
      ok: false,

      message:
        "You do not have permission to mark missing time-outs.",
    };
  }

  const result =
    await markEligibleMissingTimeouts({
      actorUserId:
        session.userId,

      limit:
        500,

      mode:
        "MANUAL_ADMIN",
    });

  revalidateMissingTimeoutMaintenancePages();

  if (
    result.markedCount === 0
  ) {
    return {
      ok: false,

      message:
        `No eligible missing time-out records were found using the ${result.policy.missingTimeoutMinutes}-minute policy threshold.`,
    };
  }

  return {
    ok: true,

    message:
      `${result.markedCount} attendance record(s) marked as MISSING TIMEOUT using the ${result.policy.missingTimeoutMinutes}-minute policy threshold.`,
  };
}