export type CalculatedAttendanceStatus =
  | "ON_TIME"
  | "LATE"
  | "HALF_DAY"
  | "MISSING_TIMEOUT"
  | "ABSENT";

export type AttendanceStatusCalculationInput = {
  attDate: Date;
  timeIn: Date | null;
  timeOut: Date | null;
  shiftStartTime: string;
  shiftEndTime: string;
  graceMinutes: number;
  isOvernight: boolean;
  currentDate?: Date;
  missingTimeoutCutoffHours?: number;
  halfDayRatio?: number;
};

export type AttendanceStatusCalculationResult = {
  status: CalculatedAttendanceStatus;
  totalMinutes: number | null;
  scheduledMinutes: number;
  lateMinutes: number;
  reason: string;
};

const MANILA_UTC_OFFSET_HOURS = 8;

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

  return {
    year: Number(parts.find((part) => part.type === "year")?.value),
    month: Number(parts.find((part) => part.type === "month")?.value),
    day: Number(parts.find((part) => part.type === "day")?.value),
  };
}

function getManilaDateOnly(date = new Date()): Date {
  const { year, month, day } = getManilaDateParts(date);

  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
}

function parseTimeValue(value: string): {
  hours: number;
  minutes: number;
  seconds: number;
} {
  const [rawHours, rawMinutes, rawSeconds] = value.split(":");

  const hours = Number(rawHours);
  const minutes = Number(rawMinutes);
  const seconds = Number(rawSeconds ?? "0");

  if (
    !Number.isInteger(hours) ||
    !Number.isInteger(minutes) ||
    !Number.isInteger(seconds) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59 ||
    seconds < 0 ||
    seconds > 59
  ) {
    return {
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }

  return {
    hours,
    minutes,
    seconds,
  };
}

function buildManilaDateTime(input: {
  date: Date;
  timeValue: string;
  addDays?: number;
}): Date {
  const { year, month, day } = getManilaDateParts(input.date);
  const { hours, minutes, seconds } = parseTimeValue(input.timeValue);

  return new Date(
    Date.UTC(
      year,
      month - 1,
      day + (input.addDays ?? 0),
      hours - MANILA_UTC_OFFSET_HOURS,
      minutes,
      seconds,
      0,
    ),
  );
}

function differenceInMinutes(laterDate: Date, earlierDate: Date): number {
  return Math.max(
    0,
    Math.floor((laterDate.getTime() - earlierDate.getTime()) / 60_000),
  );
}

function isMissingTimeoutCandidate(input: {
  attDate: Date;
  timeIn: Date;
  currentDate: Date;
  cutoffHours: number;
}): boolean {
  const attendanceDateOnly = getManilaDateOnly(input.attDate);
  const currentDateOnly = getManilaDateOnly(input.currentDate);
  const cutoffDate = new Date(
    input.currentDate.getTime() - input.cutoffHours * 60 * 60 * 1000,
  );

  return attendanceDateOnly < currentDateOnly || input.timeIn <= cutoffDate;
}

export function calculateAttendanceStatus(
  input: AttendanceStatusCalculationInput,
): AttendanceStatusCalculationResult {
  const currentDate = input.currentDate ?? new Date();
  const missingTimeoutCutoffHours = input.missingTimeoutCutoffHours ?? 18;
  const halfDayRatio = input.halfDayRatio ?? 0.5;

  const shiftStartDate = buildManilaDateTime({
    date: input.attDate,
    timeValue: input.shiftStartTime,
  });

  const shiftEndDate = buildManilaDateTime({
    date: input.attDate,
    timeValue: input.shiftEndTime,
    addDays: input.isOvernight ? 1 : 0,
  });

  const scheduledMinutes = Math.max(
    1,
    differenceInMinutes(shiftEndDate, shiftStartDate),
  );

  if (!input.timeIn && !input.timeOut) {
    return {
      status: "ABSENT",
      totalMinutes: null,
      scheduledMinutes,
      lateMinutes: 0,
      reason: "No time-in and no time-out were recorded.",
    };
  }

  if (!input.timeIn) {
    return {
      status: "ABSENT",
      totalMinutes: null,
      scheduledMinutes,
      lateMinutes: 0,
      reason: "No valid time-in was recorded.",
    };
  }

  if (!input.timeOut) {
    const isMissingTimeout = isMissingTimeoutCandidate({
      attDate: input.attDate,
      timeIn: input.timeIn,
      currentDate,
      cutoffHours: missingTimeoutCutoffHours,
    });

    if (isMissingTimeout) {
      return {
        status: "MISSING_TIMEOUT",
        totalMinutes: null,
        scheduledMinutes,
        lateMinutes: 0,
        reason:
          "Time-in exists but no time-out was recorded after the allowed timeout cutoff.",
      };
    }
  }

  const allowedStartDate = new Date(
    shiftStartDate.getTime() + input.graceMinutes * 60 * 1000,
  );

  const lateMinutes =
    input.timeIn > allowedStartDate
      ? differenceInMinutes(input.timeIn, allowedStartDate)
      : 0;

  const baseStatus: CalculatedAttendanceStatus =
    input.timeIn <= allowedStartDate ? "ON_TIME" : "LATE";

  if (!input.timeOut) {
    return {
      status: baseStatus,
      totalMinutes: null,
      scheduledMinutes,
      lateMinutes,
      reason:
        baseStatus === "ON_TIME"
          ? "Employee timed in within the shift grace period."
          : "Employee timed in after the shift grace period.",
    };
  }

  const totalMinutes = differenceInMinutes(input.timeOut, input.timeIn);
  const minimumHalfDayMinutes = Math.floor(scheduledMinutes * halfDayRatio);

  if (totalMinutes > 0 && totalMinutes < minimumHalfDayMinutes) {
    return {
      status: "HALF_DAY",
      totalMinutes,
      scheduledMinutes,
      lateMinutes,
      reason:
        "Worked minutes are below the configured half-day threshold for the assigned shift.",
    };
  }

  return {
    status: baseStatus,
    totalMinutes,
    scheduledMinutes,
    lateMinutes,
    reason:
      baseStatus === "ON_TIME"
        ? "Employee completed attendance and timed in within the shift grace period."
        : "Employee completed attendance but timed in after the shift grace period.",
  };
}