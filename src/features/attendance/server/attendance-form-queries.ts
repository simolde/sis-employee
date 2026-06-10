import { getCurrentSession } from "@/features/auth/server/session";
import { getAttendanceEnforcementPolicy } from "@/features/attendance/policies/server/attendance-policy-enforcement";
import type {
  OdlAttendanceEmployeeData,
  OdlAttendanceEvidencePolicy,
  OdlAttendancePageData,
} from "@/features/attendance/types/attendance-form-types";
import { prisma } from "@/lib/db/prisma";
import { formatFullName } from "@/lib/utils/formatting";
import { getManilaDateOnly } from "./attendance-calculations";

const MINIMUM_MINUTES_BEFORE_TIMEOUT =
  30;

function normalize(
  value:
    | string
    | null
    | undefined,
): string {
  return (
    value
      ?.toUpperCase()
      .trim() ?? ""
  );
}

function isOdlTeacherRecord(input: {
  departmentName:
    | string
    | null
    | undefined;

  empTypeName:
    | string
    | null
    | undefined;

  designationName:
    | string
    | null
    | undefined;
}): boolean {
  const combinedText = [
    input.departmentName,
    input.empTypeName,
    input.designationName,
  ]
    .map(normalize)
    .join(" ");

  const hasOdl =
    combinedText.includes(
      "ODL",
    ) ||
    combinedText.includes(
      "ONLINE DISTANCE LEARNING",
    );

  const hasTeacherRole =
    combinedText.includes(
      "TEACHER",
    ) ||
    combinedText.includes(
      "FACULTY",
    ) ||
    combinedText.includes(
      "INSTRUCTOR",
    );

  return (
    hasOdl &&
    hasTeacherRole
  );
}

function formatTime(
  date:
    | Date
    | null
    | undefined,
): string {
  if (!date) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-PH",
    {
      hour: "numeric",
      minute: "2-digit",
      timeZone:
        "Asia/Manila",
    },
  ).format(date);
}

function getMinutesDifference(
  start: Date,
  end: Date,
): number {
  return Math.floor(
    (
      end.getTime() -
      start.getTime()
    ) / 60_000,
  );
}

function buildEvidencePolicy(input: {
  requirePhoto: boolean;
  requireLocation: boolean;
  maxPhotoSizeMb: number;
}): OdlAttendanceEvidencePolicy {
  return {
    requirePhoto:
      input.requirePhoto,

    requireLocation:
      input.requireLocation,

    maxPhotoSizeMb:
      input.maxPhotoSizeMb,
  };
}

function buildBlockedPageData(input: {
  message: string;

  employee?:
    | OdlAttendanceEmployeeData
    | null;

  evidencePolicy:
    OdlAttendanceEvidencePolicy;
}): OdlAttendancePageData {
  return {
    employee:
      input.employee ?? null,

    punchState:
      "BLOCKED",

    message:
      input.message,

    timeInAt:
      "—",

    timeOutAt:
      "—",

    minutesUntilTimeout:
      0,

    evidencePolicy:
      input.evidencePolicy,
  };
}

export async function getOdlAttendancePageData(): Promise<OdlAttendancePageData> {
  const [
    session,
    policy,
  ] = await Promise.all([
    getCurrentSession(),

    getAttendanceEnforcementPolicy(),
  ]);

  const evidencePolicy =
    buildEvidencePolicy({
      requirePhoto:
        policy.requirePhoto,

      requireLocation:
        policy.requireLocation,

      maxPhotoSizeMb:
        policy.maxPhotoSizeMb,
    });

  if (!session) {
    return buildBlockedPageData({
      message:
        "Please login first.",

      evidencePolicy,
    });
  }

  if (!policy.allowWebTimeIn) {
    return buildBlockedPageData({
      message:
        "Web attendance is currently disabled by the Attendance Policy settings.",

      evidencePolicy,
    });
  }

  const user =
    await prisma.user.findUnique({
      where: {
        userId:
          session.userId,
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

  const employee =
    user?.employee;

  if (
    !employee ||
    employee.status !== "ACTIVE"
  ) {
    return buildBlockedPageData({
      message:
        "No active employee profile is connected to this login account.",

      evidencePolicy,
    });
  }

  const employeeData:
    OdlAttendanceEmployeeData = {
    empId:
      employee.empId,

    empNumber:
      employee.empNumber,

    fullName:
      formatFullName({
        firstName:
          employee.firstName,

        middleName:
          employee.middleName,

        lastName:
          employee.lastName,
      }),

    departmentName:
      employee.department
        ?.name ?? "—",

    designationName:
      employee.designation
        ?.name ?? "—",

    empTypeName:
      employee.empType
        ?.name ?? "—",

    branchName:
      employee.branch.name,

    scheduleName:
      employee.schedule
        ?.name ?? "—",
  };

  const isOdlTeacher =
    isOdlTeacherRecord({
      departmentName:
        employee.department
          ?.name,

      empTypeName:
        employee.empType
          ?.name,

      designationName:
        employee.designation
          ?.name,
    });

  if (!isOdlTeacher) {
    return buildBlockedPageData({
      employee:
        employeeData,

      message:
        "Web time-in/time-out is only for ODL teachers. Face-to-face teachers must use the lobby RFID/biometric attendance system.",

      evidencePolicy,
    });
  }

  const today =
    getManilaDateOnly(
      new Date(),
    );

  const attendance =
    await prisma.attendance.findUnique({
      where: {
        empId_attDate: {
          empId:
            employee.empId,

          attDate:
            today,
        },
      },

      select: {
        timeIn: true,
        timeOut: true,
      },
    });

  if (!attendance?.timeIn) {
    return {
      employee:
        employeeData,

      punchState:
        "TIME_IN",

      message:
        "No time-in record found today. Your next submit will be TIME IN.",

      timeInAt:
        "—",

      timeOutAt:
        "—",

      minutesUntilTimeout:
        0,

      evidencePolicy,
    };
  }

  if (attendance.timeOut) {
    return {
      employee:
        employeeData,

      punchState:
        "DONE",

      message:
        "You already completed time-in and time-out today.",

      timeInAt:
        formatTime(
          attendance.timeIn,
        ),

      timeOutAt:
        formatTime(
          attendance.timeOut,
        ),

      minutesUntilTimeout:
        0,

      evidencePolicy,
    };
  }

  const minutesSinceTimeIn =
    getMinutesDifference(
      attendance.timeIn,
      new Date(),
    );

  if (
    minutesSinceTimeIn <
    MINIMUM_MINUTES_BEFORE_TIMEOUT
  ) {
    return {
      employee:
        employeeData,

      punchState:
        "WAITING",

      message:
        `You already timed in today. Time-out is available after ${MINIMUM_MINUTES_BEFORE_TIMEOUT} minutes.`,

      timeInAt:
        formatTime(
          attendance.timeIn,
        ),

      timeOutAt:
        "—",

      minutesUntilTimeout:
        Math.max(
          0,

          MINIMUM_MINUTES_BEFORE_TIMEOUT -
            minutesSinceTimeIn,
        ),

      evidencePolicy,
    };
  }

  return {
    employee:
      employeeData,

    punchState:
      "TIME_OUT",

    message:
      "Time-in record found today. Your next submit will be TIME OUT.",

    timeInAt:
      formatTime(
        attendance.timeIn,
      ),

    timeOutAt:
      "—",

    minutesUntilTimeout:
      0,

    evidencePolicy,
  };
}