import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import { formatFullName, formatMinutesToHours } from "@/lib/utils/formatting";
import type {
  OdlAttendanceHistoryEmployee,
  OdlAttendanceHistoryFilters,
  OdlAttendanceHistoryItem,
  OdlAttendanceHistoryResult,
} from "../types/odl-attendance-history-types";

const DEFAULT_PAGE_SIZE = 15;

function singleSearchParam(
  value: string | string[] | undefined,
  fallback = "",
): string {
  if (Array.isArray(value)) {
    return value[0] ?? fallback;
  }

  return value ?? fallback;
}

function parsePositiveInteger(value: string, fallback: number): number {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
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

function dash(value: string | null | undefined): string {
  return value?.trim() ? value : "—";
}

function buildOdlAttendanceWhere(input: {
  empId: number;
  filters: OdlAttendanceHistoryFilters;
}): Prisma.AttendanceWhereInput {
  const where: Prisma.AttendanceWhereInput = {
    empId: input.empId,
    OR: [
      {
        inSource: "WEB",
      },
      {
        outSource: "WEB",
      },
    ],
  };

  const dateFrom = dateInputToDate(input.filters.dateFrom);
  const dateTo = dateInputToDate(input.filters.dateTo);

  if (dateFrom || dateTo) {
    where.attDate = {
      ...(dateFrom ? { gte: dateFrom } : {}),
      ...(dateTo ? { lte: dateTo } : {}),
    };
  }

  return where;
}

function mapEmployee(input: {
  empId: number;
  empNumber: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  department: {
    name: string;
  } | null;
  designation: {
    name: string;
  } | null;
  branch: {
    name: string;
  };
}): OdlAttendanceHistoryEmployee {
  return {
    empId: input.empId,
    empNumber: input.empNumber,
    fullName: formatFullName({
      firstName: input.firstName,
      middleName: input.middleName,
      lastName: input.lastName,
    }),
    departmentName: dash(input.department?.name),
    designationName: dash(input.designation?.name),
    branchName: input.branch.name,
  };
}

function mapAttendanceRecord(input: {
  attendanceId: number;
  attDate: Date;
  timeIn: Date | null;
  timeOut: Date | null;
  inSource: string | null;
  outSource: string | null;
  status: string;
  totalMinutes: number | null;
  isManual: boolean;
}): OdlAttendanceHistoryItem {
  return {
    attendanceId: input.attendanceId,
    attDate: formatDate(input.attDate),
    timeIn: formatTime(input.timeIn),
    timeOut: formatTime(input.timeOut),
    source: input.outSource ?? input.inSource ?? "—",
    status: input.status,
    totalHours: formatMinutesToHours(input.totalMinutes),
    isManual: input.isManual,
  };
}

export function parseOdlAttendanceHistorySearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): OdlAttendanceHistoryFilters {
  return {
    dateFrom: singleSearchParam(searchParams.dateFrom),
    dateTo: singleSearchParam(searchParams.dateTo),
    page: parsePositiveInteger(singleSearchParam(searchParams.page), 1),
    pageSize: DEFAULT_PAGE_SIZE,
  };
}

export async function getOdlAttendanceHistoryData(input: {
  userId: number;
  filters: OdlAttendanceHistoryFilters;
}): Promise<OdlAttendanceHistoryResult> {
  const user = await prisma.user.findUnique({
    where: {
      userId: input.userId,
    },
    select: {
      empId: true,
      employee: {
        select: {
          empId: true,
          empNumber: true,
          firstName: true,
          middleName: true,
          lastName: true,
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
          branch: {
            select: {
              name: true,
            },
          },
        },
      },
    },
  });

  if (!user?.empId || !user.employee) {
    return {
      employee: null,
      filters: input.filters,
      records: [],
      summary: {
        totalRecords: 0,
        completedRecords: 0,
        lateRecords: 0,
        missingTimeoutRecords: 0,
      },
      pagination: {
        page: input.filters.page,
        pageSize: input.filters.pageSize,
        totalItems: 0,
        totalPages: 1,
        hasPreviousPage: false,
        hasNextPage: false,
      },
    };
  }

  const where = buildOdlAttendanceWhere({
    empId: user.empId,
    filters: input.filters,
  });

  const skip = (input.filters.page - 1) * input.filters.pageSize;

  const [
    records,
    totalItems,
    completedRecords,
    lateRecords,
    missingTimeoutRecords,
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
      take: input.filters.pageSize,
    }),

    prisma.attendance.count({
      where,
    }),

    prisma.attendance.count({
      where: {
        ...where,
        timeIn: {
          not: null,
        },
        timeOut: {
          not: null,
        },
      },
    }),

    prisma.attendance.count({
      where: {
        ...where,
        status: "LATE",
      },
    }),

    prisma.attendance.count({
      where: {
        ...where,
        status: "MISSING_TIMEOUT",
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalItems / input.filters.pageSize));

  return {
    employee: mapEmployee(user.employee),
    filters: input.filters,
    records: records.map(mapAttendanceRecord),
    summary: {
      totalRecords: totalItems,
      completedRecords,
      lateRecords,
      missingTimeoutRecords,
    },
    pagination: {
      page: input.filters.page,
      pageSize: input.filters.pageSize,
      totalItems,
      totalPages,
      hasPreviousPage: input.filters.page > 1,
      hasNextPage: input.filters.page < totalPages,
    },
  };
}