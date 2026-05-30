import { prisma } from "@/lib/db/prisma";
import type {
  RecordStatusValue,
  SchedulePageData,
  ShiftListItem,
  ShiftOption,
  ShiftPageData,
  ShiftScheduleListItem,
} from "../types/schedule-setup-types";

function formatDateTime(date: Date): string {
  return new Intl.DateTimeFormat("en-PH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Manila",
  }).format(date);
}

function formatDate(date: Date | null | undefined): string {
  if (!date) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-PH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    timeZone: "Asia/Manila",
  }).format(date);
}

function formatDateInput(date: Date | null | undefined): string {
  if (!date) {
    return "";
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatTimeForInput(value: string): string {
  if (/^\d{2}:\d{2}:\d{2}$/.test(value)) {
    return value.slice(0, 5);
  }

  return value;
}

function mapShift(shift: {
  shiftId: number;
  shiftCode: string;
  name: string;
  startTime: string;
  endTime: string;
  graceMinutes: number;
  isOvernight: boolean;
  status: RecordStatusValue;
  createdAt: Date;
  updatedAt: Date;
}): ShiftListItem {
  return {
    shiftId: shift.shiftId,
    shiftCode: shift.shiftCode,
    name: shift.name,
    startTime: formatTimeForInput(shift.startTime),
    endTime: formatTimeForInput(shift.endTime),
    graceMinutes: shift.graceMinutes,
    isOvernight: shift.isOvernight,
    status: shift.status,
    createdAt: formatDateTime(shift.createdAt),
    updatedAt: formatDateTime(shift.updatedAt),
  };
}

function mapShiftOption(shift: {
  shiftId: number;
  shiftCode: string;
  name: string;
  startTime: string;
  endTime: string;
}): ShiftOption {
  const startTime = formatTimeForInput(shift.startTime);
  const endTime = formatTimeForInput(shift.endTime);

  return {
    shiftId: shift.shiftId,
    shiftCode: shift.shiftCode,
    name: shift.name,
    startTime,
    endTime,
    label: `${shift.shiftCode} · ${shift.name} (${startTime} - ${endTime})`,
  };
}

function mapSchedule(schedule: {
  scheduleId: number;
  scheduleCode: string;
  name: string;
  shiftId: number;
  daysOfWeek: string | null;
  effectiveFrom: Date;
  effectiveTo: Date | null;
  status: RecordStatusValue;
  createdAt: Date;
  updatedAt: Date;
  shift: {
    shiftCode: string;
    name: string;
    startTime: string;
    endTime: string;
  };
}): ShiftScheduleListItem {
  return {
    scheduleId: schedule.scheduleId,
    scheduleCode: schedule.scheduleCode,
    name: schedule.name,
    shiftId: schedule.shiftId,
    shiftName: schedule.shift.name,
    shiftCode: schedule.shift.shiftCode,
    startTime: formatTimeForInput(schedule.shift.startTime),
    endTime: formatTimeForInput(schedule.shift.endTime),
    daysOfWeek: schedule.daysOfWeek ?? "—",
    effectiveFrom: formatDate(schedule.effectiveFrom),
    effectiveTo: formatDate(schedule.effectiveTo),
    effectiveFromInput: formatDateInput(schedule.effectiveFrom),
    effectiveToInput: formatDateInput(schedule.effectiveTo),
    status: schedule.status,
    createdAt: formatDateTime(schedule.createdAt),
    updatedAt: formatDateTime(schedule.updatedAt),
  };
}

export async function getShiftPageData(): Promise<ShiftPageData> {
  const shifts = await prisma.shift.findMany({
    select: {
      shiftId: true,
      shiftCode: true,
      name: true,
      startTime: true,
      endTime: true,
      graceMinutes: true,
      isOvernight: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: [
      {
        status: "asc",
      },
      {
        name: "asc",
      },
    ],
  });

  return {
    shifts: shifts.map(mapShift),
    summary: {
      total: shifts.length,
      active: shifts.filter((shift) => shift.status === "ACTIVE").length,
      inactive: shifts.filter((shift) => shift.status === "INACTIVE").length,
      archived: shifts.filter((shift) => shift.status === "ARCHIVED").length,
      overnight: shifts.filter((shift) => shift.isOvernight).length,
    },
  };
}

export async function getSchedulePageData(): Promise<SchedulePageData> {
  const [shifts, schedules] = await Promise.all([
    prisma.shift.findMany({
      where: {
        status: "ACTIVE",
      },
      select: {
        shiftId: true,
        shiftCode: true,
        name: true,
        startTime: true,
        endTime: true,
      },
      orderBy: {
        name: "asc",
      },
    }),

    prisma.shiftSchedule.findMany({
      select: {
        scheduleId: true,
        scheduleCode: true,
        name: true,
        shiftId: true,
        daysOfWeek: true,
        effectiveFrom: true,
        effectiveTo: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        shift: {
          select: {
            shiftCode: true,
            name: true,
            startTime: true,
            endTime: true,
          },
        },
      },
      orderBy: [
        {
          status: "asc",
        },
        {
          name: "asc",
        },
      ],
    }),
  ]);

  return {
    shiftOptions: shifts.map(mapShiftOption),
    schedules: schedules.map(mapSchedule),
    summary: {
      total: schedules.length,
      active: schedules.filter((schedule) => schedule.status === "ACTIVE")
        .length,
      inactive: schedules.filter((schedule) => schedule.status === "INACTIVE")
        .length,
      archived: schedules.filter((schedule) => schedule.status === "ARCHIVED")
        .length,
    },
  };
}