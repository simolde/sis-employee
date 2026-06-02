"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { canManageEmployees } from "@/lib/security/roles";
import { getCurrentSession } from "@/features/auth/server/session";
import { getMissingTimeoutCandidateIds } from "./missing-timeout-queries";
import type { MissingTimeoutActionState } from "../types/missing-timeout-types";

export async function markMissingTimeoutsAction(): Promise<MissingTimeoutActionState> {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  if (!canManageEmployees(session.role)) {
    return {
      ok: false,
      message: "You do not have permission to mark missing time-outs.",
    };
  }

  const candidateIds = await getMissingTimeoutCandidateIds();

  if (candidateIds.length === 0) {
    return {
      ok: false,
      message: "No missing time-out candidates were found.",
    };
  }

  const now = new Date();

  const result = await prisma.$transaction(async (tx) => {
    const updateResult = await tx.attendance.updateMany({
      where: {
        attendanceId: {
          in: candidateIds,
        },
        timeIn: {
          not: null,
        },
        timeOut: null,
        isManual: false,
        status: {
          notIn: ["MISSING_TIMEOUT", "PENDING_REVIEW"],
        },
      },
      data: {
        status: "MISSING_TIMEOUT",
        updatedById: session.userId,
      },
    });

    await tx.activityLog.create({
      data: {
        actorUserId: session.userId,
        action: "ATTENDANCE_MISSING_TIMEOUT_MARKED",
        entityType: "attendance",
        entityId: "bulk",
        newValue: {
          markedCount: updateResult.count,
          attendanceIds: candidateIds,
          markedAt: now.toISOString(),
          policy:
            "Normal attendance records with time-in but no time-out after cutoff are marked as MISSING_TIMEOUT. Manual records remain under review workflow.",
        },
      },
    });

    return updateResult;
  });

  revalidatePath("/dashboard/attendance");
  revalidatePath("/dashboard/attendance/maintenance");
  revalidatePath("/dashboard/attendance/reports");

  return {
    ok: true,
    message: `${result.count} attendance record(s) marked as MISSING TIMEOUT.`,
  };
}