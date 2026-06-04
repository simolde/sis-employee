import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/db/prisma";
import { formatFullName } from "@/lib/utils/formatting";
import type {
  AbsenceRecordFilters,
  AbsenceRecordItem,
  AbsenceRecordOptions,
  AbsenceRecordResult,
} from "../types/absence-record-types";

const DEFAULT_PAGE_SIZE = 20;

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

function parsePositiveId(value: string): number | null {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

function getManilaDateInputValue(offsetDays = 0): string {
  const now = new Date();
  const targetDate = new Date(now.getTime() + offsetDays * 24 * 60 * 60 * 1000);

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Manila",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(targetDate);

  const year = parts.find((part) => part.type === "year")?.value ?? "";
  const month = parts.find((part) => part.type === "month")?.value ?? "";
  const day = parts.find((part) => part.type === "day")?.value ?? "";

  return `${year}-${month}-${day}`;
}

function dateInputToStartDate(value: string): Date | undefined {
  if (!value) {
    return undefined;
  }

  return new Date(`${value}T00:00:00.000Z`);
}

function dateInputToEndDate(value: string): Date | undefined {
  if (!value) {
    return undefined;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  date.setUTCDate(date.getUTCDate() + 1);

  return date;
}

function formatDate(date: Date | null | undefined): string {
  if (!date) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-PH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    weekday: "short",
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

function dash(value: string | null | undefined): string {
  return value?.trim() ? value : "—";
}

function formatShiftTime(input: {
  startTime: string;
  endTime: string;
  isOvernight: boolean;
}): string {
  return `${input.startTime} - ${input.endTime}${
    input.isOvernight ? " · Overnight" : ""
  }`;
}

function buildAbsenceRecordWhere(
  filters: AbsenceRecordFilters,
): Prisma.AttendanceWhereInput {
  const andConditions: Prisma.AttendanceWhereInput[] = [
    {
      status: "ABSENT",
    },
  ];

  const branchId = parsePositiveId(filters.branchId);
  const departmentId = parsePositiveId(filters.departmentId);
  const scheduleId = parsePositiveId(filters.scheduleId);
  const dateFrom = dateInputToStartDate(filters.dateFrom);
  const dateTo = dateInputToEndDate(filters.dateTo);

  if (dateFrom || dateTo) {
    andConditions.push({
      attDate: {
        ...(dateFrom ? { gte: dateFrom } : {}),
        ...(dateTo ? { lt: dateTo } : {}),
      },
    });
  }

  if (branchId) {
    andConditions.push({
      employee: {
        branchId,
      },
    });
  }

  if (departmentId) {
    andConditions.push({
      employee: {
        departmentId,
      },
    });
  }

  if (scheduleId) {
    andConditions.push({
      scheduleId,
    });
  }

  if (filters.q) {
    andConditions.push({
      OR: [
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
      ],
    });
  }

  return {
    AND: andConditions,
  };
}

function mapAbsenceRecord(input: {
  attendanceId: number;
  attDate: Date;
  status: string;
  isManual: boolean;
  createdAt: Date;
  employee: {
    empId: number;
    empNumber: string;
    firstName: string;
    middleName: string | null;
    lastName: string;
    status: string;
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
      startTime: string;
      endTime: string;
      isOvernight: boolean;
    };
  } | null;
}): AbsenceRecordItem {
  return {
    attendanceId: input.attendanceId,
    empId: input.employee.empId,
    empNumber: input.employee.empNumber,
    employeeName: formatFullName({
      firstName: input.employee.firstName,
      middleName: input.employee.middleName,
      lastName: input.employee.lastName,
    }),
    employeeStatus: input.employee.status,
    branchName: input.employee.branch.name,
    departmentName: dash(input.employee.department?.name),
    scheduleName: input.schedule
      ? `${input.schedule.scheduleCode} · ${input.schedule.name}`
      : "—",
    shiftTime: input.schedule
      ? formatShiftTime({
          startTime: input.schedule.shift.startTime,
          endTime: input.schedule.shift.endTime,
          isOvernight: input.schedule.shift.isOvernight,
        })
      : "—",
    attDate: formatDate(input.attDate),
    status: input.status,
    isManual: input.isManual,
    createdAt: formatDateTime(input.createdAt),
  };
}

export function parseAbsenceRecordSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
): AbsenceRecordFilters {
  return {
    q: singleSearchParam(searchParams.q).trim(),
    branchId: singleSearchParam(searchParams.branchId),
    departmentId: singleSearchParam(searchParams.departmentId),
    scheduleId: singleSearchParam(searchParams.scheduleId),
    dateFrom: singleSearchParam(searchParams.dateFrom, getManilaDateInputValue(-30)),
    dateTo: singleSearchParam(searchParams.dateTo, getManilaDateInputValue()),
    page: parsePositiveInteger(singleSearchParam(searchParams.page), 1),
    pageSize: DEFAULT_PAGE_SIZE,
  };
}

export async function getAbsenceRecordOptions(): Promise<AbsenceRecordOptions> {
  const [branches, departments, schedules] = await Promise.all([
    prisma.branch.findMany({
      select: {
        branchId: true,
        name: true,
      },
      orderBy: {
        name: "asc",
      },
    }),

    prisma.department.findMany({
      select: {
        departmentId: true,
        name: true,
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
      },
      orderBy: [
        {
          scheduleCode: "asc",
        },
        {
          name: "asc",
        },
      ],
    }),
  ]);

  return {
    branches: branches.map((branch) => ({
      id: branch.branchId,
      label: branch.name,
    })),
    departments: departments.map((department) => ({
      id: department.departmentId,
      label: department.name,
    })),
    schedules: schedules.map((schedule) => ({
      id: schedule.scheduleId,
      label: `${schedule.scheduleCode} · ${schedule.name}`,
    })),
  };
}

export async function getAbsenceRecordData(
  filters: AbsenceRecordFilters,
): Promise<AbsenceRecordResult> {
  const where = buildAbsenceRecordWhere(filters);
  const skip = (filters.page - 1) * filters.pageSize;

  const [
    records,
    options,
    totalItems,
    totalAbsences,
    manualAbsences,
    automaticAbsences,
  ] = await Promise.all([
    prisma.attendance.findMany({
      where,
      select: {
        attendanceId: true,
        attDate: true,
        status: true,
        isManual: true,
        createdAt: true,
        employee: {
          select: {
            empId: true,
            empNumber: true,
            firstName: true,
            middleName: true,
            lastName: true,
            status: true,
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
          attDate: "desc",
        },
        {
          attendanceId: "desc",
        },
      ],
      skip,
      take: filters.pageSize,
    }),

    getAbsenceRecordOptions(),

    prisma.attendance.count({
      where,
    }),

    prisma.attendance.count({
      where: {
        status: "ABSENT",
      },
    }),

    prisma.attendance.count({
      where: {
        status: "ABSENT",
        isManual: true,
      },
    }),

    prisma.attendance.count({
      where: {
        status: "ABSENT",
        isManual: false,
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalItems / filters.pageSize));

  return {
    filters,
    options,
    records: records.map(mapAbsenceRecord),
    summary: {
      totalAbsences,
      currentPageRecords: records.length,
      manualAbsences,
      automaticAbsences,
    },
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