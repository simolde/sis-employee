"use server";

import type {
  AttendanceExceptionType,
  Prisma,
} from "@/generated/prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentSession } from "@/features/auth/server/session";
import { prisma } from "@/lib/db/prisma";
import { canManageEmployees } from "@/lib/security/roles";
import type { AttendanceExceptionActionState } from "../types/attendance-exception-types";

function formDataString(formData: FormData, key: string): string {
  const value = formData.get(key);

  return typeof value === "string" ? value.trim() : "";
}

function parsePositiveId(value: string): number | null {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

function parseDateInput(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return null;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}

function parseExceptionType(value: string): AttendanceExceptionType | null {
  const normalized = value.trim().toUpperCase();

  if (
    normalized === "HOLIDAY" ||
    normalized === "CLASS_SUSPENSION" ||
    normalized === "NO_WORK" ||
    normalized === "SCHOOL_EVENT" ||
    normalized === "REST_DAY" ||
    normalized === "OTHER"
  ) {
    return normalized;
  }

  return null;
}

function parseRecordStatus(value: string): "ACTIVE" | "ARCHIVED" | null {
  const normalized = value.trim().toUpperCase();

  if (normalized === "ACTIVE" || normalized === "ARCHIVED") {
    return normalized;
  }

  return null;
}

function buildExceptionAuditValue(input: {
  exceptionId: number;
  exceptionDate: Date;
  branchId: number | null;
  exceptionType: AttendanceExceptionType;
  title: string;
  description: string | null;
  affectsAbsenceGeneration: boolean;
  status: string;
}): Prisma.InputJsonObject {
  return {
    exceptionId: input.exceptionId,
    exceptionDate: input.exceptionDate.toISOString(),
    branchId: input.branchId,
    exceptionType: input.exceptionType,
    title: input.title,
    description: input.description,
    affectsAbsenceGeneration: input.affectsAbsenceGeneration,
    status: input.status,
  };
}

function revalidateExceptionPages() {
  revalidatePath("/dashboard/attendance");
  revalidatePath("/dashboard/attendance/actions");
  revalidatePath("/dashboard/attendance/exceptions");
  revalidatePath("/dashboard/attendance/absences");
  revalidatePath("/dashboard/attendance/absences/candidates");
  revalidatePath("/dashboard/attendance/absences/rollback");
  revalidatePath("/dashboard/attendance/audit");
}

export async function createAttendanceExceptionAction(
  _previousState: AttendanceExceptionActionState,
  formData: FormData,
): Promise<AttendanceExceptionActionState> {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  if (!canManageEmployees(session.role)) {
    return {
      ok: false,
      message: "You do not have permission to create attendance exceptions.",
    };
  }

  const exceptionDate = parseDateInput(formDataString(formData, "exceptionDate"));
  const branchId = parsePositiveId(formDataString(formData, "branchId"));
  const exceptionType = parseExceptionType(
    formDataString(formData, "exceptionType"),
  );
  const title = formDataString(formData, "title");
  const description = formDataString(formData, "description");
  const affectsAbsenceGeneration =
    formData.get("affectsAbsenceGeneration") === "on";

  const fieldErrors: Record<string, string[] | undefined> = {};

  if (!exceptionDate) {
    fieldErrors.exceptionDate = ["Exception date is required."];
  }

  if (!exceptionType) {
    fieldErrors.exceptionType = ["Exception type is required."];
  }

  if (!title) {
    fieldErrors.title = ["Title is required."];
  }

  if (Object.keys(fieldErrors).length > 0 || !exceptionDate || !exceptionType) {
    return {
      ok: false,
      message: "Please fix the highlighted fields.",
      fieldErrors,
    };
  }

  const exception = await prisma.attendanceExceptionDate.create({
    data: {
      exceptionDate,
      branchId,
      exceptionType,
      title,
      description: description || null,
      affectsAbsenceGeneration,
      status: "ACTIVE",
      createdById: session.userId,
    },
    select: {
      exceptionId: true,
      exceptionDate: true,
      branchId: true,
      exceptionType: true,
      title: true,
      description: true,
      affectsAbsenceGeneration: true,
      status: true,
    },
  });

  await prisma.activityLog.create({
    data: {
      actorUserId: session.userId,
      action: "ATTENDANCE_EXCEPTION_CREATED",
      entityType: "attendance_exception",
      entityId: String(exception.exceptionId),
      oldValue: {
        existed: false,
      },
      newValue: buildExceptionAuditValue(exception),
    },
  });

  revalidateExceptionPages();

  return {
    ok: true,
    message: "Attendance exception created successfully.",
  };
}

export async function updateAttendanceExceptionAction(
  _previousState: AttendanceExceptionActionState,
  formData: FormData,
): Promise<AttendanceExceptionActionState> {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  if (!canManageEmployees(session.role)) {
    return {
      ok: false,
      message: "You do not have permission to update attendance exceptions.",
    };
  }

  const exceptionId = parsePositiveId(formDataString(formData, "exceptionId"));
  const exceptionDate = parseDateInput(formDataString(formData, "exceptionDate"));
  const branchId = parsePositiveId(formDataString(formData, "branchId"));
  const exceptionType = parseExceptionType(
    formDataString(formData, "exceptionType"),
  );
  const title = formDataString(formData, "title");
  const description = formDataString(formData, "description");
  const status = parseRecordStatus(formDataString(formData, "status"));
  const affectsAbsenceGeneration =
    formData.get("affectsAbsenceGeneration") === "on";

  const fieldErrors: Record<string, string[] | undefined> = {};

  if (!exceptionId) {
    fieldErrors.exceptionId = ["Exception record is invalid."];
  }

  if (!exceptionDate) {
    fieldErrors.exceptionDate = ["Exception date is required."];
  }

  if (!exceptionType) {
    fieldErrors.exceptionType = ["Exception type is required."];
  }

  if (!title) {
    fieldErrors.title = ["Title is required."];
  }

  if (!status) {
    fieldErrors.status = ["Status is required."];
  }

  if (
    Object.keys(fieldErrors).length > 0 ||
    !exceptionId ||
    !exceptionDate ||
    !exceptionType ||
    !status
  ) {
    return {
      ok: false,
      message: "Please fix the highlighted fields.",
      fieldErrors,
    };
  }

  const existing = await prisma.attendanceExceptionDate.findUnique({
    where: {
      exceptionId,
    },
    select: {
      exceptionId: true,
      exceptionDate: true,
      branchId: true,
      exceptionType: true,
      title: true,
      description: true,
      affectsAbsenceGeneration: true,
      status: true,
    },
  });

  if (!existing) {
    return {
      ok: false,
      message: "Attendance exception was not found.",
    };
  }

  const updated = await prisma.attendanceExceptionDate.update({
    where: {
      exceptionId,
    },
    data: {
      exceptionDate,
      branchId,
      exceptionType,
      title,
      description: description || null,
      affectsAbsenceGeneration,
      status,
    },
    select: {
      exceptionId: true,
      exceptionDate: true,
      branchId: true,
      exceptionType: true,
      title: true,
      description: true,
      affectsAbsenceGeneration: true,
      status: true,
    },
  });

  await prisma.activityLog.create({
    data: {
      actorUserId: session.userId,
      action: "ATTENDANCE_EXCEPTION_UPDATED",
      entityType: "attendance_exception",
      entityId: String(exceptionId),
      oldValue: buildExceptionAuditValue(existing),
      newValue: buildExceptionAuditValue(updated),
    },
  });

  revalidateExceptionPages();
  revalidatePath(`/dashboard/attendance/exceptions/${exceptionId}/edit`);

  return {
    ok: true,
    message: "Attendance exception updated successfully.",
  };
}

export async function archiveAttendanceExceptionAction(
  formData: FormData,
): Promise<void> {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  if (!canManageEmployees(session.role)) {
    redirect("/dashboard/attendance/exceptions");
  }

  const exceptionId = parsePositiveId(formDataString(formData, "exceptionId"));

  if (!exceptionId) {
    redirect("/dashboard/attendance/exceptions");
  }

  const existing = await prisma.attendanceExceptionDate.findUnique({
    where: {
      exceptionId,
    },
    select: {
      exceptionId: true,
      exceptionDate: true,
      branchId: true,
      exceptionType: true,
      title: true,
      description: true,
      affectsAbsenceGeneration: true,
      status: true,
    },
  });

  if (!existing) {
    redirect("/dashboard/attendance/exceptions");
  }

  const updated = await prisma.attendanceExceptionDate.update({
    where: {
      exceptionId,
    },
    data: {
      status: "ARCHIVED",
    },
    select: {
      exceptionId: true,
      exceptionDate: true,
      branchId: true,
      exceptionType: true,
      title: true,
      description: true,
      affectsAbsenceGeneration: true,
      status: true,
    },
  });

  await prisma.activityLog.create({
    data: {
      actorUserId: session.userId,
      action: "ATTENDANCE_EXCEPTION_ARCHIVED",
      entityType: "attendance_exception",
      entityId: String(exceptionId),
      oldValue: buildExceptionAuditValue(existing),
      newValue: buildExceptionAuditValue(updated),
    },
  });

  revalidateExceptionPages();
  redirect("/dashboard/attendance/exceptions");
}