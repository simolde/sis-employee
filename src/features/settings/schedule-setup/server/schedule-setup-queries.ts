import { prisma } from "@/lib/db/prisma";
import type {
  RecordStatusValue,
  SchedulePageData,
  ShiftListItem,
  ShiftOption,
  ShiftPageData,
  ShiftScheduleListItem,
} from "../types/schedule-setup-types";

function formatDateTime(
  date: Date,
): string {
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

function formatDateInput(
  date:
    | Date
    | null
    | undefined,
): string {
  if (!date) {
    return "";
  }

  return date
    .toISOString()
    .slice(0, 10);
}

function formatTimeForInput(
  value: string,
): string {
  return value.slice(
    0,
    5,
  );
}

function mapShift(
  shift: {
    shiftId: number;
    shiftCode: string;
    name: string;
    startTime: string;
    endTime: string;
    graceMinutes: number;
    isOvernight: boolean;
    status:
      RecordStatusValue;
    createdAt: Date;
    updatedAt: Date;

    schedules: Array<{
      status:
        RecordStatusValue;

      _count: {
        currentEmployees: number;
        employeeAssignments: number;
        attendanceRecords: number;
      };
    }>;
  },
): ShiftListItem {
  const scheduleCount =
    shift.schedules.length;

  const activeScheduleCount =
    shift.schedules.filter(
      (schedule) =>
        schedule.status ===
        "ACTIVE",
    ).length;

  const currentEmployeeCount =
    shift.schedules.reduce(
      (
        total,
        schedule,
      ) =>
        total +
        schedule._count
          .currentEmployees,
      0,
    );

  const assignmentHistoryCount =
    shift.schedules.reduce(
      (
        total,
        schedule,
      ) =>
        total +
        schedule._count
          .employeeAssignments,
      0,
    );

  const attendanceCount =
    shift.schedules.reduce(
      (
        total,
        schedule,
      ) =>
        total +
        schedule._count
          .attendanceRecords,
      0,
    );

  const ruleEditingLocked =
    currentEmployeeCount >
      0 ||
    assignmentHistoryCount >
      0 ||
    attendanceCount >
      0;

  const statusChangeLocked =
    shift.status ===
      "ACTIVE" &&
    activeScheduleCount >
      0;

  return {
    shiftId:
      shift.shiftId,

    shiftCode:
      shift.shiftCode,

    name:
      shift.name,

    startTime:
      formatTimeForInput(
        shift.startTime,
      ),

    endTime:
      formatTimeForInput(
        shift.endTime,
      ),

    graceMinutes:
      shift.graceMinutes,

    isOvernight:
      shift.isOvernight,

    status:
      shift.status,

    scheduleCount,
    activeScheduleCount,
    currentEmployeeCount,
    assignmentHistoryCount,
    attendanceCount,
    ruleEditingLocked,
    statusChangeLocked,

    createdAt:
      formatDateTime(
        shift.createdAt,
      ),

    updatedAt:
      formatDateTime(
        shift.updatedAt,
      ),
  };
}

function mapShiftOption(
  shift: {
    shiftId: number;
    shiftCode: string;
    name: string;
    startTime: string;
    endTime: string;
    status:
      RecordStatusValue;
  },
): ShiftOption {
  const startTime =
    formatTimeForInput(
      shift.startTime,
    );

  const endTime =
    formatTimeForInput(
      shift.endTime,
    );

  const statusLabel =
    shift.status ===
    "ACTIVE"
      ? ""
      : ` · ${shift.status}`;

  return {
    shiftId:
      shift.shiftId,

    shiftCode:
      shift.shiftCode,

    name:
      shift.name,

    startTime,
    endTime,

    status:
      shift.status,

    label:
      `${shift.shiftCode} · ${shift.name} (${startTime} - ${endTime})${statusLabel}`,
  };
}

function mapSchedule(
  schedule: {
    scheduleId: number;
    scheduleCode: string;
    name: string;
    shiftId: number;
    daysOfWeek:
      string | null;
    effectiveFrom: Date;
    effectiveTo:
      Date | null;
    status:
      RecordStatusValue;
    createdAt: Date;
    updatedAt: Date;

    shift: {
      shiftCode: string;
      name: string;
      startTime: string;
      endTime: string;
      status:
        RecordStatusValue;
    };

    _count: {
      currentEmployees: number;
      employeeAssignments: number;
      attendanceRecords: number;
    };

    employeeAssignments:
      Array<{
        assignmentId: number;
      }>;
  },
): ShiftScheduleListItem {
  const currentEmployeeCount =
    schedule._count
      .currentEmployees;

  const assignmentHistoryCount =
    schedule._count
      .employeeAssignments;

  const activeAssignmentCount =
    schedule
      .employeeAssignments
      .length;

  const attendanceCount =
    schedule._count
      .attendanceRecords;

  const coreEditingLocked =
    currentEmployeeCount >
      0 ||
    assignmentHistoryCount >
      0 ||
    attendanceCount >
      0;

  const statusChangeLocked =
    schedule.status ===
      "ACTIVE" &&
    (
      currentEmployeeCount >
        0 ||
      activeAssignmentCount >
        0
    );

  return {
    scheduleId:
      schedule.scheduleId,

    scheduleCode:
      schedule.scheduleCode,

    name:
      schedule.name,

    shiftId:
      schedule.shiftId,

    shiftName:
      schedule.shift.name,

    shiftCode:
      schedule.shift
        .shiftCode,

    shiftStatus:
      schedule.shift.status,

    startTime:
      formatTimeForInput(
        schedule.shift
          .startTime,
      ),

    endTime:
      formatTimeForInput(
        schedule.shift
          .endTime,
      ),

    daysOfWeek:
      schedule.daysOfWeek ??
      "—",

    effectiveFrom:
      formatDate(
        schedule.effectiveFrom,
      ),

    effectiveTo:
      formatDate(
        schedule.effectiveTo,
      ),

    effectiveFromInput:
      formatDateInput(
        schedule.effectiveFrom,
      ),

    effectiveToInput:
      formatDateInput(
        schedule.effectiveTo,
      ),

    status:
      schedule.status,

    currentEmployeeCount,
    assignmentHistoryCount,
    activeAssignmentCount,
    attendanceCount,
    coreEditingLocked,
    statusChangeLocked,

    createdAt:
      formatDateTime(
        schedule.createdAt,
      ),

    updatedAt:
      formatDateTime(
        schedule.updatedAt,
      ),
  };
}

export async function getShiftPageData(): Promise<ShiftPageData> {
  const shifts =
    await prisma.shift.findMany({
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

        schedules: {
          select: {
            status: true,

            _count: {
              select: {
                currentEmployees:
                  true,

                employeeAssignments:
                  true,

                attendanceRecords:
                  true,
              },
            },
          },
        },
      },

      orderBy: [
        {
          status:
            "asc",
        },
        {
          name:
            "asc",
        },
      ],
    });

  const mappedShifts =
    shifts.map(
      mapShift,
    );

  return {
    shifts:
      mappedShifts,

    summary: {
      total:
        mappedShifts.length,

      active:
        mappedShifts.filter(
          (shift) =>
            shift.status ===
            "ACTIVE",
        ).length,

      inactive:
        mappedShifts.filter(
          (shift) =>
            shift.status ===
            "INACTIVE",
        ).length,

      archived:
        mappedShifts.filter(
          (shift) =>
            shift.status ===
            "ARCHIVED",
        ).length,

      overnight:
        mappedShifts.filter(
          (shift) =>
            shift.isOvernight,
        ).length,

      protectedRules:
        mappedShifts.filter(
          (shift) =>
            shift.ruleEditingLocked,
        ).length,
    },
  };
}

export async function getSchedulePageData(): Promise<SchedulePageData> {
  const [
    shifts,
    schedules,
  ] =
    await Promise.all([
      prisma.shift.findMany({
        select: {
          shiftId: true,
          shiftCode: true,
          name: true,
          startTime: true,
          endTime: true,
          status: true,
        },

        orderBy: [
          {
            status:
              "asc",
          },
          {
            name:
              "asc",
          },
        ],
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
              status: true,
            },
          },

          _count: {
            select: {
              currentEmployees:
                true,

              employeeAssignments:
                true,

              attendanceRecords:
                true,
            },
          },

          employeeAssignments: {
            where: {
              isActive:
                true,
            },

            select: {
              assignmentId:
                true,
            },
          },
        },

        orderBy: [
          {
            status:
              "asc",
          },
          {
            name:
              "asc",
          },
        ],
      }),
    ]);

  const mappedSchedules =
    schedules.map(
      mapSchedule,
    );

  return {
    shiftOptions:
      shifts.map(
        mapShiftOption,
      ),

    schedules:
      mappedSchedules,

    summary: {
      total:
        mappedSchedules.length,

      active:
        mappedSchedules.filter(
          (schedule) =>
            schedule.status ===
            "ACTIVE",
        ).length,

      inactive:
        mappedSchedules.filter(
          (schedule) =>
            schedule.status ===
            "INACTIVE",
        ).length,

      archived:
        mappedSchedules.filter(
          (schedule) =>
            schedule.status ===
            "ARCHIVED",
        ).length,

      assigned:
        mappedSchedules.filter(
          (schedule) =>
            schedule.currentEmployeeCount >
            0,
        ).length,

      protectedRules:
        mappedSchedules.filter(
          (schedule) =>
            schedule.coreEditingLocked,
        ).length,
    },
  };
}