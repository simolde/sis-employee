"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { canUseOdlWebAttendance } from "@/lib/security/roles";
import { getCurrentSession } from "@/features/auth/server/session";
import {
  calculateTimeInStatus,
  calculateTotalMinutes,
  getManilaDateOnly,
} from "./attendance-calculations";
import { odlAttendanceValidationSchema } from "../validators/attendance-validation";
import type { AttendanceActionState } from "../types/attendance-action-state";

const MINUTES_BEFORE_TIMEOUT = 30;

function formDataToObject(formData: FormData): Record<string, FormDataEntryValue> {
  return Object.fromEntries(formData.entries());
}

function normalize(value: string | null | undefined): string {
  return value?.toUpperCase().trim() ?? "";
}

function isOdlTeacherRecord(input: {
  departmentName: string | null | undefined;
  empTypeName: string | null | undefined;
  designationName: string | null | undefined;
}): boolean {
  const combinedText = [
    input.departmentName,
    input.empTypeName,
    input.designationName,
  ]
    .map(normalize)
    .join(" ");

  const hasOdl =
    combinedText.includes("ODL") ||
    combinedText.includes("ONLINE DISTANCE LEARNING");

  const hasTeacherRole =
    combinedText.includes("TEACHER") ||
    combinedText.includes("FACULTY") ||
    combinedText.includes("INSTRUCTOR");

  return hasOdl && hasTeacherRole;
}

function getMinutesDifference(start: Date, end: Date): number {
  return Math.floor((end.getTime() - start.getTime()) / 60000);
}

export async function recordOdlAttendanceAction(
  _previousState: AttendanceActionState,
  formData: FormData,
): Promise<AttendanceActionState> {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  if (!canUseOdlWebAttendance(session.role)) {
    return {
      ok: false,
      message: "You do not have permission to use ODL web attendance.",
    };
  }

  const parsed = odlAttendanceValidationSchema.safeParse(
    formDataToObject(formData),
  );

  if (!parsed.success) {
    return {
      ok: false,
      message:
        "Selfie, GPS coordinates, and full address are required before submitting.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;
  const now = new Date();
  const attDate = getManilaDateOnly(now);

  const user = await prisma.user.findUnique({
    where: {
      userId: session.userId,
    },
    select: {
      employee: {
        select: {
          empId: true,
          status: true,
          branchId: true,
          scheduleId: true,
          department: {
            select: {
              name: true,
            },
          },
          empType: {
            select: {
              name: true,
            },
          },
          designation: {
            select: {
              name: true,
            },
          },
          schedule: {
            select: {
              shift: {
                select: {
                  startTime: true,
                  graceMinutes: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const employee = user?.employee;

  if (!employee || employee.status !== "ACTIVE") {
    return {
      ok: false,
      message: "No active employee profile is connected to this login account.",
    };
  }

  const isOdlTeacher = isOdlTeacherRecord({
    departmentName: employee.department?.name,
    empTypeName: employee.empType?.name,
    designationName: employee.designation?.name,
  });

  if (!isOdlTeacher) {
    return {
      ok: false,
      message:
        "Web attendance is only for ODL teachers. Face-to-face teachers must use the lobby RFID/biometric attendance system.",
    };
  }

  const existingAttendance = await prisma.attendance.findUnique({
    where: {
      empId_attDate: {
        empId: employee.empId,
        attDate,
      },
    },
    select: {
      attendanceId: true,
      timeIn: true,
      timeOut: true,
      status: true,
    },
  });

  if (!existingAttendance?.timeIn) {
    const status = calculateTimeInStatus({
      punchAt: now,
      scheduleStartTime: employee.schedule?.shift.startTime ?? null,
      graceMinutes: employee.schedule?.shift.graceMinutes ?? 0,
    });

    const attendance = await prisma.attendance.create({
      data: {
        empId: employee.empId,
        scheduleId: employee.scheduleId,
        attDate,
        timeIn: now,
        inRemark: data.remarks,
        inReason: data.reason,
        inLatitude: data.latitude,
        inLongitude: data.longitude,
        inPhoto: data.photoPath,
        inSource: "WEB",
        inBranchId: employee.branchId,
        inAddress: data.address,
        status,
        totalMinutes: null,
        isSynced: true,
        isManual: false,
        createdById: session.userId,
      },
      select: {
        attendanceId: true,
      },
    });

    await prisma.attendanceLog.create({
      data: {
        attendanceId: attendance.attendanceId,
        empId: employee.empId,
        punchType: "TIME_IN",
        punchedAt: now,
        latitude: data.latitude,
        longitude: data.longitude,
        photo: data.photoPath,
        address: data.address,
        source: "WEB",
        branchId: employee.branchId,
        remarks: data.remarks,
        reason: data.reason,
      },
    });

    revalidatePath("/dashboard/attendance");
    revalidatePath(`/dashboard/employees/${employee.empId}`);

    return {
      ok: true,
      message: `ODL web TIME IN recorded successfully. Status: ${status.replaceAll("_", " ")}.`,
    };
  }

  if (existingAttendance.timeOut) {
    return {
      ok: false,
      message: "You already completed time-in and time-out today.",
    };
  }

  const minutesSinceTimeIn = getMinutesDifference(existingAttendance.timeIn, now);

  if (minutesSinceTimeIn < MINUTES_BEFORE_TIMEOUT) {
    await prisma.attendanceLog.create({
      data: {
        attendanceId: existingAttendance.attendanceId,
        empId: employee.empId,
        punchType: "TIME_OUT",
        punchedAt: now,
        latitude: data.latitude,
        longitude: data.longitude,
        photo: data.photoPath,
        address: data.address,
        source: "WEB",
        branchId: employee.branchId,
        remarks: data.remarks
          ? `Early ODL time-out attempt. ${data.remarks}`
          : "Early ODL time-out attempt.",
        reason: data.reason,
      },
    });

    return {
      ok: false,
      message: `Time-out is only allowed after ${MINUTES_BEFORE_TIMEOUT} minutes from time-in. Please try again in ${
        MINUTES_BEFORE_TIMEOUT - minutesSinceTimeIn
      } minute(s).`,
    };
  }

  const totalMinutes = calculateTotalMinutes(existingAttendance.timeIn, now);
  const nextStatus =
    existingAttendance.status === "MISSING_TIMEOUT"
      ? "PENDING_REVIEW"
      : existingAttendance.status;

  await prisma.attendance.update({
    where: {
      attendanceId: existingAttendance.attendanceId,
    },
    data: {
      timeOut: now,
      outRemark: data.remarks,
      outReason: data.reason,
      outLatitude: data.latitude,
      outLongitude: data.longitude,
      outPhoto: data.photoPath,
      outSource: "WEB",
      outBranchId: employee.branchId,
      outAddress: data.address,
      totalMinutes,
      status: nextStatus,
      isManual: false,
      updatedById: session.userId,
    },
  });

  await prisma.attendanceLog.create({
    data: {
      attendanceId: existingAttendance.attendanceId,
      empId: employee.empId,
      punchType: "TIME_OUT",
      punchedAt: now,
      latitude: data.latitude,
      longitude: data.longitude,
      photo: data.photoPath,
      address: data.address,
      source: "WEB",
      branchId: employee.branchId,
      remarks: data.remarks,
      reason: data.reason,
    },
  });

  revalidatePath("/dashboard/attendance");
  revalidatePath(`/dashboard/employees/${employee.empId}`);

  return {
    ok: true,
    message: "ODL web TIME OUT recorded successfully.",
  };
}