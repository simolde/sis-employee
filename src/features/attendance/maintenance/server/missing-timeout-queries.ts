import {
  buildEligibleMissingTimeoutWhere,
  getMissingTimeoutPolicySnapshot,
  type MissingTimeoutPolicySnapshot,
} from "@/features/attendance/missing-timeouts/server/missing-timeout-service";
import { prisma } from "@/lib/db/prisma";
import {
  formatFullName,
  formatMinutesToHours,
} from "@/lib/utils/formatting";
import type {
  MissingTimeoutCandidate,
  MissingTimeoutMaintenanceData,
} from "../types/missing-timeout-types";

const MAX_CANDIDATES_TO_SCAN =
  500;

type AttendanceCandidateSource = {
  attendanceId: number;
  attDate: Date;
  timeIn: Date | null;
  inSource: string | null;
  status: string;
  totalMinutes: number | null;

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
    daysOfWeek: string | null;
    effectiveFrom: Date;
    effectiveTo: Date | null;
    status: string;

    shift: {
      shiftCode: string;
      name: string;
      startTime: string;
      endTime: string;
      isOvernight: boolean;
      status: string;
    };
  } | null;
};

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

function formatDateTime(
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

function getManilaDateParts(
  date: Date,
): {
  year: number;
  month: number;
  day: number;
} {
  const parts =
    new Intl.DateTimeFormat(
      "en-US",
      {
        timeZone:
          "Asia/Manila",

        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      },
    ).formatToParts(date);

  return {
    year:
      Number(
        parts.find(
          (part) =>
            part.type === "year",
        )?.value ?? "1970",
      ),

    month:
      Number(
        parts.find(
          (part) =>
            part.type === "month",
        )?.value ?? "1",
      ),

    day:
      Number(
        parts.find(
          (part) =>
            part.type === "day",
        )?.value ?? "1",
      ),
  };
}

function parseShiftTime(
  value: string,
): {
  hour: number;
  minute: number;
  second: number;
} {
  const [
    hour = "0",
    minute = "0",
    second = "0",
  ] = value.split(":");

  return {
    hour:
      Number(hour),

    minute:
      Number(minute),

    second:
      Number(second),
  };
}

function buildManilaDateTime(input: {
  attDate: Date;
  timeValue: string;
  addDays?: number;
}): Date {
  const {
    year,
    month,
    day,
  } = getManilaDateParts(
    input.attDate,
  );

  const {
    hour,
    minute,
    second,
  } = parseShiftTime(
    input.timeValue,
  );

  return new Date(
    Date.UTC(
      year,
      month - 1,
      day +
        (input.addDays ?? 0),
      hour - 8,
      minute,
      second,
      0,
    ),
  );
}

function isUsableSchedule(
  schedule:
    AttendanceCandidateSource["schedule"],

  attDate: Date,
): schedule is NonNullable<
  AttendanceCandidateSource["schedule"]
> {
  if (!schedule) {
    return false;
  }

  if (
    schedule.status !==
      "ACTIVE" ||
    schedule.shift.status !==
      "ACTIVE"
  ) {
    return false;
  }

  if (
    schedule.effectiveFrom >
    attDate
  ) {
    return false;
  }

  if (
    schedule.effectiveTo &&
    schedule.effectiveTo <
      attDate
  ) {
    return false;
  }

  return true;
}

function getScheduledEndDateTime(
  input: {
    attDate: Date;

    schedule:
      NonNullable<
        AttendanceCandidateSource["schedule"]
      >;
  },
): Date {
  const start =
    buildManilaDateTime({
      attDate:
        input.attDate,

      timeValue:
        input.schedule.shift
          .startTime,
    });

  const sameDayEnd =
    buildManilaDateTime({
      attDate:
        input.attDate,

      timeValue:
        input.schedule.shift
          .endTime,
    });

  if (
    input.schedule.shift
      .isOvernight ||
    sameDayEnd <= start
  ) {
    return buildManilaDateTime({
      attDate:
        input.attDate,

      timeValue:
        input.schedule.shift
          .endTime,

      addDays:
        1,
    });
  }

  return sameDayEnd;
}

function getCutoffData(
  input:
    AttendanceCandidateSource,

  policy:
    MissingTimeoutPolicySnapshot,
): {
  cutoffAt: Date;
  scheduledEnd: Date | null;
  reason: string;
} {
  const scheduledEnd =
    isUsableSchedule(
      input.schedule,
      input.attDate,
    )
      ? getScheduledEndDateTime({
          attDate:
            input.attDate,

          schedule:
            input.schedule,
        })
      : null;

  const fallbackStart =
    input.timeIn ??
    input.attDate;

  return {
    scheduledEnd,

    cutoffAt:
      new Date(
        fallbackStart.getTime() +
          policy.missingTimeoutMinutes *
            60_000,
      ),

    reason:
      `No time-out was recorded within ${policy.missingTimeoutMinutes} minutes after time-in.`,
  };
}

function formatScheduleName(
  schedule:
    AttendanceCandidateSource["schedule"],
): string {
  if (!schedule) {
    return "No schedule";
  }

  return `${schedule.scheduleCode} · ${schedule.name}`;
}

function formatShiftTime(
  schedule:
    AttendanceCandidateSource["schedule"],
): string {
  if (!schedule) {
    return "—";
  }

  const startTime =
    formatShiftTimeValue(
      schedule.shift.startTime,
    );

  const endTime =
    formatShiftTimeValue(
      schedule.shift.endTime,
    );

  const overnight =
    schedule.shift.isOvernight
      ? " · Overnight"
      : "";

  return `${schedule.shift.shiftCode} · ${schedule.shift.name} (${startTime} - ${endTime}${overnight})`;
}

function mapCandidate(
  input:
    AttendanceCandidateSource,

  policy:
    MissingTimeoutPolicySnapshot,
): MissingTimeoutCandidate {
  const cutoffData =
    getCutoffData(
      input,
      policy,
    );

  const employeeName =
    formatFullName({
      firstName:
        input.employee.firstName,

      middleName:
        input.employee.middleName,

      lastName:
        input.employee.lastName,
    });

  const totalMinutes =
    input.timeIn
      ? Math.max(
          0,
          getMinutesDifference(
            input.timeIn,
            new Date(),
          ),
        )
      : input.totalMinutes;

  return {
    attendanceId:
      input.attendanceId,

    empNumber:
      input.employee.empNumber,

    employeeName,

    branchName:
      input.employee.branch.name,

    departmentName:
      input.employee.department
        ?.name ?? "—",

    scheduleName:
      formatScheduleName(
        input.schedule,
      ),

    shiftTime:
      formatShiftTime(
        input.schedule,
      ),

    attDate:
      formatDate(
        input.attDate,
      ),

    timeIn:
      formatDateTime(
        input.timeIn,
      ),

    scheduledEnd:
      formatDateTime(
        cutoffData.scheduledEnd,
      ),

    cutoffAt:
      formatDateTime(
        cutoffData.cutoffAt,
      ),

    source:
      input.inSource ??
      "—",

    currentStatus:
      input.status,

    totalHours:
      formatMinutesToHours(
        totalMinutes,
      ),

    reason:
      cutoffData.reason,
  };
}

async function getRawMissingTimeoutCandidates(): Promise<{
  records:
    AttendanceCandidateSource[];

  policy:
    MissingTimeoutPolicySnapshot;
}> {
  const policy =
    await getMissingTimeoutPolicySnapshot();

  const records =
    await prisma.attendance.findMany({
      where:
        buildEligibleMissingTimeoutWhere({
          missingTimeoutMinutes:
            policy.missingTimeoutMinutes,
        }),

      select: {
        attendanceId: true,
        attDate: true,
        timeIn: true,
        inSource: true,
        status: true,
        totalMinutes: true,

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
                isOvernight: true,
                status: true,
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
        MAX_CANDIDATES_TO_SCAN,
    });

  return {
    records,
    policy,
  };
}

export async function getMissingTimeoutMaintenanceData(): Promise<MissingTimeoutMaintenanceData> {
  const {
    records,
    policy,
  } =
    await getRawMissingTimeoutCandidates();

  return {
    candidates:
      records.map(
        (record) =>
          mapCandidate(
            record,
            policy,
          ),
      ),

    summary: {
      candidateCount:
        records.length,

      withSchedule:
        records.filter(
          (record) =>
            isUsableSchedule(
              record.schedule,
              record.attDate,
            ),
        ).length,

      withoutSchedule:
        records.filter(
          (record) =>
            !isUsableSchedule(
              record.schedule,
              record.attDate,
            ),
        ).length,
    },
  };
}

export async function getMissingTimeoutCandidateIds(): Promise<number[]> {
  const {
    records,
  } =
    await getRawMissingTimeoutCandidates();

  return records.map(
    (record) =>
      record.attendanceId,
  );
}