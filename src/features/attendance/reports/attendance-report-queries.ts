import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import { formatFullName, formatMinutesToHours } from "@/lib/utils/formatting";
import {
  attendanceReportSourceValues,
  attendanceReportStatusValues,
  type AttendanceReportData,
  type AttendanceReportFilters,
  type AttendanceReportRow,
  type AttendanceReportSourceValue,
  type AttendanceReportStatusValue,
} from "./attendance-report-types";

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
  isOvernight: boolean;
}): string {
  const startTime = formatShiftTimeValue(input.startTime);
  const endTime = formatShiftTimeValue(input.endTime);
  const overnight = input.isOvernight ? " · Overnight" : "";

  return `${startTime} - ${endTime}${overnight}`;
}

function dash(value: string | null | undefined): string {
  return value?.trim() ? value : "—";
}

function isValidStatus(value: string): value is AttendanceReportStatusValue {
  return attendanceReportStatusValues.includes(
    value as AttendanceReportStatusValue,
  );
}

function isValidSource(value: string): value is AttendanceReportSourceValue {
  return attendanceReportSourceValues.includes(
    value as AttendanceReportSourceValue,
  );
}

function singleSearchParam(
  value: string | string[] | undefined,
  fallback = "",
): string {
  if (Array.isArray(value)) {
    return value[0] ?? fallback;
  }

  return value ?? fallback;
}

export function parseAttendanceReportSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): AttendanceReportFilters {
  const today = getManilaDateString();

  const q = singleSearchParam(searchParams.q).trim();
  const dateFrom = singleSearchParam(searchParams.dateFrom, today);
  const dateTo = singleSearchParam(searchParams.dateTo, today);
  const rawStatus = singleSearchParam(searchParams.status, "ALL");
  const rawSource = singleSearchParam(searchParams.source, "ALL");

  return {
    q,
    dateFrom,
    dateTo,
    status: isValidStatus(rawStatus) ? rawStatus : "ALL",
    source: isValidSource(rawSource) ? rawSource : "ALL",
  };
}

function buildAttendanceReportWhere(
  filters: AttendanceReportFilters,
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
          branch: {
            name: {
              contains: filters.q,
            },
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
          scheduleCode: {
            contains: filters.q,
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

function mapAttendanceReportRow(input: {
  attendanceId: number;
  attDate: Date;
  timeIn: Date | null;
  timeOut: Date | null;
  inSource: string | null;
  outSource: string | null;
  inAddress: string | null;
  outAddress: string | null;
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
    shift: {
      shiftCode: string;
      name: string;
      startTime: string;
      endTime: string;
      isOvernight: boolean;
    };
  } | null;
  verifiedBy: {
    username: string;
  } | null;
  approvedBy: {
    username: string;
  } | null;
}): AttendanceReportRow {
  const employeeName = formatFullName({
    firstName: input.employee.firstName,
    middleName: input.employee.middleName,
    lastName: input.employee.lastName,
  });

  const totalMinutes = input.totalMinutes ?? 0;

  return {
    attendanceId: input.attendanceId,
    empNumber: input.employee.empNumber,
    employeeName,
    departmentName: input.employee.department?.name ?? "—",
    branchName: input.employee.branch.name,
    scheduleName: input.schedule
      ? `${input.schedule.scheduleCode} · ${input.schedule.name}`
      : "—",
    shiftName: input.schedule
      ? `${input.schedule.shift.shiftCode} · ${input.schedule.shift.name}`
      : "—",
    shiftTime: input.schedule
      ? formatShiftTime({
          startTime: input.schedule.shift.startTime,
          endTime: input.schedule.shift.endTime,
          isOvernight: input.schedule.shift.isOvernight,
        })
      : "—",
    attDate: formatDate(input.attDate),
    timeIn: formatTime(input.timeIn),
    timeOut: formatTime(input.timeOut),
    source: input.outSource ?? input.inSource ?? "—",
    status: input.status,
    totalHours: formatMinutesToHours(totalMinutes),
    totalMinutes,
    inAddress: dash(input.inAddress),
    outAddress: dash(input.outAddress),
    verifiedBy: input.verifiedBy?.username ?? "—",
    approvedBy: input.approvedBy?.username ?? "—",
  };
}

export async function getAttendanceReportData(
  filters: AttendanceReportFilters,
): Promise<AttendanceReportData> {
  const where = buildAttendanceReportWhere(filters);

  const records = await prisma.attendance.findMany({
    where,
    select: {
      attendanceId: true,
      attDate: true,
      timeIn: true,
      timeOut: true,
      inSource: true,
      outSource: true,
      inAddress: true,
      outAddress: true,
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
    },
    orderBy: [
      {
        attDate: "desc",
      },
      {
        timeIn: "asc",
      },
      {
        attendanceId: "desc",
      },
    ],
    take: 1000,
  });

  const rows = records.map(mapAttendanceReportRow);
  const totalMinutes = rows.reduce((sum, row) => sum + row.totalMinutes, 0);

  return {
    filters,
    rows,
    summary: {
      totalRecords: rows.length,
      onTime: rows.filter((row) => row.status === "ON_TIME").length,
      late: rows.filter((row) => row.status === "LATE").length,
      halfDay: rows.filter((row) => row.status === "HALF_DAY").length,
      absent: rows.filter((row) => row.status === "ABSENT").length,
      excused: rows.filter((row) => row.status === "EXCUSED").length,
      pendingReview: rows.filter((row) => row.status === "PENDING_REVIEW")
        .length,
      missingTimeout: rows.filter((row) => row.status === "MISSING_TIMEOUT")
        .length,
      totalMinutes,
      totalHours: formatMinutesToHours(totalMinutes),
    },
  };
}