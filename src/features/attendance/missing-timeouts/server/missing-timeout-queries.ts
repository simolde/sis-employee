import { buildAttendanceReviewRequiredWhere } from "@/features/attendance/server/attendance-review-policy";
import {
  buildEligibleMissingTimeoutWhere,
  getMissingTimeoutPolicySnapshot,
} from "@/features/attendance/missing-timeouts/server/missing-timeout-service";
import { prisma } from "@/lib/db/prisma";
import { formatFullName } from "@/lib/utils/formatting";
import type {
  MissingTimeoutPageData,
  MissingTimeoutRecord,
} from "../types/missing-timeout-types";

function formatDate(
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
      year: "numeric",
      month: "short",
      day: "2-digit",
      timeZone:
        "Asia/Manila",
    },
  ).format(date);
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

function formatShiftTimeValue(
  value: string,
): string {
  if (
    /^\d{2}:\d{2}:\d{2}$/u.test(
      value,
    )
  ) {
    return value.slice(
      0,
      5,
    );
  }

  return value;
}

function formatShiftTime(input: {
  startTime: string;
  endTime: string;
  isOvernight: boolean;
}): string {
  const startTime =
    formatShiftTimeValue(
      input.startTime,
    );

  const endTime =
    formatShiftTimeValue(
      input.endTime,
    );

  const overnightLabel =
    input.isOvernight
      ? " · Overnight"
      : "";

  return `${startTime} - ${endTime}${overnightLabel}`;
}

function dash(
  value:
    | string
    | null
    | undefined,
): string {
  return value?.trim()
    ? value
    : "—";
}

function getAgeHours(
  date: Date | null,
): number {
  if (!date) {
    return 0;
  }

  return Math.max(
    0,
    Math.floor(
      (
        Date.now() -
        date.getTime()
      ) / 3_600_000,
    ),
  );
}

function mapMissingTimeoutRecord(input: {
  attendanceId: number;
  attDate: Date;
  timeIn: Date | null;
  inSource: string | null;
  status: string;
  isManual: boolean;

  employee: {
    empNumber: string;
    firstName: string;
    middleName: string | null;
    lastName: string;

    branch: {
      name: string;
    };

    department: {
      name: string;
    } | null;
  };

  schedule: {
    scheduleCode: string;
    name: string;

    shift: {
      shiftCode: string;
      name: string;
      startTime: string;
      endTime: string;
      isOvernight: boolean;
    };
  } | null;
}): MissingTimeoutRecord {
  const employeeName =
    formatFullName({
      firstName:
        input.employee.firstName,

      middleName:
        input.employee.middleName,

      lastName:
        input.employee.lastName,
    });

  return {
    attendanceId:
      input.attendanceId,

    empNumber:
      input.employee.empNumber,

    employeeName,

    branchName:
      input.employee.branch.name,

    departmentName:
      dash(
        input.employee.department
          ?.name,
      ),

    scheduleName:
      input.schedule
        ? `${input.schedule.scheduleCode} · ${input.schedule.name}`
        : "—",

    shiftTime:
      input.schedule
        ? `${input.schedule.shift.shiftCode} · ${
            input.schedule.shift.name
          } (${formatShiftTime({
            startTime:
              input.schedule.shift
                .startTime,

            endTime:
              input.schedule.shift
                .endTime,

            isOvernight:
              input.schedule.shift
                .isOvernight,
          })})`
        : "—",

    attDate:
      formatDate(
        input.attDate,
      ),

    timeIn:
      formatTime(
        input.timeIn,
      ),

    source:
      input.inSource ??
      "—",

    status:
      input.status,

    isManual:
      input.isManual,

    ageHours:
      getAgeHours(
        input.timeIn,
      ),
  };
}

export async function getMissingTimeoutPageData(): Promise<MissingTimeoutPageData> {
  const policy =
    await getMissingTimeoutPolicySnapshot();

  const eligibleWhere =
    buildEligibleMissingTimeoutWhere({
      missingTimeoutMinutes:
        policy.missingTimeoutMinutes,
    });

  const reviewRequiredWhere =
    buildAttendanceReviewRequiredWhere();

  const [
    records,
    eligibleMissingTimeouts,
    alreadyMarkedMissingTimeouts,
    manualPendingReview,
  ] = await Promise.all([
    prisma.attendance.findMany({
      where:
        eligibleWhere,

      select: {
        attendanceId: true,
        attDate: true,
        timeIn: true,
        inSource: true,
        status: true,
        isManual: true,

        employee: {
          select: {
            empNumber: true,
            firstName: true,
            middleName: true,
            lastName: true,

            branch: {
              select: {
                name: true,
              },
            },

            department: {
              select: {
                name: true,
              },
            },
          },
        },

        schedule: {
          select: {
            scheduleCode: true,
            name: true,

            shift: {
              select: {
                shiftCode: true,
                name: true,
                startTime: true,
                endTime: true,
                isOvernight: true,
              },
            },
          },
        },
      },

      orderBy: [
        {
          timeIn:
            "asc",
        },
        {
          attendanceId:
            "asc",
        },
      ],

      take:
        200,
    }),

    prisma.attendance.count({
      where:
        eligibleWhere,
    }),

    prisma.attendance.count({
      where: {
        status:
          "MISSING_TIMEOUT",
      },
    }),

    prisma.attendance.count({
      where: {
        AND: [
          reviewRequiredWhere,
          {
            approvedAt:
              null,
          },
        ],
      },
    }),
  ]);

  return {
    records:
      records.map(
        mapMissingTimeoutRecord,
      ),

    summary: {
      eligibleMissingTimeouts,
      alreadyMarkedMissingTimeouts,
      manualPendingReview,
    },
  };
}