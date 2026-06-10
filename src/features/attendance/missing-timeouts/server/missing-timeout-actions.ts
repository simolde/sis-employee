"use server";

import {
  revalidatePath,
} from "next/cache";
import {
  redirect,
} from "next/navigation";
import { getCurrentSession } from "@/features/auth/server/session";
import { canManageEmployees } from "@/lib/security/roles";
import type { MissingTimeoutActionState } from "../types/missing-timeout-types";
import {
  markEligibleMissingTimeouts,
  markSingleMissingTimeout,
} from "./missing-timeout-service";

function parsePositiveId(
  value:
    FormDataEntryValue |
    null,
): number | null {
  if (
    typeof value !==
    "string"
  ) {
    return null;
  }

  const parsed =
    Number(value);

  if (
    !Number.isInteger(parsed) ||
    parsed <= 0
  ) {
    return null;
  }

  return parsed;
}

function revalidateMissingTimeoutPages(
  attendanceId?: number,
): void {
  revalidatePath(
    "/dashboard/attendance",
  );

  revalidatePath(
    "/dashboard/attendance/actions",
  );

  revalidatePath(
    "/dashboard/attendance/missing-timeouts",
  );

  revalidatePath(
    "/dashboard/attendance/maintenance",
  );

  revalidatePath(
    "/dashboard/attendance/reports",
  );

  revalidatePath(
    "/dashboard/attendance/audit",
  );

  if (attendanceId) {
    revalidatePath(
      `/dashboard/attendance/${attendanceId}`,
    );
  }
}

export async function markMissingTimeoutAction(
  _previousState:
    MissingTimeoutActionState,

  formData: FormData,
): Promise<MissingTimeoutActionState> {
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
        "You do not have permission to manage missing timeouts.",
    };
  }

  const mode =
    String(
      formData.get(
        "mode",
      ) ?? "",
    );

  if (
    mode ===
    "MARK_SINGLE"
  ) {
    const attendanceId =
      parsePositiveId(
        formData.get(
          "attendanceId",
        ),
      );

    if (!attendanceId) {
      return {
        ok: false,

        message:
          "Invalid attendance record.",

        fieldErrors: {
          attendanceId: [
            "Invalid attendance record.",
          ],
        },
      };
    }

    const result =
      await markSingleMissingTimeout({
        attendanceId,

        actorUserId:
          session.userId,
      });

    revalidateMissingTimeoutPages(
      attendanceId,
    );

    return {
      ok:
        result.markedCount >
        0,

      message:
        result.markedCount >
        0
          ? `Attendance record marked as missing timeout using the ${result.policy.missingTimeoutMinutes}-minute policy threshold.`
          : "This record is no longer eligible for missing timeout marking.",
    };
  }

  if (
    mode ===
    "MARK_ALL"
  ) {
    const result =
      await markEligibleMissingTimeouts({
        actorUserId:
          session.userId,

        limit:
          200,

        mode:
          "MANUAL_ADMIN",
      });

    revalidateMissingTimeoutPages();

    return {
      ok: true,

      message:
        result.markedCount >
        0
          ? `${result.markedCount} attendance record(s) marked as missing timeout. ${
              result.remainingEligibleCount >
              0
                ? `${result.remainingEligibleCount} eligible record(s) remain. Run again to continue.`
                : "No eligible records remain."
            }`
          : `No eligible records were found using the ${result.policy.missingTimeoutMinutes}-minute policy threshold.`,
    };
  }

  return {
    ok: false,

    message:
      "Invalid missing timeout action.",
  };
}