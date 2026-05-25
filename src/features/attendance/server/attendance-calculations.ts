export type AttendanceCalculationInput = {
  punchAt: Date;
  scheduleStartTime: string | null;
  graceMinutes: number;
};

function getFormatterParts(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
}

function getPart(parts: Intl.DateTimeFormatPart[], type: string): string {
  return parts.find((part) => part.type === type)?.value ?? "00";
}

export function getManilaDateString(date = new Date()): string {
  const parts = getFormatterParts(date);
  const year = getPart(parts, "year");
  const month = getPart(parts, "month");
  const day = getPart(parts, "day");

  return `${year}-${month}-${day}`;
}

export function getManilaDateOnly(date = new Date()): Date {
  return new Date(`${getManilaDateString(date)}T00:00:00.000Z`);
}

export function getMinutesFromTimeString(time: string | null): number | null {
  if (!time) {
    return null;
  }

  const [hourRaw, minuteRaw] = time.split(":");
  const hour = Number(hourRaw);
  const minute = Number(minuteRaw);

  if (!Number.isInteger(hour) || !Number.isInteger(minute)) {
    return null;
  }

  return hour * 60 + minute;
}

export function getManilaMinutesOfDay(date: Date): number {
  const parts = getFormatterParts(date);
  const hour = Number(getPart(parts, "hour"));
  const minute = Number(getPart(parts, "minute"));

  return hour * 60 + minute;
}

export function calculateTimeInStatus({
  punchAt,
  scheduleStartTime,
  graceMinutes,
}: AttendanceCalculationInput): "ON_TIME" | "LATE" | "PENDING_REVIEW" {
  const scheduleStartMinutes = getMinutesFromTimeString(scheduleStartTime);

  if (scheduleStartMinutes === null) {
    return "PENDING_REVIEW";
  }

  const punchMinutes = getManilaMinutesOfDay(punchAt);
  const allowedMinutes = scheduleStartMinutes + graceMinutes;

  return punchMinutes <= allowedMinutes ? "ON_TIME" : "LATE";
}

export function calculateTotalMinutes(
  timeIn: Date | null,
  timeOut: Date | null,
): number | null {
  if (!timeIn || !timeOut) {
    return null;
  }

  const differenceMs = timeOut.getTime() - timeIn.getTime();

  if (differenceMs <= 0) {
    return null;
  }

  return Math.round(differenceMs / 60000);
}