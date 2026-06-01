"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db/prisma";
import { canUseOdlWebAttendance } from "@/lib/security/roles";
import { getCurrentSession } from "@/features/auth/server/session";
import {
  calculateTotalMinutes,
  getManilaDateOnly,
} from "./attendance-calculations";
import { odlAttendanceValidationSchema } from "../validators/attendance-validation";
import type { AttendanceActionState } from "../types/attendance-action-state";

const MINUTES_BEFORE_TIMEOUT = 30;

type ScheduleAttendanceStatus =
  | "ON_TIME"
  | "LATE"
  | "HALF_DAY"
  | "PENDING_REVIEW"
  | "MISSING_TIMEOUT";

type EmployeeScheduleForAttendance = {
  scheduleId: number;
  scheduleCode: string;
  name: string;
  daysOfWeek: string | null;
  effectiveFrom: Date;
  effectiveTo: Date | null;
  status: "ACTIVE" | "INACTIVE" | "ARCHIVED";
  shift: {
    shiftCode: string;
    name: string;
    startTime: string;
    endTime: string;
    graceMinutes: number;
    isOvernight: boolean;
    status: "ACTIVE" | "INACTIVE" | "ARCHIVED";
  };
} | null;

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

function getManilaDateParts(date: Date): {
  year: number;
  month: number;
  day: number;
} {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  const day = Number(parts.find((part) => part.type === "day")?.value);

  return {
    year,
    month,
    day,
  };
}

function parseShiftTime(value: string): {
  hour: number;
  minute: number;
  second: number;
} {
  const [hour = "0", minute = "0", second = "0"] = value.split(":");

  return {
    hour: Number(hour),
    minute: Number(minute),
    second: Number(second),
  };
}

function buildManilaDateTime(input: {
  attDate: Date;
  timeValue: string;
  addDays?: number;
}): Date {
  const { year, month, day } = getManilaDateParts(input.attDate);
  const { hour, minute, second } = parseShiftTime(input.timeValue);
  const addDays = input.addDays ?? 0;

  return new Date(
    Date.UTC(year, month - 1, day + addDays, hour - 8, minute, second, 0),
  );
}

function isScheduleUsableForAttendance(input: {
  schedule: EmployeeScheduleForAttendance;
  attDate: Date;
}): input is {
  schedule: NonNullable<EmployeeScheduleForAttendance>;
  attDate: Date;
} {
  const { schedule, attDate } = input;

  if (!schedule) {
    return false;
  }

  if (schedule.status !== "ACTIVE" || schedule.shift.status !== "ACTIVE") {
    return false;
  }

  if (schedule.effectiveFrom > attDate) {
    return false;
  }

  if (schedule.effectiveTo && schedule.effectiveTo < attDate) {
    return false;
  }

  return true;
}

function getUsableSchedule(input: {
  schedule: EmployeeScheduleForAttendance;
  attDate: Date;
}): NonNullable<EmployeeScheduleForAttendance> | null {
  if (!isScheduleUsableForAttendance(input)) {
    return null;
  }

  return input.schedule;
}

function calculateTimeInStatusFromSchedule(input: {
  punchAt: Date;
  attDate: Date;
  schedule: EmployeeScheduleForAttendance;
}): ScheduleAttendanceStatus {
  const schedule = getUsableSchedule({
    schedule: input.schedule,
    attDate: input.attDate,
  });

  if (!schedule) {
    return "PENDING_REVIEW";
  }

  const scheduledStart = buildManilaDateTime({
    attDate: input.attDate,
    timeValue: schedule.shift.startTime,
  });

  const graceDeadline = new Date(
    scheduledStart.getTime() + schedule.shift.graceMinutes * 60_000,
  );

  return input.punchAt <= graceDeadline ? "ON_TIME" : "LATE";
}

function getScheduledEndDateTime(input: {
  attDate: Date;
  schedule: NonNullable<EmployeeScheduleForAttendance>;
}): Date {
  const start = buildManilaDateTime({
    attDate: input.attDate,
    timeValue: input.schedule.shift.startTime,
  });

  const sameDayEnd = buildManilaDateTime({
    attDate: input.attDate,
    timeValue: input.schedule.shift.endTime,
  });

  if (input.schedule.shift.isOvernight || sameDayEnd <= start) {
    return buildManilaDateTime({
      attDate: input.attDate,
      timeValue: input.schedule.shift.endTime,
      addDays: 1,
    });
  }

  return sameDayEnd;
}

function getScheduledMinutes(input: {
  attDate: Date;
  schedule: NonNullable<EmployeeScheduleForAttendance>;
}): number {
  const start = buildManilaDateTime({
    attDate: input.attDate,
    timeValue: input.schedule.shift.startTime,
  });

  const end = getScheduledEndDateTime({
    attDate: input.attDate,
    schedule: input.schedule,
  });

  return Math.max(0, getMinutesDifference(start, end));
}

function calculateStatusAfterTimeOut(input: {
  currentStatus: ScheduleAttendanceStatus;
  attDate: Date;
  timeOut: Date;
  totalMinutes: number;
  schedule: EmployeeScheduleForAttendance;
}): ScheduleAttendanceStatus {
  const schedule = getUsableSchedule({
    schedule: input.schedule,
    attDate: input.attDate,
  });

  if (!schedule) {
    return "PENDING_REVIEW";
  }

  if (input.currentStatus === "MISSING_TIMEOUT") {
    return "PENDING_REVIEW";
  }

  const scheduledMinutes = getScheduledMinutes({
    attDate: input.attDate,
    schedule,
  });

  if (
    scheduledMinutes > 0 &&
    input.totalMinutes < Math.floor(scheduledMinutes / 2)
  ) {
    return "HALF_DAY";
  }

  const scheduledEnd = getScheduledEndDateTime({
    attDate: input.attDate,
    schedule,
  });

  if (input.timeOut < scheduledEnd) {
    return "PENDING_REVIEW";
  }

  return input.currentStatus;
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
              scheduleId: true,
              scheduleCode: true,
              name: true,
              daysOfWeek: true,
              effectiveFrom: true,
              effectiveTo: true,
              status: true,
              shift: {
                select: {
                  shiftCode: true,
                  name: true,
                  startTime: true,
                  endTime: true,
                  graceMinutes: true,
                  isOvernight: true,
                  status: true,
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

  const usableSchedule = getUsableSchedule({
    schedule: employee.schedule,
    attDate,
  });

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
      schedule: {
        select: {
          scheduleId: true,
          scheduleCode: true,
          name: true,
          daysOfWeek: true,
          effectiveFrom: true,
          effectiveTo: true,
          status: true,
          shift: {
            select: {
              shiftCode: true,
              name: true,
              startTime: true,
              endTime: true,
              graceMinutes: true,
              isOvernight: true,
              status: true,
            },
          },
        },
      },
    },
  });

  if (!existingAttendance?.timeIn) {
    const status = calculateTimeInStatusFromSchedule({
      punchAt: now,
      attDate,
      schedule: usableSchedule,
    });

    const attendance = await prisma.attendance.create({
      data: {
        empId: employee.empId,
        scheduleId: usableSchedule?.scheduleId ?? null,
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
    revalidatePath("/dashboard/attendance/odl");
    revalidatePath(`/dashboard/employees/${employee.empId}`);

    return {
      ok: true,
      message: usableSchedule
        ? `ODL web TIME IN recorded successfully. Status: ${status.replaceAll(
            "_",
            " ",
          )}.`
        : "ODL web TIME IN recorded successfully, but no active schedule was found. Status: PENDING REVIEW.",
    };
  }

  if (existingAttendance.timeOut) {
    await prisma.attendanceLog.create({
      data: {
        attendanceId: existingAttendance.attendanceId,
        empId: employee.empId,
        punchType: "REPEATED_SCAN",
        punchedAt: now,
        latitude: data.latitude,
        longitude: data.longitude,
        photo: data.photoPath,
        address: data.address,
        source: "WEB",
        branchId: employee.branchId,
        remarks: data.remarks
          ? `Repeated ODL scan after completed attendance. ${data.remarks}`
          : "Repeated ODL scan after completed attendance.",
        reason: data.reason,
      },
    });

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
        punchType: "REPEATED_SCAN",
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

  const scheduleForCompletion = existingAttendance.schedule ?? usableSchedule;
  const totalMinutes = calculateTotalMinutes(existingAttendance.timeIn, now) ?? 0;

  const nextStatus = calculateStatusAfterTimeOut({
    currentStatus: existingAttendance.status as ScheduleAttendanceStatus,
    attDate,
    timeOut: now,
    totalMinutes,
    schedule: scheduleForCompletion,
  });

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
  revalidatePath("/dashboard/attendance/odl");
  revalidatePath(`/dashboard/employees/${employee.empId}`);

  return {
    ok: true,
    message: `ODL web TIME OUT recorded successfully. Final status: ${nextStatus.replaceAll(
      "_",
      " ",
    )}.`,
  };
}