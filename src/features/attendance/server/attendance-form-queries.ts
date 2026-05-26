import { prisma } from "@/lib/db/prisma";
import { getCurrentSession } from "@/features/auth/server/session";
import { formatFullName } from "@/lib/utils/formatting";
import { getManilaDateOnly } from "./attendance-calculations";

export type OdlPunchState = "TIME_IN" | "TIME_OUT" | "WAITING" | "DONE" | "BLOCKED";

export type OdlAttendancePageData = {
  employee: {
    empId: number;
    empNumber: string;
    fullName: string;
    departmentName: string;
    designationName: string;
    empTypeName: string;
    branchName: string;
    scheduleName: string;
  } | null;
  punchState: OdlPunchState;
  message: string;
  timeInAt: string;
  timeOutAt: string;
  minutesUntilTimeout: number;
};

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

function formatTime(date: Date | null | undefined): string {
  if (!date) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-PH", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Manila",
  }).format(date);
}

function getMinutesDifference(start: Date, end: Date): number {
  return Math.floor((end.getTime() - start.getTime()) / 60000);
}

export async function getOdlAttendancePageData(): Promise<OdlAttendancePageData> {
  const session = await getCurrentSession();

  if (!session) {
    return {
      employee: null,
      punchState: "BLOCKED",
      message: "Please login first.",
      timeInAt: "—",
      timeOutAt: "—",
      minutesUntilTimeout: 0,
    };
  }

  const user = await prisma.user.findUnique({
    where: {
      userId: session.userId,
    },
    select: {
      employee: {
        select: {
          empId: true,
          empNumber: true,
          firstName: true,
          middleName: true,
          lastName: true,
          status: true,
          department: {
            select: {
              name: true,
            },
          },
          designation: {
            select: {
              name: true,
            },
          },
          empType: {
            select: {
              name: true,
            },
          },
          branch: {
            select: {
              name: true,
            },
          },
          schedule: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  const employee = user?.employee;

  if (!employee || employee.status !== "ACTIVE") {
    return {
      employee: null,
      punchState: "BLOCKED",
      message: "No active employee profile is connected to this login account.",
      timeInAt: "—",
      timeOutAt: "—",
      minutesUntilTimeout: 0,
    };
  }

  const isOdlTeacher = isOdlTeacherRecord({
    departmentName: employee.department?.name,
    empTypeName: employee.empType?.name,
    designationName: employee.designation?.name,
  });

  const employeeData = {
    empId: employee.empId,
    empNumber: employee.empNumber,
    fullName: formatFullName({
      firstName: employee.firstName,
      middleName: employee.middleName,
      lastName: employee.lastName,
    }),
    departmentName: employee.department?.name ?? "—",
    designationName: employee.designation?.name ?? "—",
    empTypeName: employee.empType?.name ?? "—",
    branchName: employee.branch.name,
    scheduleName: employee.schedule?.name ?? "—",
  };

  if (!isOdlTeacher) {
    return {
      employee: employeeData,
      punchState: "BLOCKED",
      message:
        "Web time-in/time-out is only for ODL teachers. Face-to-face teachers must use the lobby RFID/biometric attendance system.",
      timeInAt: "—",
      timeOutAt: "—",
      minutesUntilTimeout: 0,
    };
  }

  const today = getManilaDateOnly(new Date());

  const attendance = await prisma.attendance.findUnique({
    where: {
      empId_attDate: {
        empId: employee.empId,
        attDate: today,
      },
    },
    select: {
      timeIn: true,
      timeOut: true,
    },
  });

  if (!attendance?.timeIn) {
    return {
      employee: employeeData,
      punchState: "TIME_IN",
      message: "No time-in record found today. Your next submit will be TIME IN.",
      timeInAt: "—",
      timeOutAt: "—",
      minutesUntilTimeout: 0,
    };
  }

  if (attendance.timeOut) {
    return {
      employee: employeeData,
      punchState: "DONE",
      message: "You already completed time-in and time-out today.",
      timeInAt: formatTime(attendance.timeIn),
      timeOutAt: formatTime(attendance.timeOut),
      minutesUntilTimeout: 0,
    };
  }

  const minutesSinceTimeIn = getMinutesDifference(attendance.timeIn, new Date());
  const minimumMinutesBeforeTimeout = 30;

  if (minutesSinceTimeIn < minimumMinutesBeforeTimeout) {
    return {
      employee: employeeData,
      punchState: "WAITING",
      message: `You already timed in today. Time-out is available after ${minimumMinutesBeforeTimeout} minutes.`,
      timeInAt: formatTime(attendance.timeIn),
      timeOutAt: "—",
      minutesUntilTimeout: minimumMinutesBeforeTimeout - minutesSinceTimeIn,
    };
  }

  return {
    employee: employeeData,
    punchState: "TIME_OUT",
    message: "Time-in record found today. Your next submit will be TIME OUT.",
    timeInAt: formatTime(attendance.timeIn),
    timeOutAt: "—",
    minutesUntilTimeout: 0,
  };
}