import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import { formatFullName, formatMinutesToHours } from "@/lib/utils/formatting";
import type {
  AttendanceDetail,
  AttendanceDetailLog,
  AttendanceDetailPunch,
  AttendanceListItem,
  AttendanceListResult,
  AttendanceListSearchParams,
  AttendanceStatusValue,
} from "../types/attendance-types";

function parsePositiveId(value: string): number | null {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

function getManilaDateString(date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find((part) => part.type === "year")?.value ?? "1970";
  const month = parts.find((part) => part.type === "month")?.value ?? "01";
  const day = parts.find((part) => part.type === "day")?.value ?? "01";

  return `${year}-${month}-${day}`;
}

function dateInputToDate(value: string): Date | undefined {
  if (!value) {
    return undefined;
  }

  return new Date(`${value}T00:00:00.000Z`);
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

function formatDateTime(date: Date | null | undefined): string {
  if (!date) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-PH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Manila",
  }).format(date);
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

function formatShiftTimeValue(value: string): string {
  if (/^\d{2}:\d{2}:\d{2}$/.test(value)) {
    return value.slice(0, 5);
  }

  return value;
}

function formatShiftTime(input: {
  startTime: string;
  endTime: string;
  isOvernight?: boolean;
}): string {
  const startTime = formatShiftTimeValue(input.startTime);
  const endTime = formatShiftTimeValue(input.endTime);
  const overnight = input.isOvernight ? " · Overnight" : "";

  return `${startTime} - ${endTime}${overnight}`;
}

function dash(value: string | null | undefined): string {
  return value?.trim() ? value : "—";
}

function coordinate(value: { toString(): string } | null | undefined): string {
  return value ? value.toString() : "—";
}

function buildAttendanceWhere(
  filters: AttendanceListSearchParams,
): Prisma.AttendanceWhereInput {
  const where: Prisma.AttendanceWhereInput = {};

  if (filters.status !== "ALL") {
    where.status = filters.status;
  }

  if (filters.source !== "ALL") {
    where.OR = [
      {
        inSource: filters.source,
      },
      {
        outSource: filters.source,
      },
    ];
  }

  const dateFrom = dateInputToDate(filters.dateFrom);
  const dateTo = dateInputToDate(filters.dateTo);

  if (dateFrom || dateTo) {
    where.attDate = {
      ...(dateFrom ? { gte: dateFrom } : {}),
      ...(dateTo ? { lte: dateTo } : {}),
    };
  }

  if (filters.q) {
    const searchConditions: Prisma.AttendanceWhereInput[] = [
      {
        employee: {
          empNumber: {
            contains: filters.q,
          },
        },
      },
      {
        employee: {
          firstName: {
            contains: filters.q,
          },
        },
      },
      {
        employee: {
          middleName: {
            contains: filters.q,
          },
        },
      },
      {
        employee: {
          lastName: {
            contains: filters.q,
          },
        },
      },
      {
        employee: {
          department: {
            name: {
              contains: filters.q,
            },
          },
        },
      },
      {
        schedule: {
          name: {
            contains: filters.q,
          },
        },
      },
      {
        schedule: {
          scheduleCode: {
            contains: filters.q,
          },
        },
      },
      {
        inBranch: {
          name: {
            contains: filters.q,
          },
        },
      },
      {
        outBranch: {
          name: {
            contains: filters.q,
          },
        },
      },
    ];

    where.AND = [
      ...(where.AND ? (Array.isArray(where.AND) ? where.AND : [where.AND]) : []),
      {
        OR: searchConditions,
      },
    ];
  }

  return where;
}

function mapAttendanceListItem(attendance: {
  attendanceId: number;
  attDate: Date;
  timeIn: Date | null;
  timeOut: Date | null;
  inSource: string | null;
  outSource: string | null;
  status: AttendanceStatusValue;
  totalMinutes: number | null;
  isManual: boolean;
  isSynced: boolean;
  employee: {
    empNumber: string;
    firstName: string;
    middleName: string | null;
    lastName: string;
    department: {
      name: string;
    } | null;
  };
  schedule: {
    scheduleCode: string;
    name: string;
    shift: {
      startTime: string;
      endTime: string;
      isOvernight: boolean;
    };
  } | null;
  inBranch: {
    name: string;
  } | null;
  outBranch: {
    name: string;
  } | null;
}): AttendanceListItem {
  return {
    attendanceId: attendance.attendanceId,
    empNumber: attendance.employee.empNumber,
    employeeName: formatFullName({
      firstName: attendance.employee.firstName,
      middleName: attendance.employee.middleName,
      lastName: attendance.employee.lastName,
    }),
    departmentName: attendance.employee.department?.name ?? "—",
    scheduleName: attendance.schedule
      ? `${attendance.schedule.scheduleCode} · ${attendance.schedule.name}`
      : "—",
    attDate: formatDate(attendance.attDate),
    timeIn: formatTime(attendance.timeIn),
    timeOut: formatTime(attendance.timeOut),
    source: attendance.outSource ?? attendance.inSource ?? "—",
    branchName: attendance.outBranch?.name ?? attendance.inBranch?.name ?? "—",
    status: attendance.status,
    totalHours: formatMinutesToHours(attendance.totalMinutes),
    isManual: attendance.isManual,
    isSynced: attendance.isSynced,
  };
}

function mapPunch(input: {
  time: Date | null;
  source: string | null;
  branchName: string | null | undefined;
  latitude: { toString(): string } | null;
  longitude: { toString(): string } | null;
  address: string | null;
  photo: string | null;
  remark: string | null;
  reason: string | null;
}): AttendanceDetailPunch {
  return {
    time: formatDateTime(input.time),
    source: input.source ?? "—",
    branchName: dash(input.branchName),
    latitude: coordinate(input.latitude),
    longitude: coordinate(input.longitude),
    address: dash(input.address),
    photo: dash(input.photo),
    remark: dash(input.remark),
    reason: dash(input.reason),
  };
}

function mapAttendanceLog(log: {
  logId: number;
  punchType: string;
  punchedAt: Date;
  source: string;
  latitude: { toString(): string } | null;
  longitude: { toString(): string } | null;
  remarks: string | null;
  reason: string | null;
  branch: {
    name: string;
  } | null;
}): AttendanceDetailLog {
  return {
    logId: log.logId,
    punchType: log.punchType,
    punchedAt: formatDateTime(log.punchedAt),
    source: log.source,
    branchName: log.branch?.name ?? "—",
    latitude: coordinate(log.latitude),
    longitude: coordinate(log.longitude),
    remarks: dash(log.remarks),
    reason: dash(log.reason),
  };
}

function getReviewRequired(input: {
  isManual: boolean;
  inSource: string | null;
  outSource: string | null;
  logs: {
    punchType: string;
  }[];
}): boolean {
  if (input.isManual) {
    return true;
  }

  if (input.inSource === "MANUAL" || input.outSource === "MANUAL") {
    return true;
  }

  return input.logs.some(
    (log) => log.punchType === "MANUAL_EDIT" || log.punchType === "CORRECTION",
  );
}

export async function getAttendanceList(
  filters: AttendanceListSearchParams,
): Promise<AttendanceListResult> {
  const where = buildAttendanceWhere(filters);
  const skip = (filters.page - 1) * filters.pageSize;
  const today = dateInputToDate(getManilaDateString());

  const [
    records,
    totalItems,
    totalToday,
    onTimeToday,
    lateToday,
    pendingReview,
    missingTimeout,
  ] = await Promise.all([
    prisma.attendance.findMany({
      where,
      select: {
        attendanceId: true,
        attDate: true,
        timeIn: true,
        timeOut: true,
        inSource: true,
        outSource: true,
        status: true,
        totalMinutes: true,
        isManual: true,
        isSynced: true,
        employee: {
          select: {
            empNumber: true,
            firstName: true,
            middleName: true,
            lastName: true,
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
                startTime: true,
                endTime: true,
                isOvernight: true,
              },
            },
          },
        },
        inBranch: {
          select: {
            name: true,
          },
        },
        outBranch: {
          select: {
            name: true,
          },
        },
      },
      orderBy: [
        {
          attDate: "desc",
        },
        {
          createdAt: "desc",
        },
      ],
      skip,
      take: filters.pageSize,
    }),

    prisma.attendance.count({
      where,
    }),

    prisma.attendance.count({
      where: {
        attDate: today,
      },
    }),

    prisma.attendance.count({
      where: {
        attDate: today,
        status: "ON_TIME",
      },
    }),

    prisma.attendance.count({
      where: {
        attDate: today,
        status: "LATE",
      },
    }),

    prisma.attendance.count({
      where: {
        OR: [
          {
            status: "PENDING_REVIEW",
          },
          {
            isManual: true,
          },
          {
            inSource: "MANUAL",
          },
          {
            outSource: "MANUAL",
          },
          {
            logs: {
              some: {
                punchType: {
                  in: ["MANUAL_EDIT", "CORRECTION"],
                },
              },
            },
          },
        ],
      },
    }),

    prisma.attendance.count({
      where: {
        OR: [
          {
            status: "MISSING_TIMEOUT",
          },
          {
            timeOut: null,
          },
        ],
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalItems / filters.pageSize));

  return {
    records: records.map(mapAttendanceListItem),
    summary: {
      totalToday,
      onTimeToday,
      lateToday,
      pendingReview,
      missingTimeout,
    },
    filters,
    pagination: {
      page: filters.page,
      pageSize: filters.pageSize,
      totalItems,
      totalPages,
      hasPreviousPage: filters.page > 1,
      hasNextPage: filters.page < totalPages,
    },
  };
}

export async function getAttendanceDetail(
  attendanceId: string,
): Promise<AttendanceDetail | null> {
  const parsedAttendanceId = parsePositiveId(attendanceId);

  if (!parsedAttendanceId) {
    return null;
  }

  const attendance = await prisma.attendance.findUnique({
    where: {
      attendanceId: parsedAttendanceId,
    },
    select: {
      attendanceId: true,
      attDate: true,
      timeIn: true,
      inRemark: true,
      inReason: true,
      inLatitude: true,
      inLongitude: true,
      inPhoto: true,
      inSource: true,
      inAddress: true,
      timeOut: true,
      outRemark: true,
      outReason: true,
      outLatitude: true,
      outLongitude: true,
      outPhoto: true,
      outSource: true,
      outAddress: true,
      status: true,
      totalMinutes: true,
      isSynced: true,
      isManual: true,
      verifiedAt: true,
      approvedAt: true,
      createdAt: true,
      updatedAt: true,
      employee: {
        select: {
          empNumber: true,
          firstName: true,
          middleName: true,
          lastName: true,
          department: {
            select: {
              name: true,
            },
          },
          branch: {
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
          shift: {
            select: {
              shiftCode: true,
              name: true,
              startTime: true,
              endTime: true,
              graceMinutes: true,
              isOvernight: true,
            },
          },
        },
      },
      inBranch: {
        select: {
          name: true,
        },
      },
      outBranch: {
        select: {
          name: true,
        },
      },
      verifiedBy: {
        select: {
          username: true,
        },
      },
      approvedBy: {
        select: {
          username: true,
        },
      },
      logs: {
        select: {
          logId: true,
          punchType: true,
          punchedAt: true,
          latitude: true,
          longitude: true,
          source: true,
          remarks: true,
          reason: true,
          branch: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          punchedAt: "desc",
        },
      },
    },
  });

  if (!attendance) {
    return null;
  }

  const employeeName = formatFullName({
    firstName: attendance.employee.firstName,
    middleName: attendance.employee.middleName,
    lastName: attendance.employee.lastName,
  });

  const logs = attendance.logs.map(mapAttendanceLog);

  return {
    attendanceId: attendance.attendanceId,
    employeeName,
    empNumber: attendance.employee.empNumber,
    departmentName: attendance.employee.department?.name ?? "—",
    branchName: attendance.employee.branch.name,
    scheduleName: attendance.schedule
      ? `${attendance.schedule.scheduleCode} · ${attendance.schedule.name}`
      : "—",
    shiftTime: attendance.schedule
      ? `${attendance.schedule.shift.shiftCode} · ${
          attendance.schedule.shift.name
        } (${formatShiftTime({
          startTime: attendance.schedule.shift.startTime,
          endTime: attendance.schedule.shift.endTime,
          isOvernight: attendance.schedule.shift.isOvernight,
        })}) · Grace ${attendance.schedule.shift.graceMinutes} min · Days ${
          attendance.schedule.daysOfWeek ?? "—"
        }`
      : "—",
    attDate: formatDate(attendance.attDate),
    status: attendance.status,
    totalHours: formatMinutesToHours(attendance.totalMinutes),
    isManual: attendance.isManual,
    isSynced: attendance.isSynced,
    reviewRequired: getReviewRequired({
      isManual: attendance.isManual,
      inSource: attendance.inSource,
      outSource: attendance.outSource,
      logs: attendance.logs,
    }),
    verifiedBy: attendance.verifiedBy?.username ?? "—",
    verifiedAt: formatDateTime(attendance.verifiedAt),
    approvedBy: attendance.approvedBy?.username ?? "—",
    approvedAt: formatDateTime(attendance.approvedAt),
    createdAt: formatDateTime(attendance.createdAt),
    updatedAt: formatDateTime(attendance.updatedAt),
    timeIn: mapPunch({
      time: attendance.timeIn,
      source: attendance.inSource,
      branchName: attendance.inBranch?.name,
      latitude: attendance.inLatitude,
      longitude: attendance.inLongitude,
      address: attendance.inAddress,
      photo: attendance.inPhoto,
      remark: attendance.inRemark,
      reason: attendance.inReason,
    }),
    timeOut: mapPunch({
      time: attendance.timeOut,
      source: attendance.outSource,
      branchName: attendance.outBranch?.name,
      latitude: attendance.outLatitude,
      longitude: attendance.outLongitude,
      address: attendance.outAddress,
      photo: attendance.outPhoto,
      remark: attendance.outRemark,
      reason: attendance.outReason,
    }),
    logs,
  };
}