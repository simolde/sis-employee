"use server";

import type { Prisma } from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { canManageEmployees } from "@/lib/security/roles";
import { getCurrentSession } from "@/features/auth/server/session";
import { attendanceReviewValidationSchema } from "../validators/attendance-review-validation";
import type {
  AttendanceReviewActionState,
  AttendanceReviewStatusValue,
} from "../types/attendance-review-action-state";

type AttendanceReviewAuditSource = {
  attendanceId: number;
  empId: number;
  status: string;
  verifiedById: number | null;
  verifiedAt: Date | null;
  approvedById: number | null;
  approvedAt: Date | null;
  updatedById: number | null;
};

const attendanceReviewAuditSelect = {
  attendanceId: true,
  empId: true,
  status: true,
  verifiedById: true,
  verifiedAt: true,
  approvedById: true,
  approvedAt: true,
  updatedById: true,
} satisfies Prisma.AttendanceSelect;

function formDataToObject(formData: FormData): Record<string, FormDataEntryValue> {
  return Object.fromEntries(formData.entries());
}

function parseAttendanceId(value: string): number | null {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

function buildAttendanceReviewAuditValue(input: {
  attendance: AttendanceReviewAuditSource;
  reviewNote?: string | null;
}): Prisma.InputJsonObject {
  return {
    attendanceId: input.attendance.attendanceId,
    empId: input.attendance.empId,
    status: input.attendance.status,
    verifiedById: input.attendance.verifiedById,
    verifiedAt: input.attendance.verifiedAt?.toISOString() ?? null,
    approvedById: input.attendance.approvedById,
    approvedAt: input.attendance.approvedAt?.toISOString() ?? null,
    updatedById: input.attendance.updatedById,
    reviewNote: input.reviewNote ?? null,
  };
}

function getActionLabel(input: {
  reviewMode: string;
  status: AttendanceReviewStatusValue;
}): string {
  if (input.reviewMode === "VERIFY") {
    return "ATTENDANCE_VERIFIED";
  }

  if (input.reviewMode === "APPROVE") {
    return "ATTENDANCE_APPROVED";
  }

  return `ATTENDANCE_STATUS_UPDATED_TO_${input.status}`;
}

export async function reviewAttendanceAction(
  attendanceId: string,
  _previousState: AttendanceReviewActionState,
  formData: FormData,
): Promise<AttendanceReviewActionState> {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  if (!canManageEmployees(session.role)) {
    return {
      ok: false,
      message: "You do not have permission to review attendance records.",
    };
  }

  const parsedAttendanceId = parseAttendanceId(attendanceId);

  if (!parsedAttendanceId) {
    return {
      ok: false,
      message: "Invalid attendance record.",
    };
  }

  const parsed = attendanceReviewValidationSchema.safeParse(
    formDataToObject(formData),
  );

  if (!parsed.success) {
    return {
      ok: false,
      message: "Please review the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  const existingAttendance = await prisma.attendance.findUnique({
    where: {
      attendanceId: parsedAttendanceId,
    },
    select: attendanceReviewAuditSelect,
  });

  if (!existingAttendance) {
    return {
      ok: false,
      message: "Attendance record was not found.",
    };
  }

  const now = new Date();

  await prisma.$transaction(async (tx) => {
    const updatedAttendance = await tx.attendance.update({
      where: {
        attendanceId: parsedAttendanceId,
      },
      data: {
        status: data.status,
        updatedById: session.userId,

        ...(data.reviewMode === "VERIFY"
          ? {
              verifiedById: session.userId,
              verifiedAt: now,
            }
          : {}),

        ...(data.reviewMode === "APPROVE"
          ? {
              verifiedById: existingAttendance.verifiedById ?? session.userId,
              verifiedAt: existingAttendance.verifiedAt ?? now,
              approvedById: session.userId,
              approvedAt: now,
            }
          : {}),
      },
      select: attendanceReviewAuditSelect,
    });

    await tx.activityLog.create({
      data: {
        actorUserId: session.userId,
        action: getActionLabel({
          reviewMode: data.reviewMode,
          status: data.status,
        }),
        entityType: "attendance",
        entityId: String(updatedAttendance.attendanceId),
        oldValue: buildAttendanceReviewAuditValue({
          attendance: existingAttendance,
        }),
        newValue: buildAttendanceReviewAuditValue({
          attendance: updatedAttendance,
          reviewNote: data.reviewNote,
        }),
      },
    });
  });

  revalidatePath("/dashboard/attendance");
  revalidatePath(`/dashboard/attendance/${parsedAttendanceId}`);

  return {
    ok: true,
    message:
      data.reviewMode === "APPROVE"
        ? "Attendance record approved successfully."
        : data.reviewMode === "VERIFY"
          ? "Attendance record verified successfully."
          : "Attendance status updated successfully.",
  };
}