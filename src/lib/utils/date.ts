export function getTodayDateOnly(inputDate = new Date()): Date {
  return new Date(
    inputDate.getFullYear(),
    inputDate.getMonth(),
    inputDate.getDate(),
  );
}

export function parseTimeToMinutes(time: string): number {
  const [hourText, minuteText] = time.split(":");

  const hours = Number(hourText);
  const minutes = Number(minuteText);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    throw new Error(`Invalid time value: ${time}`);
  }

  return hours * 60 + minutes;
}

export function calculateLateMinutes(input: {
  scheduledStartTime: string;
  actualTime: Date;
  gracePeriodMinutes: number;
}): number {
  const scheduledMinutes = parseTimeToMinutes(input.scheduledStartTime);
  const actualMinutes = input.actualTime.getHours() * 60 + input.actualTime.getMinutes();
  const allowedStartMinutes = scheduledMinutes + input.gracePeriodMinutes;

  return Math.max(0, actualMinutes - allowedStartMinutes);
}

export function calculateTotalMinutes(input: {
  timeIn: Date;
  timeOut: Date;
}): number {
  const diffMs = input.timeOut.getTime() - input.timeIn.getTime();

  return Math.max(0, Math.floor(diffMs / 60000));
}

export function formatDateForInput(date: Date | null | undefined): string {
  if (!date) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}