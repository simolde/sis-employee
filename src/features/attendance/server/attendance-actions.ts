"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { canManageAttendance } from "@/lib/security/roles";
import { getCurrentSession } from "@/features/auth/server/session";
import {
  calculateTimeInStatus,
  calculateTotalMinutes,
  getManilaDateOnly,
} from "./attendance-calculations";
import { manualAttendanceValidationSchema } from "../validators/attendance-validation";
import type { AttendanceActionState } from "../types/attendance-action-state";

function formDataToObject(formData: FormData): Record<string, FormDataEntryValue> {
  return Object.fromEntries(formData.entries());
}

export async function recordManualAttendanceAction(
  _previousState: AttendanceActionState,
  formData: FormData,
): Promise<AttendanceActionState> {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  if (!canManageAttendance(session.role)) {
    return {
      ok: false,
      message: "You do not have permission to record manual attendance.",
    };
  }

  const parsed = manualAttendanceValidationSchema.safeParse(
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
  const now = new Date();
  const attDate = getManilaDateOnly(now);

  const employee = await prisma.employee.findUnique({
    where: {
      empId: data.empId,
    },
    select: {
      empId: true,
      status: true,
      scheduleId: true,
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
  });

  if (!employee || employee.status !== "ACTIVE") {
    return {
      ok: false,
      message: "Selected employee is not active or does not exist.",
      fieldErrors: {
        empId: ["Selected employee is not active or does not exist."],
      },
    };
  }

  const branch = await prisma.branch.findUnique({
    where: {
      branchId: data.branchId,
    },
    select: {
      branchId: true,
      status: true,
    },
  });

  if (!branch || branch.status !== "ACTIVE") {
    return {
      ok: false,
      message: "Selected branch is not active or does not exist.",
      fieldErrors: {
        branchId: ["Selected branch is not active or does not exist."],
      },
    };
  }

  if (data.punchType === "TIME_IN") {
    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        empId_attDate: {
          empId: data.empId,
          attDate,
        },
      },
      select: {
        attendanceId: true,
        timeIn: true,
      },
    });

    if (existingAttendance?.timeIn) {
      await prisma.attendanceLog.create({
        data: {
          attendanceId: existingAttendance.attendanceId,
          empId: data.empId,
          punchType: "TIME_IN",
          punchedAt: now,
          latitude: data.latitude,
          longitude: data.longitude,
          photo: data.photoPath,
          address: data.address,
          source: "WEB",
          branchId: data.branchId,
          remarks: data.remarks
            ? `Repeated time-in. ${data.remarks}`
            : "Repeated time-in.",
          reason: data.reason,
        },
      });

      revalidatePath("/dashboard/attendance");

      return {
        ok: false,
        message:
          "This employee already has a time-in today. Repeated scan was logged for review.",
      };
    }

    const status = calculateTimeInStatus({
      punchAt: now,
      scheduleStartTime: employee.schedule?.shift.startTime ?? null,
      graceMinutes: employee.schedule?.shift.graceMinutes ?? 0,
    });

    const attendance = await prisma.attendance.upsert({
      where: {
        empId_attDate: {
          empId: data.empId,
          attDate,
        },
      },
      create: {
        empId: data.empId,
        scheduleId: employee.scheduleId,
        attDate,
        timeIn: now,
        inRemark: data.remarks,
        inReason: data.reason,
        inLatitude: data.latitude,
        inLongitude: data.longitude,
        inPhoto: data.photoPath,
        inSource: "WEB",
        inBranchId: data.branchId,
        inAddress: data.address,
        status,
        totalMinutes: null,
        isSynced: true,
        isManual: true,
        createdById: session.userId,
      },
      update: {
        timeIn: now,
        inRemark: data.remarks,
        inReason: data.reason,
        inLatitude: data.latitude,
        inLongitude: data.longitude,
        inPhoto: data.photoPath,
        inSource: "WEB",
        inBranchId: data.branchId,
        inAddress: data.address,
        status,
        isManual: true,
        updatedById: session.userId,
      },
      select: {
        attendanceId: true,
      },
    });

    await prisma.attendanceLog.create({
      data: {
        attendanceId: attendance.attendanceId,
        empId: data.empId,
        punchType: "TIME_IN",
        punchedAt: now,
        latitude: data.latitude,
        longitude: data.longitude,
        photo: data.photoPath,
        address: data.address,
        source: "WEB",
        branchId: data.branchId,
        remarks: data.remarks,
        reason: data.reason,
      },
    });

    revalidatePath("/dashboard/attendance");
    revalidatePath(`/dashboard/employees/${data.empId}`);

    return {
      ok: true,
      message: `Time-in recorded successfully. Status: ${status.replaceAll("_", " ")}.`,
    };
  }

  const existingAttendance = await prisma.attendance.findUnique({
    where: {
      empId_attDate: {
        empId: data.empId,
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

  if (!existingAttendance || !existingAttendance.timeIn) {
    return {
      ok: false,
      message:
        "Cannot record time-out because this employee has no time-in today.",
    };
  }

  if (existingAttendance.timeOut) {
    await prisma.attendanceLog.create({
      data: {
        attendanceId: existingAttendance.attendanceId,
        empId: data.empId,
        punchType: "TIME_OUT",
        punchedAt: now,
        latitude: data.latitude,
        longitude: data.longitude,
        photo: data.photoPath,
        address: data.address,
        source: "WEB",
        branchId: data.branchId,
        remarks: data.remarks
          ? `Repeated time-out. ${data.remarks}`
          : "Repeated time-out.",
        reason: data.reason,
      },
    });

    revalidatePath("/dashboard/attendance");

    return {
      ok: false,
      message:
        "This employee already has a time-out today. Repeated scan was logged for review.",
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
      outBranchId: data.branchId,
      outAddress: data.address,
      totalMinutes,
      status: nextStatus,
      isManual: true,
      updatedById: session.userId,
    },
  });

  await prisma.attendanceLog.create({
    data: {
      attendanceId: existingAttendance.attendanceId,
      empId: data.empId,
      punchType: "TIME_OUT",
      punchedAt: now,
      latitude: data.latitude,
      longitude: data.longitude,
      photo: data.photoPath,
      address: data.address,
      source: "WEB",
      branchId: data.branchId,
      remarks: data.remarks,
      reason: data.reason,
    },
  });

  revalidatePath("/dashboard/attendance");
  revalidatePath(`/dashboard/employees/${data.empId}`);

  return {
    ok: true,
    message: "Time-out recorded successfully.",
  };
}